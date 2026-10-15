import { ICE_SERVERS } from '../config.js'

// Options for every Peer: our STUN/TURN servers and PeerJS logging off.
// Add ?relay to the page URL to force everything through the TURN relay,
// which is how to check the relay still works.
export function peerOptions() {
  const relayOnly = new URLSearchParams(location.search).has('relay')
  return {
    debug: 0,
    config: { iceServers: ICE_SERVERS, iceTransportPolicy: relayOnly ? 'relay' : 'all' },
  }
}

export const webrtcSupported = () => typeof window.RTCPeerConnection === 'function'

export const WEBRTC_OFF = {
  title: 'This browser has WebRTC turned off',
  detail:
    'The game needs WebRTC to connect phones to the host. Privacy extensions and hardened browser settings (Brave shields, Firefox media.peerconnection.enabled) can turn it off. Try another browser, or allow it for this site.',
}

export const SERVER_UNREACHABLE = {
  title: "Couldn't reach the game server",
  detail:
    'Check your internet connection. Some ad blockers and school or work networks block it, so try turning those off or switching between Wi-Fi and mobile data.',
}

export const HOST_UNREACHABLE = {
  title: "Couldn't connect to the host",
  detail:
    "The game server found the host but your devices couldn't talk to each other. Try again, or switch between Wi-Fi and mobile data.",
}

// What to tell a person about a PeerJS error, by err.type.
export function describePeerError(type, code) {
  switch (type) {
    case 'peer-unavailable':
      return {
        title: `No game with code ${code}`,
        detail: 'Check the code, and make sure the host still has the game open.',
      }
    case 'browser-incompatible':
      return WEBRTC_OFF
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
    case 'ssl-unavailable':
      return SERVER_UNREACHABLE
    default:
      return HOST_UNREACHABLE
  }
}

// Messages arrive from other people's browsers: only plain objects with a
// string type tag are worth looking at.
export const isMessage = (m) => m !== null && typeof m === 'object' && !Array.isArray(m) && typeof m.t === 'string'
