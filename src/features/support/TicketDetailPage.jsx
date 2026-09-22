import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  LifeBuoy,
  Send,
  UserCheck,
  CheckCircle,
  Clock,
  Shield,
  Phone,
  HeartHandshake,
  User,
  ShieldAlert,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { useAuthStore } from '../../auth/authStore';
import { usePermission } from '../../auth/usePermission';
import { PERMISSIONS } from '../../config/permissions';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { FormSkeleton } from '../../components/Skeleton';
import { toast } from '../../components/Toast';

export function TicketDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const currentUser = useAuthStore((s) => s.user);

  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: async () => {
      const res = await api.get(`/admin/support/${id}`);
      return res.data.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ message, is_internal }) => {
      return api.post(`/admin/support/${id}/reply`, { message, is_internal });
    },
    onSuccess: () => {
      toast.success('Response dispatched to ticket.');
      setReplyText('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', id] });
    },
    onError: () => {
      toast.error('Failed to post reply.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ action }) => {
      return api.post(`/admin/support/${id}/${action}`, { reason: 'Status updated by staff' });
    },
    onSuccess: () => {
      toast.success('Ticket updated.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', id] });
    },
  });

  if (isLoading) return <FormSkeleton />;

  if (isError || !ticket) {
    return (
      <div className="p-8 text-center bg-white rounded border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">Ticket Not Found</h3>
        <Button variant="secondary" onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate({ message: replyText.trim(), is_internal: isInternal });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.ticket_number} • Opened on ${formatDateTime(ticket.created_at)}`}
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.support'), to: '/support' },
          { label: ticket.ticket_number },
        ]}
        badge={
          <Badge
            variant={ticket.status === 'closed' ? 'neutral' : ticket.status === 'open' ? 'danger' : 'warning'}
            size="md"
          >
            {ticket.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {can(PERMISSIONS.SUPPORT_ASSIGN) && (
              <Button
                variant="secondary"
                size="sm"
                icon={UserCheck}
                onClick={() =>
                  statusMutation.mutate({
                    action: 'assign',
                  })
                }
              >
                {t('support.assign_to_me')}
              </Button>
            )}

            {can(PERMISSIONS.SUPPORT_CLOSE) && ticket.status !== 'closed' && (
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle}
                onClick={() => statusMutation.mutate({ action: 'close' })}
              >
                {t('support.close_ticket')}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat / Conversation Thread (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="flex flex-col h-[520px]">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">{t('support.conversation')}</CardTitle>
              <span className="text-xs text-slate-500">
                Assignee: <strong>{ticket.assignee_name || 'Unassigned'}</strong>
              </span>
            </CardHeader>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {ticket.messages?.map((msg) => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {msg.sender_name}
                      </span>
                      {msg.is_internal && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          Staff Note
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(msg.created_at, 'HH:mm')}
                      </span>
                    </div>

                    <div
                      className={`max-w-lg rounded p-3.5 text-xs leading-relaxed shadow-2xs ${
                        msg.is_internal
                          ? 'bg-amber-50 border border-amber-200 text-amber-900'
                          : isAdmin
                          ? 'bg-brand-emerald-700 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Composer */}
            {can(PERMISSIONS.SUPPORT_REPLY) && ticket.status !== 'closed' ? (
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span className="font-semibold text-slate-700">{t('support.internal_note')}</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternal
                        ? 'Add internal note visible only to staff...'
                        : t('support.reply_placeholder')
                    }
                    className={`flex-1 rounded border px-3.5 py-2 text-xs focus:outline-none focus:ring-2 ${
                      isInternal
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-100 bg-amber-50/40'
                        : 'border-slate-300 focus:border-brand-emerald-600 focus:ring-brand-emerald-100 bg-white'
                    }`}
                  />
                  <Button
                    type="submit"
                    variant={isInternal ? 'secondary' : 'primary'}
                    icon={Send}
                    loading={replyMutation.isPending}
                    className="shrink-0"
                  >
                    {t('support.send_reply')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200">
                This ticket is closed for further replies.
              </div>
            )}
          </Card>
        </div>

        {/* Side Card: Related Couple & Wedding Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Couple Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <Link
                    to={`/users/${ticket.user_id}`}
                    className="font-bold text-slate-900 hover:text-brand-emerald-700 block"
                  >
                    {ticket.user_name}
                  </Link>
                  <p className="text-slate-500 font-mono text-[11px]">{ticket.user_phone}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ticket Priority:</span>
                  <Badge
                    variant={
                      ticket.priority === 'urgent'
                        ? 'danger'
                        : ticket.priority === 'high'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {ticket.priority}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Related Wedding:</span>
                  <Link
                    to={`/weddings/${ticket.wedding_id}`}
                    className="font-semibold text-brand-emerald-700 hover:underline truncate max-w-[160px]"
                  >
                    {ticket.wedding_title}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;
