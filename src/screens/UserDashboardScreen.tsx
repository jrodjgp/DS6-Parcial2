import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { HeaderHero } from '../components/HeaderHero';
import { QuickActionCard } from '../components/QuickActionCard';
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
import { Asset, AssetPriority, AssetStatus, OperationalEvent, Session } from '../types';

type UserDashboardScreenProps = {
  session: Session;
  onCreateAsset: () => void;
  onOpenAsset: (asset: Asset) => void;
  onLogout: () => void;
};

const statusTone: Record<AssetStatus, 'success' | 'warning' | 'danger'> = {
  Operativo: 'success',
  'En revisión': 'warning',
  'Fuera de servicio': 'danger',
};

const priorityTone: Record<AssetPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  Baja: 'neutral',
  Media: 'info',
  Alta: 'warning',
  Crítica: 'danger',
};

function formatCost(value: number) {
  return `B/. ${value.toFixed(2)}`;
}

function getAssetSeverity(asset: Asset): 'low' | 'medium' | 'high' | 'critical' {
  if (asset.status === 'Fuera de servicio' || asset.priority === 'Crítica') {
    return 'critical';
  }

  if (asset.status === 'En revisión' || asset.priority === 'Alta') {
    return 'high';
  }

  if (asset.priority === 'Media') {
    return 'medium';
  }

  return 'low';
}

export function UserDashboardScreen({
  session,
  onCreateAsset,
  onOpenAsset,
  onLogout,
}: UserDashboardScreenProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const storedAssets = await getAssets();
      const currentAssets = getAssetsForUser(storedAssets, session.userId);

      setAssets(currentAssets);
    }

    loadDashboardData();
  }, [session.userId]);

  const [stats, managerEvents] = useDashboardDerivedData(session.userId, assets);

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label="PH Bahía Central"
          title={`Hola, ${session.name}`}
          subtitle="Control operativo local para activos, mantenimientos e incidencias."
        >
          <View style={styles.heroStatsGrid}>
            <HeroStatTile label="Activos" value={stats.totalAssets} />
            <HeroStatTile label="Eventos" value={stats.operationalEvents} />
            <HeroStatTile label="Pendientes" value={stats.openPendingEvents} tone="gold" />
            <HeroStatTile label="Costos" value={formatCost(stats.accumulatedCost)} />
            <HeroStatTile label="Críticos" value={stats.criticalAssets} tone="coral" />
            <HeroStatTile label="Revisiones" value={stats.upcomingReviews} tone="blue" />
          </View>
        </HeaderHero>

        <View style={styles.actionGrid}>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Nuevo activo"
              body="Registra equipo o área"
              symbol="+"
              variant="primary"
              onPress={onCreateAsset}
            />
            <QuickActionCard
              title="Pendientes"
              body={`${stats.openPendingEvents} abiertos`}
              symbol="!"
              variant="gold"
              onPress={() =>
                Alert.alert('Pendientes abiertos', 'Se calculan desde eventos pendientes o en proceso.')
              }
            />
          </View>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Activos críticos"
              body={`${stats.criticalAssets} con prioridad crítica`}
              symbol="C"
              variant="danger"
              onPress={() =>
                Alert.alert('Activos críticos', 'Se calculan desde activos con prioridad crítica.')
              }
            />
            <QuickActionCard
              title="Cerrar sesión"
              body="Salir de Umbral"
              symbol="X"
              variant="neutral"
              onPress={onLogout}
            />
          </View>
        </View>

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Mis activos</Text>
            <Text style={styles.sectionSubtitle}>Bitácora principal del PH</Text>
          </View>
          <Text style={styles.count}>{assets.length} activos</Text>
        </View>

        {assets.length === 0 ? (
          <SectionCard
            title="Todavía no hay activos"
            subtitle="Cuando registres bombas, elevadores, garitas o áreas comunes, aparecerán aquí."
            tone="goldSoft"
          >
            <Text style={styles.emptyText}>
              Usa Nuevo activo para iniciar la bitácora operativa del PH.
            </Text>
          </SectionCard>
        ) : (
          assets.map((asset) => (
            <RiskCard
              key={asset.id}
              title={asset.name}
              subtitle={`${asset.category} · ${asset.location}`}
              meta={`${countEventsForAsset(managerEvents, asset.id)} eventos registrados`}
              severity={getAssetSeverity(asset)}
              onPress={() => onOpenAsset(asset)}
              actionLabel="Historial >"
            >
              <View style={styles.assetChipRow}>
                <StatusChip label={asset.status} tone={statusTone[asset.status]} />
                <StatusChip label={asset.priority} tone={priorityTone[asset.priority]} />
              </View>
            </RiskCard>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

type HeroStatTileProps = {
  label: string;
  value: string | number;
  tone?: 'teal' | 'gold' | 'coral' | 'blue';
};

function HeroStatTile({ label, value, tone = 'teal' }: HeroStatTileProps) {
  const toneStyle =
    tone === 'gold'
      ? styles.goldTile
      : tone === 'coral'
        ? styles.coralTile
        : tone === 'blue'
          ? styles.blueTile
          : styles.tealTile;

  return (
    <View style={[styles.heroStatTile, toneStyle]}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function countEventsForAsset(events: OperationalEvent[], assetId: string) {
  return events.filter((event) => event.assetId === assetId).length;
}

function useDashboardDerivedData(userId: string, currentAssets: Asset[]) {
  const [events, setEvents] = useState<OperationalEvent[]>([]);

  useEffect(() => {
    async function loadEvents() {
      const storedEvents = await getEvents();
      setEvents(storedEvents);
    }

    loadEvents();
  }, []);

  return useMemo(() => {
    const stats = calculateManagerStats(currentAssets, events, userId);
    const managerEvents = getEventsForAssets(events, currentAssets);

    return [stats, managerEvents] as const;
  }, [currentAssets, events, userId]);
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  heroStatTile: {
    borderColor: 'rgba(255, 248, 234, 0.18)',
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 84,
    padding: spacing.md,
    width: '47%',
  },
  tealTile: {
    backgroundColor: 'rgba(14, 124, 114, 0.62)',
  },
  goldTile: {
    backgroundColor: 'rgba(242, 184, 75, 0.88)',
  },
  coralTile: {
    backgroundColor: 'rgba(231, 111, 81, 0.88)',
  },
  blueTile: {
    backgroundColor: 'rgba(43, 167, 201, 0.82)',
  },
  heroStatValue: {
    color: colors.ivory,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0,
  },
  heroStatLabel: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  actionGrid: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionSubtitle: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  count: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.canopy,
    fontSize: 15,
    lineHeight: 22,
  },
  assetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
