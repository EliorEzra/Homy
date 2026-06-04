import React, { useContext, useEffect, useState, createContext } from "react";
import { team, functions, databases, client } from "@/lib/appwrite";
import { Models, ID, Query, Channel } from "react-native-appwrite";
import { DatabaseIDs, RolePermissions } from "./db_models";
import { useAuth } from "./auth";

// ─── Generic response ─────────────────────────────────────────────────────────
// All async house functions return { data?, error? } so callers can do:
//   const { error } = await leaveHouse();
type HouseResponse<T = {}> = { data?: T; error?: any };

// ─── Context shape ────────────────────────────────────────────────────────────
interface HouseContextValue {
  createHouse: (name: string, roles?: string[]) => Promise<HouseResponse<Models.Team>>;
  addUser: (email: string, roles?: string[]) => Promise<HouseResponse>;
  getUsers: () => Promise<HouseResponse<Models.MembershipList>>;
  changeUserRoles: (memberId: string, roles: string[]) => Promise<HouseResponse>;
  removeMember: (memberId: string) => Promise<HouseResponse>;
  refreshMembers: () => Promise<void>;
  acceptHouseInvite: (teamId: string, membershipId: string, secret: string) => Promise<HouseResponse>;
  leaveHouse: () => Promise<HouseResponse>;
  deleteHouse: () => Promise<HouseResponse>;
  joinHouseByCode: (code: string) => Promise<HouseResponse>;
  transferOwnership: (newOwnerMembershipId: string) => Promise<HouseResponse>;
  updateRolePermissions: (roleName: string, perms: RolePermissions) => Promise<HouseResponse>;
  updateRoleOrder: (order: string[]) => Promise<HouseResponse>;
  addRole: (name: string) => Promise<HouseResponse>;
  removeRole: (name: string) => Promise<HouseResponse>;
  updateHierarchyEnabled: (enabled: boolean) => Promise<HouseResponse>;
  house: Models.Membership | null;
  houseTeamId: string | null;
  members: Models.Membership[];
  /** Defined roles for this house (stored in team prefs, not Appwrite team roles). */
  houseRoles: string[];
  /** Ordered list of role names — index 0 = highest authority. */
  roleOrder: string[];
  /** Per-role tab permissions, keyed by role name. */
  rolePermissions: Record<string, RolePermissions>;
  /** When true, canEdit/canDelete only apply to items from equal or lower ranked creators. */
  hierarchyEnabled: boolean;
  houseInitialized: boolean;
}

interface ProviderProps {
  children: React.ReactNode;
}

const HouseContext = createContext<HouseContextValue | undefined>(undefined);

// Appwrite Function IDs — override via .env if needed
const JOIN_HOUSE_FUNCTION_ID =
  process.env.EXPO_PUBLIC_JOIN_HOUSE_FUNCTION_ID ?? 'join-house';
const GET_MEMBERS_FUNCTION_ID =
  process.env.EXPO_PUBLIC_GET_MEMBERS_FUNCTION_ID ?? 'get-members';

/**
 * Fetch enriched memberships (with real userName/userEmail) via the get-members
 * Appwrite Function. Required because Appwrite 1.9 doesn't expose those fields
 * on listMemberships for non-owner callers.
 *
 * Falls back to whatever raw memberships the client SDK can fetch if the
 * function fails (e.g. not deployed yet) so the app keeps working.
 */
async function fetchEnrichedMembers(teamId: string): Promise<Models.Membership[]> {
  // Retry up to 3 times with increasing delays — mirrors the auth startup retry
  // pattern to handle intermittent network blips on self-hosted dynv6 setups.
  const delays = [0, 1500, 3000];
  for (const delay of delays) {
    try {
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      const exec = await functions.createExecution(
        GET_MEMBERS_FUNCTION_ID,
        JSON.stringify({ teamId }),
        false
      );
      if (exec.status === 'completed' && exec.responseBody) {
        try {
          const result = JSON.parse(exec.responseBody);
          if (result.success && Array.isArray(result.members)) {
            return result.members as Models.Membership[];
          }
        } catch (_) {
          // responseBody wasn't valid JSON — try again
        }
      }
    } catch (_) {
      // Network error — try again after delay
    }
  }
  // All retries exhausted — fall back to raw SDK memberships.
  // Names may be missing for non-owners in Appwrite 1.9 but at least we show something.
  try {
    const res = await team.listMemberships({ teamId });
    return res.memberships;
  } catch (_) {
    return [];
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function HouseProvider({ children }: ProviderProps) {
  const [house, setHouse] = useState<Models.Membership | null>(null);
  const [houseTeamId, setHouseTeamId] = useState<string | null>(null);
  const [houseInitialized, setHouseInitialized] = useState(false);
  const [members, setMembers] = useState<Models.Membership[]>([]);
  const [houseRoles, setHouseRoles] = useState<string[]>([]);
  const [roleOrder, setRoleOrder] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>({});
  const [hierarchyEnabled, setHierarchyEnabled] = useState(false);

  const { user } = useAuth();

  // ─── Prefs helper ─────────────────────────────────────────────────────────
  // Reads roles / roleOrder / rolePermissions from raw team prefs and applies to state.
  function applyPrefs(prefs: any) {
    const roles: string[] = prefs?.roles ?? [];
    setHouseRoles(roles);
    setRoleOrder(prefs?.roleOrder ?? [...roles]);
    setRolePermissions(prefs?.rolePermissions ?? {});
    setHierarchyEnabled(prefs?.hierarchyEnabled ?? false);
  }

  // ─── House loader ─────────────────────────────────────────────────────────
  // Fetches team metadata + memberships for a known teamId and sets all state.
  // Used both by the startup effect and by joinHouseByCode.
  //
  // Two-phase load:
  //   1. Fetch team info + raw memberships in parallel — fast, unblocks the UI.
  //   2. Enrich members with real names/emails via Appwrite Function in background
  //      — does NOT block phase 1, updates state when ready.
  async function loadHouseFromTeam(teamId: string) {
    const [houseTeam, ownMemberships, rawMemberships] = await Promise.all([
      team.get({ teamId }),
      team.listMemberships({ teamId, queries: [Query.equal('userId', user!.$id)] }),
      team.listMemberships({ teamId }),
    ]);
    setHouse(ownMemberships.memberships[0] ?? null);
    setHouseTeamId(teamId);
    applyPrefs(houseTeam.prefs);
    setMembers(rawMemberships.memberships);

    // Enrich names/emails in background — updates state when the function returns.
    fetchEnrichedMembers(teamId)
      .then(enriched => setMembers(enriched))
      .catch(() => {});
  }

  // ─── Fallback refresh ─────────────────────────────────────────────────────
  // Discovers which house the user belongs to via team.list() and loads it.
  // Avoid calling this immediately after joinHouseByCode — the new membership
  // may not be visible in team.list() yet due to propagation delay.
  async function refreshHouse() {
    if (!user) return;
    const houses = await team.list({ total: true });
    if (houses.total === 1) {
      await loadHouseFromTeam(houses.teams[0].$id);
    }
  }

  // ─── Public refresh (members only) ────────────────────────────────────────
  async function refreshMembers(): Promise<void> {
    if (!houseTeamId) return;
    try {
      setMembers(await fetchEnrichedMembers(houseTeamId));
    } catch (_) {}
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async function createHouse(name: string, roles?: string[]): Promise<HouseResponse<Models.Team>> {
    try {
      if (!user) throw new Error("Log in before creating a house");
      if (house) throw new Error("Already in a house — leave first");

      const response = await team.create({ teamId: ID.unique(), name });
      const initRoles = roles ?? [];

      // Store defined roles + hierarchy + permissions in team prefs.
      // These are NOT Appwrite membership roles — they are Homy's own role system.
      await team.updatePrefs({
        teamId: response.$id,
        prefs: { roles: initRoles, roleOrder: initRoles, rolePermissions: {} },
      });

      const memberships = await team.listMemberships({
        teamId: response.$id,
        queries: [Query.equal('userId', user.$id)],
        total: true,
      });
      if (memberships.total !== 1) throw new Error("Created team but membership not found");

      setHouse(memberships.memberships[0]);
      setHouseTeamId(response.$id);
      setHouseRoles(initRoles);
      setRoleOrder(initRoles);
      setRolePermissions({});
      setMembers(memberships.memberships);
      return { data: response };
    } catch (error) {
      return { error };
    }
  }

  /** Invite a member by email. Sends an Appwrite email invitation. */
  async function addUser(email: string, roles?: string[]): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      await team.createMembership({ teamId: houseTeamId, roles: roles ?? [], email, url: 'homy://accept-invite' });
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  async function getUsers(): Promise<HouseResponse<Models.MembershipList>> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      const data = await team.listMemberships({ teamId: houseTeamId });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Assign roles to a member. Requires the caller to be the team owner.
   * Roles must match names defined in houseRoles (stored in team prefs).
   */
  async function changeUserRoles(memberId: string, roles: string[]): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      const updated = await team.updateMembership({ teamId: houseTeamId, membershipId: memberId, roles });
      setMembers(prev => prev.map(m => m.$id === memberId ? { ...m, roles: updated.roles } : m));
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  async function removeMember(memberId: string): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      await team.deleteMembership({ teamId: houseTeamId, membershipId: memberId });
      setMembers(prev => prev.filter(m => m.$id !== memberId));
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Accept an email-based invite (deep-link flow). */
  async function acceptHouseInvite(teamId: string, membershipId: string, secret: string): Promise<HouseResponse> {
    try {
      if (!user) throw new Error("Log in before accepting an invitation");
      const response = await team.updateMembershipStatus({ teamId, membershipId, userId: user.$id, secret });
      setHouse(response);
      setHouseTeamId(teamId);
      try {
        setMembers(await fetchEnrichedMembers(teamId));
      } catch (_) {}
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  async function leaveHouse(): Promise<HouseResponse> {
    try {
      if (!house || !houseTeamId) throw new Error("Not in a house");
      await team.deleteMembership({ teamId: houseTeamId, membershipId: house.$id });
      clearHouseState();
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  async function deleteHouse(): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");

      // Delete all rows across every table that belong to this house
      const tables = [DatabaseIDs.TASKS, DatabaseIDs.EVENTS, DatabaseIDs.SHOP_ITEMS, DatabaseIDs.EXPENSES];
      await Promise.all(tables.map(async (tableId) => {
        try {
          const { rows } = await databases.listRows({ databaseId: DatabaseIDs.DATABASE, tableId });
          await Promise.all(
            rows
              .filter((r: Models.Row) => r.team_id === houseTeamId)
              .map((r: Models.Row) => databases.deleteRow({ databaseId: DatabaseIDs.DATABASE, tableId, rowId: r.$id }))
          );
        } catch (_) {}
      }));

      await team.delete({ teamId: houseTeamId });
      clearHouseState();
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Transfer ownership to another member.
   * - Grants the 'owner' Appwrite team role to the new owner.
   * - Strips 'owner' from the current user (retains any other roles they had).
   * - Updates local state immediately so the UI reflects the change without re-fetch.
   */
  async function transferOwnership(newOwnerMembershipId: string): Promise<HouseResponse> {
    try {
      if (!houseTeamId || !house) throw new Error("Not in a house");

      const newOwnerUpdated = await team.updateMembership({
        teamId: houseTeamId,
        membershipId: newOwnerMembershipId,
        roles: ['owner'],
      });
      const myRolesWithoutOwner = (house.roles as string[] ?? []).filter(r => r !== 'owner');
      const selfUpdated = await team.updateMembership({
        teamId: houseTeamId,
        membershipId: house.$id,
        roles: myRolesWithoutOwner,
      });

      setMembers(prev => prev.map(m => {
        if (m.$id === newOwnerMembershipId) return { ...m, roles: newOwnerUpdated.roles };
        if (m.$id === house.$id) return { ...m, roles: selfUpdated.roles };
        return m;
      }));
      setHouse(prev => prev ? { ...prev, roles: selfUpdated.roles } : null);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Update the tab permissions for one role and persist to team prefs. */
  async function updateRolePermissions(roleName: string, perms: RolePermissions): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      const newPerms = { ...rolePermissions, [roleName]: perms };
      await team.updatePrefs({ teamId: houseTeamId, prefs: { roles: houseRoles, roleOrder, rolePermissions: newPerms, hierarchyEnabled } });
      setRolePermissions(newPerms);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Reorder the role hierarchy and persist to team prefs. Index 0 = highest authority. */
  async function updateRoleOrder(order: string[]): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      await team.updatePrefs({ teamId: houseTeamId, prefs: { roles: houseRoles, roleOrder: order, rolePermissions, hierarchyEnabled } });
      setRoleOrder(order);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Add a new role to the house. Appends to houseRoles and roleOrder. */
  async function addRole(name: string): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Role name cannot be empty");
      if (houseRoles.includes(trimmed)) throw new Error(`Role "${trimmed}" already exists`);
      const newRoles = [...houseRoles, trimmed];
      const newOrder = [...roleOrder, trimmed];
      await team.updatePrefs({ teamId: houseTeamId, prefs: { roles: newRoles, roleOrder: newOrder, rolePermissions, hierarchyEnabled } });
      setHouseRoles(newRoles);
      setRoleOrder(newOrder);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Remove a role from the house. Cleans up houseRoles, roleOrder, and rolePermissions. */
  async function removeRole(name: string): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      const newRoles = houseRoles.filter(r => r !== name);
      const newOrder = roleOrder.filter(r => r !== name);
      const newPerms = { ...rolePermissions };
      delete newPerms[name];
      await team.updatePrefs({ teamId: houseTeamId, prefs: { roles: newRoles, roleOrder: newOrder, rolePermissions: newPerms, hierarchyEnabled } });
      setHouseRoles(newRoles);
      setRoleOrder(newOrder);
      setRolePermissions(newPerms);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /** Toggle whether the role hierarchy affects edit/delete permissions. */
  async function updateHierarchyEnabled(enabled: boolean): Promise<HouseResponse> {
    try {
      if (!houseTeamId) throw new Error("Not in a house");
      await team.updatePrefs({ teamId: houseTeamId, prefs: { roles: houseRoles, roleOrder, rolePermissions, hierarchyEnabled: enabled } });
      setHierarchyEnabled(enabled);
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Join a house by its invite code (= the Appwrite team ID, lowercase, no dashes).
   *
   * Flow:
   * 1. Call the `join-house` Appwrite Function with the teamId.
   *    The function uses an admin API key to create the membership server-side,
   *    bypassing the normal email-invite flow.
   * 2. Load the house directly by teamId — do NOT use team.list() here because
   *    Appwrite may not yet reflect the new membership due to propagation delay.
   * 3. If the membership still isn't visible, wait 1.5 s and fall back to refreshHouse().
   */
  async function joinHouseByCode(code: string): Promise<HouseResponse> {
    try {
      if (!user) throw new Error("Log in first");
      if (house) throw new Error("Already in a house — leave first");

      const teamId = code.replace(/-/g, '').trim().toLowerCase();
      if (!teamId) throw new Error("Invalid code");

      const execution = await functions.createExecution(
        JOIN_HOUSE_FUNCTION_ID,
        JSON.stringify({ teamId }),
        false // synchronous
      );

      if (execution.status === 'failed') throw new Error('Function failed — check Appwrite logs');
      if (execution.status !== 'completed') throw new Error(`Unexpected status: ${execution.status}`);

      let result: any;
      try { result = JSON.parse(execution.responseBody); }
      catch { throw new Error(`Bad function response: ${execution.responseBody}`); }

      if (!result.success) throw new Error(result.error ?? 'Could not join house');

      // Verify membership is visible before loading state
      const ownMemberships = await team.listMemberships({
        teamId,
        queries: [Query.equal('userId', user.$id)],
      });

      if (ownMemberships.total === 0) {
        // Membership not propagated yet — short wait then fall back
        await new Promise(resolve => setTimeout(resolve, 1500));
        await refreshHouse();
      } else {
        await loadHouseFromTeam(teamId);
      }
      return { data: {} };
    } catch (error) {
      return { error };
    }
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  function clearHouseState() {
    setHouse(null); setHouseTeamId(null); setMembers([]);
    setHouseRoles([]); setRoleOrder([]); setRolePermissions({}); setHierarchyEnabled(false);
  }

  // ─── Realtime: team prefs + membership changes ────────────────────────────
  useEffect(() => {
    if (!houseTeamId) return;
    const channels = [Channel.team(houseTeamId).toString(), "memberships"];
    const unsubscribe = client.subscribe(channels, (response) => {
      const events = response.events as string[];
      const payload = response.payload as any;
      const isMembership = events.some(e => e.includes('memberships'));
      if (isMembership) {
        // Ignore memberships from other teams (global channel sees them all).
        if (payload?.teamId && payload.teamId !== houseTeamId) return;
        const isMine = payload?.userId === user?.$id;
        if (events.some(e => e.endsWith('.create'))) {
          fetchEnrichedMembers(houseTeamId).then(enriched => setMembers(enriched)).catch(() => {});
        } else if (events.some(e => e.endsWith('.update'))) {
          if (payload?.$id) setMembers(prev => prev.map(m => m.$id === payload.$id ? { ...m, ...payload } : m));
          // If it's my own membership (e.g. I was just made owner), refresh `house`
          // so owner-gated UI / permissions update immediately.
          if (isMine && payload?.$id) setHouse(prev => prev ? { ...prev, ...payload } : prev);
        } else if (events.some(e => e.endsWith('.delete'))) {
          if (payload?.$id) setMembers(prev => prev.filter(m => m.$id !== payload.$id));
          // If I was the one removed, clear my house state so I'm kicked out cleanly.
          if (isMine) clearHouseState();
        }
      } else if (events.some(e => e.endsWith('.update'))) {
        // Team-level update — roles / hierarchy / permissions changed.
        // The realtime payload may omit the full prefs object, so re-fetch the
        // team to get authoritative prefs rather than trusting payload.prefs.
        if (payload?.prefs) applyPrefs(payload.prefs);
        team.get({ teamId: houseTeamId }).then(t => applyPrefs(t.prefs)).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [houseTeamId, user?.$id]);

  // ─── Startup: load house from Appwrite ────────────────────────────────────
  useEffect(() => {
    (async () => {
      setHouseInitialized(false)
      if (!user) {
        setHouse(null);
        setMembers([]);
        setHouseInitialized(true);
        return;
      }
      try {
        const houses = await team.list({ total: true });
        if (houses.total > 1) throw new Error("User belongs to more than 1 house");
        if (houses.total === 1) {
          await loadHouseFromTeam(houses.teams[0].$id);
        } else {
          clearHouseState();
        }
      } catch (error) {
        console.log("HouseProvider init error:", error);
        setHouse(null);
      }
      setHouseInitialized(true);
    })();
  }, [user?.$id]);

  return (
    <HouseContext.Provider value={{
      createHouse, addUser, getUsers, changeUserRoles, removeMember,
      refreshMembers, acceptHouseInvite, leaveHouse, deleteHouse,
      joinHouseByCode, transferOwnership, updateRolePermissions, updateRoleOrder,
      addRole, removeRole, updateHierarchyEnabled,
      house, houseTeamId, members, houseRoles, roleOrder, rolePermissions, hierarchyEnabled, houseInitialized
    }}>
      {children}
    </HouseContext.Provider>
  );
}

export const useHouse = () => {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error("useHouse must be used within HouseProvider");
  return ctx;
};
