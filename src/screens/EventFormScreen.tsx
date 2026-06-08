import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { OptionGroup } from '../components/OptionGroup';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  Asset,
  OperationalEvent,
  OperationalEventStatus,
  OperationalEventType,
} from '../types';
import { isValidDateText } from '../utils/dateUtils';

export type EventFormValues = {
  type: OperationalEventType;
  title: string;
  description: string;
  date: string;
  cost: string;
  status: OperationalEventStatus;
  provider: string;
  responsible: string;
  managerResponse: string;
  nextReviewDate: string;
};

type EventFormScreenProps = {
  asset: Asset;
  event?: OperationalEvent;
  onCancel: () => void;
  onDelete: (asset: Asset, event: OperationalEvent) => Promise<string | null>;
  onSave: (
    values: EventFormValues,
    asset: Asset,
    event?: OperationalEvent,
  ) => Promise<string | null>;
};

const eventTypes: OperationalEventType[] = [
  'Mantenimiento',
  'Incidencia',
  'Inspección',
  'Reparación',
  'Limpieza',
  'Cotización',
  'Visita técnica',
  'Garantía',
];

const eventStatuses: OperationalEventStatus[] = [
  'Pendiente',
  'En proceso',
  'Completado',
  'Cancelado',
];

export function EventFormScreen({
  asset,
  event,
  onCancel,
  onDelete,
  onSave,
}: EventFormScreenProps) {
  const [values, setValues] = useState<EventFormValues>({
    type: event?.type ?? 'Mantenimiento',
    title: event?.title ?? '',
    description: event?.description ?? '',
    date: event?.date ?? '',
    cost: event ? String(event.cost) : '',
    status: event?.status ?? 'Pendiente',
    provider: event?.provider ?? '',
    responsible: event?.responsible ?? '',
    managerResponse: event?.managerResponse ?? '',
    nextReviewDate: event?.nextReviewDate ?? '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof EventFormValues>(
    key: Key,
    value: EventFormValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setMessage('');

    if (!values.type || !values.title.trim() || !values.date.trim() || !values.status) {
      setMessage('Completa tipo, título, fecha y estado.');
      return;
    }

    if (!isValidDateText(values.date)) {
      setMessage('La fecha debe tener formato YYYY-MM-DD y ser válida.');
      return;
    }

    if (values.nextReviewDate.trim() && !isValidDateText(values.nextReviewDate)) {
      setMessage('La próxima revisión debe tener formato YYYY-MM-DD.');
      return;
    }

    setIsSaving(true);
    const error = await onSave(values, asset, event);
    setIsSaving(false);

    if (error) {
      setMessage(error);
    }
  }

  function requestDelete() {
    if (!event) {
      return;
    }

    Alert.alert('Eliminar evento', `¿Eliminar ${event.title}? El activo se conservará.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteEvent();
        },
      },
    ]);
  }

  async function deleteEvent() {
    if (!event) {
      return;
    }

    const error = await onDelete(asset, event);

    if (error) {
      setMessage(error);
    }
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeaderHero
          label={event ? 'editar evento' : 'nuevo evento'}
          title={event ? 'Editar evento' : 'Añadir evento'}
          subtitle={asset.name}
          accent="blue"
        />

        <SectionCard
          title="Registro de historial"
          subtitle="Cada evento queda vinculado a este activo para alimentar estadísticas y seguimiento."
        >
          <OptionGroup
            label="Tipo"
            options={eventTypes}
            selectedValue={values.type}
            onSelect={(type) => updateValue('type', type)}
          />

          <AppInput
            label="Título"
            value={values.title}
            onChangeText={(text) => updateValue('title', text)}
            placeholder="Mantenimiento de bomba"
          />

          <AppInput
            label="Descripción"
            value={values.description}
            onChangeText={(text) => updateValue('description', text)}
            placeholder="Detalle operativo del evento"
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <AppInput
                label="Fecha"
                value={values.date}
                onChangeText={(text) => updateValue('date', text)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.column}>
              <AppInput
                label="Costo"
                value={values.cost}
                onChangeText={(text) => updateValue('cost', text)}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <OptionGroup
            label="Estado"
            options={eventStatuses}
            selectedValue={values.status}
            onSelect={(status) => updateValue('status', status)}
          />

          <AppInput
            label="Proveedor"
            value={values.provider}
            onChangeText={(text) => updateValue('provider', text)}
            placeholder="Empresa o técnico"
          />

          <AppInput
            label="Responsable"
            value={values.responsible}
            onChangeText={(text) => updateValue('responsible', text)}
            placeholder="Nombre del responsable"
          />

          <AppInput
            label="Respuesta del encargado"
            value={values.managerResponse}
            onChangeText={(text) => updateValue('managerResponse', text)}
            placeholder="Seguimiento visible para residentes"
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />

          <AppInput
            label="Próxima revisión"
            value={values.nextReviewDate}
            onChangeText={(text) => updateValue('nextReviewDate', text)}
            placeholder="YYYY-MM-DD"
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <AppButton
            label={isSaving ? 'Guardando...' : event ? 'Guardar cambios' : 'Crear evento'}
            onPress={handleSave}
          />
          <AppButton label="Volver al activo" onPress={onCancel} variant="secondary" />

          {event ? (
            <AppButton label="Eliminar evento" onPress={requestDelete} variant="danger" />
          ) : null}
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  notesInput: {
    minHeight: 104,
    paddingTop: spacing.md,
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
});
