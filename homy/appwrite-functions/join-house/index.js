const http = require('http');
const https = require('https');

// Make an Appwrite REST API call directly using Node's http/https module.
// This avoids any fetch/DNS issues with the node-appwrite SDK on self-hosted setups.
// externalHost: the real hostname (e.g. alminim0.dynv6.net) sent as Host header so
// nginx virtual-host routing works even when connecting via a raw IP address.
function appwriteRequest(endpoint, projectId, apiKey, method, path, body, externalHost) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, endpoint);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        // Override Host so nginx routes correctly when connecting via IP
        ...(externalHost ? { 'Host': externalHost } : {}),
      },
      // Allow self-signed certs on self-hosted instances
      rejectUnauthorized: false,
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async ({ req, res, log, error }) => {
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ success: false, error: 'Not authenticated' }, 401);
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.json({ success: false, error: 'Invalid request body' }, 400);
  }

  const teamId = body?.teamId;
  if (!teamId || typeof teamId !== 'string') {
    return res.json({ success: false, error: 'Missing teamId' }, 400);
  }

  log(`join-house: userId=${userId} teamId=${teamId}`);

  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  // Extract the real external hostname so we can set the Host header correctly.
  // Nginx on self-hosted Appwrite uses virtual-host routing and rejects requests
  // where Host doesn't match the configured domain — even if the IP is correct.
  const externalUrl = new URL(process.env.APPWRITE_FUNCTION_API_ENDPOINT);
  const externalHost = externalUrl.host; // e.g. "alminim0.dynv6.net"

  const call = (ep, method, path, body) =>
    appwriteRequest(ep, projectId, apiKey, method, path, body, externalHost);

  // Try endpoints in order until one resolves — needed for self-hosted Docker setups
  // where the external hostname is unreachable from inside the function container.
  const CANDIDATE_ENDPOINTS = [
    'http://host.docker.internal/v1',  // Docker Desktop (Windows/Mac) or Linux with host-gateway
    'http://172.17.0.1/v1',            // Default Docker bridge gateway (Linux)
    'http://172.18.0.1/v1',            // Alternative bridge network
    'http://appwrite/v1',              // Appwrite Docker service name (same network)
  ];

  async function resolveEndpoint() {
    for (const ep of CANDIDATE_ENDPOINTS) {
      try {
        const r = await appwriteRequest(ep, projectId, apiKey, 'GET', '/v1/health', null, externalHost);
        log(`endpoint resolved: ${ep} (status ${r.status})`);
        return ep;
      } catch (e) {
        log(`endpoint failed: ${ep} — ${e.message}`);
      }
    }
    return null;
  }

  const endpoint = await resolveEndpoint();
  log(`using endpoint=${endpoint} externalHost=${externalHost} hasApiKey=${!!apiKey}`);
  if (!endpoint) {
    return res.json({ success: false, error: 'Cannot reach Appwrite API from function container' }, 500);
  }

  // Check if already a member (also verifies the team exists)
  let membershipsRes;
  try {
    membershipsRes = await call(endpoint, 'GET', `/v1/teams/${teamId}/memberships`);
    log(`listMemberships status=${membershipsRes.status}`);
  } catch (e) {
    log(`listMemberships error: ${e.message}`);
    return res.json({ success: false, error: 'Invalid invite code — house not found' }, 404);
  }

  if (membershipsRes.status === 404) {
    return res.json({ success: false, error: 'Invalid invite code — house not found' }, 404);
  }
  if (membershipsRes.status !== 200) {
    return res.json({ success: false, error: `API error (${membershipsRes.status}): ${JSON.stringify(membershipsRes.body)}` }, 500);
  }
  const alreadyMember = (membershipsRes.body?.memberships ?? []).some(m => m.userId === userId);
  if (alreadyMember) {
    return res.json({ success: false, error: 'Already a member of this house' }, 400);
  }

  // Get user info
  let userRes;
  try {
    userRes = await call(endpoint, 'GET', `/v1/users/${userId}`);
    log(`getUser status=${userRes.status}`);
  } catch (e) {
    log(`getUser error: ${e.message}`);
    return res.json({ success: false, error: 'Could not retrieve user info' }, 500);
  }

  if (userRes.status !== 200) {
    return res.json({ success: false, error: 'Could not retrieve user info' }, 500);
  }

  const userEmail = userRes.body.email;
  const userName = userRes.body.name || '';

  // Create membership
  let createRes;
  try {
    createRes = await call(
      endpoint, 'POST',
      `/v1/teams/${teamId}/memberships`,
      {
        email: userEmail,
        userId,
        roles: [],
        url: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
        name: userName,
      }
    );
    log(`createMembership status=${createRes.status} body=${JSON.stringify(createRes.body)}`);
  } catch (e) {
    log(`createMembership error: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }

  if (createRes.status === 201) {
    log(`join-house: success, ${userEmail} joined team ${teamId}`);
    return res.json({ success: true });
  }

  return res.json({ success: false, error: createRes.body?.message || 'Failed to join' }, createRes.status);
};
