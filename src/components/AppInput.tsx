import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type AppInputProps = TextInputProps & {
  label: string;
};

export function AppInput({ label, style, placeholderTextColor, ...props }: AppInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor ?? colors.graphite}
        selectionColor={colors.isthmusTeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.umbralInk,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.warmSand,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.umbralInk,
    fontSize: 17,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
});
