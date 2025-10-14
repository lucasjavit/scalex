// Teste de variáveis de ambiente
import React from 'react';

const TestEnv = () => {
  const jitsiDomain = import.meta.env.VITE_JITSI_DOMAIN;
  const jitsiTenant = import.meta.env.VITE_JITSI_TENANT;
  const jitsiJwt = import.meta.env.VITE_JITSI_JWT;
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Environment Variables Test</h2>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <p><strong>VITE_JITSI_DOMAIN:</strong> {jitsiDomain || '❌ undefined'}</p>
        <p><strong>VITE_JITSI_TENANT:</strong> {jitsiTenant || '(empty)'}</p>
        <p><strong>VITE_JITSI_JWT:</strong> {jitsiJwt || '(empty)'}</p>
        <p><strong>VITE_API_URL:</strong> {apiUrl || '❌ undefined'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: jitsiDomain === 'localhost:8443' ? '#d4edda' : '#f8d7da', borderRadius: '8px' }}>
        {jitsiDomain === 'localhost:8443' ? (
          <p>✅ <strong>Correto!</strong> Jitsi domain está configurado para localhost:8443</p>
        ) : (
          <p>❌ <strong>Erro!</strong> Esperado: localhost:8443, Recebido: {jitsiDomain || 'undefined'}</p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <p><strong>Instruções:</strong></p>
        <ul>
          <li>Se VITE_JITSI_DOMAIN estiver undefined ou diferente de localhost:8443, reinicie o servidor</li>
          <li>Execute: <code>npm run dev</code></li>
          <li>Limpe o cache: <code>rm -rf node_modules/.vite</code></li>
        </ul>
      </div>
    </div>
  );
};

export default TestEnv;
