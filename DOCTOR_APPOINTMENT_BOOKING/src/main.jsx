import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default function MyApp({ Component, pageProps }) {
    return (
        <PrimeReactProvider>
            <Component {...pageProps} />
        </PrimeReactProvider>
    );
}       