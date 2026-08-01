import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyUserError } from '../lib/adminNotify';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  type: string;
}

interface RealtimeChatProps {
  roomId: string;
  onClose?: () => void;
}

export default function RealtimeChat({ roomId, onClose }: RealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
    subscribeToMessages();
    subscribeToTyping();

    return () => {
      supabase.channel(`room:${roomId}`).unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      notifyUserError('Messages failed to load.');
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newPayload = payload.new as any;
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newPayload.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newPayload, user: userData } as Message,
          ]);
        }
      )
      .subscribe();

    return channel;
  }

  function subscribeToTyping() {
    const channel = supabase
      .channel(`typing:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newPayload = payload.new as any;
          if (newPayload && newPayload.user_id !== currentUser?.id) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', newPayload.user_id)
              .single();

            if (data) {
              setTypingUsers((prev) =>
                prev.includes(data.full_name) ? prev : [...prev, data.full_name]
              );

              setTimeout(() => {
                setTypingUsers((prev) =>
                  prev.filter((name) => name !== data.full_name)
                );
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    return channel;
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        user_id: currentUser?.id,
        content: newMessage.trim(),
        type: 'text',
      });

      if (error) throw error;
      setNewMessage('');
      await clearTypingIndicator();
    } catch (error) {
      notifyUserError('Message send failed.');
    } finally {
      setSending(false);
    }
  }

  async function handleTyping() {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await supabase.from('chat_typing_indicators').upsert({
      room_id: roomId,
      user_id: currentUser?.id,
      updated_at: new Date().toISOString(),
    });

    typingTimeoutRef.current = setTimeout(async () => {
      await clearTypingIndicator();
    }, 3000);
  }

  async function clearTypingIndicator() {
    await supabase
      .from('chat_typing_indicators')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', currentUser?.id);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-[var(--bm-border)] bg-surface shadow-lg">
      <div className="flex items-center justify-between border-b border-[var(--bm-border)] p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Chat</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-page p-4">
        {messages.map((message) => {
          const isOwn = message.user_id === currentUser?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[70%] gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">
                    {message.user?.full_name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  {!isOwn && (
                    <p className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                      {message.user?.full_name || 'Unknown'}
                    </p>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      isOwn
                        ? 'bg-orange-600 text-white'
                        : 'border border-[var(--bm-border)] bg-surface text-gray-900 dark:text-neutral-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`mt-1 flex items-center gap-1 ${isOwn ? 'justify-end' : ''}`}>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {formatTime(message.created_at)}
                    </p>
                    {isOwn && <CheckCheck className="h-3 w-3 text-orange-600 dark:text-orange-400" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />

        {typingUsers.length > 0 && (
          <div className="text-sm italic text-gray-600 dark:text-neutral-400">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-[var(--bm-border)] bg-surface p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Smile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-[var(--bm-border)] bg-page px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-neutral-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="rounded-lg bg-orange-600 p-2 text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
