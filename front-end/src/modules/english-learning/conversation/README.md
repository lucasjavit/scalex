# 🎥 Video Call Module

Módulo de videochamada para prática de inglês usando Daily.co.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard**: Página principal com estatísticas e ações
- **Matching**: Sistema de busca de parceiros de conversa
- **Video Call**: Interface de videochamada com Daily.co
- **Tópicos de Conversa**: 8 categorias diferentes de tópicos
- **Estatísticas**: Contagem de chamadas e tempo de prática
- **Responsivo**: Design adaptável para mobile e desktop

### 🔧 Tecnologias Utilizadas
- **Daily.co**: Plataforma de videochamada SaaS (30k minutos/mês grátis)
- **React**: Interface de usuário
- **React Router**: Navegação
- **Tailwind CSS**: Estilização
- **@daily-co/daily-js**: SDK oficial do Daily.co

## 📁 Estrutura do Módulo

```
video-call/
├── components/
│   └── VideoCall.jsx          # Componente principal de videochamada
├── pages/
│   ├── VideoCallDashboard.jsx # Dashboard principal
│   ├── Matching.jsx           # Página de busca de parceiros
│   └── VideoCallRoom.jsx      # Sala de videochamada
├── services/
│   └── videoCallService.js    # Serviço de gerenciamento
├── VideoCallRoutes.jsx        # Rotas do módulo
├── index.js                   # Exports do módulo
└── README.md                  # Documentação
```

## 🎯 Como Usar

### 1. Acessar o Módulo
- Faça login na aplicação
- Clique em "Video Call" no navbar ou na página inicial
- Acesse `/video-call` diretamente

### 2. Iniciar uma Chamada
- **Buscar Parceiro**: Clique em "Find a Partner"
- **Escolher Tópico**: Selecione um tópico de conversa
- **Aguardar Match**: O sistema encontrará um parceiro
- **Iniciar Chamada**: Clique em "Start Video Call"

### 3. Entrar em Sala
- **Com Room ID**: Clique em "Join with Room ID"
- **Inserir ID**: Digite o ID da sala compartilhada
- **Entrar**: Acesse a sala diretamente

## 🎨 Tópicos de Conversa

1. **🎲 Random Topics** - Tópicos aleatórios
2. **✈️ Travel & Culture** - Viagem e cultura
3. **🍕 Food & Cooking** - Comida e culinária
4. **💻 Technology** - Tecnologia
5. **⚽ Sports & Fitness** - Esportes e fitness
6. **🎵 Music & Entertainment** - Música e entretenimento
7. **📚 Books & Literature** - Livros e literatura
8. **💼 Career & Work** - Carreira e trabalho

## ⚙️ Configuração do Daily.co

### Configurações Aplicadas
- **Áudio**: Habilitado por padrão
- **Vídeo**: Habilitado por padrão
- **Screen Share**: Habilitado
- **Chat**: Habilitado
- **Máximo de Participantes**: 4 (plano gratuito)
- **Interface**: Personalizada com controles customizados

### Personalizações
- Botão de sair customizado
- Contador de participantes
- Interface integrada com o tema da aplicação
- Gerenciamento automático de salas via backend

## 📊 Estatísticas

O módulo rastreia:
- **Total de Chamadas**: Número de sessões completadas
- **Tempo Total**: Duração acumulada de prática
- **Duração Média**: Tempo médio por chamada
- **Última Chamada**: Data da última sessão

## 🔧 Desenvolvimento

### Adicionando Novos Tópicos
```javascript
// Em videoCallService.js
const topics = [
  { id: 'novo-topico', name: 'Novo Tópico', icon: '🎯', description: 'Descrição' }
];
```

### Personalizando Daily.co
```javascript
// Em VideoCallDaily.jsx
await dailyFrameRef.current.join({
  url: roomUrl,
  token: token,
  showFullscreenButton: true,
  showLocalVideo: true,
  // Outras opções...
});
```

## 🚀 Próximas Funcionalidades

- [ ] Sistema de avaliação de parceiros
- [ ] Histórico de conversas
- [ ] Filtros avançados de matching
- [ ] Integração com backend
- [ ] Notificações em tempo real
- [ ] Sistema de favoritos
- [ ] Chat de texto durante chamada
- [ ] Gravação de chamadas (opcional)

## 🐛 Solução de Problemas

### Problemas Comuns
1. **Câmera não funciona**: Verifique permissões do navegador
2. **Áudio não funciona**: Verifique permissões de microfone
3. **Não consegue entrar na sala**: Verifique se o ID da sala está correto
4. **Interface não carrega**: Verifique conexão com internet

### Logs de Debug
```javascript
// Ativar logs detalhados
console.log('Daily.co room URL:', roomUrl);
console.log('Daily.co token:', token);
console.log('Room name:', roomName);
console.log('User info:', user);
```

## 📝 Notas Importantes

- **Gratuito**: Usa Daily.co com plano gratuito (30.000 minutos/mês)
- **Limite Gratuito**: Até 30.000 minutos/mês, depois é necessário upgrade
- **Privacidade**: Salas privadas criadas sob demanda
- **Compatibilidade**: Funciona em todos os navegadores modernos
- **Infraestrutura**: Gerenciada pelo Daily.co (não requer servidores próprios)

## 🤝 Contribuição

Para contribuir com o módulo:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Submeta um pull request

## 📄 Licença

Este módulo segue a mesma licença do projeto principal.
