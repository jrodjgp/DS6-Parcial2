import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { HeaderHero } from '../components/HeaderHero';
import { RiskCard } from '../components/RiskCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { getAssets, getEvents } from '../services/storage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Asset, OperationalEvent, OperationalEventStatus, Session } from '../types';

type ResidentReportsScreenProps = {
  propertyName: string;
  session: Session;
  onBack: () => void;
  onLogout: () => void;
};

type ResidentReportItem = {
  asset?: Asset;
  event: OperationalEvent;
};

const statusTone: Record<OperationalEventStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    Pendiente: 'warning',
    'En proceso': 'info',
    Completado: 'success',
    Cancelado: 'danger',
  };

function getReportSeverity(status: OperationalEventStatus): 'low' | 'medium' | 'high' | 'critical' {
  if (status === 'Pendiente') {
    return 'high';
  }

  if (status === 'En proceso') {
    return 'medium';
  }

  if (status === 'Cancelado') {
    return 'critical';
  }

  return 'low';
}

export function ResidentReportsScreen({
  propertyName,
  session,
  onBack,
  onLogout,
}: ResidentReportsScreenProps) {
  const [reports, setReports] = useState<ResidentReportItem[]>([]);

  useEffect(() => {
    async function loadReports() {
      const [storedAssets, storedEvents] = await Promise.all([getAssets(), getEvents()]);
      const residentReports = storedEvents
        .filter((event) => event.createdBy === session.userId)
        .sort((firstEvent, secondEvent) => secondEvent.createdAt.localeCompare(firstEvent.createdAt))
        .map((event) => ({
          event,
          asset: storedAssets.find((asset) => asset.id === event.assetId),
        }));

      setReports(residentReports);
    }

    loadReports();
  }, [session.userId]);

  const openReports = reports.filter(
    ({ event }) => event.status === 'Pendiente' || event.status === 'En proceso',
  ).length;

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label={propertyName}
          title="Mis reportes"
          subtitle={`${openReports} reportes abiertos. Seguimiento local de tus incidencias.`}
          accent="blue"
        />

        {reports.length === 0 ? (
          <SectionCard
            title="Todavía no has reportado incidencias"
            subtitle="Cuando envíes una incidencia, aparecerá aquí con su estado."
            tone="goldSoft"
          >
            <Text style={styles.emptyText}>
              El encargado podrá verla en el centro de alertas del PH.
            </Text>
          </SectionCard>
        ) : (
          reports.map(({ asset, event }) => (
            <RiskCard
              key={event.id}
              title={event.title}
              subtitle={asset ? `${asset.name} · ${asset.location}` : 'Activo no disponible'}
              meta={`Fecha: ${event.date}`}
              severity={getReportSeverity(event.status)}
            >
              <View style={styles.chipRow}>
                <StatusChip label={event.status} tone={statusTone[event.status]} />
                <StatusChip label={event.type} tone="neutral" />
              </View>
              <Text style={styles.description}>{event.description}</Text>
              {event.managerResponse ? (
                <Text style={styles.response}>Respuesta: {event.managerResponse}</Text>
              ) : null}
            </RiskCard>
          ))
        )}

        <AppButton label="Volver" onPress={onBack} variant="secondary" />
        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  description: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  response: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.canopy,
    fontSize: 15,
    lineHeight: 22,
  },
});
