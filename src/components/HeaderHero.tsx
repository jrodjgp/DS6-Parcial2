import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

type HeaderHeroProps = {
  label?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  accent?: 'gold' | 'blue' | 'coral';
  centered?: boolean;
};

const accentColors = {
  gold: colors.gold,
  blue: colors.blue,
  coral: colors.coral,
};

export function HeaderHero({
  label,
  title,
  subtitle,
  children,
  accent = 'gold',
  centered = false,
}: HeaderHeroProps) {
  return (
    <View style={[styles.hero, { borderBottomColor: accentColors[accent] }]}>
      {label ? <Text style={[styles.label, centered && styles.centered]}>{label}</Text> : null}
      <Text style={[styles.title, centered && styles.centered]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, centered && styles.centered]}>{subtitle}</Text> : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.canopy,
    borderBottomWidth: 7,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.lift,
  },
  label: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.ivory,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 38,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  children: {
    marginTop: spacing.xl,
  },
  centered: {
    textAlign: 'center',
  },
});
