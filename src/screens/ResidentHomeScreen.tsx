import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Session } from '../types';

type ResidentHomeScreenProps = {
  session: Session;
  onLogout: () => void;
  onReportIncident: () => void;
};

export function ResidentHomeScreen({
  session,
  onLogout,
  onReportIncident,
}: ResidentHomeScreenProps) {
  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <StatusChip label="resident" tone="info" />
          <Text style={styles.title}>Hola, {session.name}</Text>
          <Text style={styles.subtitle}>Reporta incidencias y consulta servicios del PH.</Text>
        </View>

        <ResidentActionCard
          title="Reportar incidencia"
          body="Envía una novedad al historial operativo del área afectada."
          tone="primary"
          onPress={onReportIncident}
        />
        <ResidentActionCard
          title="Mis reportes"
          body="Consulta de reportes enviados. Placeholder para la versión académica."
          onPress={() => Alert.alert('Mis reportes', 'Esta vista queda como placeholder.')}
        />
        <ResidentActionCard
          title="Comunicados"
          body="Avisos del PH para residentes. Placeholder sin comunicación real."
          onPress={() => Alert.alert('Comunicados', 'Esta sección queda como placeholder.')}
        />
        <ResidentActionCard
          title="Reservas"
          body="Reserva de áreas comunes. Placeholder sin reservas reales."
          onPress={() => Alert.alert('Reservas', 'Esta sección queda como placeholder.')}
        />

        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

type ResidentActionCardProps = {
  title: string;
  body: string;
  tone?: 'primary' | 'soft';
  onPress: () => void;
};

function ResidentActionCard({
  title,
  body,
  tone = 'soft',
  onPress,
}: ResidentActionCardProps) {
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        isPrimary && styles.primaryActionCard,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionTitle, isPrimary && styles.primaryActionTitle]}>{title}</Text>
      <Text style={[styles.actionBody, isPrimary && styles.primaryActionBody]}>{body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.caribeBlue,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.cardIvory,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.mistGreen,
    fontSize: 16,
    lineHeight: 23,
  },
  actionCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  primaryActionCard: {
    backgroundColor: colors.isthmusTeal,
    borderColor: colors.deepCanopy,
  },
  actionTitle: {
    color: colors.umbralInk,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  primaryActionTitle: {
    color: colors.cardIvory,
  },
  actionBody: {
    color: colors.graphite,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryActionBody: {
    color: colors.mistGreen,
  },
  pressed: {
    opacity: 0.78,
  },
});
