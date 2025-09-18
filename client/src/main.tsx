import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Movie from './App.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Movie />
  </StrictMode>,
)
