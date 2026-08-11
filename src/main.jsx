import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// No StrictMode: its dev-only double-mounting of effects would create and
// destroy PeerJS peers twice, churning game codes for no benefit.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
