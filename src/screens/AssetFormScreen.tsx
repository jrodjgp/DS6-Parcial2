import { useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { Asset, AssetPriority, AssetStatus } from '../types';

export type AssetFormValues = {
  name: string;
  category: string;
  location: string;
  status: AssetStatus;
  priority: AssetPriority;
  provider: string;
  notes: string;
};

type AssetFormScreenProps = {
  asset?: Asset;
  onSave: (values: AssetFormValues, asset?: Asset) => Promise<string | null>;
  onDelete: (asset: Asset) => Promise<string | null>;
  onCancel: () => void;
};

const categories = [
  'Sistema hidráulico',
  'Seguridad',
  'Acceso',
  'Área común',
  'Eléctrico',
  'Elevador',
  'Piscina',
  'Otro',
];

const statuses: AssetStatus[] = ['Operativo', 'En revisión', 'Fuera de servicio'];
const priorities: AssetPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

export function AssetFormScreen({
  asset,
  onSave,
  onDelete,
  onCancel,
}: AssetFormScreenProps) {
  const [values, setValues] = useState<AssetFormValues>({
    name: asset?.name ?? '',
    category: asset?.category ?? categories[0],
    location: asset?.location ?? '',
    status: asset?.status ?? 'Operativo',
    priority: asset?.priority ?? 'Media',
    provider: asset?.provider ?? '',
    notes: asset?.notes ?? '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof AssetFormValues>(
    key: Key,
    value: AssetFormValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setMessage('');

    if (
      !values.name.trim() ||
      !values.category.trim() ||
      !values.location.trim() ||
      !values.status ||
      !values.priority
    ) {
      setMessage('Completa nombre, categoría, ubicación, estado y prioridad.');
      return;
    }

    setIsSaving(true);
    const error = await onSave(values, asset);
    setIsSaving(false);

    if (error) {
      setMessage(error);
    }
  }

  function requestDelete() {
    if (!asset) {
      return;
    }

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
    if (!asset) {
      return;
    }

    const error = await onDelete(asset);

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
          <StatusChip label={asset ? 'editar activo' : 'nuevo activo'} tone="success" />
          <Text style={styles.title}>{asset ? 'Editar activo' : 'Nuevo activo'}</Text>
          <Text style={styles.subtitle}>Registra equipos, áreas y puntos operativos del PH.</Text>
        </View>

        <View style={styles.card}>
          <AppInput
            label="Nombre"
            value={values.name}
            onChangeText={(text) => updateValue('name', text)}
            placeholder="Bomba de agua"
          />

          <OptionGroup
            label="Categoría"
            options={categories}
            selectedValue={values.category}
            onSelect={(category) => updateValue('category', category)}
          />

          <AppInput
            label="Ubicación"
            value={values.location}
            onChangeText={(text) => updateValue('location', text)}
            placeholder="Sótano, lobby, garita..."
          />

          <OptionGroup
            label="Estado"
            options={statuses}
            selectedValue={values.status}
            onSelect={(status) => updateValue('status', status)}
          />

          <OptionGroup
            label="Prioridad"
            options={priorities}
            selectedValue={values.priority}
            onSelect={(priority) => updateValue('priority', priority)}
          />

          <AppInput
            label="Proveedor"
            value={values.provider}
            onChangeText={(text) => updateValue('provider', text)}
            placeholder="Empresa o técnico responsable"
          />

          <AppInput
            label="Notas"
            value={values.notes}
            onChangeText={(text) => updateValue('notes', text)}
            placeholder="Observaciones del activo"
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <AppButton
            label={isSaving ? 'Guardando...' : asset ? 'Guardar cambios' : 'Crear activo'}
            onPress={handleSave}
          />
          <AppButton label="Volver al panel" onPress={onCancel} variant="secondary" />

          {asset ? (
            <Pressable
              onPress={requestDelete}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            >
              <Text style={styles.deleteText}>Eliminar activo</Text>
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
    borderBottomColor: colors.guayacanGold,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.xl,
    ...shadow.lift,
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
    padding: spacing.xl,
    ...shadow.soft,
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
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 46,
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
    color: colors.deepCanopy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.coralAlerta,
    borderRadius: radius.lg,
    minHeight: 54,
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
    opacity: 0.82,
  },
});
