import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { HeaderHero } from '../components/HeaderHero';
import { QuickActionCard } from '../components/QuickActionCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { TimelineEventCard } from '../components/TimelineEventCard';
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
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeaderHero label="Detalle de activo" title={asset.name} subtitle={asset.location}>
          <View style={styles.chipRow}>
            <StatusChip label={asset.status} tone={statusTone[asset.status]} />
            <StatusChip label={asset.priority} tone={priorityTone[asset.priority]} />
          </View>
        </HeaderHero>

        <SectionCard title="Ficha operativa" subtitle="Datos principales del activo o área.">
          <InfoRow label="Categoría" value={asset.category} />
          <InfoRow label="Ubicación" value={asset.location} />
          <InfoRow label="Proveedor" value={asset.provider || 'No asignado'} />
          <InfoRow label="Notas" value={asset.notes || 'Sin notas registradas.'} />
        </SectionCard>

        <View style={styles.actionRow}>
          <QuickActionCard
            title="Añadir evento"
            body="Mantenimiento, incidencia o revisión"
            symbol="+"
            variant="primary"
            onPress={() => onAddEvent(asset)}
          />
          <QuickActionCard
            title="Editar activo"
            body="Actualizar ficha"
            symbol="E"
            variant="neutral"
            onPress={() => onEditAsset(asset)}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.timelineHeader}>
          <View>
            <Text style={styles.sectionTitle}>Historial operativo</Text>
            <Text style={styles.sectionSubtitle}>Subregistros ligados a este activo</Text>
          </View>
          <Text style={styles.count}>{events.length} eventos</Text>
        </View>

        {events.length === 0 ? (
          <SectionCard
            title="Sin eventos todavía"
            subtitle="Registra mantenimientos, incidencias, inspecciones o visitas técnicas para construir la bitácora."
            tone="goldSoft"
          >
            <Text style={styles.emptyText}>Este espacio mostrará la historia operativa del activo.</Text>
          </SectionCard>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventBlock}>
              <Pressable
                onPress={() => onEditEvent(asset, event)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <TimelineEventCard
                  type={event.type}
                  title={event.title}
                  date={event.date}
                  status={event.status}
                  cost={formatCost(event.cost)}
                  provider={event.provider || 'Proveedor no asignado'}
                  description={event.description}
                  statusTone={eventStatusTone[event.status]}
                />
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

        <AppButton label="Eliminar activo" onPress={requestDeleteAsset} variant="danger" />
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoRow: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.graphite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  message: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    color: colors.coral,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
  timelineHeader: {
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
  eventBlock: {
    gap: spacing.sm,
  },
  eventDeleteButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.coral,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  eventDeleteText: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});
