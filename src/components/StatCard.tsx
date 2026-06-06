import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 118,
    padding: spacing.lg,
    ...shadow.soft,
  },
  label: {
    color: colors.graphite,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: colors.umbralInk,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: spacing.xs,
  },
  helper: {
    color: colors.deepCanopy,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
