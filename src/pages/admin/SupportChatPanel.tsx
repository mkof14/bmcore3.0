import { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, Send, Users, Clock, Loader, Zap, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminDb } from '../../lib/adminApi';
import { useSession } from '../../hooks/useSession';
import TypingIndicator from '../../components/TypingIndicator';
import { notifyError } from '../../lib/adminNotify';

const QUICK_REPLIES = [
  { id: 1, text: "Thank you for reaching out! How can I help you today?" },
  { id: 2, text: "I'm here to assist you. Let me look into that for you." },
  { id: 3, text: "Could you provide more details about the issue you're experiencing?" },
  { id: 4, text: "Thank you for your patience. I'm checking this now." },
  { id: 5, text: "Is there anything else I can help you with today?" },
  { id: 6, text: "That's a great question! Let me explain..." },
];

interface ChatRoom {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  unread_count: number;
  last_message?: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  sender_name?: string;
  is_support?: boolean;
}

export default function SupportChatPanel() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useSession();

  useEffect(() => {
    loadChatRooms();
    const interval = setInterval(loadChatRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      setupRealtimeSubscriptions(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredRooms = useMemo(() => {
    return chatRooms.filter((room) => {
      const matchesUnread = !filterUnread || room.unread_count > 0;
      if (!matchesUnread) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        room.user_name.toLowerCase().includes(query) ||
        room.last_message?.toLowerCase().includes(query)
      );
    });
  }, [chatRooms, filterUnread, searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          name,
          created_by,
          created_at,
          updated_at,
          profiles:created_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq('type', 'support')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const roomsWithUnread = await Promise.all(
        (data || []).map(async (room: any) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .neq('user_id', room.created_by);

          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: room.id,
            name: room.name,
            created_by: room.created_by,
            created_at: room.created_at,
            updated_at: room.updated_at,
            user_name: room.profiles
              ? `${room.profiles.first_name || ''} ${room.profiles.last_name || ''}`.trim() ||
                room.profiles.email
              : 'Unknown User',
            unread_count: count || 0,
            last_message: lastMsg?.content,
          };
        })
      );

      setChatRooms(roomsWithUnread);
      setError(null);
    } catch (error) {
      notifyError('Support chat rooms load failed');
      setError('Unable to load support chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            is_admin
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          created_at: msg.created_at,
          sender_name: msg.profiles
            ? `${msg.profiles.first_name || ''} ${msg.profiles.last_name || ''}`.trim() || 'User'
            : 'User',
          is_support: msg.profiles?.is_admin || false,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      notifyError('Support messages load failed');
      setError('Unable to load messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const setupRealtimeSubscriptions = (roomId: string) => {
    const messageChannel = supabase
      .channel(`support-room:${roomId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
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
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
              : 'User',
            is_support: profile?.is_admin || false,
          };

          setMessages((prev) => [...prev, newMsg]);
          loadChatRooms();
        }
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`support-room:${roomId}:typing`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `room_id=eq.${roomId}`,
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
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
                : 'User';

              setTypingUsers((prev) => {
                if (!prev.includes(name)) {
                  return [...prev, name];
                }
                return prev;
              });

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
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
              : 'User';

            setTypingUsers((prev) => prev.filter((n) => n !== name));
          }
        }
      )
      .subscribe();

    return () => {
      messageChannel.unsubscribe();
      typingChannel.unsubscribe();
    };
  };

  const handleTyping = async () => {
    if (!selectedRoom || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      await adminDb({
        table: 'chat_typing_indicators',
        action: 'upsert',
        data: {
          room_id: selectedRoom.id,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await adminDb({
        table: 'chat_typing_indicators',
        action: 'delete',
        match: { room_id: selectedRoom.id, user_id: user.id },
      });
    }, 3000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    await adminDb({
      table: 'chat_typing_indicators',
      action: 'delete',
      match: { room_id: selectedRoom.id, user_id: user.id },
    });

    const result = await adminDb({
      table: 'chat_messages',
      action: 'insert',
      data: {
        room_id: selectedRoom.id,
        user_id: user.id,
        content: messageText,
        type: 'text',
      },
    });

    if (!result.ok) {
      setNewMessage(messageText);
    }

    setSending(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return hours < 1 ? 'Just now' : `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-[var(--bm-surface)] rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Support Chats</span>
          </h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterUnread
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Unread only</span>
          </button>
          <button
            onClick={loadChatRooms}
            className="ml-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            {filteredRooms.length} conversations
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-lg border border-red-500/30 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No active support chats
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                  selectedRoom?.id === room.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {room.user_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(room.updated_at)}</span>
                  </span>
                </div>
                {room.last_message && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {room.last_message}
                  </p>
                )}
                {room.unread_count > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {room.unread_count} new
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedRoom.user_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Started {formatDate(selectedRoom.created_at)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[var(--bm-surface)]">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No messages yet.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.is_support ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.is_support
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {!message.is_support && (
                        <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                          {message.sender_name}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.is_support
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                    <TypingIndicator />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {typingUsers[0]} is typing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              {/* Quick Replies */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Zap className="h-4 w-4" />
                  <span>{showQuickReplies ? 'Hide' : 'Show'} Quick Replies</span>
                </button>

                {showQuickReplies && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply.id}
                        type="button"
                        onClick={() => {
                          setNewMessage(reply.text);
                          setShowQuickReplies(false);
                        }}
                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                      >
                        {reply.text.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-end space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Type your response..."
                  rows={3}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {newMessage.length} characters
                </span>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a chat to start responding
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
