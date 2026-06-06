import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { StatusChip } from './StatusChip';

type TimelineEventCardProps = {
  type: string;
  title: string;
  date: string;
  status: string;
  cost: string;
  provider: string;
  description?: string;
  statusTone?: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
};

export function TimelineEventCard({
  type,
  title,
  date,
  status,
  cost,
  provider,
  description,
  statusTone = 'neutral',
}: TimelineEventCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <StatusChip label={type} tone="neutral" />
          <StatusChip label={status} tone={statusTone} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{date}</Text>
          <Text style={styles.meta}>{cost}</Text>
        </View>
        <Text style={styles.provider}>{provider}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 18,
  },
  dot: {
    backgroundColor: colors.gold,
    borderColor: colors.ivory,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 18,
    width: 18,
  },
  line: {
    backgroundColor: colors.line,
    flex: 1,
    marginTop: spacing.xs,
    minHeight: 90,
    width: 2,
  },
  card: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 23,
  },
  description: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  meta: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '700',
  },
  provider: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
