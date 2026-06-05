import { useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  Asset,
  OperationalEvent,
  OperationalEventStatus,
  OperationalEventType,
} from '../types';

export type EventFormValues = {
  type: OperationalEventType;
  title: string;
  description: string;
  date: string;
  cost: string;
  status: OperationalEventStatus;
  provider: string;
  responsible: string;
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
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <StatusChip label={event ? 'editar evento' : 'nuevo evento'} tone="info" />
          <Text style={styles.title}>{event ? 'Editar evento' : 'Añadir evento'}</Text>
          <Text style={styles.subtitle}>{asset.name}</Text>
        </View>

        <View style={styles.card}>
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

          <AppInput
            label="Fecha"
            value={values.date}
            onChangeText={(text) => updateValue('date', text)}
            placeholder="YYYY-MM-DD"
          />

          <AppInput
            label="Costo"
            value={values.cost}
            onChangeText={(text) => updateValue('cost', text)}
            placeholder="0"
            keyboardType="decimal-pad"
          />

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
            <Pressable
              onPress={requestDelete}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            >
              <Text style={styles.deleteText}>Eliminar evento</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

type OptionGroupProps<Option extends string> = {
  label: string;
  options: Option[];
  selectedValue: Option;
  onSelect: (value: Option) => void;
};

function OptionGroup<Option extends string>({
  label,
  options,
  selectedValue,
  onSelect,
}: OptionGroupProps<Option>) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    borderBottomColor: colors.caribeBlue,
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
  card: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  fieldLabel: {
    color: colors.umbralInk,
    fontSize: 15,
    fontWeight: '700',
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.mistGreen,
    borderColor: colors.deepCanopy,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.isthmusTeal,
    borderColor: colors.isthmusTeal,
  },
  optionText: {
    color: colors.deepCanopy,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  optionTextSelected: {
    color: colors.cardIvory,
  },
  notesInput: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  message: {
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
