import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type OptionGroupProps<Option extends string> = {
  label: string;
  options: Option[];
  selectedValue: Option;
  onSelect: (value: Option) => void;
};

export function OptionGroup<Option extends string>({
  label,
  options,
  selectedValue,
  onSelect,
}: OptionGroupProps<Option>) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.mist,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  optionText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  optionTextSelected: {
    color: colors.ivory,
  },
  pressed: {
    opacity: 0.82,
  },
});
