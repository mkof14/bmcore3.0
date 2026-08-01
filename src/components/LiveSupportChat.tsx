import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';
import TypingIndicator from './TypingIndicator';
import { notifyUserError } from '../lib/adminNotify';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  sender_name?: string;
  is_support?: boolean;
}

interface LiveSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveSupportChat({ isOpen, onClose }: LiveSupportChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [initError, setInitError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useSession();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const setupRealtimeSubscriptions = useCallback(
    (currentRoomId: string) => {
      const messageChannel = supabase
        .channel(`room:${currentRoomId}:messages`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${currentRoomId}`,
          },
          async (payload) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, is_admin')
              .eq('id', payload.new.user_id)
              .maybeSingle();

            const newMsg: Message = {
              id: payload.new.id,
              content: payload.new.content,
              user_id: payload.new.user_id,
              created_at: payload.new.created_at,
              sender_name: profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                  t('liveSupportChat.userFallback')
                : t('liveSupportChat.userFallback'),
              is_support: profile?.is_admin || false,
            };

            setMessages((prev) => [...prev, newMsg]);
          },
        )
        .subscribe();

      const typingChannel = supabase
        .channel(`room:${currentRoomId}:typing`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_typing_indicators',
            filter: `room_id=eq.${currentRoomId}`,
          },
          async (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              if (payload.new.user_id !== user?.id) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', payload.new.user_id)
                  .maybeSingle();

                const name = profile
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                    t('liveSupportChat.someoneFallback')
                  : t('liveSupportChat.someoneFallback');

                setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));

                setTimeout(() => {
                  setTypingUsers((prev) => prev.filter((n) => n !== name));
                }, 5000);
              }
            } else if (payload.eventType === 'DELETE') {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', payload.old.user_id)
                .maybeSingle();

              const name = profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                  t('liveSupportChat.someoneFallback')
                : t('liveSupportChat.someoneFallback');

              setTypingUsers((prev) => prev.filter((n) => n !== name));
            }
          },
        )
        .subscribe();

      return () => {
        messageChannel.unsubscribe();
        typingChannel.unsubscribe();
      };
    },
    [t, user],
  );

  const loadMessages = async (currentRoomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(
        `
        id,
        content,
        user_id,
        created_at,
        profiles:user_id (
          first_name,
          last_name,
          is_admin
        )
      `,
      )
      .eq('room_id', currentRoomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      const formattedMessages = (data as Array<Record<string, unknown>>).map((msg) => {
        const profileRaw = msg.profiles;
        const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
        const p = profile as { first_name?: string; last_name?: string; is_admin?: boolean } | null;
        return {
          id: msg.id as string,
          content: msg.content as string,
          user_id: msg.user_id as string,
          created_at: msg.created_at as string,
          sender_name: p
            ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || t('liveSupportChat.userFallback')
            : t('liveSupportChat.userFallback'),
          is_support: p?.is_admin || false,
        };
      });
      setMessages(formattedMessages);
    }
  };

  const initializeChat = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setInitError(false);
    try {
      const { data: existingRooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('type', 'support')
        .eq('created_by', user.id)
        .maybeSingle();

      let currentRoomId: string;

      if (existingRooms) {
        currentRoomId = existingRooms.id;
      } else {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            name: 'Support Chat',
            type: 'support',
            created_by: user.id,
          })
          .select()
          .single();

        if (roomError) throw roomError;
        currentRoomId = newRoom.id;

        await supabase.from('chat_participants').insert({
          room_id: currentRoomId,
          user_id: user.id,
          role: 'member',
        });
      }

      setRoomId(currentRoomId);
      await loadMessages(currentRoomId);
      setupRealtimeSubscriptions(currentRoomId);
    } catch {
      setInitError(true);
      notifyUserError(t('liveSupportChat.loadError'));
    } finally {
      setLoading(false);
    }
  }, [setupRealtimeSubscriptions, t, user]);

  useEffect(() => {
    if (isOpen && user) {
      void initializeChat();
    }
    if (!isOpen) {
      setInitError(false);
    }
  }, [isOpen, user, initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTyping = async () => {
    if (!roomId || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      await supabase.from('chat_typing_indicators').upsert({
        room_id: roomId,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await supabase
        .from('chat_typing_indicators')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    }, 3000);
  };

  const sendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!newMessage.trim() || !roomId || !user) return;

    const messageText = newMessage;
    setNewMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    await supabase
      .from('chat_typing_indicators')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: messageText,
      type: 'text',
    });

    if (error) {
      setNewMessage(messageText);
      notifyUserError(t('liveSupportChat.sendError'));
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[min(600px,calc(100vh-6rem))] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-2xl border border-[var(--bm-border)] bg-surface shadow-2xl sm:right-6">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-orange-700/20 bg-gradient-to-r from-orange-600 to-orange-700 p-4 text-white">
        <div>
          <h3 className="text-lg font-semibold">{t('liveSupportChat.title')}</h3>
          <p className="text-xs text-orange-100">{t('liveSupportChat.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-white/20"
          aria-label={t('liveSupportChat.closeAria')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-page p-4">
        {!user ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Send className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="mb-2 font-medium text-gray-900 dark:text-neutral-100">
              {t('liveSupportChat.signInTitle')}
            </p>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {t('liveSupportChat.signInBody')}
            </p>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />
          </div>
        ) : initError ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="mb-2 font-medium text-gray-900 dark:text-neutral-100">
              {t('liveSupportChat.errorTitle')}
            </p>
            <p className="mb-4 text-sm text-gray-600 dark:text-neutral-300">
              {t('liveSupportChat.errorBody')}
            </p>
            <button
              type="button"
              onClick={() => void initializeChat()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
            >
              {t('liveSupportChat.retry')}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Send className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="mb-2 font-medium text-gray-900 dark:text-neutral-100">
              {t('liveSupportChat.emptyTitle')}
            </p>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {t('liveSupportChat.emptyBody')}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.user_id === user?.id
                      ? 'bg-orange-600 text-white'
                      : message.is_support
                        ? 'border border-orange-200 bg-orange-50 text-gray-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-neutral-100'
                        : 'border border-[var(--bm-border)] bg-surface text-gray-900 dark:text-neutral-100'
                  }`}
                >
                  {message.user_id !== user?.id && (
                    <p
                      className={`mb-1 text-xs font-semibold ${
                        message.is_support
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      {message.is_support
                        ? t('liveSupportChat.supportTeam')
                        : message.sender_name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      message.user_id === user?.id
                        ? 'text-orange-100'
                        : 'text-gray-500 dark:text-neutral-400'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-[var(--bm-border)] bg-surface px-4 py-2">
                  <TypingIndicator />
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {t('liveSupportChat.typing', { name: typingUsers[0] })}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="rounded-b-2xl border-t border-[var(--bm-border)] bg-surface p-4"
      >
        <div className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              void handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(e);
              }
            }}
            placeholder={t('liveSupportChat.placeholder')}
            rows={2}
            disabled={!user || loading || initError}
            className="flex-1 resize-none rounded-lg border border-[var(--bm-border)] bg-page px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!user || !newMessage.trim() || loading || initError}
            className="rounded-lg bg-orange-600 p-3 text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-[var(--bm-border)]"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          {t('liveSupportChat.hint')}
        </p>
      </form>
    </div>
  );
}
