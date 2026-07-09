/**
 * المحضر الذكي — Smart Judicial Minutes (Teams tab client entrypoint)
 * Designed and Developed by Mohammed Al-Maabdi (mbmaabdi@moj.gov.sa)
 * Ministry of Justice — Kingdom of Saudi Arabia
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root was not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
