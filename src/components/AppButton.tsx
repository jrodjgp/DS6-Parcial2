import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function AppButton({ label, onPress, variant = 'primary' }: AppButtonProps) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        isDanger && styles.dangerButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.isthmusTeal,
    borderRadius: radius.lg,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.mistGreen,
    borderColor: colors.deepCanopy,
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: colors.coralAlerta,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    color: colors.cardIvory,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  secondaryLabel: {
    color: colors.deepCanopy,
  },
});
