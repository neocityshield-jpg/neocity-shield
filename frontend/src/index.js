import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Registrar Service Worker para modo offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registrado'))
      .catch(e => console.log('SW error:', e));

    // Escuchar reportes offline guardados
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data.type === 'SAVE_OFFLINE') {
        const pending = JSON.parse(localStorage.getItem('offline-reports') || '[]');
        pending.push({ ...e.data.payload, timestamp: Date.now() });
        localStorage.setItem('offline-reports', JSON.stringify(pending));
      }
    });
  });
}
