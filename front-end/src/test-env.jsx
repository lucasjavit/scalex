// Teste de variáveis de ambiente
import React from 'react';

const TestEnv = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const dailyApiKey = import.meta.env.VITE_DAILY_API_KEY;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Environment Variables Test</h2>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <p><strong>VITE_API_URL:</strong> {apiUrl || '❌ undefined'}</p>
        <p><strong>VITE_DAILY_API_KEY:</strong> {dailyApiKey ? '✅ Set (hidden)' : '⚠️ Not set (using backend default)'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
        <p>✅ <strong>Daily.co Integration</strong></p>
        <p>Video calls now use Daily.co instead of Jitsi</p>
        <p>API Key is configured in the backend</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p><strong>Instruções:</strong></p>
        <ul>
          <li>VITE_API_URL deve apontar para o backend (ex: http://localhost:3000)</li>
          <li>A chave Daily.co está configurada no backend</li>
          <li>Não são necessárias variáveis adicionais no frontend</li>
        </ul>
      </div>
    </div>
  );
};

export default TestEnv;
