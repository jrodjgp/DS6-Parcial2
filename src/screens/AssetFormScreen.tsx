import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { OptionGroup } from '../components/OptionGroup';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
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
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeaderHero
          label={asset ? 'editar activo' : 'nuevo activo'}
          title={asset ? 'Editar activo' : 'Nuevo activo'}
          subtitle="Registra equipos, áreas y puntos operativos del PH."
        />

        <SectionCard
          title="Ficha del activo"
          subtitle="Estos datos alimentan el dashboard y la historia operativa."
        >
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
            <AppButton label="Eliminar activo" onPress={requestDelete} variant="danger" />
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
