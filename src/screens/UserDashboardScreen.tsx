import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { StatCard } from '../components/StatCard';
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

export function UserDashboardScreen({
  session,
  onCreateAsset,
  onOpenAsset,
  onLogout,
}: UserDashboardScreenProps) {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const [storedAssets, storedEvents] = await Promise.all([getAssets(), getEvents()]);
      const currentAssets = getAssetsForUser(storedAssets, session.userId);

      setAssets(currentAssets);
    }

    loadDashboardData();
  }, [session.userId]);

  const [stats, managerEvents] = useDashboardDerivedData(session.userId, assets);

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <StatusChip label="manager" tone="success" />
          <Text style={styles.title}>Panel operativo</Text>
          <Text style={styles.subtitle}>Hola, {session.name}. Este es el resumen local del PH.</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Total de activos" value={stats.totalAssets} helper="Áreas y equipos bajo tu gestión." />
          <StatCard label="Eventos operativos" value={stats.operationalEvents} helper="Historial ligado a tus activos." />
          <StatCard label="Pendientes abiertos" value={stats.openPendingEvents} helper="Pendiente o en proceso." />
          <StatCard label="Costo acumulado" value={formatCost(stats.accumulatedCost)} helper="Suma de eventos registrados." />
          <StatCard label="Activos críticos" value={stats.criticalAssets} helper="Prioridad marcada como crítica." />
          <StatCard label="Próximas revisiones" value={stats.upcomingReviews} helper="Eventos con revisión futura." />
        </View>

        <View style={styles.actionRow}>
          <AppButton label="Nuevo activo" onPress={onCreateAsset} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Mis activos</Text>
          <Text style={styles.count}>{assets.length} activos</Text>
        </View>

        {assets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Todavía no hay activos</Text>
            <Text style={styles.emptyText}>
              Cuando registres bombas, elevadores, garitas o áreas comunes, aparecerán aquí.
            </Text>
          </View>
        ) : (
          assets.map((asset) => (
            <Pressable
              key={asset.id}
              onPress={() => onOpenAsset(asset)}
              style={({ pressed }) => [styles.assetCard, pressed && styles.pressed]}
            >
              <View style={styles.assetChipRow}>
                <StatusChip label={asset.status} tone={statusTone[asset.status]} />
                <StatusChip label={asset.priority} tone={priorityTone[asset.priority]} />
              </View>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetMeta}>{asset.category}</Text>
              <Text style={styles.assetMeta}>Ubicación: {asset.location}</Text>
              <Text style={styles.assetHint}>
                {countEventsForAsset(managerEvents, asset.id)} eventos registrados. Toca para ver historial.
              </Text>
            </Pressable>
          ))
        )}

        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
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
  statsGrid: {
    gap: spacing.lg,
  },
  actionRow: {
    gap: spacing.md,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.umbralInk,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  count: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.umbralInk,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  emptyText: {
    color: colors.graphite,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  assetCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  assetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  assetName: {
    color: colors.umbralInk,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0,
  },
  assetMeta: {
    color: colors.deepCanopy,
    fontSize: 15,
    lineHeight: 21,
  },
  assetHint: {
    color: colors.graphite,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.78,
  },
});
