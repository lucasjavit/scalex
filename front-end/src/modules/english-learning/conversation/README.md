# 🎥 Video Call Module

Módulo de videochamada para prática de inglês usando Jitsi Meet.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard**: Página principal com estatísticas e ações
- **Matching**: Sistema de busca de parceiros de conversa
- **Video Call**: Interface de videochamada com Jitsi Meet
- **Tópicos de Conversa**: 8 categorias diferentes de tópicos
- **Estatísticas**: Contagem de chamadas e tempo de prática
- **Responsivo**: Design adaptável para mobile e desktop

### 🔧 Tecnologias Utilizadas
- **Jitsi Meet**: Plataforma de videochamada open source
- **React**: Interface de usuário
- **React Router**: Navegação
- **Tailwind CSS**: Estilização
- **LocalStorage**: Armazenamento local de sessões

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

## ⚙️ Configuração do Jitsi Meet

### Configurações Aplicadas
- **Áudio**: Habilitado por padrão
- **Vídeo**: Habilitado por padrão
- **Qualidade**: 720p
- **Controles**: Interface personalizada
- **Branding**: Removido (sem marca d'água)

### Personalizações
- Interface em português
- Controles customizados
- Tema personalizado
- Sem página de boas-vindas

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

### Personalizando Jitsi Meet
```javascript
// Em VideoCall.jsx
const options = {
  configOverwrite: {
    // Suas configurações aqui
  }
};
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
console.log('Jitsi API loaded:', window.JitsiMeetExternalAPI);
console.log('Room name:', roomName);
console.log('User info:', user);
```

## 📝 Notas Importantes

- **Gratuito**: Usa Jitsi Meet gratuito (meet.jit.si)
- **Sem Limitações**: Sem restrições de tempo ou usuários
- **Privacidade**: Dados armazenados localmente
- **Compatibilidade**: Funciona em todos os navegadores modernos

## 🤝 Contribuição

Para contribuir com o módulo:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Submeta um pull request

## 📄 Licença

Este módulo segue a mesma licença do projeto principal.
