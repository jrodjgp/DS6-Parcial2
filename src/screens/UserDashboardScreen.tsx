import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { StatCard } from '../components/StatCard';
import { StatusChip } from '../components/StatusChip';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Session } from '../types';

type UserDashboardScreenProps = {
  session: Session;
  onLogout: () => void;
};

export function UserDashboardScreen({ session, onLogout }: UserDashboardScreenProps) {
  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <View style={styles.header}>
        <StatusChip label="manager" tone="success" />
        <Text style={styles.title}>Panel operativo</Text>
        <Text style={styles.subtitle}>Hola, {session.name}. Aquí vivirán los activos y eventos.</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="Activos" value={0} helper="CRUD pendiente para la siguiente etapa." />
        <StatCard label="Eventos" value={0} helper="Historial operativo aún no implementado." />
      </View>

      <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.guayacanGold,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.cardIvory,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.mistGreen,
    fontSize: 16,
    lineHeight: 23,
  },
  stats: {
    gap: spacing.lg,
    marginVertical: spacing.xl,
  },
});
