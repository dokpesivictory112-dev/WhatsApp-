const https = require('https');

const PIXEL_ID     = '993725449682149';
const ACCESS_TOKEN = 'EAGDaJTh2MZCIBRnPbcLAcW9Vv4xJ1OhqDgEqmvqVrqfA4Q1rjGuf6ovky7nbeTEaCxyITfruIk5IgVb6BVUoimcFlDdMI28LdZBm52W07ZBpeSFwHMlPPhc7w33EtYUQRKxDD2i5E2SKvjKZCt71DylG7ZAVrlWWBLh6K9PhWZB11MgzKcHrVL3I75Q54MD204kgZDZ';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { eventId, fbp, fbc, userAgent } = body;

  const clientIp =
    event.headers['x-forwarded-for']
      ? event.headers['x-forwarded-for'].split(',')[0].trim()
      : event.headers['client-ip'] || null;

  const userData = {};
  if (fbp)       userData.fbp               = fbp;
  if (fbc)       userData.fbc               = fbc;
  if (clientIp)  userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;

  const payload = JSON.stringify({
    data: [{
      event_name:    'Lead',
      event_time:    Math.floor(Date.now() / 1000),
      event_id:      eventId,
      action_source: 'website',
      user_data:     userData,
      custom_data:   { currency: 'NGN', value: 0 }
    }],
    test_event_code: 'TEST62462'
  });

  const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  await new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
