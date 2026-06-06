import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.umbralInk,
  },
  content: {
    flex: 1,
    backgroundColor: colors.warmSand,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
