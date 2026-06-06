import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'ivory' | 'mist' | 'tealSoft' | 'goldSoft' | 'dangerSoft';
};

const toneStyles = {
  ivory: { backgroundColor: colors.ivory, borderColor: colors.line },
  mist: { backgroundColor: colors.mist, borderColor: colors.line },
  tealSoft: { backgroundColor: colors.tealSoft, borderColor: colors.mist },
  goldSoft: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  dangerSoft: { backgroundColor: colors.dangerSoft, borderColor: colors.coral },
};

export function SectionCard({
  title,
  subtitle,
  children,
  tone = 'ivory',
}: SectionCardProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.card, toneStyle]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.xl,
    ...shadow.soft,
  },
  title: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.graphite,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  body: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
});
