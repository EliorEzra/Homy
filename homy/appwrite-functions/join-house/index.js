const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const teams = new sdk.Teams(client);
  const users = new sdk.Users(client);

  // Appwrite injects the calling user's ID into the request headers
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ success: false, error: 'You must be logged in to join a house' }, 401);
  }

  let body;
  try {
    body = JSON.parse(req.body || '{}');
  } catch {
    return res.json({ success: false, error: 'Invalid request body' }, 400);
  }

  const teamId = (body.teamId || '').trim().toLowerCase();
  if (!teamId) {
    return res.json({ success: false, error: 'Missing invite code' }, 400);
  }

  try {
    // Verify the team exists
    await teams.get(teamId);
  } catch {
    return res.json({ success: false, error: 'Invalid invite code — house not found' }, 404);
  }

  try {
    // Check the user isn't already a member
    const existing = await teams.listMemberships(teamId, [
      sdk.Query.equal('userId', userId),
    ]);
    if (existing.total > 0) {
      return res.json({ success: false, error: 'You are already a member of this house' }, 400);
    }
  } catch (e) {
    error(e.message);
    return res.json({ success: false, error: 'Could not verify membership' }, 500);
  }

  try {
    // Look up the user's email (needed by createMembership)
    const user = await users.get(userId);

    // Server-side createMembership with userId → creates an ACTIVE membership immediately,
    // no email confirmation required.
    // v12 signature: createMembership(teamId, roles, email, userId, phone, url, name)
    await teams.createMembership(teamId, [], user.email, userId, undefined, 'homy://accept-invite', user.name || '');

    log(`User ${userId} joined team ${teamId} via invite code`);
    return res.json({ success: true });
  } catch (e) {
    error(e.message);
    return res.json({ success: false, error: e.message }, 500);
  }
};
