import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppInput } from '../components/AppInput';
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
  propertyName: string;
  session: Session;
  onCreateAsset: () => void;
  onOpenAlerts: () => void;
  onOpenPropertySettings: () => void;
  onOpenReportPreview: () => void;
  onOpenAsset: (asset: Asset) => void;
  onLogout: () => void;
};

type AssetStatusFilter = 'Todos' | AssetStatus;
type AssetPriorityFilter = 'Todas' | AssetPriority;

const statusFilters: AssetStatusFilter[] = [
  'Todos',
  'Operativo',
  'En revisión',
  'Fuera de servicio',
];
const priorityFilters: AssetPriorityFilter[] = ['Todas', 'Baja', 'Media', 'Alta', 'Crítica'];

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
  propertyName,
  session,
  onCreateAsset,
  onOpenAlerts,
  onOpenPropertySettings,
  onOpenReportPreview,
  onOpenAsset,
  onLogout,
}: UserDashboardScreenProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatusFilter>('Todos');
  const [priorityFilter, setPriorityFilter] = useState<AssetPriorityFilter>('Todas');

  useEffect(() => {
    async function loadDashboardData() {
      const storedAssets = await getAssets();
      const currentAssets = getAssetsForUser(storedAssets, session.userId);

      setAssets(currentAssets);
    }

    loadDashboardData();
  }, [session.userId]);

  const [stats, managerEvents] = useDashboardDerivedData(session.userId, assets);
  const visibleAssets = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesQuery =
        !cleanQuery ||
        asset.name.toLowerCase().includes(cleanQuery) ||
        asset.category.toLowerCase().includes(cleanQuery) ||
        asset.location.toLowerCase().includes(cleanQuery) ||
        asset.provider.toLowerCase().includes(cleanQuery);
      const matchesStatus = statusFilter === 'Todos' || asset.status === statusFilter;
      const matchesPriority = priorityFilter === 'Todas' || asset.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [assets, priorityFilter, query, statusFilter]);

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label={propertyName}
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
              onPress={onOpenAlerts}
            />
          </View>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Activos críticos"
              body={`${stats.criticalAssets} con prioridad crítica`}
              symbol="C"
              variant="danger"
              onPress={() => setPriorityFilter('Crítica')}
            />
            <QuickActionCard
              title="Cerrar sesión"
              body="Salir de Umbral"
              symbol="X"
              variant="neutral"
              onPress={onLogout}
            />
          </View>
          <View style={styles.actionRow}>
            <QuickActionCard
              title="Perfil del PH"
              body="Datos del conjunto"
              symbol="P"
              variant="neutral"
              onPress={onOpenPropertySettings}
            />
            <QuickActionCard
              title="Resumen"
              body="Vista para presentar"
              symbol="R"
              variant="gold"
              onPress={onOpenReportPreview}
            />
          </View>
        </View>

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Mis activos</Text>
            <Text style={styles.sectionSubtitle}>Bitácora principal del PH</Text>
          </View>
          <Text style={styles.count}>{visibleAssets.length}/{assets.length}</Text>
        </View>

        <View style={styles.filterPanel}>
          <AppInput
            label="Buscar activos"
            value={query}
            onChangeText={setQuery}
            placeholder="Nombre, ubicación, proveedor..."
          />
          <FilterRow
            label="Estado"
            options={statusFilters}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
          />
          <FilterRow
            label="Prioridad"
            options={priorityFilters}
            selectedValue={priorityFilter}
            onSelect={setPriorityFilter}
          />
          <Text
            onPress={() => {
              setQuery('');
              setStatusFilter('Todos');
              setPriorityFilter('Todas');
            }}
            style={styles.clearFilters}
          >
            Limpiar filtros
          </Text>
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
        ) : visibleAssets.length === 0 ? (
          <SectionCard
            title="Sin coincidencias"
            subtitle="Ajusta la búsqueda o limpia los filtros para ver tus activos."
            tone="tealSoft"
          >
            <Text style={styles.emptyText}>
              Los activos siguen guardados; solo están ocultos por el filtro actual.
            </Text>
          </SectionCard>
        ) : (
          visibleAssets.map((asset) => (
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

type FilterRowProps<Option extends string> = {
  label: string;
  options: Option[];
  selectedValue: Option;
  onSelect: (value: Option) => void;
};

function FilterRow<Option extends string>({
  label,
  options,
  selectedValue,
  onSelect,
}: FilterRowProps<Option>) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterWrap}>
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Text
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
            >
              {option}
            </Text>
          );
        })}
      </View>
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
  filterPanel: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.mist,
    borderRadius: radius.pill,
    color: colors.canopy,
    fontSize: 13,
    fontWeight: '800',
    minHeight: 38,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: colors.teal,
    color: colors.ivory,
  },
  clearFilters: {
    alignSelf: 'flex-start',
    color: colors.teal,
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
