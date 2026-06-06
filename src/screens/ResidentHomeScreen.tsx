import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { QuickActionCard } from '../components/QuickActionCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { Session } from '../types';

type ResidentHomeScreenProps = {
  session: Session;
  onLogout: () => void;
  onReportIncident: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ResidentHomeScreen({
  session,
  onLogout,
  onReportIncident,
}: ResidentHomeScreenProps) {
  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Umbral</Text>
            <Text style={styles.brandSub}>Residente</Text>
          </View>
          <View style={styles.topRight}>
            <View style={styles.notificationDot} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(session.name) || 'R'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>PH Bahía Central</Text>
          <Text style={styles.heroTitle}>Hola, {session.name}</Text>
          <Text style={styles.heroText}>
            Accesos rápidos para reportes, reservas y comunicados del PH.
          </Text>
        </View>

        <View style={styles.actionGrid}>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Reportar incidencia"
              body="Avisar al equipo"
              symbol="+"
              variant="primary"
              onPress={onReportIncident}
            />
            <QuickActionCard
              title="Mis reportes"
              body="Seguimiento"
              symbol="R"
              variant="gold"
              onPress={() => Alert.alert('Mis reportes', 'Esta vista queda como placeholder.')}
            />
          </View>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Comunicados"
              body="Avisos del PH"
              symbol="C"
              variant="neutral"
              onPress={() => Alert.alert('Comunicados', 'Esta sección queda como placeholder.')}
            />
            <QuickActionCard
              title="Reservas"
              body="Áreas comunes"
              symbol="A"
              variant="neutral"
              onPress={() => Alert.alert('Reservas', 'Esta sección queda como placeholder.')}
            />
          </View>
        </View>

        <SectionCard title="Hoy en tu PH" subtitle="Resumen casual para residentes." tone="mist">
          <ResidentStatusItem title="Paquete recibido" detail="Garita registró una entrega pendiente." />
          <ResidentStatusItem title="Último reporte" detail="Sin novedades urgentes por ahora." />
          <ResidentStatusItem title="Reserva próxima" detail="No hay reservas activas." />
          <ResidentStatusItem title="Estado del edificio" detail="Operación estable." accent="teal" />
        </SectionCard>

        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

type ResidentStatusItemProps = {
  title: string;
  detail: string;
  accent?: 'gold' | 'teal';
};

function ResidentStatusItem({ title, detail, accent = 'gold' }: ResidentStatusItemProps) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.statusMarker, accent === 'teal' && styles.statusMarkerTeal]} />
      <View style={styles.statusBody}>
        <Text style={styles.statusTitle}>{title}</Text>
        <Text style={styles.statusDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
  },
  brandSub: {
    color: colors.graphite,
    fontSize: 13,
    fontWeight: '800',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  topRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationDot: {
    backgroundColor: colors.coral,
    borderColor: colors.ivory,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 18,
    width: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.canopy,
    borderColor: colors.gold,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: colors.ivory,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  hero: {
    backgroundColor: colors.canopy,
    borderBottomColor: colors.blue,
    borderBottomWidth: 7,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.lift,
  },
  heroLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.ivory,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 36,
  },
  heroText: {
    color: colors.mist,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  actionGrid: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusItem: {
    alignItems: 'flex-start',
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  statusMarker: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    height: 12,
    marginTop: spacing.xs,
    width: 12,
  },
  statusMarkerTeal: {
    backgroundColor: colors.teal,
  },
  statusBody: {
    flex: 1,
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  statusDetail: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
