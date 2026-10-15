import { useEffect, useRef, useState } from 'react'
import { Peer } from 'peerjs'
import { CONNECT_TIMEOUT_MS, PEER_PREFIX, PROTOCOL } from '../config.js'
import { newToken } from '../lib/gameCode.js'
import { describePeerError, HOST_UNREACHABLE, isMessage, peerOptions, webrtcSupported, WEBRTC_OFF } from '../lib/net.js'

// Player side: one peer, one connection to the host, and the last state
// snapshot the host sent. The UI is a pure render of that snapshot.
//
// status: 'connecting' | 'connected' (host accepted us) | 'failed' (never got in)
//         | 'removed' (host turned us away) | 'ended' (host gone after we were in)
// Returns { snapshot, status, error, myId, myAnswer, sendAnswer, retry }.
export function usePlayerConnection(code, name) {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null) // { title, detail }
  const [myId, setMyId] = useState(null)
  const [myAnswer, setMyAnswer] = useState(null) // { questionIndex, answerIndex }
  const [attempt, setAttempt] = useState(0)
  const connRef = useRef(null)

  useEffect(() => {
    if (!code || !name) return
    setStatus('connecting')
    setError(null)
    setSnapshot(null)
    setMyAnswer(null)
    if (!webrtcSupported()) {
      setStatus('failed')
      setError(WEBRTC_OFF)
      return
    }

    const token = gameToken(code)
    const peer = new Peer(peerOptions()) // random cloud-assigned ID
    let joined = false
    let done = false // failed or turned away: ignore everything after
    let reconnectTimer = null
    let reconnectAttempts = 0

    function fail(reason) {
      if (joined || done) return
      done = true
      clearTimeout(failTimeout)
      setStatus('failed')
      setError(reason)
      peer.destroy()
    }

    const failTimeout = setTimeout(() => fail(HOST_UNREACHABLE), CONNECT_TIMEOUT_MS)

    peer.on('open', () => {
      reconnectAttempts = 0
      // 'open' re-fires after every signaling reconnect. The DataConnection to
      // the host survives those, so never open a second one.
      if (connRef.current) return
      const conn = peer.connect(PEER_PREFIX + code, { reliable: true, serialization: 'json' })
      connRef.current = conn

      conn.on('open', () => {
        conn.send({ t: 'hello', v: PROTOCOL, name, token })
        // PeerJS 'close' is unreliable when the host tab dies abruptly —
        // watch the ICE state as a fallback ('disconnected' is skipped so a
        // wifi blip doesn't end the game for this player).
        const pc = conn.peerConnection
        if (pc) {
          pc.addEventListener('iceconnectionstatechange', () => {
            const state = pc.iceConnectionState
            if ((state === 'failed' || state === 'closed') && joined && !done) setStatus('ended')
          })
        }
      })
      conn.on('data', (msg) => {
        if (done || !isMessage(msg)) return
        if (msg.t === 'welcome' && typeof msg.pid === 'string') {
          joined = true
          clearTimeout(failTimeout)
          setMyId(msg.pid)
          setStatus('connected')
        } else if (msg.t === 'state' && joined) {
          setSnapshot(msg)
          if (msg.phase === 'lobby') setMyAnswer(null) // "Play again" starts over at question 1

        } else if (msg.t === 'bye') {
          done = true
          clearTimeout(failTimeout)
          setStatus('removed')
          setError(BYE[msg.reason] || BYE.bad)
          if (msg.reason === 'kicked') forgetGame(code)
        }
      })
      conn.on('close', () => {
        if (done) return
        if (joined) setStatus('ended')
        else fail(HOST_UNREACHABLE)
      })
    })

    // 'peer-unavailable' (bad code / host gone), blocked signaling server and
    // friends. Errors after we're in are left to the connection close handler.
    peer.on('error', (err) => {
      if (!joined) fail(describePeerError(err.type, code))
    })

    // Signaling loss doesn't break the live game connection; retry with
    // capped backoff so an outage doesn't become a hammering loop.
    peer.on('disconnected', () => {
      if (!joined || peer.destroyed) return
      clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        if (!peer.destroyed && peer.disconnected) peer.reconnect()
      }, Math.min(30000, 1000 * 2 ** Math.min(reconnectAttempts++, 5)))
    })

    // Closing/refreshing the tab: tear down the peer explicitly so the host
    // marks us disconnected right away instead of after a slow ICE timeout.
    const onPageHide = () => peer.destroy()
    window.addEventListener('pagehide', onPageHide)

    return () => {
      done = true
      clearTimeout(failTimeout)
      clearTimeout(reconnectTimer)
      window.removeEventListener('pagehide', onPageHide)
      connRef.current = null
      peer.destroy()
    }
  }, [code, name, attempt])

  function sendAnswer(questionIndex, answerIndex) {
    const conn = connRef.current
    if (conn && conn.open) {
      conn.send({ t: 'answer', q: questionIndex, a: answerIndex })
      setMyAnswer({ questionIndex, answerIndex })
    }
  }

  return {
    snapshot,
    status,
    error,
    myId,
    myAnswer,
    sendAnswer,
    retry: () => setAttempt((a) => a + 1),
  }
}

const BYE = {
  kicked: { title: 'The host removed you from the game', detail: null },
  locked: { title: "This game isn't taking new players", detail: 'Ask the host to unlock the lobby.' },
  full: { title: 'This game is full', detail: null },
  version: { title: 'This game is on a different version', detail: 'Refresh the page and try again.' },
  bad: { title: "Couldn't join with that name", detail: 'Try a different name.' },
}

// The rejoin token and name for each game live in this tab's sessionStorage,
// so a refresh or a locked phone puts you straight back in with your score.
const tokenKey = (code) => `kahoot-token-${code}`
const nameKey = (code) => `kahoot-name-${code}`

function gameToken(code) {
  try {
    let token = sessionStorage.getItem(tokenKey(code))
    if (!token) {
      token = newToken()
      sessionStorage.setItem(tokenKey(code), token)
    }
    return token
  } catch {
    return newToken() // storage blocked: still playable, just no rejoin after a refresh
  }
}

export function savedName(code) {
  try {
    return sessionStorage.getItem(nameKey(code))
  } catch {
    return null
  }
}

export function saveName(code, name) {
  try {
    sessionStorage.setItem(nameKey(code), name)
    localStorage.setItem('kahoot-last-name', name)
  } catch {
    // Storage blocked — fine, just no auto-rejoin.
  }
}

export function lastName() {
  try {
    return localStorage.getItem('kahoot-last-name') || ''
  } catch {
    return ''
  }
}

function forgetGame(code) {
  try {
    sessionStorage.removeItem(tokenKey(code))
    sessionStorage.removeItem(nameKey(code))
  } catch {
    // nothing to forget
  }
}
