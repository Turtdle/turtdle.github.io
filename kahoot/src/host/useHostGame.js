import { useEffect, useRef, useState } from 'react'
import { Peer } from 'peerjs'
import { HELLO_TIMEOUT_MS, MAX_PLAYERS, MSG_BURST, MSG_PER_SEC, PEER_PREFIX, PROTOCOL } from '../config.js'
import { isToken, newGameCode, newPlayerId } from '../lib/gameCode.js'
import { describePeerError, isMessage, peerOptions, webrtcSupported, WEBRTC_OFF } from '../lib/net.js'
import { cleanName } from '../lib/text.js'
import { scoreFor } from '../lib/scoring.js'

// The host's browser is the game server. All game state lives in a mutable
// object held in a ref — PeerJS handlers and timers fire outside React and
// would otherwise close over stale state. Every mutation ends with
// broadcast(), which sends the same snapshot to every player AND to the
// host's own UI, so the two can never disagree.
//
// Anyone can host, so players are strangers' browsers: every connection is
// rate limited, must say 'hello' first, and every field is checked. On first
// join a player gets a private token; rejoining (refresh, phone lock, flaky
// network) needs it, so nobody can take over someone else's name and score.
//
// Protocol (JSON): player -> host  { t: 'hello', v, name, token } | { t: 'answer', q, a }
//                  host -> player  { t: 'welcome', pid } | { t: 'state', ... } | { t: 'bye', reason }
//
// Returns { snapshot, status: {state, code, error}, actions }.
export function useHostGame(questions) {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState({ state: 'connecting', code: null, error: null })
  const actionsRef = useRef({})

  useEffect(() => {
    if (!questions) return
    if (!webrtcSupported()) {
      setStatus({ state: 'error', code: null, error: WEBRTC_OFF })
      return
    }
    let disposed = false
    let peer = null
    let idAttempts = 0
    let reconnectTimer = null
    let reconnectAttempts = 0

    const game = {
      phase: 'lobby', // lobby | question | results | gameover
      questionIndex: -1,
      questionStartTime: 0,
      locked: false, // no new players (rejoins still work)
      players: new Map(), // pid -> player record (includes live conn and private token)
      kicked: new Set(), // tokens that may not come back
    }

    const playerList = () => [...game.players.values()]

    function buildSnapshot() {
      const question = game.questionIndex >= 0 ? questions[game.questionIndex] : null
      const revealCorrect = game.phase === 'results' || game.phase === 'gameover'
      // While a question is open, hide everything that would reveal whether an
      // answer was right (including the score delta) — otherwise a second tab
      // in devtools becomes a live answer oracle. Revealed at results.
      const hideOutcome = game.phase === 'question'
      return {
        t: 'state',
        phase: game.phase,
        locked: game.locked,
        questionIndex: game.questionIndex,
        questionCount: questions.length,
        question: question ? { text: question.text, answers: question.answers } : null,
        correctAnswerIndex: revealCorrect && question ? question.correctIndex : null,
        // How many players picked each answer — revealed with the answer.
        answerCounts:
          revealCorrect && question
            ? question.answers.map((_, i) => playerList().filter((p) => p.lastAnswerIndex === i).length)
            : null,
        players: playerList()
          .map((p) => ({
            pid: p.pid,
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

    function send(conn, msg) {
      if (conn && conn.open) {
        try {
          conn.send(msg)
        } catch {
          // Connection died mid-send; the close handler will mark it.
        }
      }
    }

    function broadcast() {
      if (disposed) return
      const snap = buildSnapshot()
      for (const p of game.players.values()) send(p.conn, snap)
      setSnapshot(snap)
    }

    // Tell a connection why it's being turned away, then hang up once the
    // message has had a moment to go out.
    function refuse(conn, reason) {
      send(conn, { t: 'bye', reason })
      setTimeout(() => conn.close(), 300)
    }

    function resetRound(p) {
      p.answered = false
      p.lastGain = 0
      p.lastCorrect = null
      p.lastAnswerIndex = null
    }

    function startQuestion(index) {
      game.phase = 'question'
      game.questionIndex = index
      game.questionStartTime = Date.now()
      for (const p of game.players.values()) resetRound(p)
      broadcast()
    }

    function enterResults() {
      if (game.phase !== 'question') return
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

    // "Play again": same quiz, same players, scores back to zero.
    function restart() {
      if (game.phase !== 'gameover') return
      for (const p of game.players.values()) {
        p.score = 0
        resetRound(p)
      }
      game.phase = 'lobby'
      game.questionIndex = -1
      broadcast()
    }

    function checkAllAnswered() {
      if (game.phase !== 'question') return
      const connected = playerList().filter((p) => p.connected)
      // The length guard stops a runaway auto-advance if everyone drops.
      if (connected.length > 0 && connected.every((p) => p.answered)) enterResults()
    }

    function uniqueName(name) {
      const taken = (n) => playerList().some((p) => p.name.toLowerCase() === n.toLowerCase())
      let finalName = name
      for (let n = 2; taken(finalName); n++) finalName = `${name} (${n})`
      return finalName
    }

    function handleHello(conn, meta, msg) {
      if (meta.pid) return // one hello per connection
      if (msg.v !== PROTOCOL) return refuse(conn, 'version')
      if (!isToken(msg.token)) return refuse(conn, 'bad')
      if (game.kicked.has(msg.token)) return refuse(conn, 'kicked')

      // Rejoin (refresh, phone lock, flaky network): the token proves it's
      // them. Swap in the new connection and hang up the old one.
      const returning = playerList().find((p) => p.token === msg.token)
      if (returning) {
        const old = returning.conn
        returning.conn = conn
        returning.connected = true
        meta.pid = returning.pid
        if (old && old !== conn) old.close()
        send(conn, { t: 'welcome', pid: returning.pid })
        broadcast()
        checkAllAnswered()
        return
      }

      if (game.locked) return refuse(conn, 'locked')
      if (game.players.size >= MAX_PLAYERS) return refuse(conn, 'full')
      const name = typeof msg.name === 'string' ? cleanName(msg.name) : ''
      if (!name) return refuse(conn, 'bad')

      const pid = newPlayerId()
      game.players.set(pid, {
        pid,
        token: msg.token,
        name: uniqueName(name),
        score: 0,
        connected: true,
        answered: false,
        lastGain: 0,
        lastCorrect: null,
        lastAnswerIndex: null,
        conn,
      })
      meta.pid = pid
      send(conn, { t: 'welcome', pid })
      broadcast()
    }

    function handleAnswer(pid, msg) {
      const player = game.players.get(pid)
      if (!player || game.phase !== 'question' || player.answered) return
      if (msg.q !== game.questionIndex) return
      const question = questions[game.questionIndex]
      if (!Number.isInteger(msg.a) || msg.a < 0 || msg.a >= question.answers.length) return

      player.answered = true
      player.lastAnswerIndex = msg.a
      player.lastCorrect = msg.a === question.correctIndex
      player.lastGain = player.lastCorrect ? scoreFor(Date.now() - game.questionStartTime) : 0
      player.score += player.lastGain
      broadcast()
      checkAllAnswered()
    }

    function handleDisconnect(pid, sourceConn) {
      const player = pid && game.players.get(pid)
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
    function handleReconnect(pid, conn) {
      const player = pid && game.players.get(pid)
      if (player && !player.connected && player.conn === conn && conn.open) {
        player.connected = true
        broadcast()
        checkAllAnswered()
      }
    }

    function kick(pid) {
      const player = game.players.get(pid)
      if (!player) return
      game.kicked.add(player.token)
      game.players.delete(pid)
      if (player.conn) refuse(player.conn, 'kicked')
      broadcast()
      checkAllAnswered()
    }

    function onConnection(conn) {
      // Our players always use JSON. Anything else is a hand-rolled client
      // trying to get the binary decoder to chew on something.
      if (conn.serialization !== 'json') {
        conn.close()
        return
      }
      const meta = { pid: null, budget: MSG_BURST, lastRefill: Date.now() }
      const helloTimer = setTimeout(() => {
        if (!meta.pid) conn.close()
      }, HELLO_TIMEOUT_MS)

      conn.on('data', (msg) => {
        if (disposed) return
        // Token-bucket rate limit: a burst of MSG_BURST, refilled at
        // MSG_PER_SEC. Real players send one hello and one answer per question.
        const now = Date.now()
        meta.budget = Math.min(MSG_BURST, meta.budget + ((now - meta.lastRefill) / 1000) * MSG_PER_SEC)
        meta.lastRefill = now
        if (meta.budget < 1) {
          conn.close()
          return
        }
        meta.budget -= 1

        if (!isMessage(msg)) return
        if (msg.t === 'hello') {
          clearTimeout(helloTimer)
          handleHello(conn, meta, msg)
        } else if (msg.t === 'answer' && meta.pid) {
          handleAnswer(meta.pid, msg)
        }
      })
      conn.on('close', () => {
        clearTimeout(helloTimer)
        handleDisconnect(meta.pid, conn)
      })
      conn.on('error', () => handleDisconnect(meta.pid, conn))
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
            handleDisconnect(meta.pid, conn)
          } else if (state === 'disconnected') {
            if (!graceTimer) {
              graceTimer = setTimeout(() => {
                graceTimer = null
                handleDisconnect(meta.pid, conn)
              }, 4000)
            }
          } else if (state === 'connected' || state === 'completed') {
            clearTimeout(graceTimer)
            graceTimer = null
            handleReconnect(meta.pid, conn)
          }
        })
      })
    }

    function openPeer() {
      const code = newGameCode()
      const thisPeer = new Peer(PEER_PREFIX + code, peerOptions())
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
        if (!disposed) onConnection(conn)
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
          setStatus({ state: 'error', code: null, error: describePeerError(err.type) })
        }
        // After 'open', signaling-layer errors ('network', 'socket-error', …)
        // are recoverable: live P2P connections keep working and the
        // 'disconnected' handler above retries. Never replace a running game
        // with a fatal error screen for those.
      })
    }

    actionsRef.current = {
      start: () => game.phase === 'lobby' && game.players.size > 0 && startQuestion(0),
      next: advance,
      reveal: enterResults,
      restart,
      kick,
      setLocked: (locked) => {
        game.locked = !!locked
        broadcast()
      },
    }

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
      actionsRef.current = {}
      window.removeEventListener('pagehide', onPageHide)
      if (peer) peer.destroy()
    }
  }, [questions])

  // Stable wrappers: the real implementations live inside the effect.
  const [actions] = useState(() => {
    const call = (name) => (...args) => actionsRef.current[name]?.(...args)
    return {
      start: call('start'),
      next: call('next'),
      reveal: call('reveal'),
      restart: call('restart'),
      kick: call('kick'),
      setLocked: call('setLocked'),
    }
  })

  return { snapshot, status, actions }
}
