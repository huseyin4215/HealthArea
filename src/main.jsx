import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Gerçek bir API'ye bağlı olmadığından, localStorage'ı kullanarak bazı demo verileri ekleyeceğiz
if (!localStorage.getItem('demoInitialized')) {
  // Demo verileri ekleyelim
  try {
    localStorage.setItem('token', 'demo-token-123456')
    localStorage.setItem('demoInitialized', 'true')
    
    // Kullanıcıya başlangıç puanları ve streak verelim
    const initialUserProgress = {
      points: 50,
      currentStreak: 3,
      longestStreak: 3,
      selectedAvatarId: 'default',
      customNickname: '',
      lastActive: new Date().toISOString()
    }
    
    localStorage.setItem('userProgress_1', JSON.stringify(initialUserProgress))
  } catch (error) {
    console.error('Demo verileri oluşturulamadı:', error)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 