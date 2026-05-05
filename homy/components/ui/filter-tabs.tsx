import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Body } from './typography';
import { spacing } from '@/theme/spacing';
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
          <Body
            size="sm"
            color={
              activeTab === index
                ? lightModePalette.neutral[100]
                : lightModePalette.onSurface
            }
          >
            {tab}
          </Body>
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
});
