import { PERMISSIONS } from '../../config/permissions';

// Standard Admin permissions (Notice: No system permissions, No couple private data, No payments.refund)
export const DEFAULT_ADMIN_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.USERS_EDIT,
  PERMISSIONS.USERS_SUSPEND,
  PERMISSIONS.WEDDINGS_VIEW,
  PERMISSIONS.WEDDINGS_EDIT,
  PERMISSIONS.WEDDINGS_SUSPEND,
  PERMISSIONS.INVITATIONS_VIEW,
  PERMISSIONS.INVITATIONS_MODERATE,
  PERMISSIONS.TEMPLATES_VIEW,
  PERMISSIONS.TEMPLATES_CREATE,
  PERMISSIONS.TEMPLATES_EDIT,
  PERMISSIONS.TEMPLATES_PUBLISH,
  PERMISSIONS.CONTENT_VIEW,
  PERMISSIONS.CONTENT_EDIT,
  PERMISSIONS.PAYMENTS_VIEW,
  PERMISSIONS.PAYMENTS_VERIFY,
  PERMISSIONS.REPORTS_VIEW,
  PERMISSIONS.SUPPORT_VIEW,
  PERMISSIONS.SUPPORT_REPLY,
  PERMISSIONS.SUPPORT_ASSIGN,
  PERMISSIONS.SUPPORT_CLOSE,
  PERMISSIONS.MEDIA_VIEW,
  PERMISSIONS.ANNOUNCEMENTS_VIEW,
  PERMISSIONS.ANNOUNCEMENTS_CREATE,
];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function generateInitialData() {
  // Staff Accounts
  const admins = [
    {
      id: 'adm_1',
      name: 'Vireak Dara (Super Admin)',
      email: 'super@theapka.test',
      role: 'super_admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      last_login_at: '2026-09-22T08:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
      permissions: ALL_PERMISSIONS,
    },
    {
      id: 'adm_2',
      name: 'Sophea Pich (Staff Admin)',
      email: 'admin@theapka.test',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      last_login_at: '2026-09-21T14:15:00Z',
      created_at: '2024-03-15T00:00:00Z',
      permissions: [...DEFAULT_ADMIN_PERMISSIONS],
    },
    {
      id: 'adm_3',
      name: 'Chanthou Sok (Finance Staff)',
      email: 'finance@theapka.test',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      last_login_at: '2026-09-20T11:00:00Z',
      created_at: '2024-05-10T00:00:00Z',
      permissions: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.PAYMENTS_VIEW,
        PERMISSIONS.PAYMENTS_VERIFY,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_EXPORT,
      ],
    },
    {
      id: 'adm_4',
      name: 'Piseth Roeun (Support Staff)',
      email: 'support@theapka.test',
      role: 'admin',
      status: 'disabled',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      last_login_at: '2026-08-14T09:20:00Z',
      created_at: '2024-06-01T00:00:00Z',
      permissions: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.SUPPORT_VIEW,
        PERMISSIONS.SUPPORT_REPLY,
        PERMISSIONS.SUPPORT_CLOSE,
      ],
    },
  ];

  // Users (60 realistic Cambodian couple accounts)
  const khmerFirstNames = ['Sokha', 'Bopha', 'Rithy', 'Kosal', 'Visal', 'Sreynich', 'Daline', 'Thyda', 'Sovann', 'Narith', 'Phally', 'Kalyan', 'Vannak', 'Chamroeun', 'Monita'];
  const khmerLastNames = ['Chan', 'Keo', 'Lim', 'Pich', 'Seng', 'Heng', 'Chea', 'Kong', 'Ou', 'Sam', 'Ros', 'Vann', 'Chhay', 'Bun', 'Meas'];

  const users = [];
  for (let i = 1; i <= 60; i++) {
    const fn = khmerFirstNames[i % khmerFirstNames.length];
    const ln = khmerLastNames[Math.floor(i / 2) % khmerLastNames.length];
    const phonePrefixes = ['012', '010', '015', '098', '077', '089', '093'];
    const phone = `${phonePrefixes[i % phonePrefixes.length]}${Math.floor(100000 + Math.random() * 900000)}`;
    const status = i === 5 ? 'suspended' : i === 18 ? 'pending' : 'active';

    users.push({
      id: `usr_${i}`,
      name: `${ln} ${fn}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
      phone,
      status,
      role: 'user', // strictly couple user, never admin
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${i}`,
      weddings_count: (i % 7 === 0) ? 2 : 1,
      total_spent_usd: (i % 3 === 0) ? 99 : (i % 2 === 0) ? 49 : 0,
      total_spent_khr: (i % 3 === 0) ? 400000 : (i % 2 === 0) ? 200000 : 0,
      created_at: new Date(Date.now() - (60 - i) * 86400000 * 2).toISOString(),
    });
  }

  // Weddings (40 weddings)
  const plans = ['standard_free', 'premium_gold', 'vip_diamond'];
  const weddingStatuses = ['published', 'draft', 'archived', 'suspended'];
  const templatesList = [
    { id: 'tpl_1', name: 'Angkor Heritage Gold', slug: 'angkor-heritage-gold' },
    { id: 'tpl_2', name: 'Modern Jasmine Bloom', slug: 'modern-jasmine-bloom' },
    { id: 'tpl_3', name: 'Royal Silk Romance', slug: 'royal-silk-romance' },
    { id: 'tpl_4', name: 'Lotus Serenity Emerald', slug: 'lotus-serenity-emerald' },
  ];

  const weddings = [];
  for (let i = 1; i <= 40; i++) {
    const user = users[(i - 1) % users.length];
    const groomName = `${khmerLastNames[i % khmerLastNames.length]} ${khmerFirstNames[i % khmerFirstNames.length]}`;
    const brideName = `${khmerLastNames[(i + 3) % khmerLastNames.length]} ${khmerFirstNames[(i + 2) % khmerFirstNames.length]}`;
    const template = templatesList[i % templatesList.length];
    const plan = plans[i % plans.length];
    const status = i === 4 ? 'suspended' : i === 12 ? 'archived' : i % 3 === 0 ? 'draft' : 'published';
    const weddingDate = new Date(Date.now() + (i * 3 - 20) * 86400000).toISOString().slice(0, 10);

    weddings.push({
      id: `wed_${i}`,
      title: `${groomName} & ${brideName} Wedding Celebration`,
      groom_name: groomName,
      bride_name: brideName,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      wedding_date: weddingDate,
      venue_name: i % 2 === 0 ? 'The Premier Centre Sen Sok, Hall A' : 'Sokha Phnom Penh Hotel Grand Ballroom',
      venue_address: i % 2 === 0 ? 'Sen Sok, Phnom Penh, Cambodia' : 'Chroy Changvar, Phnom Penh, Cambodia',
      plan,
      status,
      template_id: template.id,
      template_name: template.name,
      guest_count: 80 + (i * 12) % 400,
      total_gifts_khr: 3500000 + (i * 250000),
      total_gifts_usd: 850 + (i * 65),
      invitation_slug: `wedding-${groomName.toLowerCase().replace(/\s+/g, '')}-${brideName.toLowerCase().replace(/\s+/g, '')}-${i}`,
      invitation_views: 120 + i * 45,
      invitation_flagged: i === 7,
      invitation_flag_reason: i === 7 ? 'Reported for offensive image uploaded in gallery section.' : null,
      created_at: new Date(Date.now() - (45 - i) * 86400000).toISOString(),
      schedule: [
        { time: '07:00 AM', title_km: 'ពិធីហែជំនូន និងសែនព្រេន', title_en: 'Groom Procession Ceremony & Ancestor Offering' },
        { time: '09:30 AM', title_km: 'ពិធីកាត់សក់បង្កក់សិរី', title_en: 'Hair Cutting Ceremony' },
        { time: '02:00 PM', title_km: 'ពិធីចងដៃសំពះផ្ទឹម', title_en: 'Knot Tying & Blessing Ceremony' },
        { time: '06:00 PM', title_km: 'ពិធីទទួលទានភោជនាហារពេលល្ងាច', title_en: 'Evening Wedding Banquet & Reception' },
      ],
      config: {
        theme_color: i % 2 === 0 ? '#D4AF37' : '#1B5E4A',
        font_family: 'Kantumruy Pro',
        show_schedule: true,
        show_map: true,
        show_qr_gift: true,
        music_url: 'https://example.com/audio/traditional-wedding.mp3',
      },
    });
  }

  // Payments (80 payments in KHR and USD)
  const providers = ['Bakong KHQR', 'ABA PayWay', 'Manual Bank Transfer'];
  const paymentStatuses = ['completed', 'completed', 'completed', 'pending', 'refunded', 'failed'];
  const payments = [];

  for (let i = 1; i <= 80; i++) {
    const user = users[i % users.length];
    const wedding = weddings[i % weddings.length];
    const isKHR = i % 2 === 0;
    const provider = providers[i % providers.length];
    const status = paymentStatuses[i % paymentStatuses.length];
    const currency = isKHR ? 'KHR' : 'USD';
    const amount = isKHR
      ? [100000, 200000, 400000, 800000, 1200000][i % 5]
      : [25, 49, 99, 149, 299][i % 5];

    payments.push({
      id: `pay_${i}`,
      reference: `TK-${currency}-${20260000 + i}`,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      wedding_id: wedding.id,
      wedding_title: wedding.title,
      provider,
      currency,
      amount,
      status,
      created_at: new Date(Date.now() - (85 - i) * 3600000 * 18).toISOString(),
      verified_by: status === 'completed' && provider === 'Manual Bank Transfer' ? 'Chanthou Sok' : null,
      refund_reason: status === 'refunded' ? 'Couple requested cancellation within 48h guarantee period.' : null,
      raw_payload: {
        transaction_id: `tx_mock_${100000 + i}`,
        provider_code: provider === 'Bakong KHQR' ? 'BAKONG' : provider === 'ABA PayWay' ? 'PAYWAY' : 'MANUAL',
        gateway_fee: isKHR ? 0 : 1.5,
        ip_address: `103.216.50.${(i * 3) % 250}`,
        auth_code: `APPR_${i * 997}`,
      },
    });
  }

  // Support Tickets (25 tickets)
  const supportPriorities = ['urgent', 'high', 'medium', 'low'];
  const ticketStatuses = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'];
  const tickets = [];

  for (let i = 1; i <= 25; i++) {
    const user = users[i % users.length];
    const wedding = weddings[i % weddings.length];

    tickets.push({
      id: `tkt_${i}`,
      ticket_number: `TKT-${1000 + i}`,
      subject: [
        'Question regarding Bakong KHQR scan generation',
        'Need assistance modifying schedule times on invitation',
        'Inquiry about downloading guest RSVP list into Excel',
        'Custom domain setup for my wedding invitation link',
        'Requesting refund for unused premium features',
      ][i % 5],
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone,
      wedding_id: wedding.id,
      wedding_title: wedding.title,
      priority: supportPriorities[i % supportPriorities.length],
      status: ticketStatuses[i % ticketStatuses.length],
      assignee_id: i % 2 === 0 ? 'adm_2' : 'adm_1',
      assignee_name: i % 2 === 0 ? 'Sophea Pich' : 'Vireak Dara',
      created_at: new Date(Date.now() - (30 - i) * 3600000 * 20).toISOString(),
      messages: [
        {
          id: `msg_${i}_1`,
          sender_type: 'user',
          sender_name: user.name,
          message: 'Hello, our wedding is next month and some of our older guests had difficulty opening the invitation map. Can you please check?',
          created_at: new Date(Date.now() - (30 - i) * 3600000 * 20).toISOString(),
        },
        {
          id: `msg_${i}_2`,
          sender_type: 'admin',
          sender_name: i % 2 === 0 ? 'Sophea Pich' : 'Vireak Dara',
          message: 'Hello! Thank you for contacting TheapKa support. We have reviewed your Google Maps embed link and updated it with direct GPS coordinates.',
          created_at: new Date(Date.now() - (29 - i) * 3600000 * 20).toISOString(),
        },
      ],
    });
  }

  // Audit Logs (200 records)
  const auditActions = [
    { action: 'users.suspend', target_type: 'User', old: { status: 'active' }, new: { status: 'suspended', reason: 'Repeated spam reported' } },
    { action: 'users.reactivate', target_type: 'User', old: { status: 'suspended' }, new: { status: 'active', reason: 'Identity verified' } },
    { action: 'weddings.archive', target_type: 'Wedding', old: { status: 'published' }, new: { status: 'archived', reason: 'Event completed' } },
    { action: 'payments.verify', target_type: 'Payment', old: { status: 'pending' }, new: { status: 'completed', verified_by: 'Chanthou Sok' } },
    { action: 'payments.refund', target_type: 'Payment', old: { status: 'completed' }, new: { status: 'refunded', reason: 'Couple canceled reservation' } },
    { action: 'templates.publish', target_type: 'Template', old: { status: 'draft' }, new: { status: 'published' } },
    { action: 'guests.reveal', target_type: 'Guest', old: { phone_revealed: false }, new: { phone_revealed: true, reason: 'Customer support verification' } },
    { action: 'system.maintenance_toggle', target_type: 'System', old: { active: false }, new: { active: true, reason: 'Scheduled DB migration' } },
    { action: 'roles.update_permissions', target_type: 'Role', old: { permissions_count: 24 }, new: { permissions_count: 25, granted: 'reports.export' } },
  ];

  const auditLogs = [];
  for (let i = 1; i <= 200; i++) {
    const act = auditActions[i % auditActions.length];
    const actor = admins[i % admins.length];

    auditLogs.push({
      id: `log_${i}`,
      actor_id: actor.id,
      actor_name: actor.name,
      actor_email: actor.email,
      action: act.action,
      target_type: act.target_type,
      target_id: `${act.target_type.toLowerCase()}_${(i * 7) % 40 + 1}`,
      ip_address: `192.168.1.${(i * 11) % 254 + 1}`,
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      old_values: act.old,
      new_values: act.new,
      created_at: new Date(Date.now() - (200 - i) * 3600000 * 4).toISOString(),
    });
  }

  // Templates
  const templates = [
    {
      id: 'tpl_1',
      name: 'Angkor Heritage Gold',
      slug: 'angkor-heritage-gold',
      category: 'traditional',
      is_premium: true,
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
      created_at: '2024-01-10T00:00:00Z',
      config: {
        theme: 'gold_traditional',
        colors: {
          primary: '#D4AF37',
          secondary: '#FAF7F0',
          accent: '#1B5E4A',
          background: '#FFFFFF',
        },
        typography: {
          headingFont: 'Kantumruy Pro',
          bodyFont: 'Kantumruy Pro',
        },
        layout: {
          headerStyle: 'angkor_arch',
          showLoveStory: true,
          showPhotoGallery: true,
          showBlessingsWall: true,
          showBankKHQR: true,
        },
      },
    },
    {
      id: 'tpl_2',
      name: 'Modern Jasmine Bloom',
      slug: 'modern-jasmine-bloom',
      category: 'modern',
      is_premium: false,
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=80',
      created_at: '2024-02-15T00:00:00Z',
      config: {
        theme: 'jasmine_white',
        colors: {
          primary: '#39886C',
          secondary: '#F0F9F5',
          accent: '#DEC58F',
          background: '#FAFAFA',
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Kantumruy Pro',
        },
        layout: {
          headerStyle: 'minimalist',
          showLoveStory: true,
          showPhotoGallery: true,
          showBlessingsWall: false,
          showBankKHQR: true,
        },
      },
    },
    {
      id: 'tpl_3',
      name: 'Royal Silk Romance',
      slug: 'royal-silk-romance',
      category: 'luxury',
      is_premium: true,
      status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&auto=format&fit=crop&q=80',
      created_at: '2024-03-20T00:00:00Z',
      config: {
        theme: 'silk_burgundy',
        colors: {
          primary: '#881337',
          secondary: '#FFF1F2',
          accent: '#D4AF37',
          background: '#FFFFFF',
        },
        typography: {
          headingFont: 'Kantumruy Pro',
          bodyFont: 'Kantumruy Pro',
        },
        layout: {
          headerStyle: 'royal_crest',
          showLoveStory: true,
          showPhotoGallery: true,
          showBlessingsWall: true,
          showBankKHQR: true,
        },
      },
    },
    {
      id: 'tpl_4',
      name: 'Lotus Serenity Emerald',
      slug: 'lotus-serenity-emerald',
      category: 'nature',
      is_premium: false,
      status: 'draft',
      thumbnail: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&auto=format&fit=crop&q=80',
      created_at: '2024-05-01T00:00:00Z',
      config: {
        theme: 'emerald_nature',
        colors: {
          primary: '#0F342A',
          secondary: '#EBDDBA',
          accent: '#39886C',
          background: '#FBF8F1',
        },
        typography: {
          headingFont: 'Kantumruy Pro',
          bodyFont: 'Kantumruy Pro',
        },
        layout: {
          headerStyle: 'lotus_crest',
          showLoveStory: true,
          showPhotoGallery: true,
          showBlessingsWall: true,
          showBankKHQR: true,
        },
      },
    },
  ];

  // Content Entries
  const content = [
    {
      key: 'faq_general',
      category: 'faqs',
      status: 'published',
      updated_at: '2026-09-10T10:00:00Z',
      km: 'សំណួរញឹកញាប់៖ តើធ្វើដូចម្តេចដើម្បីចែករំលែកលិខិតអញ្ជើញតាម Telegram ឬ Facebook?',
      en: 'Frequently Asked Questions: How do I share my digital wedding invitation via Telegram or Facebook?',
    },
    {
      key: 'terms_of_service',
      category: 'legal',
      status: 'published',
      updated_at: '2026-08-01T00:00:00Z',
      km: 'លក្ខខណ្ឌប្រើប្រាស់សេវាកម្មផ្លូវការរបស់ TheapKa Online សម្រាប់គូស្វាមីភរិយា...',
      en: 'Official Terms of Service of TheapKa Online platform governing couples and guest access...',
    },
    {
      key: 'privacy_policy',
      category: 'legal',
      status: 'published',
      updated_at: '2026-08-01T00:00:00Z',
      km: 'គោលការណ៍រក្សាភាពឯកជន និងការការពារទិន្នន័យភ្ញៀវកិត្តិយសរបស់ TheapKa...',
      en: 'Privacy and data protection policy regarding wedding guest lists and financial gift records...',
    },
    {
      key: 'landing_hero_text',
      category: 'landing',
      status: 'published',
      updated_at: '2026-09-01T00:00:00Z',
      km: 'បង្កើតលិខិតអញ្ជើញមង្គលការឌីជីថលដ៏ប្រណិត និងស្រស់ស្អាតបំផុតសម្រាប់ថ្ងៃពិសេសរបស់អ្នក។',
      en: 'Craft exquisite and unforgettable digital wedding invitations for your most cherished day.',
    },
  ];

  // Announcements
  const announcements = [
    {
      id: 'anc_1',
      title: 'Bakong KHQR 2.0 Integration Live',
      body_km: 'ប្រព័ន្ធបាគង KHQR ជំនាន់ថ្មីត្រូវបានភ្ជាប់ដោយជោគជ័យ ផ្ដល់ភាពងាយស្រួលដល់ភ្ញៀវក្នុងការស្កេនចំណងដៃ។',
      body_en: 'Bakong KHQR 2.0 has been successfully integrated, offering seamless cross-bank wedding gift scans.',
      audience: 'all',
      status: 'published',
      scheduled_at: '2026-09-15T00:00:00Z',
      created_at: '2026-09-14T00:00:00Z',
    },
    {
      id: 'anc_2',
      title: 'Scheduled Server Maintenance Notice',
      body_km: 'ការថែទាំប្រព័ន្ធប្រចាំខែត្រូវបានគ្រោងធ្វើឡើងនៅថ្ងៃអាទិត្យ វេលាម៉ោង ០២:០០ ទៀបភ្លឺ។',
      body_en: 'Monthly infrastructure optimization scheduled for Sunday at 02:00 AM ICT.',
      audience: 'staff',
      status: 'published',
      scheduled_at: '2026-09-28T02:00:00Z',
      created_at: '2026-09-20T00:00:00Z',
    },
  ];

  // Media
  const media = [
    { id: 'med_1', name: 'angkor_cover_hero.jpg', wedding_id: 'wed_1', wedding_title: 'Chan & Lim Wedding', size: 2450000, mime: 'image/jpeg', created_at: '2026-09-18T10:00:00Z', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800' },
    { id: 'med_2', name: 'traditional_pleng_kar.mp3', wedding_id: 'wed_2', wedding_title: 'Sok & Keo Wedding', size: 5800000, mime: 'audio/mpeg', created_at: '2026-09-17T11:30:00Z', url: 'https://example.com/audio/song.mp3' },
    { id: 'med_3', name: 'khqr_gift_qr.png', wedding_id: 'wed_3', wedding_title: 'Vannak & Monita Wedding', size: 450000, mime: 'image/png', created_at: '2026-09-16T14:20:00Z', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800' },
    { id: 'med_4', name: 'couple_prewedding_01.jpg', wedding_id: 'wed_4', wedding_title: 'Pich & Bopha Wedding', size: 3200000, mime: 'image/jpeg', created_at: '2026-09-15T09:10:00Z', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800' },
  ];

  // Backups
  const backups = [
    { id: 'bk_1', date: '2026-09-22T02:00:00Z', size: 142000000, type: 'Automated Daily', status: 'completed', filename: 'theapka_backup_20260922_0200.sql.gz' },
    { id: 'bk_2', date: '2026-09-21T02:00:00Z', size: 139000000, type: 'Automated Daily', status: 'completed', filename: 'theapka_backup_20260921_0200.sql.gz' },
    { id: 'bk_3', date: '2026-09-20T02:00:00Z', size: 136000000, type: 'Automated Daily', status: 'completed', filename: 'theapka_backup_20260920_0200.sql.gz' },
    { id: 'bk_4', date: '2026-09-15T16:40:00Z', size: 131000000, type: 'Manual Snapshot', status: 'completed', filename: 'theapka_pre_release_snapshot.sql.gz' },
  ];

  // System Settings
  const settings = {
    platform_name: 'TheapKa Online',
    default_lang: 'km',
    max_guests_free: 100,
    max_guests_premium: 800,
    allow_khqr: true,
    allow_payway: true,
    contact_email: 'support@theapka.com',
    contact_phone: '+855 12 345 678',
  };

  // System Security
  const security = {
    session_timeout_minutes: 30,
    require_2fa: true,
    ip_allowlist: '127.0.0.1\n103.216.50.10',
    password_min_length: 8,
    active_sessions: [
      { id: 'sess_1', ip: '127.0.0.1', device: 'Chrome on macOS (Current)', last_active: '2026-09-22T08:30:00Z', current: true },
      { id: 'sess_2', ip: '103.216.50.12', device: 'Safari on iPhone 15 Pro', last_active: '2026-09-21T20:15:00Z', current: false },
    ],
    failed_logins: [
      { id: 'fl_1', ip: '45.154.255.88', email: 'admin@theapka.test', time: '2026-09-22T04:12:00Z', reason: 'Invalid password' },
      { id: 'fl_2', ip: '45.154.255.88', email: 'root@theapka.test', time: '2026-09-22T04:10:00Z', reason: 'User not found' },
    ],
  };

  // Payment Config (Gateway configs - secrets write-only)
  const paymentConfig = {
    khqr: {
      enabled: true,
      merchant_id: 'THEAPKA_BAKONG_KHQR',
      merchant_name: 'THEAPKA ONLINE CO., LTD.',
      environment: 'production',
      has_secret: true, // Frontend knows secret exists, but value is NEVER returned
    },
    payway: {
      enabled: true,
      merchant_id: 'ec438819',
      merchant_name: 'TheapKa Wedding Services',
      environment: 'production',
      has_secret: true,
    },
  };

  // Maintenance State
  const maintenance = {
    enabled: false,
    message_km: 'ប្រព័ន្ធ TheapKa កំពុងស្ថិតក្រោមការថែទាំបច្ចេកទេស។ សូមអភ័យទោសចំពោះការរំខាន។',
    message_en: 'TheapKa Online is currently performing scheduled system updates. Service will resume shortly.',
    scheduled_end: null,
    allowed_ips: '127.0.0.1\n103.216.50.10',
  };

  return {
    admins,
    users,
    weddings,
    payments,
    tickets,
    auditLogs,
    templates,
    content,
    announcements,
    media,
    backups,
    settings,
    security,
    paymentConfig,
    maintenance,
  };
}
