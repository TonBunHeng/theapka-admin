import { generateInitialData, ALL_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS } from './seedData';
import { PERMISSIONS } from '../../config/permissions';

// Initialize mutable database
let db = generateInitialData();

// Helper to log audit event
function logAudit(actor, action, targetType, targetId, oldValues = {}, newValues = {}) {
  const newLog = {
    id: `log_${Date.now()}`,
    actor_id: actor?.id || 'sys_actor',
    actor_name: actor?.name || 'System Actor',
    actor_email: actor?.email || 'actor@theapka.test',
    action,
    target_type: targetType,
    target_id: targetId,
    ip_address: '127.0.0.1',
    user_agent: navigator.userAgent,
    old_values: oldValues,
    new_values: newValues,
    created_at: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  return newLog;
}

// Get current user from token in request header
function getCurrentUser(config) {
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  if (token.startsWith('mock_super_token')) {
    return db.admins.find((a) => a.role === 'super_admin');
  }
  if (token.startsWith('mock_admin_token')) {
    return db.admins.find((a) => a.id === 'adm_2') || db.admins[1];
  }
  return db.admins[0];
}

// Pagination helper
function paginate(items, page = 1, perPage = 15) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const pp = Math.max(1, parseInt(perPage, 10) || 15);
  const start = (p - 1) * pp;
  const paginated = items.slice(start, start + pp);

  return {
    data: paginated,
    meta: {
      page: p,
      per_page: pp,
      total: items.length,
      last_page: Math.ceil(items.length / pp) || 1,
    },
  };
}

export function setupMockServer(axiosInstance) {
  // Override axios adapter to simulate real HTTP latency and responses
  const originalAdapter = axiosInstance.defaults.adapter;

  axiosInstance.defaults.adapter = async function mockAdapter(config) {
    // Artificial latency (150-250ms for realistic back-office feel)
    await new Promise((res) => setTimeout(res, 180));

    const url = config.url.replace(/^\/api/, '');
    const method = config.method.toUpperCase();
    let body = {};
    try {
      if (config.data) {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      }
    } catch {
      body = {};
    }

    const params = config.params || {};
    const currentUser = getCurrentUser(config);

    // ==========================================
    // 1. AUTH ROUTES
    // ==========================================
    if (method === 'POST' && url === '/auth/login') {
      const { email, password } = body;
      const admin = db.admins.find((a) => a.email.toLowerCase() === (email || '').toLowerCase());

      if (!admin || password !== 'password123') {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Invalid credentials. Use password123' },
          },
        });
      }

      if (admin.status === 'disabled') {
        return Promise.reject({
          response: {
            status: 403,
            data: { message: 'Your staff account has been disabled by management.' },
          },
        });
      }

      const token = admin.role === 'super_admin' ? 'mock_super_token_999' : `mock_admin_token_${admin.id}`;
      logAudit(admin, 'auth.login', 'Admin', admin.id, {}, { ip: '127.0.0.1' });

      return {
        status: 200,
        data: {
          data: {
            token,
            user: {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              avatar: admin.avatar,
              role: admin.role,
              status: admin.status,
            },
            role: admin.role,
            permissions: admin.permissions,
          },
        },
      };
    }

    if (method === 'POST' && url === '/auth/logout') {
      if (currentUser) logAudit(currentUser, 'auth.logout', 'Admin', currentUser.id);
      return { status: 200, data: { message: 'Logged out' } };
    }

    if (method === 'POST' && url === '/auth/forgot-password') {
      return { status: 200, data: { message: 'Reset email dispatched' } };
    }

    if (method === 'GET' && url === '/auth/me') {
      if (!currentUser) {
        return Promise.reject({ response: { status: 401, data: { message: 'Unauthenticated' } } });
      }
      return {
        status: 200,
        data: {
          data: {
            user: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              avatar: currentUser.avatar,
              role: currentUser.role,
              status: currentUser.status,
            },
            role: currentUser.role,
            permissions: currentUser.permissions,
          },
        },
      };
    }

    // ==========================================
    // 2. DASHBOARD
    // ==========================================
    if (method === 'GET' && url === '/admin/dashboard') {
      const activeWeddings = db.weddings.filter((w) => w.status === 'published').length;
      const totalGuests = db.weddings.reduce((acc, w) => acc + (w.guest_count || 0), 0);
      const khrRevenue = db.payments
        .filter((p) => p.currency === 'KHR' && p.status === 'completed')
        .reduce((acc, p) => acc + p.amount, 0);
      const usdRevenue = db.payments
        .filter((p) => p.currency === 'USD' && p.status === 'completed')
        .reduce((acc, p) => acc + p.amount, 0);
      const pendingPayments = db.payments.filter((p) => p.status === 'pending').length;
      const openTickets = db.tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

      // 30 days growth curve mock
      const growthSeries = Array.from({ length: 15 }).map((_, i) => ({
        date: `Sep ${i * 2 + 1}`,
        users: Math.floor(10 + i * 3.5 + Math.random() * 5),
        weddings: Math.floor(5 + i * 2.2 + Math.random() * 3),
      }));

      // Monthly revenue chart
      const monthlyRevenue = [
        { month: 'May', khr: 4500000, usd: 1250 },
        { month: 'Jun', khr: 6200000, usd: 1890 },
        { month: 'Jul', khr: 8100000, usd: 2450 },
        { month: 'Aug', khr: 7900000, usd: 2100 },
        { month: 'Sep', khr: khrRevenue, usd: usdRevenue },
      ];

      return {
        status: 200,
        data: {
          data: {
            stats: {
              total_users: db.users.length,
              active_weddings: activeWeddings,
              published_invitations: activeWeddings,
              total_guests: totalGuests,
              monthly_revenue_khr: khrRevenue,
              monthly_revenue_usd: usdRevenue,
              pending_payments: pendingPayments,
              open_tickets: openTickets,
            },
            growth_chart: growthSeries,
            revenue_chart: monthlyRevenue,
            recent_weddings: db.weddings.slice(0, 5),
            recent_payments: db.payments.slice(0, 5),
            recent_tickets: db.tickets.slice(0, 5),
          },
        },
      };
    }

    // ==========================================
    // 3. USERS (Couples only - Super Admin excluded)
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/users')) {
      const matchId = url.match(/^\/admin\/users\/([^/?]+)/);
      if (matchId && matchId[1] && !['suspend', 'reactivate', 'reset-password'].includes(matchId[1])) {
        const user = db.users.find((u) => u.id === matchId[1]);
        if (!user) return Promise.reject({ response: { status: 404, data: { message: 'User not found' } } });
        const userWeddings = db.weddings.filter((w) => w.user_id === user.id);
        const userPayments = db.payments.filter((p) => p.user_id === user.id);
        const userTickets = db.tickets.filter((t) => t.user_id === user.id);

        return {
          status: 200,
          data: {
            data: {
              ...user,
              weddings: userWeddings,
              payments: userPayments,
              tickets: userTickets,
            },
          },
        };
      }

      // List users with search and filters
      let list = [...db.users];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((u) => u.status === params.status);
      }

      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    // User actions
    if (method === 'POST' && url.includes('/admin/users/')) {
      const parts = url.split('/');
      const userId = parts[3];
      const action = parts[4];
      const user = db.users.find((u) => u.id === userId);
      if (!user) return Promise.reject({ response: { status: 404, data: { message: 'User not found' } } });

      if (action === 'suspend') {
        const old = { status: user.status };
        user.status = 'suspended';
        logAudit(currentUser, 'users.suspend', 'User', user.id, old, { status: 'suspended', reason: body.reason });
        return { status: 200, data: { data: user, message: 'User suspended' } };
      }

      if (action === 'reactivate') {
        const old = { status: user.status };
        user.status = 'active';
        logAudit(currentUser, 'users.reactivate', 'User', user.id, old, { status: 'active', reason: body.reason });
        return { status: 200, data: { data: user, message: 'User reactivated' } };
      }

      if (action === 'reset-password') {
        logAudit(currentUser, 'users.reset_password', 'User', user.id, {}, { reason: body.reason || 'Staff requested' });
        return { status: 200, data: { message: 'Reset email sent' } };
      }
    }

    if (method === 'DELETE' && url.startsWith('/admin/users/')) {
      const userId = url.split('/')[3];
      const idx = db.users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        const [removed] = db.users.splice(idx, 1);
        logAudit(currentUser, 'users.delete', 'User', userId, { user: removed.email }, { reason: body.reason });
      }
      return { status: 200, data: { message: 'User account soft-deleted' } };
    }

    // ==========================================
    // 4. WEDDINGS & PRIVATE DATA
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/weddings')) {
      // Check private couple data sub-routes
      const guestMatch = url.match(/^\/admin\/weddings\/([^/?]+)\/guests/);
      if (guestMatch) {
        const weddingId = guestMatch[1];
        // Enforce guests.view permission
        if (!currentUser?.permissions?.includes(PERMISSIONS.GUESTS_VIEW) && currentUser?.role !== 'super_admin') {
          return Promise.reject({
            response: {
              status: 403,
              data: { message: 'Access denied: requires guests.view permission.' },
            },
          });
        }
        logAudit(currentUser, 'guests.view_private', 'Wedding', weddingId, {}, { notice: 'Access to private guest list' });
        // Return realistic guest list for this wedding
        const guests = Array.from({ length: 25 }).map((_, i) => ({
          id: `gst_${weddingId}_${i + 1}`,
          name: `Guest ${i + 1} (${['Family', 'Friend', 'VIP Colleagues', 'Relative'][i % 4]})`,
          phone: `012${Math.floor(100000 + Math.random() * 900000)}`,
          rsvp_status: ['confirmed', 'confirmed', 'declined', 'pending'][i % 4],
          pax: (i % 3) + 1,
          table_no: (i % 10) + 1,
        }));
        return { status: 200, data: { data: guests } };
      }

      const giftsMatch = url.match(/^\/admin\/weddings\/([^/?]+)\/gifts-summary/);
      if (giftsMatch) {
        const weddingId = giftsMatch[1];
        if (!currentUser?.permissions?.includes(PERMISSIONS.GIFTS_VIEW) && currentUser?.role !== 'super_admin') {
          return Promise.reject({
            response: {
              status: 403,
              data: { message: 'Access denied: requires gifts.view permission.' },
            },
          });
        }
        logAudit(currentUser, 'gifts.view_private', 'Wedding', weddingId, {}, { notice: 'Access to private gifts' });
        const wedding = db.weddings.find((w) => w.id === weddingId);
        return {
          status: 200,
          data: {
            data: {
              total_khr: wedding?.total_gifts_khr || 4500000,
              total_usd: wedding?.total_gifts_usd || 1200,
              total_transfers: 65,
              recent_gifts: [
                { id: 'g_1', sender: 'Uncle Keo Rithy', amount: 200000, currency: 'KHR', method: 'Bakong KHQR', date: '2026-09-20' },
                { id: 'g_2', sender: 'Dr. Heng Sokly', amount: 100, currency: 'USD', method: 'ABA PayWay', date: '2026-09-20' },
              ],
            },
          },
        };
      }

      // Single wedding detail
      const singleMatch = url.match(/^\/admin\/weddings\/([^/?]+)/);
      if (singleMatch && !['suspend', 'restore', 'archive'].includes(singleMatch[1])) {
        const wedding = db.weddings.find((w) => w.id === singleMatch[1]);
        if (!wedding) return Promise.reject({ response: { status: 404, data: { message: 'Wedding not found' } } });
        const weddingPayments = db.payments.filter((p) => p.wedding_id === wedding.id);

        return {
          status: 200,
          data: {
            data: {
              ...wedding,
              payments: weddingPayments,
            },
          },
        };
      }

      // List weddings
      let list = [...db.weddings];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((w) => w.title.toLowerCase().includes(q) || w.user_name.toLowerCase().includes(q));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((w) => w.status === params.status);
      }
      if (params.plan && params.plan !== 'all') {
        list = list.filter((w) => w.plan === params.plan);
      }

      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    if (method === 'POST' && url.includes('/admin/weddings/')) {
      const parts = url.split('/');
      const weddingId = parts[3];
      const action = parts[4];
      const wedding = db.weddings.find((w) => w.id === weddingId);
      if (!wedding) return Promise.reject({ response: { status: 404, data: { message: 'Wedding not found' } } });

      const old = { status: wedding.status };
      if (action === 'suspend') wedding.status = 'suspended';
      if (action === 'restore') wedding.status = 'published';
      if (action === 'archive') wedding.status = 'archived';

      logAudit(currentUser, `weddings.${action}`, 'Wedding', wedding.id, old, { status: wedding.status, reason: body.reason });
      return { status: 200, data: { data: wedding, message: `Wedding ${action}ed` } };
    }

    if (method === 'DELETE' && url.startsWith('/admin/weddings/')) {
      const weddingId = url.split('/')[3];
      const idx = db.weddings.findIndex((w) => w.id === weddingId);
      if (idx !== -1) {
        const [removed] = db.weddings.splice(idx, 1);
        logAudit(currentUser, 'weddings.delete', 'Wedding', weddingId, { title: removed.title }, { reason: body.reason });
      }
      return { status: 200, data: { message: 'Wedding deleted' } };
    }

    // ==========================================
    // 5. INVITATIONS MODERATION
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/invitations')) {
      let list = db.weddings.filter((w) => w.status === 'published');
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((w) => w.title.toLowerCase().includes(q) || w.invitation_slug.toLowerCase().includes(q));
      }
      if (params.flagged === 'true') {
        list = list.filter((w) => w.invitation_flagged);
      }
      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    if (method === 'POST' && url.includes('/admin/invitations/')) {
      const parts = url.split('/');
      const weddingId = parts[3];
      const action = parts[4];
      const wedding = db.weddings.find((w) => w.id === weddingId);
      if (!wedding) return Promise.reject({ response: { status: 404, data: { message: 'Invitation not found' } } });

      if (action === 'unpublish') {
        wedding.status = 'draft';
        logAudit(currentUser, 'invitations.unpublish', 'Invitation', wedding.id, { status: 'published' }, { status: 'draft', reason: body.reason });
      } else if (action === 'flag') {
        wedding.invitation_flagged = true;
        wedding.invitation_flag_reason = body.reason;
        logAudit(currentUser, 'invitations.flag', 'Invitation', wedding.id, {}, { flagged: true, reason: body.reason });
      }
      return { status: 200, data: { data: wedding, message: 'Action completed' } };
    }

    // ==========================================
    // 6. TEMPLATES
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/templates')) {
      const matchId = url.match(/^\/admin\/templates\/([^/?]+)/);
      if (matchId) {
        const tpl = db.templates.find((t) => t.id === matchId[1]);
        if (!tpl) return Promise.reject({ response: { status: 404, data: { message: 'Template not found' } } });
        return { status: 200, data: { data: tpl } };
      }
      let list = [...db.templates];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
      }
      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    if (method === 'POST' && url === '/admin/templates') {
      const newTpl = {
        id: `tpl_${Date.now()}`,
        name: body.name,
        slug: body.slug,
        category: body.category || 'modern',
        is_premium: Boolean(body.is_premium),
        status: body.status || 'draft',
        thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
        created_at: new Date().toISOString(),
        config: body.config || {},
      };
      db.templates.push(newTpl);
      logAudit(currentUser, 'templates.create', 'Template', newTpl.id, {}, { name: newTpl.name });
      return { status: 201, data: { data: newTpl } };
    }

    if (method === 'PUT' && url.startsWith('/admin/templates/')) {
      const tplId = url.split('/')[3];
      const tpl = db.templates.find((t) => t.id === tplId);
      if (!tpl) return Promise.reject({ response: { status: 404, data: { message: 'Template not found' } } });
      const old = { ...tpl };
      Object.assign(tpl, body);
      logAudit(currentUser, 'templates.edit', 'Template', tpl.id, old, tpl);
      return { status: 200, data: { data: tpl } };
    }

    if (method === 'POST' && url.includes('/admin/templates/')) {
      const parts = url.split('/');
      const tplId = parts[3];
      const action = parts[4];
      const tpl = db.templates.find((t) => t.id === tplId);
      if (!tpl) return Promise.reject({ response: { status: 404, data: { message: 'Template not found' } } });

      const old = { status: tpl.status };
      if (action === 'publish') tpl.status = 'published';
      if (action === 'retire') tpl.status = 'retired';

      logAudit(currentUser, `templates.${action}`, 'Template', tpl.id, old, { status: tpl.status });
      return { status: 200, data: { data: tpl } };
    }

    // ==========================================
    // 7. CONTENT (Bilingual)
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/content')) {
      return { status: 200, data: { data: db.content } };
    }

    if (method === 'PUT' && url.startsWith('/admin/content/')) {
      const key = url.split('/')[3];
      const item = db.content.find((c) => c.key === key);
      if (!item) return Promise.reject({ response: { status: 404, data: { message: 'Content key not found' } } });
      const old = { ...item };
      item.km = body.km !== undefined ? body.km : item.km;
      item.en = body.en !== undefined ? body.en : item.en;
      item.updated_at = new Date().toISOString();
      logAudit(currentUser, 'content.edit', 'Content', key, old, item);
      return { status: 200, data: { data: item } };
    }

    // ==========================================
    // 8. GUESTS (Cross-wedding search)
    // ==========================================
    if (method === 'GET' && url === '/admin/guests') {
      if (!currentUser?.permissions?.includes(PERMISSIONS.GUESTS_VIEW) && currentUser?.role !== 'super_admin') {
        return Promise.reject({ response: { status: 403, data: { message: 'Forbidden: requires guests.view' } } });
      }
      logAudit(currentUser, 'guests.cross_search', 'Guest', 'search_query', {}, { query: params.search });
      // Synthesize 50 cross wedding guests from users & weddings
      let guests = db.weddings.flatMap((w, i) => [
        {
          id: `gst_cross_${w.id}_1`,
          name: `Chea Sovann`,
          wedding_id: w.id,
          wedding_title: w.title,
          phone: '012987654',
          rsvp_status: 'confirmed',
          pax: 2,
        },
        {
          id: `gst_cross_${w.id}_2`,
          name: `Vannak Sreyleak`,
          wedding_id: w.id,
          wedding_title: w.title,
          phone: '098123456',
          rsvp_status: 'pending',
          pax: 1,
        },
      ]);
      if (params.search) {
        const q = params.search.toLowerCase();
        guests = guests.filter((g) => g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.wedding_title.toLowerCase().includes(q));
      }
      return { status: 200, data: paginate(guests, params.page, params.per_page) };
    }

    // ==========================================
    // 9. PAYMENTS & FINANCES
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/payments')) {
      const matchId = url.match(/^\/admin\/payments\/([^/?]+)/);
      if (matchId && !['verify', 'refund'].includes(matchId[1])) {
        const p = db.payments.find((item) => item.id === matchId[1]);
        if (!p) return Promise.reject({ response: { status: 404, data: { message: 'Payment not found' } } });
        return { status: 200, data: { data: p } };
      }

      let list = [...db.payments];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((p) => p.reference.toLowerCase().includes(q) || p.user_name.toLowerCase().includes(q));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((p) => p.status === params.status);
      }
      if (params.provider && params.provider !== 'all') {
        list = list.filter((p) => p.provider === params.provider);
      }
      if (params.currency && params.currency !== 'all') {
        list = list.filter((p) => p.currency === params.currency);
      }

      // Calculate totals separately! NEVER sum KHR and USD!
      const totalKhr = list.filter((p) => p.currency === 'KHR' && p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
      const totalUsd = list.filter((p) => p.currency === 'USD' && p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);

      const paginated = paginate(list, params.page, params.per_page);
      return {
        status: 200,
        data: {
          ...paginated,
          summary: {
            total_khr: totalKhr,
            total_usd: totalUsd,
          },
        },
      };
    }

    if (method === 'POST' && url.includes('/admin/payments/')) {
      const parts = url.split('/');
      const paymentId = parts[3];
      const action = parts[4];
      const payment = db.payments.find((p) => p.id === paymentId);
      if (!payment) return Promise.reject({ response: { status: 404, data: { message: 'Payment not found' } } });

      if (action === 'verify') {
        if (!currentUser?.permissions?.includes(PERMISSIONS.PAYMENTS_VERIFY) && currentUser?.role !== 'super_admin') {
          return Promise.reject({ response: { status: 403, data: { message: 'Lacking payments.verify permission' } } });
        }
        const old = { status: payment.status };
        payment.status = 'completed';
        payment.verified_by = currentUser.name;
        logAudit(currentUser, 'payments.verify', 'Payment', payment.id, old, { status: 'completed' });
        return { status: 200, data: { data: payment, message: 'Payment verified' } };
      }

      if (action === 'refund') {
        if (!currentUser?.permissions?.includes(PERMISSIONS.PAYMENTS_REFUND) && currentUser?.role !== 'super_admin') {
          return Promise.reject({ response: { status: 403, data: { message: 'Lacking payments.refund permission' } } });
        }
        const old = { status: payment.status };
        payment.status = 'refunded';
        payment.refund_reason = body.reason;
        logAudit(currentUser, 'payments.refund', 'Payment', payment.id, old, { status: 'refunded', reason: body.reason });
        return { status: 200, data: { data: payment, message: 'Payment refunded' } };
      }
    }

    // ==========================================
    // 10. REPORTS
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/reports/')) {
      const type = url.split('/')[3].replace('/export', '');
      const isExport = url.includes('/export');

      if (isExport) {
        return {
          status: 200,
          data: 'Date,Reference,User,Amount,Currency,Status\n2026-09-20,TK-KHR-1,Chan Sok,400000,KHR,completed\n2026-09-21,TK-USD-2,Lim Dara,49,USD,completed',
          headers: { 'Content-Type': 'text/csv' },
        };
      }

      return {
        status: 200,
        data: {
          data: {
            type,
            charts: [
              { label: 'Standard Free', count: 18, share: 45 },
              { label: 'Premium Gold', count: 16, share: 40 },
              { label: 'VIP Diamond', count: 6, share: 15 },
            ],
            kpi: {
              conversion_rate: '68.4%',
              avg_gift_khr: 3800000,
              avg_gift_usd: 940,
            },
          },
        },
      };
    }

    // ==========================================
    // 11. SUPPORT TICKETS
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/support')) {
      const matchId = url.match(/^\/admin\/support\/([^/?]+)/);
      if (matchId && !['reply', 'assign', 'close'].includes(matchId[1])) {
        const ticket = db.tickets.find((t) => t.id === matchId[1]);
        if (!ticket) return Promise.reject({ response: { status: 404, data: { message: 'Ticket not found' } } });
        return { status: 200, data: { data: ticket } };
      }

      let list = [...db.tickets];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((t) => t.subject.toLowerCase().includes(q) || t.user_name.toLowerCase().includes(q));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((t) => t.status === params.status);
      }
      if (params.priority && params.priority !== 'all') {
        list = list.filter((t) => t.priority === params.priority);
      }
      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    if (method === 'POST' && url.includes('/admin/support/')) {
      const parts = url.split('/');
      const ticketId = parts[3];
      const action = parts[4];
      const ticket = db.tickets.find((t) => t.id === ticketId);
      if (!ticket) return Promise.reject({ response: { status: 404, data: { message: 'Ticket not found' } } });

      if (action === 'reply') {
        ticket.messages.push({
          id: `msg_${Date.now()}`,
          sender_type: 'admin',
          sender_name: currentUser.name,
          message: body.message,
          is_internal: Boolean(body.is_internal),
          created_at: new Date().toISOString(),
        });
        if (ticket.status === 'open') ticket.status = 'in_progress';
        logAudit(currentUser, 'support.reply', 'Ticket', ticket.id, {}, { internal: body.is_internal });
        return { status: 200, data: { data: ticket } };
      }

      if (action === 'assign') {
        ticket.assignee_id = body.assignee_id || currentUser.id;
        ticket.assignee_name = body.assignee_name || currentUser.name;
        logAudit(currentUser, 'support.assign', 'Ticket', ticket.id, {}, { assignee: ticket.assignee_name });
        return { status: 200, data: { data: ticket } };
      }

      if (action === 'close') {
        ticket.status = 'closed';
        logAudit(currentUser, 'support.close', 'Ticket', ticket.id, {}, { reason: body.reason });
        return { status: 200, data: { data: ticket } };
      }
    }

    // ==========================================
    // 12. MEDIA
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/media')) {
      let list = [...db.media];
      if (params.mime) {
        list = list.filter((m) => m.mime.startsWith(params.mime));
      }
      const totalBytes = list.reduce((acc, m) => acc + m.size, 0);
      return {
        status: 200,
        data: {
          ...paginate(list, params.page, params.per_page),
          total_storage_bytes: totalBytes,
        },
      };
    }

    if (method === 'DELETE' && url.startsWith('/admin/media/')) {
      const mediaId = url.split('/')[3];
      const idx = db.media.findIndex((m) => m.id === mediaId);
      if (idx !== -1) {
        const [removed] = db.media.splice(idx, 1);
        logAudit(currentUser, 'media.delete', 'Media', mediaId, { name: removed.name }, { reason: body.reason });
      }
      return { status: 200, data: { message: 'Media removed' } };
    }

    // ==========================================
    // 13. ANNOUNCEMENTS
    // ==========================================
    if (method === 'GET' && url.startsWith('/admin/announcements')) {
      return { status: 200, data: paginate(db.announcements, params.page, params.per_page) };
    }

    if (method === 'POST' && url === '/admin/announcements') {
      const newAnc = {
        id: `anc_${Date.now()}`,
        title: body.title,
        body_km: body.body_km,
        body_en: body.body_en,
        audience: body.audience || 'all',
        status: body.status || 'published',
        scheduled_at: body.scheduled_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      db.announcements.unshift(newAnc);
      logAudit(currentUser, 'announcements.create', 'Announcement', newAnc.id, {}, { title: newAnc.title });
      return { status: 201, data: { data: newAnc } };
    }

    if (method === 'DELETE' && url.startsWith('/admin/announcements/')) {
      const id = url.split('/')[3];
      const idx = db.announcements.findIndex((a) => a.id === id);
      if (idx !== -1) db.announcements.splice(idx, 1);
      return { status: 200, data: { message: 'Announcement deleted' } };
    }

    // ==========================================
    // 14. PROFILE & PASSWORD
    // ==========================================
    if (method === 'PUT' && url === '/admin/profile') {
      if (currentUser) {
        currentUser.name = body.name || currentUser.name;
        currentUser.email = body.email || currentUser.email;
      }
      return { status: 200, data: { data: currentUser, message: 'Profile updated' } };
    }

    if (method === 'PUT' && url === '/admin/password') {
      return { status: 200, data: { message: 'Password updated successfully' } };
    }

    // ==========================================
    // 15. SUPER ADMIN - SYSTEM SUITE
    // ==========================================
    // Guard all /super-admin routes to super_admin role!
    if (url.startsWith('/super-admin/')) {
      if (currentUser?.role !== 'super_admin') {
        return Promise.reject({
          response: {
            status: 403,
            data: { message: 'Forbidden: This area is restricted to Super Admin role.' },
          },
        });
      }
    }

    // 15.1 Admin Accounts
    if (method === 'GET' && url.startsWith('/super-admin/admins')) {
      return { status: 200, data: paginate(db.admins, params.page, params.per_page) };
    }

    if (method === 'POST' && url === '/super-admin/admins') {
      const newAdmin = {
        id: `adm_${Date.now()}`,
        name: body.name,
        email: body.email,
        role: body.role || 'admin',
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name}`,
        last_login_at: null,
        created_at: new Date().toISOString(),
        permissions: body.permissions || [...DEFAULT_ADMIN_PERMISSIONS],
      };
      db.admins.push(newAdmin);
      logAudit(currentUser, 'admins.create', 'Admin', newAdmin.id, {}, { name: newAdmin.name, role: newAdmin.role });
      return { status: 201, data: { data: newAdmin } };
    }

    if (method === 'POST' && url.includes('/super-admin/admins/')) {
      const parts = url.split('/');
      const adminId = parts[3];
      const action = parts[4];
      const targetAdmin = db.admins.find((a) => a.id === adminId);
      if (!targetAdmin) return Promise.reject({ response: { status: 404, data: { message: 'Admin not found' } } });

      if (action === 'disable') {
        // Self-lockout prevention rule: The last active Super Admin can never be disabled or demoted!
        const activeSuperAdmins = db.admins.filter((a) => a.role === 'super_admin' && a.status === 'active');
        if (targetAdmin.role === 'super_admin' && activeSuperAdmins.length <= 1) {
          return Promise.reject({
            response: {
              status: 422,
              data: { message: 'System Rule: The last active Super Admin cannot be disabled or demoted.' },
            },
          });
        }
        targetAdmin.status = 'disabled';
        logAudit(currentUser, 'admins.disable', 'Admin', targetAdmin.id, { status: 'active' }, { status: 'disabled', reason: body.reason });
        return { status: 200, data: { data: targetAdmin } };
      }

      if (action === 'enable') {
        targetAdmin.status = 'active';
        logAudit(currentUser, 'admins.enable', 'Admin', targetAdmin.id, { status: 'disabled' }, { status: 'active', reason: body.reason });
        return { status: 200, data: { data: targetAdmin } };
      }

      if (action === 'force-reset') {
        logAudit(currentUser, 'admins.force_reset', 'Admin', targetAdmin.id, {}, { reason: body.reason });
        return { status: 200, data: { message: 'Password reset forced for staff member' } };
      }
    }

    // 15.2 Roles & Permissions
    if (method === 'GET' && url === '/super-admin/roles') {
      return {
        status: 200,
        data: {
          data: {
            admin_permissions: db.admins.find((a) => a.id === 'adm_2')?.permissions || DEFAULT_ADMIN_PERMISSIONS,
            super_admin_permissions: ALL_PERMISSIONS,
          },
        },
      };
    }

    if (method === 'PUT' && url === '/super-admin/roles') {
      const updatedPermissions = body.permissions || [];
      // Apply to all normal admins
      db.admins.forEach((a) => {
        if (a.role === 'admin') {
          a.permissions = [...updatedPermissions];
        }
      });
      logAudit(currentUser, 'roles.update', 'Role', 'admin', {}, { count: updatedPermissions.length, reason: body.reason });
      return { status: 200, data: { message: 'Role permissions updated' } };
    }

    // 15.3 Settings
    if (method === 'GET' && url === '/super-admin/settings') {
      return { status: 200, data: { data: db.settings } };
    }

    if (method === 'PUT' && url === '/super-admin/settings') {
      const old = { ...db.settings };
      Object.assign(db.settings, body);
      logAudit(currentUser, 'settings.edit', 'Settings', 'global', old, db.settings);
      return { status: 200, data: { data: db.settings, message: 'Settings saved' } };
    }

    // 15.4 Security
    if (method === 'GET' && url === '/super-admin/security') {
      return { status: 200, data: { data: db.security } };
    }

    if (method === 'PUT' && url === '/super-admin/security') {
      Object.assign(db.security, body);
      logAudit(currentUser, 'security.edit', 'Security', 'policies', {}, body);
      return { status: 200, data: { data: db.security } };
    }

    if (method === 'DELETE' && url.startsWith('/super-admin/security/sessions/')) {
      const sessId = url.split('/')[4];
      db.security.active_sessions = db.security.active_sessions.filter((s) => s.id !== sessId);
      logAudit(currentUser, 'security.revoke_session', 'Session', sessId);
      return { status: 200, data: { message: 'Session revoked' } };
    }

    // 15.5 Audit Logs
    if (method === 'GET' && url.startsWith('/super-admin/audit-logs')) {
      let list = [...db.auditLogs];
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((l) => l.actor_name.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.target_type.toLowerCase().includes(q));
      }
      if (params.action && params.action !== 'all') {
        list = list.filter((l) => l.action.startsWith(params.action));
      }
      return { status: 200, data: paginate(list, params.page, params.per_page) };
    }

    // 15.6 Payment Config (Gateways)
    if (method === 'GET' && url === '/super-admin/payment-config') {
      // Return gateway configs but NEVER return raw secrets (masked only)
      return { status: 200, data: { data: db.paymentConfig } };
    }

    if (method === 'PUT' && url === '/super-admin/payment-config') {
      // Store settings, mark secret as present if provided
      if (body.khqr) {
        db.paymentConfig.khqr.enabled = body.khqr.enabled;
        db.paymentConfig.khqr.merchant_id = body.khqr.merchant_id;
        db.paymentConfig.khqr.merchant_name = body.khqr.merchant_name;
        db.paymentConfig.khqr.environment = body.khqr.environment;
        if (body.khqr.api_key) db.paymentConfig.khqr.has_secret = true;
      }
      if (body.payway) {
        db.paymentConfig.payway.enabled = body.payway.enabled;
        db.paymentConfig.payway.merchant_id = body.payway.merchant_id;
        db.paymentConfig.payway.merchant_name = body.payway.merchant_name;
        db.paymentConfig.payway.environment = body.payway.environment;
        if (body.payway.api_key) db.paymentConfig.payway.has_secret = true;
      }
      logAudit(currentUser, 'payment_config.edit', 'PaymentConfig', 'gateways', {}, { updated: Object.keys(body) });
      return { status: 200, data: { data: db.paymentConfig, message: 'Payment gateways updated' } };
    }

    if (method === 'POST' && url === '/super-admin/payment-config/test') {
      return { status: 200, data: { message: `Connection to ${body.provider || 'gateway'} verified successfully (Ping: 42ms).` } };
    }

    // 15.7 Backup & Disaster Recovery
    if (method === 'GET' && url.startsWith('/super-admin/backups')) {
      return { status: 200, data: { data: db.backups } };
    }

    if (method === 'POST' && url === '/super-admin/backups') {
      const newBackup = {
        id: `bk_${Date.now()}`,
        date: new Date().toISOString(),
        size: 145000000,
        type: 'Manual Snapshot',
        status: 'completed',
        filename: `theapka_manual_snapshot_${Date.now()}.sql.gz`,
      };
      db.backups.unshift(newBackup);
      logAudit(currentUser, 'backup.create', 'Backup', newBackup.id);
      return { status: 201, data: { data: newBackup, message: 'Snapshot created' } };
    }

    if (method === 'POST' && url.includes('/super-admin/backups/') && url.includes('/restore')) {
      const backupId = url.split('/')[3];
      logAudit(currentUser, 'backup.restore', 'Database', backupId, {}, { action: 'RESTORE_EXECUTED' });
      return { status: 200, data: { message: 'Database restored successfully to selected recovery point.' } };
    }

    // 15.8 Maintenance Mode
    if (method === 'GET' && url === '/super-admin/maintenance') {
      return { status: 200, data: { data: db.maintenance } };
    }

    if (method === 'PUT' && url === '/super-admin/maintenance') {
      const old = { ...db.maintenance };
      Object.assign(db.maintenance, body);
      logAudit(currentUser, 'maintenance.toggle', 'System', 'maintenance', old, db.maintenance);
      return { status: 200, data: { data: db.maintenance, message: 'Maintenance mode updated' } };
    }

    // Fallback unhandled route
    return originalAdapter ? originalAdapter(config) : Promise.reject({
      response: {
        status: 404,
        data: { message: `Mock route not found: ${method} ${url}` },
      },
    });
  };
}

export default setupMockServer;
