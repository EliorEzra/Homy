// get-members Appwrite Function
// -----------------------------------------------------------------------------
// Returns enriched membership data (with real userName + userEmail) for a team.
//
// Background:
//   In Appwrite 1.9, team.listMemberships() does NOT populate userName/userEmail
//   when called by a non-owner member — only the team owner sees those fields.
//   This function uses an admin API key to fetch each user's info and merge it
//   into the membership list so the app can display proper names.
//
// Auth:
//   Caller must be authenticated and must already be a member of the requested
//   team (verified via listMemberships).
//
// Request body: { teamId: string }
// Response:     { success: true, members: Membership[] }
//
// Network notes (self-hosted): see comments in join-house/index.js — same
// internal-Docker-endpoint discovery and Host-header logic applies here.
// -----------------------------------------------------------------------------

const http = require('http');
const https = require('https');

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
        ...(externalHost ? { 'Host': externalHost } : {}),
      },
      rejectUnauthorized: false,
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async ({ req, res, log }) => {
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) return res.json({ success: false, error: 'Not authenticated' }, 401);

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.json({ success: false, error: 'Invalid body' }, 400); }

  const teamId = body?.teamId;
  if (!teamId) return res.json({ success: false, error: 'Missing teamId' }, 400);

  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const externalUrl = new URL(process.env.APPWRITE_FUNCTION_API_ENDPOINT);
  const externalHost = externalUrl.host;

  // Discover a reachable endpoint (see join-house notes)
  const CANDIDATES = [
    'http://host.docker.internal/v1',
    'http://172.17.0.1/v1',
    'http://172.18.0.1/v1',
    'http://appwrite/v1',
  ];
  let endpoint = null;
  for (const ep of CANDIDATES) {
    try {
      await appwriteRequest(ep, projectId, apiKey, 'GET', '/v1/health', null, externalHost);
      endpoint = ep;
      break;
    } catch (_) {}
  }
  if (!endpoint) return res.json({ success: false, error: 'Cannot reach Appwrite API' }, 500);

  const call = (method, path) =>
    appwriteRequest(endpoint, projectId, apiKey, method, path, null, externalHost);

  // 1. List memberships and verify the caller is a member
  const membershipsRes = await call('GET', `/v1/teams/${teamId}/memberships`);
  if (membershipsRes.status !== 200) {
    return res.json({ success: false, error: `Could not load memberships (${membershipsRes.status})` }, 500);
  }
  const memberships = membershipsRes.body?.memberships ?? [];
  if (!memberships.some(m => m.userId === userId)) {
    return res.json({ success: false, error: 'Not a member of this team' }, 403);
  }

  // 2. Enrich each membership — user info and prefs fetched in parallel per member.
  //    Each call has its own .catch() so one failure never prevents the other.
  const noResult = { status: 0, body: {} };
  const enriched = await Promise.all(memberships.map(async (m) => {
    const [u, p] = await Promise.all([
      call('GET', `/v1/users/${m.userId}`).catch(e => { log(`user error ${m.userId}: ${e.message}`); return noResult; }),
      call('GET', `/v1/users/${m.userId}/prefs`).catch(e => { log(`prefs error ${m.userId}: ${e.message}`); return noResult; }),
    ]);
    return {
      ...m,
      userName:    (u.status === 200 && u.body && u.body.name)         || m.userName  || '',
      userEmail:   (u.status === 200 && u.body && u.body.email)        || m.userEmail || '',
      avatarColor: (p.status === 200 && p.body && p.body.avatarColor)  || '',
      avatarIcon:  (p.status === 200 && p.body && p.body.avatarIcon)   || '',
    };
  }));

  return res.json({ success: true, members: enriched });
};
