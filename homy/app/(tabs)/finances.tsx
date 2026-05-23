import { StyleSheet, View, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { Plus, DollarSign, Trash2, X, ArrowLeftRight, CheckCircle } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { useExpenses } from '@/context/expenses_db';
import { usePermissions } from '@/hooks/use-permissions';

export default function FinancesScreen() {
  const { user } = useAuth();
  const { members, house } = useHouse();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  const isOwner = house?.roles?.includes('owner') ?? false;
  const { canCreate, canDelete } = usePermissions();

  const MEMBERS = members.length > 0
    ? members.map(m => m.userId === user?.$id
        ? 'Me'
        : (m.userName || m.userEmail?.split('@')[0] || m.userId.slice(0, 6)))
    : ['Me'];

  const [formVisible, setFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Me');
  const [splitWith, setSplitWith] = useState<string[]>(['Me']);
  const [saving, setSaving] = useState(false);

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'cardBackground');

  const allExpenses = expenses ?? [];

  // Members only see expenses they're part of
  const visibleExpenses = isOwner
    ? allExpenses
    : allExpenses.filter(e => {
        const sw = (e.split_with as string).split(',').filter(Boolean);
        return e.paid_by === 'Me' || sw.includes('Me');
      });

  // ── Per-person balances: positive = they owe me, negative = I owe them ───────
  const balanceByPerson: Record<string, number> = {};
  allExpenses.forEach(e => {
    const pb = e.paid_by as string;
    const sw = (e.split_with as string).split(',').filter(Boolean);
    const perPerson = (e.amount as number) / (sw.length || 1);
    if (pb === 'Me') {
      sw.forEach(m => { if (m !== 'Me') balanceByPerson[m] = (balanceByPerson[m] ?? 0) + perPerson; });
    } else if (sw.includes('Me')) {
      balanceByPerson[pb] = (balanceByPerson[pb] ?? 0) - perPerson;
    }
  });

  const oweMe = Object.entries(balanceByPerson).filter(([, v]) => v > 0.005);
  const iOwe = Object.entries(balanceByPerson).filter(([, v]) => v < -0.005);
  const allSettled = oweMe.length === 0 && iOwe.length === 0;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const resetForm = () => { setTitle(''); setAmount(''); setPaidBy('Me'); setSplitWith(['Me']); };

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) return;
    setSaving(true);
    const { error } = await addExpense({
      title: title.trim(), amount: amt,
      paid_by: paidBy, split_with: splitWith.join(','),
      date: new Date().toLocaleDateString(),
    });
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    resetForm(); setFormVisible(false);
  };

  const handleSettleUp = (personLabel: string, net: number) => {
    const youOwe = net < 0;
    const absAmt = Math.abs(net).toFixed(2);
    Alert.alert(
      'Settle Up',
      youOwe
        ? `You owe ${personLabel} $${absAmt}. A settlement record will be added.`
        : `${personLabel} owes you $${absAmt}. A settlement record will be added.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle Up',
          onPress: async () => {
            const { error } = await addExpense({
              title: `Settled up with ${personLabel}`,
              amount: Math.abs(net),
              paid_by: youOwe ? 'Me' : personLabel,
              split_with: youOwe ? personLabel : 'Me',
              date: new Date().toLocaleDateString(),
            });
            if (error) Alert.alert('Error', error.message);
          },
        },
      ]
    );
  };

  const toggleSplit = (m: string) =>
    setSplitWith(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
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
                <ThemedText style={[styles.balanceGroupLabel, { color: '#1fc16b' }]}>Owed to you</ThemedText>
                {oweMe.map(([person, net], i) => (
                  <View key={person} style={[styles.balanceRow, i > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}>
                    <View style={[styles.balanceDot, { backgroundColor: '#1fc16b' }]} />
                    <View style={styles.balanceInfo}>
                      <ThemedText style={styles.balanceName}>{person}</ThemedText>
                      <ThemedText style={[styles.balanceAmt, { color: '#1fc16b' }]}>owes you ${net.toFixed(2)}</ThemedText>
                    </View>
                    <Pressable onPress={() => handleSettleUp(person, net)} style={[styles.settleBtn, { borderColor: primaryColor }]}>
                      <ArrowLeftRight size={12} color={primaryColor} />
                      <ThemedText style={[styles.settleBtnText, { color: primaryColor }]}>Settle</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </ThemedCard>
            )}

            {iOwe.length > 0 && (
              <ThemedCard variant="outlined" style={styles.balanceGroup}>
                <ThemedText style={[styles.balanceGroupLabel, { color: '#ff3748' }]}>You owe</ThemedText>
                {iOwe.map(([person, net], i) => (
                  <View key={person} style={[styles.balanceRow, i > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}>
                    <View style={[styles.balanceDot, { backgroundColor: '#ff3748' }]} />
                    <View style={styles.balanceInfo}>
                      <ThemedText style={styles.balanceName}>{person}</ThemedText>
                      <ThemedText style={[styles.balanceAmt, { color: '#ff3748' }]}>you owe ${Math.abs(net).toFixed(2)}</ThemedText>
                    </View>
                    <Pressable onPress={() => handleSettleUp(person, net)} style={[styles.settleBtn, { borderColor: primaryColor }]}>
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
        ) : [...visibleExpenses].reverse().map(item => {
          const sw = (item.split_with as string).split(',').filter(Boolean);
          const perPerson = ((item.amount as number) / (sw.length || 1)).toFixed(2);
          const isMePaying = item.paid_by === 'Me';
          return (
            <ThemedCard key={item.$id} variant="outlined" style={styles.expenseCard}>
              <View style={styles.expenseRow}>
                <View style={[styles.expenseIconBox, { backgroundColor: isMePaying ? `${primaryColor}20` : `${mutedColor}15` }]}>
                  <DollarSign size={16} color={isMePaying ? primaryColor : mutedColor} />
                </View>
                <View style={styles.expenseBody}>
                  <ThemedText style={styles.expenseTitle} numberOfLines={1}>{item.title as string}</ThemedText>
                  <ThemedText style={[styles.expenseSub, { color: mutedColor }]}>
                    {item.paid_by as string} paid · ${perPerson}/person · {sw.join(', ')}
                  </ThemedText>
                  <ThemedText style={[styles.expenseDate, { color: mutedColor }]}>{item.date as string}</ThemedText>
                </View>
                <View style={styles.expenseRight}>
                  <ThemedText style={styles.expenseAmt}>${(item.amount as number).toFixed(2)}</ThemedText>
                  {canDelete('finances', item.userId as string) && (
                    <Pressable onPress={() => Alert.alert(
                      'Delete Expense',
                      'Remove this expense? Balances will update automatically.',
                      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(item.$id) }]
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
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add Expense</ThemedText>
                <Pressable onPress={() => { setFormVisible(false); resetForm(); }} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.fieldLabel}>Title</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g. Groceries"
                  placeholderTextColor={mutedColor}
                  value={title} onChangeText={setTitle}
                />
                <ThemedText style={styles.fieldLabel}>Amount ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="0.00"
                  placeholderTextColor={mutedColor}
                  value={amount} onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <ThemedText style={styles.fieldLabel}>Paid By</ThemedText>
                <View style={styles.chipRow}>
                  {MEMBERS.map(m => (
                    <Pressable key={m} onPress={() => setPaidBy(m)}
                      style={[styles.chip, { borderColor }, paidBy === m && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
                      <ThemedText style={[styles.chipText, paidBy === m && { color: 'white' }]}>{m}</ThemedText>
                    </Pressable>
                  ))}
                </View>
                <ThemedText style={styles.fieldLabel}>Split With</ThemedText>
                <View style={styles.chipRow}>
                  {MEMBERS.map(m => (
                    <Pressable key={m} onPress={() => toggleSplit(m)}
                      style={[styles.chip, { borderColor }, splitWith.includes(m) && { backgroundColor: '#1fc16b', borderColor: '#1fc16b' }]}>
                      <ThemedText style={[styles.chipText, splitWith.includes(m) && { color: 'white' }]}>{m}</ThemedText>
                    </Pressable>
                  ))}
                </View>
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
  balanceGroupLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
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
  modalFooter: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '700', fontSize: 15 },
});
