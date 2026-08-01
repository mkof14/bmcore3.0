import { useState, useEffect } from 'react';
import { Mail, Gift, UserPlus, Calendar, Clock, CheckCircle, XCircle, Copy, Send, Trash2, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminDb } from '../../lib/adminApi';
import { sendEmail, htmlToPlainText } from '../../lib/emailProvider';
import { notifyError, notifySuccess } from '../../lib/adminNotify';
import StateCard from '../ui/StateCard';
import SuccessBanner from '../ui/SuccessBanner';
import ModalShell from '../ui/ModalShell';

interface Invitation {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  code: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  plan_type: 'core' | 'daily' | 'max';
  duration_months: number;
  expires_at: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  revoked: number;
}

export default function InvitationManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    revoked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'expired' | 'revoked'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [newInvitation, setNewInvitation] = useState({
    email: '',
    first_name: '',
    last_name: '',
    plan_type: 'core' as 'core' | 'daily' | 'max',
    duration_months: 3,
    expires_in_days: 30,
    notes: '',
    send_email: true,
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invitationsData = data || [];
      setInvitations(invitationsData);

      const calculatedStats: InvitationStats = {
        total: invitationsData.length,
        pending: invitationsData.filter(i => i.status === 'pending').length,
        accepted: invitationsData.filter(i => i.status === 'accepted').length,
        expired: invitationsData.filter(i => i.status === 'expired').length,
        revoked: invitationsData.filter(i => i.status === 'revoked').length,
      };

      setStats(calculatedStats);
    } catch (error) {
      setError('Invitations load failed');
      notifyError('Invitations load failed');
    } finally {
      setLoading(false);
    }
  };

  const generateInvitationCode = async () => {
    const { data, error } = await supabase.rpc('generate_invitation_code');
    if (error) throw error;
    return data;
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      if (!newInvitation.email) {
        throw new Error('Email is required');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const code = await generateInvitationCode();
      const expiresAt = newInvitation.expires_in_days > 0
        ? new Date(Date.now() + newInvitation.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const result = await adminDb({
        table: 'invitations',
        action: 'insert',
        data: {
          email: newInvitation.email,
          first_name: newInvitation.first_name || null,
          last_name: newInvitation.last_name || null,
          code: code,
          invited_by: user.id,
          plan_type: newInvitation.plan_type,
          duration_months: newInvitation.duration_months,
          expires_at: expiresAt,
          notes: newInvitation.notes || null,
          status: 'pending',
        },
      });

      if (!result.ok) throw new Error(result.error || 'Invitation create failed');

      const data = Array.isArray(result.data) ? result.data[0] : result.data;

      let emailFailed = false;
      if (newInvitation.send_email) {
        try {
          await sendInvitationEmail(data);
        } catch (err: any) {
          emailFailed = true;
          const message = err.message || 'Invitation email failed';
          setError(message);
          notifyError(message);
        }
      }

      setNewInvitation({
        email: '',
        first_name: '',
        last_name: '',
        plan_type: 'core',
        duration_months: 3,
        expires_in_days: 30,
        notes: '',
        send_email: true,
      });
      setShowCreateModal(false);
      loadInvitations();
      const successMessage = emailFailed
        ? 'Invitation created. Email failed to send.'
        : `Invitation created. Code: ${code}`;
      setSuccess(successMessage);
      notifySuccess(successMessage);
    } catch (err: any) {
      const message = err.message || 'Invitation create failed';
      setError(message);
      notifyError(message);
    } finally {
      setCreating(false);
    }
  };

  const sendInvitationEmail = async (invitation: Invitation) => {
    const planMap: Record<string, string> = {
      core: 'Core Plan',
      daily: 'Daily Plan',
      max: 'Max Plan',
    };
    const planName = planMap[invitation.plan_type] || invitation.plan_type;
    const inviteLink = `${window.location.origin}/redeem-invitation?code=${invitation.code}`;
    const recipientName = invitation.first_name || invitation.email;
    const subject = `You’re invited to BioMath Core (${planName})`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 8px;">You’re invited to BioMath Core</h2>
        <p>Hi ${recipientName},</p>
        <p>You’ve been invited to join BioMath Core with the <strong>${planName}</strong>.</p>
        <p>Use this invitation code:</p>
        <p style="font-size: 20px; font-weight: bold; color: #F97316;">${invitation.code}</p>
        <p>Click the link below to redeem your invite:</p>
        <p><a href="${inviteLink}" style="color: #2563EB;">${inviteLink}</a></p>
        <p>If you have any questions, reply to this email and we’ll help.</p>
        <p>— BioMath Core Team</p>
      </div>
    `;
    const text = htmlToPlainText(html);

    const result = await sendEmail({
      to: invitation.email,
      subject,
      html,
      text,
    });

    await adminDb({
      table: 'email_sends',
      action: 'insert',
      data: {
        template_id: null,
        recipient_email: invitation.email,
        subject,
        body_html: html,
        body_text: text,
        variables_used: { code: invitation.code, plan: planName },
        send_type: 'invitation',
        status: result.success ? 'sent' : 'failed',
        provider: result.provider || 'edge',
        provider_message_id: result.messageId,
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Invitation email failed');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/redeem-invitation?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevokeInvitation = async (id: string, email: string) => {
    if (!confirm(`Revoke invitation for ${email}?`)) return;

    try {
      const result = await adminDb({
        table: 'invitations',
        action: 'update',
        data: { status: 'revoked', updated_at: new Date().toISOString() },
        match: { id },
      });

      if (!result.ok) throw new Error(result.error || 'Invitation revoke failed');

      loadInvitations();
      setSuccess('Invitation revoked');
      notifySuccess('Invitation revoked');
    } catch (error) {
      setError('Invitation revoke failed');
      notifyError('Invitation revoke failed');
    }
  };

  const handleResendEmail = async (invitation: Invitation) => {
    try {
      await sendInvitationEmail(invitation);
      setSuccess('Invitation email sent');
      notifySuccess('Invitation email sent');
    } catch (error) {
      setError('Email send failed');
      notifyError('Email send failed');
    }
  };

  const handleDeleteInvitation = async (id: string, email: string) => {
    if (!confirm(`Delete invitation for ${email}? This cannot be undone.`)) return;

    try {
      const result = await adminDb({
        table: 'invitations',
        action: 'delete',
        match: { id },
      });

      if (!result.ok) throw new Error(result.error || 'Invitation delete failed');

      loadInvitations();
      setSuccess('Invitation deleted');
      notifySuccess('Invitation deleted');
    } catch (error) {
      setError('Invitation delete failed');
      notifyError('Invitation delete failed');
    }
  };

  const getFilteredInvitations = () => {
    if (filter === 'all') return invitations;
    return invitations.filter(i => i.status === filter);
  };

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      core: 'Core Plan',
      daily: 'Daily Plan',
      max: 'Max Plan',
    };
    return plans[planType] || planType;
  };

  const getDurationText = (months: number) => {
    if (months === 0) return 'Forever';
    if (months === 1) return '1 month';
    if (months === 12) return '1 year';
    return `${months} months`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      accepted: 'bg-green-50 border-green-200 text-green-700',
      expired: 'bg-slate-100 border-slate-200 text-slate-600',
      revoked: 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'revoked': return <XCircle className="h-3 w-3" />;
      case 'expired': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredInvitations = getFilteredInvitations();

  return (
    <div className="space-y-6">
      {success && <SuccessBanner message={success} />}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <Gift className="h-7 w-7 text-purple-500" />
          Invitation Manager
        </h2>
        <div className="flex gap-3">
          <button
            onClick={loadInvitations}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2 border border-slate-200"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            Create Invitation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Gift className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Invitations</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.accepted}</p>
          <p className="text-sm text-gray-600">Accepted</p>
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
          <p className="text-sm text-gray-600">Expired</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.revoked}</p>
          <p className="text-sm text-gray-600">Revoked</p>
        </div>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All ({stats.total})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="accepted">Accepted ({stats.accepted})</option>
              <option value="expired">Expired ({stats.expired})</option>
              <option value="revoked">Revoked ({stats.revoked})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <StateCard title="Loading invitations..." description="Fetching active and historical invites." />
        ) : filteredInvitations.length === 0 ? (
          <StateCard
            title="No invitations found"
            description="Create your first invitation to get started."
            icon={<Gift className="h-10 w-10" />}
          />
        ) : (
          <div className="space-y-3">
            {filteredInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 rounded-lg border bg-slate-50 border-slate-200 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {invitation.first_name || invitation.last_name
                          ? `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim()
                          : invitation.email}
                      </h3>
                      {(invitation.first_name || invitation.last_name) && (
                        <span className="text-sm text-gray-500">({invitation.email})</span>
                      )}
                      <span className={`px-2 py-0.5 border text-xs rounded-full flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        {invitation.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Invitation Code</p>
                        <div className="flex items-center gap-2">
                          <p className="text-purple-600 font-mono font-bold">{invitation.code}</p>
                          <button
                            onClick={() => handleCopyCode(invitation.code)}
                            className="text-gray-500 hover:text-purple-600 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === invitation.code ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Plan & Duration</p>
                        <p className="text-gray-700">
                          {getPlanName(invitation.plan_type)} - {getDurationText(invitation.duration_months)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="text-gray-700">{new Date(invitation.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="text-gray-700">
                          {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    {invitation.notes && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-sm">Notes</p>
                        <p className="text-gray-700 text-sm">{invitation.notes}</p>
                      </div>
                    )}

                    {invitation.status === 'accepted' && invitation.accepted_at && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Accepted on {new Date(invitation.accepted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {invitation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCopyLink(invitation.code)}
                          className="p-2 bg-purple-50 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Copy Invitation Link"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResendEmail(invitation)}
                          className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Resend Email"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                          className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Revoke Invitation"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                      className="p-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Delete Invitation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <ModalShell
          title="Create New Invitation"
          icon={<Gift className="h-6 w-6 text-purple-400" />}
          onClose={() => setShowCreateModal(false)}
          panelClassName="max-w-md"
        >

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newInvitation.first_name}
                    onChange={(e) => setNewInvitation({ ...newInvitation, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newInvitation.last_name}
                    onChange={(e) => setNewInvitation({ ...newInvitation, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Gift className="h-4 w-4 inline mr-1" />
                  Plan Type *
                </label>
                <select
                  value={newInvitation.plan_type}
                  onChange={(e) => setNewInvitation({ ...newInvitation, plan_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="core">Core Plan ($19/mo)</option>
                  <option value="daily">Daily Plan ($39/mo)</option>
                  <option value="max">Max Plan ($79/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Free Duration
                </label>
                <select
                  value={newInvitation.duration_months}
                  onChange={(e) => setNewInvitation({ ...newInvitation, duration_months: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">1 Year</option>
                  <option value="0">Forever (Lifetime)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Invitation Expires In
                </label>
                <select
                  value={newInvitation.expires_in_days}
                  onChange={(e) => setNewInvitation({ ...newInvitation, expires_in_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="0">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newInvitation.notes}
                  onChange={(e) => setNewInvitation({ ...newInvitation, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Internal notes about this invitation..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send_email"
                  checked={newInvitation.send_email}
                  onChange={(e) => setNewInvitation({ ...newInvitation, send_email: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="send_email" className="text-sm text-gray-700 flex items-center gap-1">
                  <Send className="h-4 w-4 text-purple-500" />
                  Send invitation email automatically
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewInvitation({
                      email: '',
                      first_name: '',
                      last_name: '',
                      plan_type: 'core',
                      duration_months: 3,
                      expires_in_days: 30,
                      notes: '',
                      send_email: true,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Invitation'}
                </button>
              </div>
            </form>
        </ModalShell>
      )}
    </div>
  );
}
