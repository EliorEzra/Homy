import { useHouse } from '@/context/house';
import { useAuth } from '@/context/auth';
import { DEFAULT_TAB_PERMISSION, TabPermission } from '@/context/db_models';

export type TabKey = 'tasks' | 'shop' | 'finances' | 'calendar';

/**
 * Returns permission helpers scoped to the current user.
 *
 * ## Role hierarchy
 * `roleOrder[0]` = highest authority (e.g. "admin"), last index = lowest.
 * A user can edit/delete items whose creator has equal or lower authority
 * (i.e. creator's index >= actor's index).
 *
 * ## Special cases
 * - **Owner** bypasses all checks — always returns true.
 * - **No roles configured** — everyone gets full access (system not active).
 * - **Roles exist but member has no role** — denied everything until owner assigns one.
 */
export function usePermissions() {
  const { house, members, houseRoles, roleOrder, rolePermissions, hierarchyEnabled } = useHouse();
  const { user } = useAuth();

  const isOwner = (house?.roles as string[] | undefined)?.includes('owner') ?? false;

  const myMembership = members.find(m => m.userId === user?.$id);
  const myRole: string | null =
    ((myMembership?.roles as string[] | undefined) ?? []).find(r => r !== 'owner') ?? null;

  // Prefer explicit roleOrder; fall back to houseRoles insertion order
  const effectiveOrder = roleOrder.length > 0 ? roleOrder : houseRoles;

  // Lower index = higher authority. Unknown / no role = one beyond last (lowest).
  const myRank: number =
    myRole !== null && effectiveOrder.includes(myRole)
      ? effectiveOrder.indexOf(myRole)
      : effectiveOrder.length;

  /** Resolve the rank of any userId (for hierarchy comparison). */
  function rankOf(userId: string): number {
    if (!userId) return effectiveOrder.length;
    const m = members.find(mem => mem.userId === userId);
    const role = ((m?.roles as string[] | undefined) ?? []).find(r => r !== 'owner') ?? null;
    return role !== null && effectiveOrder.includes(role)
      ? effectiveOrder.indexOf(role)
      : effectiveOrder.length;
  }

  /** Get the effective tab permission for the current user. */
  function getTabPerm(tab: TabKey): TabPermission {
    if (isOwner) return DEFAULT_TAB_PERMISSION;
    if (!myRole) {
      // No roles configured → permissive default; roles exist but no role assigned → locked
      return houseRoles.length === 0
        ? DEFAULT_TAB_PERMISSION
        : { canCreate: false, canEdit: false, canDelete: false };
    }
    return rolePermissions[myRole]?.[tab] ?? DEFAULT_TAB_PERMISSION;
  }

  /** Can the current user add new items in this tab? */
  function canCreate(tab: TabKey): boolean {
    if (isOwner) return true;
    return getTabPerm(tab).canCreate;
  }

  /**
   * Can the current user edit an item in this tab?
   * @param creatorUserId  The `userId` stored on the DB row.
   */
  function canEdit(tab: TabKey, creatorUserId: string): boolean {
    if (isOwner) return true;
    if (!getTabPerm(tab).canEdit) return false;
    // Own items are always editable; unknown creator → allow
    if (!creatorUserId || creatorUserId === user?.$id) return true;
    // With hierarchy off, canEdit applies to all items regardless of creator rank
    if (!hierarchyEnabled) return true;
    return rankOf(creatorUserId) >= myRank;
  }

  /**
   * Can the current user delete an item in this tab?
   * @param creatorUserId  The `userId` stored on the DB row.
   */
  function canDelete(tab: TabKey, creatorUserId: string): boolean {
    if (isOwner) return true;
    if (!getTabPerm(tab).canDelete) return false;
    if (!creatorUserId || creatorUserId === user?.$id) return true;
    if (!hierarchyEnabled) return true;
    return rankOf(creatorUserId) >= myRank;
  }

  return { canCreate, canEdit, canDelete, isOwner };
}
