import { useEffect, useRef, useState } from 'react'
import { Peer } from 'peerjs'
import { PEER_PREFIX } from '../config.js'
import { newGameCode } from '../lib/gameCode.js'
import { scoreFor } from '../lib/scoring.js'

// The host's browser is the game server. All game state lives in a mutable
// object held in a ref — PeerJS handlers and timers fire outside React and
// would otherwise close over stale state. Every mutation ends with
// broadcast(), which sends the same snapshot to every player AND to the
// host's own UI, so the two can never disagree.
//
// Returns { snapshot, status: {state, code, error}, start }.
export function useHostGame(questions) {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState({ state: 'connecting', code: null, error: null })
  const actionsRef = useRef({})

  useEffect(() => {
    if (!questions) return
    let disposed = false
    let peer = null
    let idAttempts = 0
    let reconnectTimer = null
    let reconnectAttempts = 0

    const game = {
      phase: 'lobby', // lobby | question | results | gameover
      questionIndex: -1,
      questionStartTime: 0,
      players: new Map(), // peerId -> player record (includes live conn)
    }

    function buildSnapshot() {
      const question = game.questionIndex >= 0 ? questions[game.questionIndex] : null
      const revealCorrect = game.phase === 'results' || game.phase === 'gameover'
      // While a question is open, hide everything that would reveal whether an
      // answer was right (including the score delta) — otherwise a second tab
      // in devtools becomes a live answer oracle. Revealed at results.
      const hideOutcome = game.phase === 'question'
      return {
        type: 'state',
        phase: game.phase,
        questionIndex: game.questionIndex,
        questionCount: questions.length,
        question: question ? { text: question.text, answers: question.answers } : null,
        correctAnswerIndex: revealCorrect && question ? question.correctIndex : null,
        // How many players picked each answer — revealed with the answer.
        answerCounts: revealCorrect
          ? [0, 1, 2].map(
              (i) =>
                [...game.players.values()].filter((p) => p.lastAnswerIndex === i).length
            )
          : null,
        players: [...game.players.values()]
          .map((p) => ({
            id: p.id,
            name: p.name,
            score: hideOutcome ? p.score - p.lastGain : p.score,
            connected: p.connected,
            answered: p.answered,
            lastGain: hideOutcome ? 0 : p.lastGain,
            lastCorrect: hideOutcome ? null : p.lastCorrect,
          }))
          .sort((a, b) => b.score - a.score),
      }
    }

    function broadcast() {
      if (disposed) return
      const snap = buildSnapshot()
      for (const p of game.players.values()) {
        if (p.conn && p.conn.open) {
          try {
            p.conn.send(snap)
          } catch {
            // Connection died mid-send; the close handler will mark it.
          }
        }
      }
      setSnapshot(snap)
    }

    function startQuestion(index) {
      game.phase = 'question'
      game.questionIndex = index
      game.questionStartTime = Date.now()
      for (const p of game.players.values()) {
        p.answered = false
        p.lastGain = 0
        p.lastCorrect = null
        p.lastAnswerIndex = null
      }
      broadcast()
    }

    function enterResults() {
      game.phase = 'results'
      broadcast()
    }

    // Host presses "Next" on the results screen to move on.
    function advance() {
      if (game.phase !== 'results') return
      if (game.questionIndex + 1 < questions.length) {
        startQuestion(game.questionIndex + 1)
      } else {
        game.phase = 'gameover'
        broadcast()
      }
    }

    function checkAllAnswered() {
      if (game.phase !== 'question') return
      const connected = [...game.players.values()].filter((p) => p.connected)
      // The length guard stops a runaway auto-advance if everyone drops.
      if (connected.length > 0 && connected.every((p) => p.answered)) enterResults()
    }

    function handleJoin(conn, rawName) {
      // A peer we already know re-sending 'join' (PeerJS re-fires 'open' after
      // a signaling reconnect, and cheating clients can send anything): refresh
      // the connection, never reset the record — this blocks the
      // re-answer/score-reset exploit and keeps the score through blips.
      const samePeer = game.players.get(conn.peer)
      if (samePeer) {
        samePeer.conn = conn
        samePeer.connected = true
        broadcast()
        checkAllAnswered()
        return
      }

      const cleanName = String(rawName || '').trim().slice(0, 20) || 'Player'
      const lower = cleanName.toLowerCase()

      // Same name as a disconnected player = a refresh/rejoin: re-attach the
      // new connection to the old record so their score survives.
      const returning = [...game.players.values()].find(
        (p) => !p.connected && p.name.toLowerCase() === lower
      )
      if (returning) {
        game.players.delete(returning.id)
        returning.id = conn.peer
        returning.conn = conn
        returning.connected = true
        game.players.set(conn.peer, returning)
        broadcast()
        checkAllAnswered()
        return
      }

      // Name taken (connected player, or a disconnected one whose assigned
      // name differs from what they typed): auto-rename "Sam (2)". Checking
      // ALL players keeps assigned names unique so rejoin-by-name stays
      // unambiguous.
      let finalName = cleanName
      let n = 2
      while (
        [...game.players.values()].some(
          (p) => p.name.toLowerCase() === finalName.toLowerCase()
        )
      ) {
        finalName = `${cleanName} (${n++})`
      }

      game.players.set(conn.peer, {
        id: conn.peer,
        name: finalName,
        score: 0,
        connected: true,
        answered: false,
        lastGain: 0,
        lastCorrect: null,
        conn,
      })
      broadcast()
    }

    function handleAnswer(conn, msg) {
      const player = game.players.get(conn.peer)
      if (!player) return
      if (game.phase !== 'question') return
      if (msg.questionIndex !== game.questionIndex) return
      if (player.answered) return
      if (![0, 1, 2].includes(msg.answerIndex)) return

      player.answered = true
      player.lastAnswerIndex = msg.answerIndex
      const correct = msg.answerIndex === questions[game.questionIndex].correctIndex
      player.lastCorrect = correct
      player.lastGain = correct ? scoreFor(Date.now() - game.questionStartTime) : 0
      player.score += player.lastGain
      broadcast()
      checkAllAnswered()
    }

    function handleDisconnect(peerId, sourceConn) {
      const player = game.players.get(peerId)
      if (!player || !player.connected) return
      // A stale connection that was already replaced (player reconnected on a
      // new one) closing later must not disconnect the live player.
      if (sourceConn && player.conn !== sourceConn) return
      player.connected = false
      broadcast()
      // Critical: never leave the game stalled waiting on a ghost.
      checkAllAnswered()
    }

    // ICE recovered from a transient blip (wifi hiccup): un-mark the player.
    function handleReconnect(conn) {
      const player = game.players.get(conn.peer)
      if (player && !player.connected && conn.open) {
        player.connected = true
        player.conn = conn
        broadcast()
        checkAllAnswered()
      }
    }

    function openPeer() {
      const code = newGameCode()
      const thisPeer = new Peer(PEER_PREFIX + code)
      peer = thisPeer
      let opened = false

      thisPeer.on('open', () => {
        if (disposed) return
        opened = true
        reconnectAttempts = 0
        setStatus({ state: 'ready', code, error: null })
        broadcast()
      })

      thisPeer.on('connection', (conn) => {
        if (disposed) return
        conn.on('data', (msg) => {
          if (disposed || !msg || typeof msg !== 'object') return
          if (msg.type === 'join') handleJoin(conn, msg.name)
          else if (msg.type === 'answer') handleAnswer(conn, msg)
        })
        conn.on('close', () => handleDisconnect(conn.peer, conn))
        conn.on('error', () => handleDisconnect(conn.peer, conn))
        // PeerJS 'close' is unreliable when a tab dies abruptly — watch the
        // ICE state too, or the game stalls waiting on a ghost player.
        // 'disconnected' is usually a 1-3s blip that self-recovers, so it gets
        // a grace period instead of instantly ending the round for everyone;
        // 'failed'/'closed' are final and act immediately.
        conn.on('open', () => {
          const pc = conn.peerConnection
          if (!pc) return
          let graceTimer = null
          pc.addEventListener('iceconnectionstatechange', () => {
            const state = pc.iceConnectionState
            if (state === 'failed' || state === 'closed') {
              clearTimeout(graceTimer)
              graceTimer = null
              handleDisconnect(conn.peer, conn)
            } else if (state === 'disconnected') {
              if (!graceTimer) {
                graceTimer = setTimeout(() => {
                  graceTimer = null
                  handleDisconnect(conn.peer, conn)
                }, 4000)
              }
            } else if (state === 'connected' || state === 'completed') {
              clearTimeout(graceTimer)
              graceTimer = null
              handleReconnect(conn)
            }
          })
        })
      })

      // Lost the signaling server: existing P2P connections keep working; we
      // only need it back for NEW joins. Capped exponential backoff so an
      // outage doesn't become a hammering retry loop.
      thisPeer.on('disconnected', () => {
        if (disposed || thisPeer.destroyed) return
        clearTimeout(reconnectTimer)
        reconnectTimer = setTimeout(() => {
          if (!disposed && !thisPeer.destroyed && thisPeer.disconnected) thisPeer.reconnect()
        }, Math.min(30000, 1000 * 2 ** Math.min(reconnectAttempts++, 5)))
      })

      thisPeer.on('error', (err) => {
        if (disposed) return
        if (err.type === 'unavailable-id' && idAttempts < 3) {
          idAttempts++
          thisPeer.destroy()
          openPeer()
        } else if (err.type === 'peer-unavailable') {
          // Stale/unknown target peer — not fatal.
        } else if (!opened) {
          setStatus({ state: 'error', code: null, error: err.message || String(err) })
        }
        // After 'open', signaling-layer errors ('network', 'socket-error', …)
        // are recoverable: live P2P connections keep working and the
        // 'disconnected' handler above retries. Never replace a running game
        // with a fatal error screen for those.
      })
    }

    actionsRef.current.start = () => {
      if (game.phase === 'lobby') startQuestion(0)
    }
    actionsRef.current.next = advance

    openPeer()

    // Closing/refreshing the host tab: tear down the peer explicitly so
    // players get a prompt "host disconnected" instead of a slow timeout.
    const onPageHide = () => {
      if (peer) peer.destroy()
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      disposed = true
      clearTimeout(reconnectTimer)
      actionsRef.current.start = null
      actionsRef.current.next = null
      window.removeEventListener('pagehide', onPageHide)
      if (peer) peer.destroy()
    }
  }, [questions])

  return {
    snapshot,
    status,
    start: () => actionsRef.current.start?.(),
    next: () => actionsRef.current.next?.(),
  }
}
