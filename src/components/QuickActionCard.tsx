import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

type QuickActionCardProps = {
  title: string;
  body?: string;
  symbol?: string;
  variant?: 'primary' | 'gold' | 'neutral' | 'danger';
  onPress: () => void;
};

const variantStyles = {
  primary: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
    titleColor: colors.ivory,
    bodyColor: colors.tealSoft,
    symbolBg: colors.ivory,
    symbolColor: colors.teal,
  },
  gold: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    titleColor: colors.ink,
    bodyColor: colors.deepCanopy,
    symbolBg: colors.ink,
    symbolColor: colors.gold,
  },
  neutral: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    titleColor: colors.ink,
    bodyColor: colors.graphite,
    symbolBg: colors.mist,
    symbolColor: colors.canopy,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.coral,
    titleColor: colors.ink,
    bodyColor: colors.graphite,
    symbolBg: colors.coral,
    symbolColor: colors.ivory,
  },
};

export function QuickActionCard({
  title,
  body,
  symbol,
  variant = 'neutral',
  onPress,
}: QuickActionCardProps) {
  const variantStyle = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      {symbol ? (
        <Text
          style={[
            styles.symbol,
            { backgroundColor: variantStyle.symbolBg, color: variantStyle.symbolColor },
          ]}
        >
          {symbol}
        </Text>
      ) : null}
      <Text style={[styles.title, { color: variantStyle.titleColor }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: variantStyle.bodyColor }]}>{body}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 132,
    padding: spacing.lg,
    ...shadow.soft,
  },
  symbol: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    fontSize: 18,
    fontWeight: '800',
    height: 40,
    lineHeight: 40,
    marginBottom: spacing.md,
    overflow: 'hidden',
    textAlign: 'center',
    width: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 21,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.84,
  },
});
