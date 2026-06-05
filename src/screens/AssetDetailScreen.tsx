import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
import { getEvents } from '../services/storage';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  Asset,
  AssetPriority,
  AssetStatus,
  OperationalEvent,
  OperationalEventStatus,
} from '../types';

type AssetDetailScreenProps = {
  asset: Asset;
  onAddEvent: (asset: Asset) => void;
  onBack: () => void;
  onDeleteAsset: (asset: Asset) => Promise<string | null>;
  onDeleteEvent: (asset: Asset, event: OperationalEvent) => Promise<string | null>;
  onEditAsset: (asset: Asset) => void;
  onEditEvent: (asset: Asset, event: OperationalEvent) => void;
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

const eventStatusTone: Record<OperationalEventStatus, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    Pendiente: 'warning',
    'En proceso': 'info',
    Completado: 'success',
    Cancelado: 'danger',
  };

function formatCost(value: number) {
  return `B/. ${value.toFixed(2)}`;
}

export function AssetDetailScreen({
  asset,
  onAddEvent,
  onBack,
  onDeleteAsset,
  onDeleteEvent,
  onEditAsset,
  onEditEvent,
  onLogout,
}: AssetDetailScreenProps) {
  const [events, setEvents] = useState<OperationalEvent[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadEvents() {
      const storedEvents = await getEvents();
      const assetEvents = storedEvents
        .filter((event) => event.assetId === asset.id)
        .sort((firstEvent, secondEvent) => secondEvent.date.localeCompare(firstEvent.date));

      setEvents(assetEvents);
    }

    loadEvents();
  }, [asset.id]);

  function requestDeleteAsset() {
    Alert.alert(
      'Eliminar activo',
      `¿Eliminar ${asset.name}? También se eliminarán sus eventos vinculados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteAsset();
          },
        },
      ],
    );
  }

  async function deleteAsset() {
    const error = await onDeleteAsset(asset);

    if (error) {
      setMessage(error);
    }
  }

  function requestDeleteEvent(event: OperationalEvent) {
    Alert.alert('Eliminar evento', `¿Eliminar ${event.title}? El activo se conservará.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteEvent(event);
        },
      },
    ]);
  }

  async function deleteEvent(event: OperationalEvent) {
    const error = await onDeleteEvent(asset, event);

    if (error) {
      setMessage(error);
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter((currentEvent) => currentEvent.id !== event.id),
    );
    setMessage('Evento eliminado. El activo se conservó.');
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Detalle de activo</Text>
          <Text style={styles.title}>{asset.name}</Text>
          <View style={styles.chipRow}>
            <StatusChip label={asset.status} tone={statusTone[asset.status]} />
            <StatusChip label={asset.priority} tone={priorityTone[asset.priority]} />
          </View>
        </View>

        <View style={styles.assetCard}>
          <InfoRow label="Categoría" value={asset.category} />
          <InfoRow label="Ubicación" value={asset.location} />
          <InfoRow label="Proveedor" value={asset.provider || 'No asignado'} />
          <InfoRow label="Notas" value={asset.notes || 'Sin notas registradas.'} />
        </View>

        <View style={styles.actionGrid}>
          <AppButton label="Añadir evento" onPress={() => onAddEvent(asset)} />
          <AppButton label="Editar activo" onPress={() => onEditAsset(asset)} variant="secondary" />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.timelineHeader}>
          <Text style={styles.sectionTitle}>Historial operativo</Text>
          <Text style={styles.count}>{events.length} eventos</Text>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin eventos todavía</Text>
            <Text style={styles.emptyText}>
              Registra mantenimientos, incidencias, inspecciones o visitas técnicas para construir la bitácora.
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Pressable
                onPress={() => onEditEvent(asset, event)}
                style={({ pressed }) => [styles.eventPressArea, pressed && styles.pressed]}
              >
                <View style={styles.eventTopRow}>
                  <StatusChip label={event.type} tone="neutral" />
                  <StatusChip label={event.status} tone={eventStatusTone[event.status]} />
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>Fecha: {event.date}</Text>
                <Text style={styles.eventMeta}>Costo: {formatCost(event.cost)}</Text>
                <Text style={styles.eventMeta}>
                  Proveedor: {event.provider || 'No asignado'}
                </Text>
                <Text style={styles.eventHint}>Toca para editar</Text>
              </Pressable>
              <Pressable
                onPress={() => requestDeleteEvent(event)}
                style={({ pressed }) => [styles.eventDeleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.eventDeleteText}>Eliminar evento</Text>
              </Pressable>
            </View>
          ))
        )}

        <Pressable
          onPress={requestDeleteAsset}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Text style={styles.deleteText}>Eliminar activo</Text>
        </Pressable>
        <AppButton label="Volver al panel" onPress={onBack} variant="secondary" />
        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
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
  headerLabel: {
    color: colors.guayacanGold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.cardIvory,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  assetCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoRow: {
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.graphite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.umbralInk,
    fontSize: 16,
    lineHeight: 23,
  },
  actionGrid: {
    gap: spacing.md,
  },
  message: {
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  timelineHeader: {
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
  eventCard: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventPressArea: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  eventTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventTitle: {
    color: colors.umbralInk,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  eventMeta: {
    color: colors.deepCanopy,
    fontSize: 14,
    lineHeight: 20,
  },
  eventHint: {
    color: colors.graphite,
    fontSize: 13,
    fontWeight: '700',
  },
  eventDeleteButton: {
    alignItems: 'center',
    backgroundColor: colors.mistGreen,
    borderTopColor: colors.cardIvory,
    borderTopWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  eventDeleteText: {
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.coralAlerta,
    borderRadius: radius.md,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  deleteText: {
    color: colors.cardIvory,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.78,
  },
});
