import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeadphonesIcon, Send, Mail, MessageCircle, Plus, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import StateCard from '../../components/ui/StateCard';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function SupportSection() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'normal',
    message: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (currentTicket) {
      loadMessages(currentTicket.id);
    }
  }, [currentTicket]);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError('Please sign in to view support tickets');
        return;
      }
      setUserId(user.user.id);

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
      setError(null);
    } catch (error) {
      notifyUserError('Support tickets load failed');
      setError('Unable to load support tickets. Please try again.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setMessageError(null);
    } catch (error) {
      notifyUserError('Support messages load failed');
      setMessageError('Unable to load messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const createTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.message) {
      notifyUserInfo('Subject and message are required');
      return;
    }

    try {
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        notifyUserError('Please sign in to create a ticket');
        return;
      }

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: resolvedUserId,
          subject: newTicketForm.subject,
          category: newTicketForm.category,
          priority: newTicketForm.priority,
          status: 'open',
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      if (ticket) {
        const { error: msgError } = await supabase
          .from('support_messages')
          .insert({
            ticket_id: ticket.id,
            sender_type: 'user',
            message: newTicketForm.message,
          });

        if (msgError) throw msgError;
      }

      setShowNewTicket(false);
      setNewTicketForm({ subject: '', category: 'technical', priority: 'normal', message: '' });
      loadTickets();
      notifyUserSuccess('Support ticket created');
    } catch (error) {
      notifyUserError('Support ticket creation failed');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTicket) {
      notifyUserInfo('Select a ticket to send a message');
      return;
    }

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: currentTicket.id,
          sender_type: 'user',
          message: newMessage,
        });

      if (error) throw error;

      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentTicket.id);

      setNewMessage('');
      loadMessages(currentTicket.id);
      loadTickets();
    } catch (error) {
      notifyUserError('Support message send failed');
      setMessageError('Unable to send message. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400';
      case 'resolved': return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300';
      default: return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-600/30 text-red-700 dark:text-red-400';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-600/30 text-orange-700 dark:text-orange-400';
      case 'normal': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400';
      case 'low': return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300';
      default: return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300';
    }
  };

  return (
    <div>
<ReportBrandHeader
        title="BioMath Core"
        subtitle="Support Center"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="member-card p-4 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Live Chat" className="mb-3" />
          <MessageCircle className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-neutral-50 mb-1">{t('member.support.liveChat')}</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">{t('member.support.liveChatBody')}</p>
          <button className="text-xs text-blue-600 hover:text-blue-700">Start Chat →</button>
        </div>

        <div className="member-card p-4 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Email Support" className="mb-3" />
          <Mail className="h-6 w-6 text-emerald-600 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-neutral-50 mb-1">{t('member.support.emailSupport')}</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">support@biomathcore.com</p>
          <p className="text-xs text-gray-500 dark:text-neutral-300">Response within 24 hours</p>
        </div>

        <div className="member-card p-4 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Support Hours" className="mb-3" />
          <Clock className="h-6 w-6 text-orange-500 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-neutral-50 mb-1">{t('member.support.supportHours')}</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">24/7 for Pro users</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">9AM-6PM EST for Basic</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('member.support.tickets')}</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={loadTickets}>
            Refresh
          </Button>
          <button
            onClick={() => setShowNewTicket(true)}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {loadingTickets ? (
            <StateCard title="Loading tickets..." description="Fetching your support history." />
          ) : tickets.length === 0 ? (
            <StateCard title="No tickets yet" description="Create your first support ticket to get help." />
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setCurrentTicket(ticket)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  currentTicket?.id === ticket.id
                    ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30'
                    : 'bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{ticket.subject}</h4>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="md:col-span-2 member-card flex flex-col h-[600px] shadow-lg">
          <ReportBrandHeader
            variant="strip"
            subtitle="Ticket Details"
            className="m-4 mb-0"
          />
          {currentTicket ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-[var(--bm-border)]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{currentTicket.subject}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(currentTicket.status)}`}>
                    {currentTicket.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(currentTicket.priority)}`}>
                    {currentTicket.priority}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full border bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300">
                    {currentTicket.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messageError && (
                  <ErrorBanner message={messageError} className="mb-4" />
                )}
                {loadingMessages ? (
                  <div className="text-center text-sm text-gray-600 dark:text-neutral-300">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-600 dark:text-neutral-300">No messages yet.</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-xl ${
                          msg.sender_type === 'user'
                            ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30'
                            : 'bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30'
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-[var(--bm-border)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('member.support.typeMessage')}
                    className="flex-1 px-4 py-2 member-input"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-neutral-400">Select a ticket to view conversation or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewTicket && (
        <ModalShell
          title="Create Support Ticket"
          icon={<HeadphonesIcon className="h-6 w-6 text-orange-500" />}
          onClose={() => setShowNewTicket(false)}
          panelClassName="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">Subject</label>
              <input
                type="text"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.support.subjectPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full px-4 py-2 member-input"
                >
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full px-4 py-2 member-input"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-200 mb-2">Message</label>
              <textarea
                value={newTicketForm.message}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 member-input"
                placeholder={t('member.support.descriptionPlaceholder')}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={createTicket}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all"
            >
              Create Ticket
            </button>
            <button
              onClick={() => setShowNewTicket(false)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
