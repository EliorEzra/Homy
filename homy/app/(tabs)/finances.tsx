import { StyleSheet, View, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { FadeScreen } from '@/components/fade-screen';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { Plus, DollarSign, Trash2, X, ArrowLeftRight, CheckCircle } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { useExpenses } from '@/context/expenses_db';
import { usePermissions } from '@/hooks/use-permissions';
import { Expense } from '@/context/db_models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if split_with uses the custom "Name:amount" format */
function isCustomSplit(splitWith: string) {
  return splitWith.includes(':');
}

/** Parse a split_with string into {name, amount} entries */
function parseSplitEntries(splitWith: string, totalAmount: number) {
  if (isCustomSplit(splitWith)) {
    return splitWith.split(',').filter(Boolean).map(s => {
      const [name, amt] = s.split(':');
      return { name, amount: parseFloat(amt) || 0 };
    });
  }
  const names = splitWith.split(',').filter(Boolean);
  const perPerson = totalAmount / (names.length || 1);
  return names.map(name => ({ name, amount: perPerson }));
}

/** Extract member names from split_with (handles both formats) */
function splitNames(splitWith: string) {
  return splitWith.split(',').filter(Boolean).map(s => s.split(':')[0]);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FinancesScreen() {
  const { user } = useAuth();
  const { members, house } = useHouse();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  const isOwner = house?.roles?.includes('owner') ?? false;
  const { canCreate, canDelete } = usePermissions();

  // label = what the user sees; value = what gets stored (userId or 'Me' for self)
  const MEMBERS_DATA = members.length > 0
    ? members.map(m => ({
        label: m.userId === user?.$id
          ? 'Me'
          : (m.userName || m.userEmail?.split('@')[0] || m.userId.slice(0, 6)),
        value: m.userId === user?.$id ? 'Me' : m.userId,
      }))
    : [{ label: 'Me', value: 'Me' }];

  // ── Form state ────────────────────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Me');
  const [splitWith, setSplitWith] = useState<string[]>(['Me']);
  const [splitMode, setSplitMode] = useState<'even' | 'custom'>('even');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');

  const currentUserId = user?.$id ?? '';
  const allExpenses = expenses ?? [];

  // Resolve a stored value to a real userId.
  // Handles three cases:
  //   'Me'       → the expense creator (creatorId)
  //   a userId   → returned as-is (new format, stable across renames)
  //   a name     → matched by display name (old format, best-effort after renames)
  const labelToUserId = (label: string, creatorId: string): string => {
    if (label === 'Me') return creatorId;
    // Already a userId (new storage format)
    if (members.some(mb => mb.userId === label)) return label;
    // Old format: stored display name — match against current names
    const m = members.find(mb => {
      const display = mb.userName || mb.userEmail?.split('@')[0] || mb.userId.slice(0, 6);
      return display === label;
    });
    return m?.userId ?? label;
  };

  // Resolve any stored value (userId, 'Me', or legacy name) to the display label
  // the current viewer should see, taking into account the expense creator.
  const resolveLabel = (raw: string, creatorId: string): string => {
    if (raw === 'Me') return creatorId === currentUserId ? 'Me' : userIdToLabel(creatorId);
    return userIdToLabel(labelToUserId(raw, creatorId));
  };

  // Convert a userId to the display name the current viewer sees.
  const userIdToLabel = (userId: string): string => {
    if (userId === currentUserId) return 'Me';
    const m = members.find(mb => mb.userId === userId);
    return m ? (m.userName || m.userEmail?.split('@')[0] || userId.slice(0, 6)) : userId.slice(0, 6);
  };

  // Members only see expenses they're part of (resolved correctly per creator)
  const visibleExpenses = isOwner
    ? allExpenses
    : allExpenses.filter(e => {
        const creatorId = e.userId as string;
        const payerId = (e.paid_by as string) === 'Me' ? creatorId : labelToUserId(e.paid_by as string, creatorId);
        const splitUserIds = splitNames(e.split_with as string).map(n => labelToUserId(n, creatorId));
        return payerId === currentUserId || splitUserIds.includes(currentUserId);
      });

  // ── Per-person balances (keyed by userId, from current viewer's perspective) ─
  const balanceByUserId: Record<string, number> = {};
  allExpenses.forEach(e => {
    const creatorId = e.userId as string;
    const payerId = (e.paid_by as string) === 'Me' ? creatorId : labelToUserId(e.paid_by as string, creatorId);
    const entries = parseSplitEntries(e.split_with as string, e.amount as number);
    const resolved = entries.map(({ name, amount }) => ({ userId: labelToUserId(name, creatorId), amount }));

    if (payerId === currentUserId) {
      // Current user paid — others owe them
      resolved.forEach(({ userId, amount }) => {
        if (userId !== currentUserId)
          balanceByUserId[userId] = (balanceByUserId[userId] ?? 0) + amount;
      });
    } else {
      // Someone else paid — check if current user is in the split
      const myEntry = resolved.find(en => en.userId === currentUserId);
      if (myEntry)
        balanceByUserId[payerId] = (balanceByUserId[payerId] ?? 0) - myEntry.amount;
    }
  });

  const oweMe = Object.entries(balanceByUserId).filter(([, v]) => v > 0.005);
  const iOwe = Object.entries(balanceByUserId).filter(([, v]) => v < -0.005);
  const allSettled = oweMe.length === 0 && iOwe.length === 0;

  // ── Custom-amount derived values ──────────────────────────────────────────
  const totalAmt = parseFloat(amount) || 0;
  const specifiedTotal = splitWith.reduce((sum, m) => {
    return sum + (parseFloat(customAmounts[m] || '') || 0);
  }, 0);
  const autoFields = splitWith.filter(m => !customAmounts[m] || customAmounts[m] === '');
  const remaining = totalAmt - specifiedTotal;
  const autoPerPerson = autoFields.length > 0 ? remaining / autoFields.length : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(''); setAmount(''); setPaidBy('Me');
    setSplitWith(['Me']); setSplitMode('even'); setCustomAmounts({});
  };

  const toggleSplit = (m: string) => {
    if (splitWith.includes(m)) {
      setSplitWith(prev => prev.filter(x => x !== m));
      setCustomAmounts(prev => { const next = { ...prev }; delete next[m]; return next; });
    } else {
      setSplitWith(prev => [...prev, m]);
    }
  };

  const handleSplitModeChange = (mode: 'even' | 'custom') => {
    setSplitMode(mode);
    if (mode === 'even') setCustomAmounts({});
  };

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0 || splitWith.length === 0) return;

    let splitWithStr: string;
    if (splitMode === 'custom') {
      if (specifiedTotal > amt + 0.01) {
        Alert.alert('Invalid Amounts', `The specified amounts ($${specifiedTotal.toFixed(2)}) exceed the total expense ($${amt.toFixed(2)}).`);
        return;
      }
      splitWithStr = splitWith.map(m => {
        const specified = customAmounts[m] && customAmounts[m] !== '';
        const personAmt = specified ? parseFloat(customAmounts[m]) : autoPerPerson;
        return `${m}:${personAmt.toFixed(2)}`;
      }).join(',');
    } else {
      splitWithStr = splitWith.join(',');
    }

    setSaving(true);
    addExpense({
      title: title.trim(), amount: amt,
      paid_by: paidBy, split_with: splitWithStr,
      date: new Date().toLocaleDateString(),
    } as Expense).then(({error}) => {
      setSaving(false);
      if (error) { Alert.alert('Error', error.message); return; }
    }).catch(() => {});
    resetForm(); setFormVisible(false);
  };

  const handleSettleUp = (personUserId: string, net: number) => {
    const personDisplayName = userIdToLabel(personUserId);
    const youOwe = net < 0;
    const absAmt = Math.abs(net).toFixed(2);
    Alert.alert(
      'Settle Up',
      youOwe
        ? `You owe ${personDisplayName} $${absAmt}. A settlement record will be added.`
        : `${personDisplayName} owes you $${absAmt}. A settlement record will be added.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle Up',
          onPress: () => {
            addExpense({
              title: `Settled up with ${personDisplayName}`,
              amount: Math.abs(net),
              // Store stable userId so renames don't break this record
              paid_by: youOwe ? 'Me' : personUserId,
              split_with: youOwe ? personUserId : 'Me',
              date: new Date().toLocaleDateString(),
            } as Expense).then(({error}) => {
              if (error) Alert.alert('Error', error.message);
            }).catch(() => {});
          },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <FadeScreen>
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Finances</ThemedText>
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Balances ─────────────────────────────────────────────────────── */}
        <ThemedText style={styles.sectionLabel}>Balances</ThemedText>

        {allSettled ? (
          <ThemedCard variant="outlined" style={styles.settledCard}>
            <CheckCircle size={22} color="#1fc16b" />
            <ThemedText style={styles.settledText}>All settled up!</ThemedText>
          </ThemedCard>
        ) : (
          <>
            {oweMe.length > 0 && (
              <ThemedCard variant="outlined" style={styles.balanceGroup}>
                {oweMe.map(([personId, net], i) => (
                  <View key={personId} style={[styles.balanceRow, i > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}>
                    <View style={[styles.balanceDot, { backgroundColor: '#1fc16b' }]} />
                    <View style={styles.balanceInfo}>
                      <ThemedText style={styles.balanceName}>{userIdToLabel(personId)}</ThemedText>
                      <ThemedText style={[styles.balanceAmt, { color: '#1fc16b' }]}>owes you ${net.toFixed(2)}</ThemedText>
                    </View>
                    <Pressable onPress={() => handleSettleUp(personId, net)} style={[styles.settleBtn, { borderColor: primaryColor }]}>
                      <ArrowLeftRight size={12} color={primaryColor} />
                      <ThemedText style={[styles.settleBtnText, { color: primaryColor }]}>Settle</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </ThemedCard>
            )}

            {iOwe.length > 0 && (
              <ThemedCard variant="outlined" style={styles.balanceGroup}>
                {iOwe.map(([personId, net], i) => (
                  <View key={personId} style={[styles.balanceRow, i > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}>
                    <View style={[styles.balanceDot, { backgroundColor: '#ff3748' }]} />
                    <View style={styles.balanceInfo}>
                      <ThemedText style={styles.balanceName}>{userIdToLabel(personId)}</ThemedText>
                      <ThemedText style={[styles.balanceAmt, { color: '#ff3748' }]}>you owe ${Math.abs(net).toFixed(2)}</ThemedText>
                    </View>
                    <Pressable onPress={() => handleSettleUp(personId, net)} style={[styles.settleBtn, { borderColor: primaryColor }]}>
                      <ArrowLeftRight size={12} color={primaryColor} />
                      <ThemedText style={[styles.settleBtnText, { color: primaryColor }]}>Settle</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </ThemedCard>
            )}
          </>
        )}

        {/* ── Expenses ─────────────────────────────────────────────────────── */}
        <View style={styles.expensesHeader}>
          <ThemedText style={styles.sectionLabel}>Expenses</ThemedText>
          <ThemedText style={[styles.expenseCount, { color: mutedColor }]}>{visibleExpenses.length}</ThemedText>
        </View>

        {visibleExpenses.length === 0 ? (
          <ThemedCard variant="outlined" style={styles.emptyCard}>
            <DollarSign size={28} color={mutedColor} opacity={0.4} />
            <ThemedText style={[styles.emptyText, { color: mutedColor }]}>No expenses yet</ThemedText>
          </ThemedCard>
        ) : [...visibleExpenses]
            .sort((a, b) => {
              const ta = a.$createdAt ? new Date(a.$createdAt).getTime() : 0;
              const tb = b.$createdAt ? new Date(b.$createdAt).getTime() : 0;
              return tb - ta;
            })
            .map(item => {
          const creatorId = item.userId as string;
          const splitStr = item.split_with as string;
          const custom = isCustomSplit(splitStr);
          // Resolve all names using resolveLabel so renames and userId format both work
          const entries = custom
            ? splitStr.split(',').filter(Boolean).map(s => {
                const [n, a] = s.split(':');
                return `${resolveLabel(n, creatorId)} $${parseFloat(a).toFixed(2)}`;
              })
            : null;
          const evenNames = custom ? null : splitStr.split(',').filter(Boolean).map(n => resolveLabel(n, creatorId));
          const perPerson = evenNames ? ((item.amount as number) / (evenNames.length || 1)).toFixed(2) : null;
          const paidByLabel = resolveLabel(item.paid_by as string, creatorId);
          const isMePaying = (item.paid_by as string) === 'Me'
            ? creatorId === currentUserId
            : labelToUserId(item.paid_by as string, creatorId) === currentUserId;

          return (
            <ThemedCard key={item.$id} variant="outlined" style={styles.expenseCard}>
              <View style={styles.expenseRow}>
                <View style={[styles.expenseIconBox, { backgroundColor: isMePaying ? `${primaryColor}20` : `${mutedColor}15` }]}>
                  <DollarSign size={16} color={isMePaying ? primaryColor : mutedColor} />
                </View>
                <View style={styles.expenseBody}>
                  <ThemedText style={styles.expenseTitle} numberOfLines={1}>{item.title as string}</ThemedText>
                  <ThemedText style={[styles.expenseSub, { color: mutedColor }]} numberOfLines={2}>
                    {paidByLabel} paid
                    {custom
                      ? ` · ${entries!.join(', ')}`
                      : ` · $${perPerson}/person · ${evenNames!.join(', ')}`
                    }
                  </ThemedText>
                  <ThemedText style={[styles.expenseDate, { color: mutedColor }]}>{item.date as string}</ThemedText>
                </View>
                <View style={styles.expenseRight}>
                  <ThemedText style={styles.expenseAmt}>${(item.amount as number).toFixed(2)}</ThemedText>
                  {canDelete('finances', item.userId as string) && (
                    <Pressable onPress={() => Alert.alert(
                      'Delete Expense',
                      'Remove this expense? Balances will update automatically.',
                      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {deleteExpense(item.$id).catch(() => {})} }]
                    )} hitSlop={8}>
                      <Trash2 size={15} color="#ff3748" />
                    </Pressable>
                  )}
                </View>
              </View>
            </ThemedCard>
          );
        })}
      </ScrollView>

      {canCreate('finances') && (
        <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => setFormVisible(true)}>
          <Plus size={28} color="white" strokeWidth={3} />
        </Pressable>
      )}

      {/* ── Add Expense Modal ─────────────────────────────────────────────── */}
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => { setFormVisible(false); resetForm(); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add Expense</ThemedText>
                <Pressable onPress={() => { setFormVisible(false); resetForm(); }} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Title */}
                <ThemedText style={styles.fieldLabel}>Title</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g. Groceries"
                  placeholderTextColor={mutedColor}
                  value={title} onChangeText={setTitle}
                />

                {/* Amount */}
                <ThemedText style={styles.fieldLabel}>Amount ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="0.00"
                  placeholderTextColor={mutedColor}
                  value={amount} onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />

                {/* Paid By */}
                <ThemedText style={styles.fieldLabel}>Paid By</ThemedText>
                <View style={styles.chipRow}>
                  {MEMBERS_DATA.map(({ label, value }) => (
                    <Pressable key={value} onPress={() => setPaidBy(value)}
                      style={[styles.chip, { borderColor, backgroundColor: inputBg }, paidBy === value && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
                      <ThemedText style={[styles.chipText, paidBy === value && { color: 'white' }]}>{label}</ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Split With */}
                <ThemedText style={styles.fieldLabel}>Split With</ThemedText>
                <View style={styles.chipRow}>
                  {MEMBERS_DATA.map(({ label, value }) => (
                    <Pressable key={value} onPress={() => toggleSplit(value)}
                      style={[styles.chip, { borderColor, backgroundColor: inputBg }, splitWith.includes(value) && { backgroundColor: '#1fc16b', borderColor: '#1fc16b' }]}>
                      <ThemedText style={[styles.chipText, splitWith.includes(value) && { color: 'white' }]}>{label}</ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Split Mode — only shown when ≥2 people selected */}
                {splitWith.length >= 2 && (
                  <>
                    <ThemedText style={styles.fieldLabel}>Split</ThemedText>
                    <View style={styles.chipRow}>
                      <Pressable
                        onPress={() => handleSplitModeChange('even')}
                        style={[styles.chip, { borderColor, backgroundColor: inputBg }, splitMode === 'even' && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                      >
                        <ThemedText style={[styles.chipText, splitMode === 'even' && { color: 'white' }]}>Evenly</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => handleSplitModeChange('custom')}
                        style={[styles.chip, { borderColor, backgroundColor: inputBg }, splitMode === 'custom' && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                      >
                        <ThemedText style={[styles.chipText, splitMode === 'custom' && { color: 'white' }]}>Custom amounts</ThemedText>
                      </Pressable>
                    </View>
                  </>
                )}

                {/* Custom Amounts */}
                {splitMode === 'custom' && splitWith.length >= 1 && (
                  <>
                    <ThemedText style={styles.fieldLabel}>Amounts</ThemedText>
                    {splitWith.map(v => {
                      const memberLabel = MEMBERS_DATA.find(m => m.value === v)?.label ?? v;
                      return (
                        <View key={v} style={styles.customAmtRow}>
                          <ThemedText style={styles.customAmtName}>{memberLabel}</ThemedText>
                          <View style={[styles.customAmtInput, { borderColor, backgroundColor: inputBg }]}>
                            <ThemedText style={[styles.customAmtSymbol, { color: mutedColor }]}>$</ThemedText>
                            <TextInput
                              style={[styles.customAmtField, { color: textColor }]}
                              placeholder={autoFields.includes(v) && totalAmt > 0
                                ? `${autoPerPerson.toFixed(2)} (auto)`
                                : 'auto'}
                              placeholderTextColor={mutedColor}
                              value={customAmounts[v] || ''}
                              onChangeText={val => setCustomAmounts(prev => ({ ...prev, [v]: val }))}
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>
                      );
                    })}

                    {/* Remaining indicator */}
                    {totalAmt > 0 && (() => {
                      if (remaining < -0.01) return (
                        <View style={[styles.remBox, { backgroundColor: '#ff374815', borderColor: '#ff374840' }]}>
                          <ThemedText style={[styles.remText, { color: '#ff3748' }]}>
                            ⚠ Amounts exceed total by ${Math.abs(remaining).toFixed(2)}
                          </ThemedText>
                        </View>
                      );
                      if (autoFields.length > 0) return (
                        <View style={[styles.remBox, { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` }]}>
                          <ThemedText style={[styles.remText, { color: primaryColor }]}>
                            ${remaining.toFixed(2)} remaining — split evenly among {autoFields.length} auto field{autoFields.length > 1 ? 's' : ''}
                          </ThemedText>
                        </View>
                      );
                      return (
                        <View style={[styles.remBox, { backgroundColor: '#1fc16b15', borderColor: '#1fc16b40' }]}>
                          <ThemedText style={[styles.remText, { color: '#1fc16b' }]}>
                            ✓ Fully distributed
                          </ThemedText>
                        </View>
                      );
                    })()}
                  </>
                )}

              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable onPress={() => { setFormVisible(false); resetForm(); }} style={[styles.footerBtn, { borderColor }]}>
                  <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleAdd} disabled={saving}
                  style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: saving ? 0.6 : 1 }]}>
                  <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{saving ? 'Saving...' : 'Add'}</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
    </FadeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 3 },
  sectionLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, opacity: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  // Balances
  settledCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  settledText: { fontSize: 15, fontWeight: '600', color: '#1fc16b' },
  balanceGroup: { marginBottom: spacing.md, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  balanceDot: { width: 8, height: 8, borderRadius: 4 },
  balanceInfo: { flex: 1 },
  balanceName: { fontWeight: '600', fontSize: 14 },
  balanceAmt: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  settleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: 16, borderWidth: 1.5 },
  settleBtnText: { fontSize: 12, fontWeight: '700' },
  // Expenses
  expensesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  expenseCount: { fontSize: 12, fontWeight: '700', marginBottom: spacing.sm },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  emptyText: { fontSize: 14 },
  expenseCard: { marginBottom: spacing.sm, paddingVertical: spacing.sm + 2 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  expenseIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expenseBody: { flex: 1 },
  expenseTitle: { fontWeight: '600', fontSize: 14, marginBottom: 1 },
  expenseSub: { fontSize: 11, marginBottom: 1 },
  expenseDate: { fontSize: 10 },
  expenseRight: { alignItems: 'flex-end', gap: spacing.xs },
  expenseAmt: { fontWeight: '700', fontSize: 15 },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  // Modal
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { minHeight: '70%', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalForm: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  fieldLabel: { fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: 14, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  // Custom amounts
  customAmtRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  customAmtName: { width: 72, fontWeight: '600', fontSize: 14 },
  customAmtInput: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2 },
  customAmtSymbol: { fontSize: 14, fontWeight: '600', marginRight: 4 },
  customAmtField: { flex: 1, fontSize: 14, paddingVertical: 2 },
  remBox: { borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.sm },
  remText: { fontSize: 13, fontWeight: '600' },
  // Footer
  modalFooter: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '700', fontSize: 15 },
});
