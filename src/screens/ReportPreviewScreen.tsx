import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { HeaderHero } from '../components/HeaderHero';
import { RiskCard } from '../components/RiskCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { getAssets, getEvents } from '../services/storage';
import {
  calculateManagerStats,
  getAssetsForUser,
  getEventsForAssets,
} from '../services/statsService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Asset, OperationalEvent, PropertyProfile, Session } from '../types';
import { isFutureDateText } from '../utils/dateUtils';

type ReportPreviewScreenProps = {
  profile: PropertyProfile;
  session: Session;
  onBack: () => void;
  onLogout: () => void;
};

function formatCost(value: number) {
  return `B/. ${value.toFixed(2)}`;
}

function isOpenEvent(event: OperationalEvent) {
  return event.status === 'Pendiente' || event.status === 'En proceso';
}

export function ReportPreviewScreen({
  profile,
  session,
  onBack,
  onLogout,
}: ReportPreviewScreenProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [events, setEvents] = useState<OperationalEvent[]>([]);

  useEffect(() => {
    async function loadReportData() {
      const [storedAssets, storedEvents] = await Promise.all([getAssets(), getEvents()]);
      const managerAssets = getAssetsForUser(storedAssets, session.userId);

      setAssets(managerAssets);
      setEvents(getEventsForAssets(storedEvents, managerAssets));
    }

    loadReportData();
  }, [session.userId]);

  const stats = useMemo(
    () => calculateManagerStats(assets, events, session.userId),
    [assets, events, session.userId],
  );
  const criticalAssets = assets.filter((asset) => asset.priority === 'Crítica');
  const openEvents = events.filter(isOpenEvent);
  const upcomingReviews = events.filter((event) => isFutureDateText(event.nextReviewDate));

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label={profile.name}
          title="Resumen operativo"
          subtitle="Vista lista para explicar el estado del PH en la presentación."
          accent="gold"
        />

        <SectionCard title="Ficha del PH" subtitle="Contexto general del conjunto.">
          <InfoLine label="Dirección" value={profile.address || 'Sin dirección registrada'} />
          <InfoLine label="Contacto" value={profile.contactName || 'Sin contacto registrado'} />
          <InfoLine label="Teléfono" value={profile.contactPhone || 'Sin teléfono registrado'} />
          <InfoLine label="Torres y unidades" value={`${profile.towers || '0'} torres · ${profile.units || '0'} unidades`} />
        </SectionCard>

        <SectionCard title="Indicadores" subtitle="Calculados desde activos y eventos locales." tone="tealSoft">
          <View style={styles.metricGrid}>
            <Metric label="Activos" value={stats.totalAssets} />
            <Metric label="Eventos" value={stats.operationalEvents} />
            <Metric label="Pendientes" value={stats.openPendingEvents} />
            <Metric label="Costo" value={formatCost(stats.accumulatedCost)} />
            <Metric label="Críticos" value={stats.criticalAssets} />
            <Metric label="Revisiones" value={stats.upcomingReviews} />
          </View>
        </SectionCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riesgos principales</Text>
          <Text style={styles.sectionCount}>{criticalAssets.length}</Text>
        </View>
        {criticalAssets.length === 0 ? (
          <SectionCard title="Sin activos críticos" subtitle="No hay activos con prioridad crítica." tone="goldSoft">
            <Text style={styles.bodyText}>La prioridad crítica se calcula desde la ficha de cada activo.</Text>
          </SectionCard>
        ) : (
          criticalAssets.map((asset) => (
            <RiskCard
              key={asset.id}
              title={asset.name}
              subtitle={`${asset.category} · ${asset.location}`}
              meta={asset.provider || 'Proveedor no asignado'}
              severity="critical"
            >
              <View style={styles.chipRow}>
                <StatusChip label={asset.status} tone={asset.status === 'Operativo' ? 'success' : 'warning'} />
                <StatusChip label={asset.priority} tone="danger" />
              </View>
            </RiskCard>
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pendientes abiertos</Text>
          <Text style={styles.sectionCount}>{openEvents.length}</Text>
        </View>
        {openEvents.length === 0 ? (
          <SectionCard title="Sin pendientes" subtitle="No hay eventos pendientes o en proceso." tone="goldSoft">
            <Text style={styles.bodyText}>El centro de alertas se mantiene libre.</Text>
          </SectionCard>
        ) : (
          openEvents.map((event) => (
            <RiskCard
              key={event.id}
              title={event.title}
              subtitle={event.type}
              meta={`Fecha: ${event.date}`}
              severity={event.status === 'Pendiente' ? 'high' : 'medium'}
            >
              <StatusChip label={event.status} tone={event.status === 'Pendiente' ? 'warning' : 'info'} />
            </RiskCard>
          ))
        )}

        <SectionCard title="Próximas revisiones" subtitle="Eventos con fecha futura de revisión.">
          {upcomingReviews.length === 0 ? (
            <Text style={styles.bodyText}>No hay revisiones futuras registradas.</Text>
          ) : (
            upcomingReviews.map((event) => (
              <Text key={event.id} style={styles.bodyText}>
                {event.nextReviewDate}: {event.title}
              </Text>
            ))
          )}
        </SectionCard>

        <AppButton label="Volver al panel" onPress={onBack} variant="secondary" />
        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

type InfoLineProps = {
  label: string;
  value: string;
};

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({ label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  infoLine: {
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.graphite,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metric: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 82,
    padding: spacing.md,
    width: '47%',
  },
  metricValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.graphite,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bodyText: {
    color: colors.canopy,
    fontSize: 15,
    lineHeight: 22,
  },
});
