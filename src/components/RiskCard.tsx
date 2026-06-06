import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

type RiskCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  children?: ReactNode;
  onPress?: () => void;
  actionLabel?: string;
};

const severityColors = {
  low: colors.blue,
  medium: colors.teal,
  high: colors.gold,
  critical: colors.coral,
};

export function RiskCard({
  title,
  subtitle,
  meta,
  severity = 'medium',
  children,
  onPress,
  actionLabel = 'Ver >',
}: RiskCardProps) {
  const content = (
    <View style={styles.inner}>
      <View style={[styles.severityRail, { backgroundColor: severityColors[severity] }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {onPress ? <Text style={styles.chevron}>{actionLabel}</Text> : null}
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {children ? <View style={styles.children}>{children}</View> : null}
      </View>
    </View>
  );

  if (!onPress) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow.soft,
  },
  inner: {
    flexDirection: 'row',
    minHeight: 116,
  },
  severityRail: {
    width: 7,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 23,
  },
  subtitle: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  chevron: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  meta: {
    color: colors.graphite,
    fontSize: 13,
    lineHeight: 18,
  },
  children: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.84,
  },
});
