const FORM_CONFIGS = {
  contact: {
    subject: 'Website enquiry - MSR Avionics',
    fields: {
      name: 'Name',
      email: 'Email',
      message: 'Message'
    },
    required: ['name', 'email', 'message']
  },
  rfq: {
    subject: 'RFQ enquiry - MSR Avionics',
    fields: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      role: 'Role',
      msg: 'RFQ summary'
    },
    required: ['name', 'company', 'email', 'msg']
  }
};

export async function main(event = {}) {
  const method = String(event?.http?.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    return jsonResponse(204, '');
  }

  if (method !== 'POST') {
    return jsonResponse(405, { ok: false, message: 'Method not allowed.' });
  }

  const type = String(event.type || '').trim().toLowerCase();
  const config = FORM_CONFIGS[type];
  if (!config) {
    return jsonResponse(400, { ok: false, message: 'Unknown enquiry type.' });
  }

  if (String(event.company_website || '').trim() !== '') {
    return jsonResponse(200, { ok: true, message: 'Thanks. Your enquiry has been received.' });
  }

  const values = {};
  const missing = [];

  Object.keys(config.fields).forEach((field) => {
    const rawValue = String(event[field] || '').trim();
    values[field] = rawValue.replace(/\r\n|\r/g, '\n');
  });

  config.required.forEach((field) => {
    if (!values[field]) {
      missing.push(config.fields[field]);
    }
  });

  if (missing.length > 0) {
    return jsonResponse(422, {
      ok: false,
      message: `Please complete: ${missing.join(', ')}.`
    });
  }

  if (!isValidEmail(values.email)) {
    return jsonResponse(422, { ok: false, message: 'Please enter a valid email address.' });
  }

  const serverToken = process.env.POSTMARK_SERVER_TOKEN || '';
  const fromEmail = process.env.POSTMARK_FROM_EMAIL || '';
  const toEmail = process.env.POSTMARK_TO_EMAIL || '';
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || 'outbound';
  const bccEmail = process.env.POSTMARK_BCC_EMAIL || '';

  if (!serverToken || !fromEmail || !toEmail) {
    return jsonResponse(500, { ok: false, message: 'Email delivery is not configured on this server.' });
  }

  const headers = event?.http?.headers || {};
  const lines = [
    `Enquiry type: ${type.toUpperCase()}`,
    `Submitted at: ${new Date().toISOString()}`,
    `IP address: ${headers['x-forwarded-for'] || 'Unavailable'}`,
    `User agent: ${headers['user-agent'] || 'Unavailable'}`,
    ''
  ];

  Object.entries(config.fields).forEach(([field, label]) => {
    lines.push(`${label}: ${values[field] || '-'}`);
  });

  const payload = {
    From: fromEmail,
    To: toEmail,
    Subject: config.subject,
    ReplyTo: values.email,
    TextBody: lines.join('\n'),
    MessageStream: messageStream,
    Tag: `website-${type}`
  };

  if (bccEmail) {
    payload.Bcc = bccEmail;
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': serverToken
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return jsonResponse(502, {
        ok: false,
        message: 'We could not send your enquiry right now. Please call or email us directly.'
      });
    }

    return jsonResponse(200, {
      ok: true,
      message: 'Thanks. Your enquiry has been sent to the MSR Avionics team.'
    });
  } catch (error) {
    return jsonResponse(502, {
      ok: false,
      message: 'We could not send your enquiry right now. Please call or email us directly.'
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    },
    body
  };
}
