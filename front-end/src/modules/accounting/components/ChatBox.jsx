import { useState, useEffect, useRef } from 'react';
import { accountingApi } from '../../../services/accountingApi';

/**
 * ChatBox Component
 *
 * Real-time chat interface between users and accountants.
 *
 * Features:
 * - Send/receive messages
 * - Auto-scroll to latest message
 * - Polling for new messages (every 5s)
 * - Mark messages as read
 * - Loading/error states
 * - Timestamps
 *
 * Props:
 * - requestId: Registration request ID (optional)
 * - companyId: Company ID (optional)
 * - receiverId: Who receives the messages
 * - currentUserId: Current logged user ID
 */
export default function ChatBox({ requestId, companyId, receiverId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages initially
  useEffect(() => {
    loadMessages();
  }, [requestId, companyId]);

  // Polling: fetch messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true); // silent reload (no loading spinner)
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId, companyId]);

  /**
   * Load messages from API
   */
  const loadMessages = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      let fetchedMessages = [];
      if (requestId) {
        fetchedMessages = await accountingApi.getMessagesByRequest(requestId);
      } else if (companyId) {
        fetchedMessages = await accountingApi.getMessagesByCompany(companyId);
      }

      setMessages(fetchedMessages || []);

      // Mark unread messages as read
      if (fetchedMessages && fetchedMessages.length > 0) {
        const unreadMessages = fetchedMessages.filter(
          (msg) => !msg.isRead && msg.receiverId === currentUserId
        );

        for (const msg of unreadMessages) {
          try {
            await accountingApi.markMessageAsRead(msg.id);
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      if (!silent) {
        setError(err.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /**
   * Send a new message
   */
  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const messageData = {
        requestId: requestId || null,
        companyId: companyId || null,
        receiverId,
        message: newMessage.trim(),
      };

      await accountingApi.sendMessage(messageData);

      // Clear input
      setNewMessage('');

      // Reload messages immediately
      await loadMessages(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copilot-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 card-copilot min-h-[400px] max-h-[600px]">
        {messages.length === 0 ? (
          <div className="text-center text-copilot-text-tertiary py-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          messages.map((msg) => {
            const isSentByMe = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isSentByMe
                      ? 'bg-copilot-accent text-white'
                      : 'bg-copilot-bg-secondary border border-copilot-border-default text-copilot-text-primary'
                  }`}
                >
                  {/* Sender name (if not me) */}
                  {!isSentByMe && msg.sender && (
                    <p className="text-xs font-semibold text-copilot-text-secondary mb-1">
                      {msg.sender.full_name || msg.sender.email}
                    </p>
                  )}

                  {/* Message content */}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1 ${
                      isSentByMe ? 'text-white/70' : 'text-copilot-text-tertiary'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={sending}
          className="input-copilot flex-1 disabled:opacity-50"
          maxLength={5000}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="btn-copilot-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {/* Character count */}
      <p className="text-xs text-copilot-text-tertiary mt-1">
        {newMessage.length} / 5000 caracteres
      </p>
    </div>
  );
}
