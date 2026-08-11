import { useEffect, useRef, useState } from 'react'
import { Peer } from 'peerjs'
import { PEER_PREFIX, CONNECT_TIMEOUT_MS } from '../config.js'

// Player side: one peer, one connection to the host, and the last state
// snapshot the host sent. The UI is a pure render of that snapshot.
//
// status: 'connecting' | 'connected' | 'failed' (never reached host)
//         | 'ended' (host gone after we were in)
// Returns { snapshot, status, myId, myAnswer, sendAnswer, retry }.
export function usePlayerConnection(code, name) {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState('connecting')
  const [myId, setMyId] = useState(null)
  const [myAnswer, setMyAnswer] = useState(null) // { questionIndex, answerIndex }
  const [attempt, setAttempt] = useState(0)
  const connRef = useRef(null)

  useEffect(() => {
    if (!code || !name) return
    setStatus('connecting')
    setSnapshot(null)
    setMyAnswer(null)

    const peer = new Peer() // random cloud-assigned ID; doubles as our player ID
    let opened = false
    let failed = false
    let reconnectTimer = null
    let reconnectAttempts = 0

    function fail() {
      if (opened || failed) return
      failed = true
      clearTimeout(failTimeout)
      setStatus('failed')
      peer.destroy()
    }

    const failTimeout = setTimeout(fail, CONNECT_TIMEOUT_MS)

    peer.on('open', (id) => {
      setMyId(id)
      reconnectAttempts = 0
      // 'open' re-fires after every signaling reconnect. The DataConnection to
      // the host survives those, so never open a second one (a duplicate join
      // would reset this player on the host).
      if (connRef.current) return
      const conn = peer.connect(PEER_PREFIX + code, {
        reliable: true,
        serialization: 'json',
      })
      connRef.current = conn

      conn.on('open', () => {
        opened = true
        clearTimeout(failTimeout)
        setStatus('connected')
        conn.send({ type: 'join', name })
        // PeerJS 'close' is unreliable when the host tab dies abruptly —
        // watch the ICE state as a fallback ('disconnected' is skipped so a
        // wifi blip doesn't end the game for this player).
        const pc = conn.peerConnection
        if (pc) {
          pc.addEventListener('iceconnectionstatechange', () => {
            const state = pc.iceConnectionState
            if (state === 'failed' || state === 'closed') setStatus('ended')
          })
        }
      })
      conn.on('data', (msg) => {
        if (msg && msg.type === 'state') setSnapshot(msg)
      })
      conn.on('close', () => {
        if (opened) setStatus('ended')
        else fail()
      })
    })

    // 'peer-unavailable' (bad code / host gone) and friends. Errors after
    // we're in are left to the connection close handler.
    peer.on('error', () => {
      if (!opened) fail()
    })

    // Signaling loss doesn't break the live game connection; retry with
    // capped backoff so an outage doesn't become a hammering loop.
    peer.on('disconnected', () => {
      if (!opened || peer.destroyed) return
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
      conn.send({ type: 'answer', questionIndex, answerIndex })
      setMyAnswer({ questionIndex, answerIndex })
    }
  }

  return {
    snapshot,
    status,
    myId,
    myAnswer,
    sendAnswer,
    retry: () => setAttempt((a) => a + 1),
  }
}
