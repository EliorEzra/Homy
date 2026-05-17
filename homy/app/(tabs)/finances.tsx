import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { spacing } from '@/theme/theme';
import { Plus, Trash2, DollarSign, X, Users, TrendingUp, TrendingDown } from 'lucide-react-native';

type Participant = { name: string; share: number };

type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: Participant[];
  date: string;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatCurrency = (amount: number) =>
  `$${Math.abs(amount).toFixed(2)}`;

const todayStr = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function FinancesScreen() {
  const { user } = useAuth();
  const myName = user?.name || user?.email?.split('@')[0] || 'Me';

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidBy, setFormPaidBy] = useState(myName);
  const [otherPerson, setOtherPerson] = useState('');
  const [formErrors, setFormErrors] = useState<{ title?: string; amount?: string }>({});

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  // Compute balances: positive = others owe me, negative = I owe others
  const balances: Record<string, number> = {};
  for (const expense of expenses) {
    const perPerson = expense.amount / expense.participants.length;
    for (const p of expense.participants) {
      if (p.name !== expense.paidBy) {
        // p.name owes expense.paidBy
        balances[p.name] = (balances[p.name] ?? 0) - perPerson;
        balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + perPerson;
      }
    }
  }

  const myBalance = balances[myName] ?? 0;

  const openForm = () => {
    setFormTitle('');
    setFormAmount('');
    setFormPaidBy(myName);
    setOtherPerson('');
    setFormErrors({});
    setFormVisible(true);
  };

  const handleAdd = () => {
    const errs: { title?: string; amount?: string } = {};
    if (!formTitle.trim()) errs.title = 'Title required';
    const amt = parseFloat(formAmount);
    if (!formAmount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    const other = otherPerson.trim() || 'Other';
    const participants: Participant[] = [
      { name: myName, share: amt / 2 },
      { name: other, share: amt / 2 },
    ];

    setExpenses(prev => [
      {
        id: generateId(),
        title: formTitle.trim(),
        amount: amt,
        paidBy: formPaidBy,
        participants,
        date: todayStr(),
      },
      ...prev,
    ]);
    setFormVisible(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <ThemedCard variant="elevated" style={styles.summaryCard}>
            <DollarSign size={20} color={primaryColor} />
            <ThemedText style={[styles.summaryValue, { color: primaryColor }]}>
              {formatCurrency(totalSpent)}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>Total spent</ThemedText>
          </ThemedCard>

          <ThemedCard variant="elevated" style={styles.summaryCard}>
            {myBalance >= 0
              ? <TrendingUp size={20} color="#1fc16b" />
              : <TrendingDown size={20} color="#ff3748" />
            }
            <ThemedText
              style={[
                styles.summaryValue,
                { color: myBalance >= 0 ? '#1fc16b' : '#ff3748' },
              ]}
            >
              {myBalance >= 0 ? '+' : '-'}{formatCurrency(myBalance)}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>
              {myBalance >= 0 ? 'You are owed' : 'You owe'}
            </ThemedText>
          </ThemedCard>
        </View>

        {/* Balances per person */}
        {Object.keys(balances).filter(name => name !== myName && balances[name] !== 0).length > 0 && (
          <>
            <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>BALANCES</ThemedText>
            <ThemedCard variant="elevated" style={styles.balancesCard}>
              {Object.entries(balances)
                .filter(([name]) => name !== myName)
                .map(([name, bal], idx, arr) => (
                  <React.Fragment key={name}>
                    <View style={styles.balanceRow}>
                      <View style={[styles.personCircle, { backgroundColor: primaryColor }]}>
                        <ThemedText style={styles.personInitial}>
                          {name[0]?.toUpperCase() ?? '?'}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.personName}>{name}</ThemedText>
                      <ThemedText style={{ color: bal > 0 ? '#1fc16b' : '#ff3748', fontWeight: '600' }}>
                        {bal > 0 ? `owes you ${formatCurrency(bal)}` : `you owe ${formatCurrency(bal)}`}
                      </ThemedText>
                    </View>
                    {idx < arr.length - 1 && <ThemedDivider />}
                  </React.Fragment>
                ))}
            </ThemedCard>
          </>
        )}

        {/* Expense list */}
        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>EXPENSES</ThemedText>

        {expenses.length === 0 ? (
          <ThemedEmptyState
            title="No expenses yet"
            description="Tap + to add a shared expense"
            icon={<DollarSign size={52} color={primaryColor} opacity={0.4} />}
          />
        ) : (
          expenses.map(expense => (
            <ThemedCard key={expense.id} variant="outlined" style={styles.expenseCard}>
              <View style={styles.expenseRow}>
                <View style={styles.expenseInfo}>
                  <ThemedText style={styles.expenseTitle}>{expense.title}</ThemedText>
                  <ThemedText style={[styles.expenseMeta, { color: mutedColor }]}>
                    {expense.date} · Paid by {expense.paidBy}
                  </ThemedText>
                  <ThemedText style={[styles.expenseSplit, { color: mutedColor }]}>
                    {expense.participants.map(p => p.name).join(' & ')} · {formatCurrency(expense.amount / expense.participants.length)} each
                  </ThemedText>
                </View>
                <View style={styles.expenseRight}>
                  <ThemedText style={[styles.expenseAmount, { color: primaryColor }]}>
                    {formatCurrency(expense.amount)}
                  </ThemedText>
                  <Pressable onPress={() => deleteExpense(expense.id)} hitSlop={8} style={styles.deleteBtn}>
                    <Trash2 size={16} color="#ff3748" />
                  </Pressable>
                </View>
              </View>
            </ThemedCard>
          ))
        )}

        <View style={{ height: spacing.xl * 3 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={openForm}>
        <Plus size={28} color="white" strokeWidth={3} />
      </Pressable>

      {/* Add Expense Modal */}
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add Expense</ThemedText>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={8}>
                  <X size={22} color={primaryColor} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Title */}
                <ThemedText style={styles.label}>What was it for?</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor: formErrors.title ? '#ff3748' : borderColor, backgroundColor: bgColor }]}
                  placeholder="e.g. Groceries, Dinner..."
                  placeholderTextColor={mutedColor}
                  value={formTitle}
                  onChangeText={t => { setFormTitle(t); if (formErrors.title) setFormErrors(e => ({ ...e, title: undefined })); }}
                />
                {formErrors.title && <ThemedText style={styles.errorText}>{formErrors.title}</ThemedText>}

                {/* Amount */}
                <ThemedText style={styles.label}>Amount ($)</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor: formErrors.amount ? '#ff3748' : borderColor, backgroundColor: bgColor }]}
                  placeholder="0.00"
                  placeholderTextColor={mutedColor}
                  keyboardType="decimal-pad"
                  value={formAmount}
                  onChangeText={t => { setFormAmount(t); if (formErrors.amount) setFormErrors(e => ({ ...e, amount: undefined })); }}
                />
                {formErrors.amount && <ThemedText style={styles.errorText}>{formErrors.amount}</ThemedText>}

                {/* Paid by */}
                <ThemedText style={styles.label}>Paid by</ThemedText>
                <View style={styles.paidByRow}>
                  {[myName, otherPerson || 'Other'].map(name => (
                    <Pressable
                      key={name}
                      onPress={() => setFormPaidBy(name)}
                      style={[
                        styles.paidChip,
                        { borderColor },
                        formPaidBy === name && { backgroundColor: primaryColor, borderColor: primaryColor },
                      ]}
                    >
                      <ThemedText style={[styles.chipText, formPaidBy === name && styles.chipTextActive]}>
                        {name === myName ? `${name} (me)` : name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {/* Other person */}
                <ThemedText style={styles.label}>Split with</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor, backgroundColor: bgColor }]}
                  placeholder="Person's name"
                  placeholderTextColor={mutedColor}
                  value={otherPerson}
                  onChangeText={setOtherPerson}
                />

                <View style={styles.modalFooter}>
                  <Pressable onPress={() => setFormVisible(false)} style={[styles.footerBtn, { borderColor }]}>
                    <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                  </Pressable>
                  <Pressable onPress={handleAdd} style={[styles.footerBtn, styles.confirmBtn, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.confirmText}>Add</ThemedText>
                  </Pressable>
                </View>
              </ScrollView>
            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.md },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 4,
  },
  summaryValue: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 11, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  balancesCard: { marginHorizontal: spacing.lg, padding: spacing.md },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  personCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitial: { color: 'white', fontWeight: '700', fontSize: 13 },
  personName: { flex: 1, fontSize: 14, fontWeight: '500' },
  expenseCard: { marginHorizontal: spacing.lg, marginVertical: spacing.xs },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expenseInfo: { flex: 1, marginRight: spacing.md },
  expenseTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  expenseMeta: { fontSize: 12, marginBottom: 2 },
  expenseSplit: { fontSize: 11 },
  expenseRight: { alignItems: 'flex-end', gap: spacing.sm },
  expenseAmount: { fontSize: 17, fontWeight: '700' },
  deleteBtn: { padding: 2 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Modal
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  errorText: { color: '#ff3748', fontSize: 12, marginTop: 4 },
  paidByRow: { flexDirection: 'row', gap: spacing.sm },
  paidChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  modalFooter: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  footerBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  confirmBtn: { borderWidth: 0 },
  cancelText: { fontSize: 15, fontWeight: '600' },
  confirmText: { fontSize: 15, fontWeight: '600', color: 'white' },
});
