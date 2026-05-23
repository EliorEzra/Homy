import { StyleSheet, View, FlatList, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { Plus, DollarSign, Trash2, X } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { useExpenses } from '@/context/expenses_db';
import { Models } from 'react-native-appwrite';

export default function FinancesScreen() {
  const { user } = useAuth();
  const { members } = useHouse();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  // Build member label list: current user is always "Me", others use display name
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

  const expenseList = expenses ?? [];

  const totalSpent = expenseList.reduce((s, e) => s + (e.amount as number), 0);
  const myExpenses = expenseList.filter(e => (e.split_with as string).split(',').includes('Me'));
  const myShare = myExpenses.reduce((s, e) => {
    const splitMembers = (e.split_with as string).split(',').filter(Boolean);
    return s + (e.amount as number) / (splitMembers.length || 1);
  }, 0);
  const iPaid = expenseList.filter(e => e.paid_by === 'Me').reduce((s, e) => s + (e.amount as number), 0);
  const balance = iPaid - myShare;

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) return;
    setSaving(true);
    const { error } = await addExpense({
      title: title.trim(),
      amount: amt,
      paid_by: paidBy,
      split_with: splitWith.join(','),
      date: new Date().toLocaleDateString(),
    });
    setSaving(false);
    if (error) { Alert.alert("Error", error.message); return; }
    setTitle(''); setAmount(''); setPaidBy('Me'); setSplitWith(['Me']);
    setFormVisible(false);
  };

  const handleDelete = async (expenseId: string) => {
    const { error } = await deleteExpense(expenseId);
    if (error) Alert.alert("Error", error.message);
  };

  const toggleSplit = (member: string) => {
    setSplitWith(prev => prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}><ThemedText type="title">Finances</ThemedText></ThemedView>

      <View style={styles.summaryRow}>
        <ThemedCard variant="elevated" style={[styles.summaryCard, { borderLeftColor: '#1fc16b', borderLeftWidth: 3 }]}>
          <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>Total Spent</ThemedText>
          <ThemedText style={styles.summaryValue}>${totalSpent.toFixed(2)}</ThemedText>
        </ThemedCard>
        <ThemedCard variant="elevated" style={[styles.summaryCard, { borderLeftColor: balance >= 0 ? '#1fc16b' : '#ff3748', borderLeftWidth: 3 }]}>
          <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>Your Balance</ThemedText>
          <ThemedText style={[styles.summaryValue, { color: balance >= 0 ? '#1fc16b' : '#ff3748' }]}>
            {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
          </ThemedText>
        </ThemedCard>
      </View>

      {expenseList.length === 0 ? (
        <ThemedEmptyState
          title="No Expenses Yet"
          description="Add your first shared expense"
          icon={<DollarSign size={64} color="#1fc16b" opacity={0.5} />}
          action={
            <Pressable onPress={() => setFormVisible(true)} style={[styles.emptyAdd, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.emptyAddText}>+ Add Expense</ThemedText>
            </Pressable>
          }
        />
      ) : (
        <FlatList
          data={expenseList}
          keyExtractor={item => item.$id}
          renderItem={({ item }) => {
            const splitMembers = (item.split_with as string).split(',').filter(Boolean);
            const perPerson = ((item.amount as number) / (splitMembers.length || 1)).toFixed(2);
            return (
              <ThemedCard variant="outlined" style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={[styles.expenseIcon, { backgroundColor: `${primaryColor}20` }]}>
                    <DollarSign size={18} color={primaryColor} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <ThemedText style={styles.expenseTitle} numberOfLines={1}>{item.title as string}</ThemedText>
                    <ThemedText style={[styles.expenseMeta, { color: mutedColor }]}>
                      Paid by {item.paid_by as string} · {item.date as string}
                    </ThemedText>
                    <ThemedText style={[styles.expenseSplit, { color: mutedColor }]}>
                      ${perPerson}/person · {splitMembers.join(', ')}
                    </ThemedText>
                  </View>
                  <View style={styles.expenseRight}>
                    <ThemedText style={styles.expenseAmount}>${(item.amount as number).toFixed(2)}</ThemedText>
                    <Pressable onPress={() => handleDelete(item.$id)} hitSlop={8}>
                      <Trash2 size={16} color="#ff3748" />
                    </Pressable>
                  </View>
                </View>
              </ThemedCard>
            );
          }}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      )}

      <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => setFormVisible(true)}>
        <Plus size={28} color="white" strokeWidth={3} />
      </Pressable>

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add Expense</ThemedText>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.fieldLabel}>Title</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g., Groceries"
                  placeholderTextColor={mutedColor}
                  value={title}
                  onChangeText={setTitle}
                />
                <ThemedText style={styles.fieldLabel}>Amount ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="0.00"
                  placeholderTextColor={mutedColor}
                  value={amount}
                  onChangeText={setAmount}
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
                <Pressable onPress={() => setFormVisible(false)} style={[styles.footerBtn, { borderColor }]}>
                  <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleAdd} disabled={saving} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: saving ? 0.6 : 1 }]}>
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
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', marginBottom: spacing.xs },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  list: { paddingHorizontal: spacing.lg },
  expenseCard: { marginVertical: spacing.sm / 2 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  expenseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  expenseMeta: { fontSize: 12, marginBottom: 1 },
  expenseSplit: { fontSize: 11 },
  expenseRight: { alignItems: 'flex-end', gap: spacing.xs },
  expenseAmount: { fontWeight: '700', fontSize: 16 },
  emptyAdd: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20 },
  emptyAddText: { color: 'white', fontWeight: '700' },
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
