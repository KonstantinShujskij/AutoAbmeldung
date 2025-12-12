import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme, ThemePanel } from "@radix-ui/themes"
import { BrowserRouter } from 'react-router-dom'

import "@radix-ui/themes/styles.css"
import './index.css'

import App from './App.jsx'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Theme scaling="110%">
                <App />
                {/* <ThemePanel /> */}
            </Theme>
        </BrowserRouter>
    </StrictMode>
)
