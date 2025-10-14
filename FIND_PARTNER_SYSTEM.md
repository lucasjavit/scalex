# 🎯 Sistema de Find Partner - Documentação

## 📋 Visão Geral

O sistema **Find Partner** é um matchmaking automático que cria sessões programadas de vídeo chamadas a cada 10 minutos, emparelhando usuários com base no nível de inglês.

---

## 🔄 Fluxo Completo

### 1️⃣ **Usuário Entra na Fila**
- Usuário clica em "Find Partner" no dashboard
- Sistema adiciona usuário à fila de espera
- Usuário é redirecionado para `/video-call/waiting-queue`

### 2️⃣ **Página de Espera**
- Mostra posição na fila
- Countdown para próxima sessão
- Botão "Sair da Fila"
- **Polling a cada 2 segundos** para verificar:
  - Se sessão começou → Redireciona para a room
  - Se não está mais na fila → Volta ao dashboard

### 3️⃣ **Sistema Cria Sessões (A cada 10 minutos)**
- Backend automaticamente:
  - Agrupa usuários por nível (beginner, intermediate, advanced)
  - Cria pares de 2 usuários
  - Gera rooms automáticas
  - Remove usuários da fila
  - **Usuários ímpares** são removidos e precisam clicar novamente

### 4️⃣ **Sessão Ativa (10 minutos)**
- Usuários conversam na room
- Timer de 10 minutos
- Não podem trocar de room

### 5️⃣ **Fim da Sessão**
- Após 10 minutos, sessão termina automaticamente
- Usuários são redirecionados ao dashboard
- Sistema aguarda **2 minutos**
- Próxima sessão começa (ciclo se repete)

---

## 🏗️ Arquitetura

### **Backend (NestJS)**

#### **Entities**
```typescript
// QueueUser - Usuário na fila
{
  userId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  preferences: { topic?, language? };
  joinedAt: Date;
}

// Session - Sessão ativa
{
  sessionId: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'ended';
  rooms: SessionRoom[];
}

// SessionRoom - Room de uma sessão
{
  roomName: string;
  sessionId: string;
  user1: string;
  user2: string;
  level: string;
  status: 'active' | 'ended';
}
```

#### **Endpoints**
- `POST /video-call/queue/join` - Entrar na fila
- `DELETE /video-call/queue/leave/:userId` - Sair da fila
- `GET /video-call/queue/status/:userId` - Status do usuário
- `GET /video-call/queue` - Ver toda a fila (admin/debug)
- `GET /video-call/sessions` - Ver todas as sessões (admin/debug)
- `GET /video-call/session-room/:roomName` - Detalhes da room

#### **VideoCallQueueService**
- **Armazenamento**: In-memory com `Map`
- **Timer Automático**: Cria sessões a cada 10 minutos + 2 minutos de espera
- **Matchmaking**: Agrupa por nível, emparelha por ordem de chegada (FIFO)
- **Limpeza**: Remove usuários ímpares, finaliza sessões antigas

---

### **Frontend (React)**

#### **Páginas**
1. **VideoCallDashboard.jsx**
   - Botão "Find Partner" → Entra na fila

2. **WaitingQueue.jsx**
   - Polling a cada 2 segundos
   - Countdown timer
   - Auto-redirect quando sessão começar

3. **VideoCallRoom.jsx**
   - Sessão de vídeo chamada
   - Auto-redirect ao dashboard quando terminar

#### **Services (videoCallService.js)**
```javascript
// Queue methods
joinQueue(userId, level, preferences)
leaveQueue(userId)
getQueueStatus(userId)
getQueue()
getAllSessions()
getSessionRoom(roomName)
```

---

## ⏱️ Timeline Example

```
00:00 - Sistema cria sessão automática
        Fila: [Alice (intermediate), Bob (intermediate), 
               Carol (beginner), David (beginner), 
               Eve (intermediate)]
        
        Resultado:
        ✅ Room 1: Alice + Bob (intermediate)
        ✅ Room 2: Carol + David (beginner)
        ❌ Eve: Removida da fila (número ímpar no nível intermediate)

00:10 - Sessões terminam
        → Todos redirecionados ao dashboard

00:12 - Sistema aguarda 2 minutos
        → Nova sessão se inicia (se tiver usuários na fila)

00:22 - Próxima sessão
        ...ciclo se repete
```

---

## 🎯 Casos de Uso

### **Caso 1: Matchmaking Bem-Sucedido**
```
Fila: [Alice (intermediate), Bob (intermediate)]
Sistema: Cria Room 1 com Alice + Bob
Resultado: ✅ Ambos redirecionados para /video-call/room/room_session_123_intermediate_0
```

### **Caso 2: Número Ímpar**
```
Fila: [Alice (intermediate), Bob (intermediate), Carol (intermediate)]
Sistema: 
  - Cria Room 1 com Alice + Bob
  - Remove Carol da fila
Resultado: 
  ✅ Alice + Bob → Room
  ❌ Carol → Volta ao dashboard (precisa clicar "Find Partner" novamente)
```

### **Caso 3: Fila Vazia**
```
Fila: []
Sistema: Nenhuma room criada, aguarda próximo ciclo
```

### **Caso 4: Apenas 1 Usuário**
```
Fila: [Alice (intermediate)]
Sistema: Não cria room (precisa de 2), remove Alice da fila
Resultado: ❌ Alice volta ao dashboard
```

### **Caso 5: Níveis Diferentes**
```
Fila: [Alice (beginner), Bob (intermediate)]
Sistema: Nenhum par possível, ambos removidos
Resultado: ❌ Alice e Bob voltam ao dashboard
```

---

## 🔧 Configuração

### **Timers (back-end/src/video-call/video-call-queue.service.ts)**
```typescript
private readonly SESSION_DURATION = 10 * 60 * 1000; // 10 minutos
private readonly WAIT_DURATION = 2 * 60 * 1000;    // 2 minutos
```

### **Polling (front-end/src/modules/video-call/pages/WaitingQueue.jsx)**
```javascript
const interval = setInterval(pollQueueStatus, 2000); // 2 segundos
```

---

## 🧪 Como Testar

### **Teste com Múltiplos Usuários:**

1. **Abra 4 browsers/sessões diferentes**
2. **Faça login com contas diferentes**
3. **Clique "Find Partner" em todas as sessões**
4. **Observe:**
   - Todos aparecem na fila
   - Countdown sincronizado
   - Quando sessão começar:
     - 2 pares são criados
     - Usuários são redirecionados automaticamente
5. **Após 10 minutos:**
   - Todos voltam ao dashboard

### **Endpoints de Debug:**
```bash
# Ver fila atual
GET http://localhost:3000/video-call/queue

# Ver sessões ativas
GET http://localhost:3000/video-call/sessions

# Status de um usuário
GET http://localhost:3000/video-call/queue/status/USER_ID
```

---

## 📊 Logs Importantes

### **Backend Logs:**
```
[VideoCallQueueService] User abc123 joined queue. Level: intermediate. Queue size: 3
[VideoCallQueueService] === CREATING NEW SESSION ===
[VideoCallQueueService] Queue size: 4
[VideoCallQueueService] Level intermediate: 3 users
[VideoCallQueueService] Created room: room_session_xxx_intermediate_0 for users abc123 and def456
[VideoCallQueueService] Removed odd user ghi789 from queue
[VideoCallQueueService] Session session_xxx created with 1 rooms
[VideoCallQueueService] Next session scheduled at 2025-10-14T17:22:00.000Z
```

### **Frontend Logs:**
```
=== JOINING QUEUE VIA API ===
User ID: abc123
Level: intermediate
Queue join result: { success: true, queuePosition: 1 }

Queue status: { inQueue: true, queuePosition: 1, queueSize: 3, currentSession: null }

Session started! Redirecting to room: room_session_xxx_intermediate_0
```

---

## 🚀 Próximos Passos (Melhorias Futuras)

1. ✅ **Persistência em Banco de Dados**
   - Migrar de in-memory para PostgreSQL
   - Histórico de sessões

2. ✅ **WebSockets**
   - Substituir polling por notificações em tempo real
   - Melhor performance

3. ✅ **Sistema de Preferências**
   - Usuários escolhem nível no perfil
   - Preferências de tópicos

4. ✅ **Admin Dashboard**
   - Visualizar sessões em andamento
   - Estatísticas em tempo real
   - Controle manual de sessões

5. ✅ **Notificações**
   - Notificar quando sessão está prestes a começar
   - Email/Push notifications

---

## ⚠️ Observações Importantes

1. **Sessões Automáticas**: O timer inicia assim que o backend sobe. Para testes, ajuste os timers para valores menores.

2. **In-Memory Storage**: Dados são perdidos ao reiniciar o servidor. Para produção, use banco de dados.

3. **Usuários Ímpares**: São removidos da fila e precisam clicar novamente em "Find Partner".

4. **Polling**: Frontend faz polling a cada 2 segundos. Considere WebSockets para produção.

5. **Timezone**: Sistema usa UTC para timestamps. Ajuste conforme necessário.

---

## 📝 Licença

Este sistema foi desenvolvido como parte do projeto ScaleX - English Learning Platform.

---

**Desenvolvido por:** ScaleX Team  
**Data:** Outubro 2025  
**Versão:** 1.0.0

