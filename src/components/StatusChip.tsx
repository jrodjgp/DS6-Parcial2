import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { StatusTone } from '../types';

type StatusChipProps = {
  label: string;
  tone?: StatusTone;
};

const toneStyles: Record<StatusTone, { backgroundColor: string; color: string }> = {
  success: { backgroundColor: colors.mistGreen, color: colors.deepCanopy },
  warning: { backgroundColor: colors.guayacanGold, color: colors.umbralInk },
  danger: { backgroundColor: colors.coralAlerta, color: colors.cardIvory },
  info: { backgroundColor: colors.caribeBlue, color: colors.umbralInk },
  neutral: { backgroundColor: colors.cardIvory, color: colors.graphite },
};

export function StatusChip({ label, tone = 'neutral' }: StatusChipProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.chip, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
