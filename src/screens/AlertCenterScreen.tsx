import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { HeaderHero } from '../components/HeaderHero';
import { RiskCard } from '../components/RiskCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { getAssets, getEvents, getUsers } from '../services/storage';
import { getAssetsForUser, getEventsForAssets } from '../services/statsService';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  Asset,
  OperationalEvent,
  OperationalEventStatus,
  Session,
  User,
} from '../types';
import { isFutureDateText, isTodayText } from '../utils/dateUtils';

type AlertCenterScreenProps = {
  propertyName: string;
  session: Session;
  onBack: () => void;
  onLogout: () => void;
  onOpenEvent: (asset: Asset, event: OperationalEvent) => void;
  onUpdateEventStatus: (
    asset: Asset,
    event: OperationalEvent,
    status: OperationalEventStatus,
  ) => Promise<string | null>;
};

type AlertFilter = 'todos' | 'hoy' | 'criticos' | 'residentes' | 'revisiones';

type AlertItem = {
  asset: Asset;
  createdByUser: User | undefined;
  event: OperationalEvent;
};

const filterLabels: Record<AlertFilter, string> = {
  todos: 'Todos',
  hoy: 'Hoy',
  criticos: 'Críticos',
  residentes: 'Residentes',
  revisiones: 'Revisiones',
};

const statusTone: Record<OperationalEventStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    Pendiente: 'warning',
    'En proceso': 'info',
    Completado: 'success',
    Cancelado: 'danger',
  };

function isOpenEvent(event: OperationalEvent) {
  return event.status === 'Pendiente' || event.status === 'En proceso';
}

function getAlertSeverity(item: AlertItem): 'low' | 'medium' | 'high' | 'critical' {
  if (item.asset.priority === 'Crítica' || item.asset.status === 'Fuera de servicio') {
    return 'critical';
  }

  if (item.asset.priority === 'Alta' || item.event.status === 'Pendiente') {
    return 'high';
  }

  return 'medium';
}

export function AlertCenterScreen({
  propertyName,
  session,
  onBack,
  onLogout,
  onOpenEvent,
  onUpdateEventStatus,
}: AlertCenterScreenProps) {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<AlertFilter>('todos');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadAlerts() {
      const [storedAssets, storedEvents, storedUsers] = await Promise.all([
        getAssets(),
        getEvents(),
        getUsers(),
      ]);
      const managerAssets = getAssetsForUser(storedAssets, session.userId);
      const managerEvents = getEventsForAssets(storedEvents, managerAssets);
      const openItems = managerEvents
        .filter(isOpenEvent)
        .map((event) => {
          const asset = managerAssets.find((currentAsset) => currentAsset.id === event.assetId);

          if (!asset) {
            return null;
          }

          return {
            asset,
            event,
            createdByUser: storedUsers.find((user) => user.id === event.createdBy),
          };
        })
        .filter((item): item is AlertItem => item !== null)
        .sort((firstItem, secondItem) => {
          const firstCritical = firstItem.asset.priority === 'Crítica' ? 1 : 0;
          const secondCritical = secondItem.asset.priority === 'Crítica' ? 1 : 0;

          if (firstCritical !== secondCritical) {
            return secondCritical - firstCritical;
          }

          return secondItem.event.date.localeCompare(firstItem.event.date);
        });

      setItems(openItems);
    }

    loadAlerts();
  }, [session.userId]);

  const filteredItems = useMemo(() => {
    if (filter === 'hoy') {
      return items.filter((item) => isTodayText(item.event.date));
    }

    if (filter === 'criticos') {
      return items.filter(
        (item) => item.asset.priority === 'Crítica' || item.asset.status === 'Fuera de servicio',
      );
    }

    if (filter === 'residentes') {
      return items.filter((item) => item.createdByUser?.role === 'resident');
    }

    if (filter === 'revisiones') {
      return items.filter((item) => isFutureDateText(item.event.nextReviewDate));
    }

    return items;
  }, [filter, items]);

  async function updateStatus(
    item: AlertItem,
    nextStatus: OperationalEventStatus,
  ) {
    setMessage('');
    const error = await onUpdateEventStatus(item.asset, item.event, nextStatus);

    if (error) {
      setMessage(error);
      return;
    }

    if (nextStatus === 'Completado' || nextStatus === 'Cancelado') {
      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.event.id !== item.event.id),
      );
    } else {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.event.id === item.event.id
            ? {
                ...currentItem,
                event: {
                  ...currentItem.event,
                  status: nextStatus,
                  updatedAt: new Date().toISOString(),
                },
              }
            : currentItem,
        ),
      );
    }

    setMessage(`Evento marcado como ${nextStatus}.`);
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero
          label={propertyName}
          title="Centro de alertas"
          subtitle={`${items.length} tareas abiertas entre incidencias, revisiones y mantenimientos.`}
          accent="coral"
        />

        <View style={styles.filterWrap}>
          {(Object.keys(filterLabels) as AlertFilter[]).map((filterKey) => {
            const isSelected = filter === filterKey;

            return (
              <Pressable
                key={filterKey}
                onPress={() => setFilter(filterKey)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                  {filterLabels[filterKey]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {filteredItems.length === 0 ? (
          <SectionCard
            title="Sin alertas en este filtro"
            subtitle="Los eventos pendientes o en proceso aparecerán aquí."
            tone="goldSoft"
          >
            <Text style={styles.emptyText}>Buen momento para revisar próximas fechas o crear un evento nuevo.</Text>
          </SectionCard>
        ) : (
          filteredItems.map((item) => (
            <RiskCard
              key={item.event.id}
              title={item.event.title}
              subtitle={`${item.asset.name} · ${item.asset.location}`}
              meta={`Fecha: ${item.event.date} · ${item.createdByUser?.name ?? 'Registro operativo'}`}
              severity={getAlertSeverity(item)}
              onPress={() => onOpenEvent(item.asset, item.event)}
              actionLabel="Abrir >"
            >
              <View style={styles.chipRow}>
                <StatusChip label={item.event.status} tone={statusTone[item.event.status]} />
                <StatusChip label={item.event.type} tone="neutral" />
                <StatusChip label={item.asset.priority} tone={item.asset.priority === 'Crítica' ? 'danger' : 'warning'} />
              </View>
              <View style={styles.actionRow}>
                {item.event.status === 'Pendiente' ? (
                  <Pressable
                    onPress={() => updateStatus(item, 'En proceso')}
                    style={({ pressed }) => [styles.inlineButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.inlineButtonText}>Tomar caso</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => updateStatus(item, 'Completado')}
                  style={({ pressed }) => [styles.inlineButton, styles.successButton, pressed && styles.pressed]}
                >
                  <Text style={styles.inlineButtonText}>Completar</Text>
                </Pressable>
              </View>
            </RiskCard>
          ))
        )}

        <AppButton label="Volver al panel" onPress={onBack} variant="secondary" />
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
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.ivory,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  filterChipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  filterText: {
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
  },
  filterTextSelected: {
    color: colors.ivory,
  },
  message: {
    backgroundColor: colors.tealSoft,
    borderRadius: radius.md,
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inlineButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  successButton: {
    backgroundColor: colors.canopy,
  },
  inlineButtonText: {
    color: colors.ivory,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.canopy,
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.82,
  },
});
