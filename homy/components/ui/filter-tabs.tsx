import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { lightModePalette } from '@/theme/palette';


interface FilterTabsProps {
  tabs: string[];
  activeTab: number;
  onTabPress: (index: number) => void;
}

export function FilterTabs({ tabs, activeTab, onTabPress }: FilterTabsProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            activeTab === index && styles.tabActive,
          ]}
          onPress={() => onTabPress(index)}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === index && styles.tabTextActive,
            ]}
          >
            {tab}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: lightModePalette.neutral[200],
  },
  tabActive: {
    backgroundColor: lightModePalette.primary.DEFAULT,
  },
  tabText: {
    ...typography.label.md,
    color: lightModePalette.onSurface,
  },
  tabTextActive: {
    color: lightModePalette.neutral[100],
  },
});
