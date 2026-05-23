import { useHouse } from '@/context/house';
import { useAuth } from '@/context/auth';
import { DEFAULT_TAB_PERMISSION, TabPermission } from '@/context/db_models';

export type TabKey = 'tasks' | 'shop' | 'finances' | 'calendar';

/**
 * Returns permission helpers for the current user.
 *
 * Hierarchy rule: roleOrder[0] = highest authority. A user can only
 * edit/delete items created by someone with equal or lower authority
 * (equal or higher index in roleOrder).
 *
 * Owner always bypasses all checks.
 */
export function usePermissions() {
  const { house, members, houseRoles, roleOrder, rolePermissions } = useHouse();
  const { user } = useAuth();

  const isOwner = (house?.roles as string[] | undefined)?.includes('owner') ?? false;

  // Current user's non-owner role
  const myMembership = members.find(m => m.userId === user?.$id);
  const myRole: string | null =
    ((myMembership?.roles as string[] | undefined) ?? []).find(r => r !== 'owner') ?? null;

  // Effective order: prefer explicit roleOrder, fall back to houseRoles array order
  const effectiveOrder = roleOrder.length > 0 ? roleOrder : houseRoles;

  // Lower index = higher authority. No role / unrecognised role = lowest rank.
  const myRank: number =
    myRole !== null && effectiveOrder.includes(myRole)
      ? effectiveOrder.indexOf(myRole)
      : effectiveOrder.length;

  function getTabPerm(tab: TabKey): TabPermission {
    if (isOwner) return DEFAULT_TAB_PERMISSION;
    if (!myRole) return DEFAULT_TAB_PERMISSION; // no role → default all-allowed
    return rolePermissions[myRole]?.[tab] ?? DEFAULT_TAB_PERMISSION;
  }

  function _creatorRank(creatorUserId: string): number {
    if (!creatorUserId) return effectiveOrder.length; // unknown creator = lowest
    const m = members.find(mem => mem.userId === creatorUserId);
    const creatorRole: string | null =
      ((m?.roles as string[] | undefined) ?? []).find(r => r !== 'owner') ?? null;
    return creatorRole !== null && effectiveOrder.includes(creatorRole)
      ? effectiveOrder.indexOf(creatorRole)
      : effectiveOrder.length;
  }

  /**
   * Can the current user add new items in this tab?
   */
  function canCreate(tab: TabKey): boolean {
    if (isOwner) return true;
    return getTabPerm(tab).canCreate;
  }

  /**
   * Can the current user edit an item in this tab?
   * @param creatorUserId  The userId stored on the DB row (may be empty string for legacy rows).
   */
  function canEdit(tab: TabKey, creatorUserId: string): boolean {
    if (isOwner) return true;
    if (!getTabPerm(tab).canEdit) return false;
    if (!creatorUserId || creatorUserId === user?.$id) return true; // own item or unknown
    return _creatorRank(creatorUserId) >= myRank; // creator is equal or lower authority
  }

  /**
   * Can the current user delete an item in this tab?
   */
  function canDelete(tab: TabKey, creatorUserId: string): boolean {
    if (isOwner) return true;
    if (!getTabPerm(tab).canDelete) return false;
    if (!creatorUserId || creatorUserId === user?.$id) return true;
    return _creatorRank(creatorUserId) >= myRank;
  }

  return { canCreate, canEdit, canDelete, isOwner };
}
