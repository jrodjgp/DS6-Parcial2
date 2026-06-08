import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { StatusChip } from '../components/StatusChip';
import { getAssets } from '../services/storage';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Asset, Session } from '../types';

export type ResidentReportValues = {
  assetId: string;
  title: string;
  description: string;
  locationDetail: string;
};

type ResidentReportScreenProps = {
  propertyName: string;
  session: Session;
  onCancel: () => void;
  onSubmit: (values: ResidentReportValues) => Promise<string | null>;
};

export function ResidentReportScreen({
  propertyName,
  session,
  onCancel,
  onSubmit,
}: ResidentReportScreenProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [values, setValues] = useState<ResidentReportValues>({
    assetId: '',
    title: '',
    description: '',
    locationDetail: '',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      const storedAssets = await getAssets();
      setAssets(storedAssets);

      if (storedAssets.length > 0) {
        setValues((currentValues) => ({
          ...currentValues,
          assetId: currentValues.assetId || storedAssets[0].id,
        }));
      }
    }

    loadAssets();
  }, []);

  function updateValue<Key extends keyof ResidentReportValues>(
    key: Key,
    value: ResidentReportValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setMessage('');

    if (
      !values.assetId ||
      !values.title.trim() ||
      !values.description.trim() ||
      !values.locationDetail.trim()
    ) {
      setMessage('Selecciona un área y completa título, descripción y detalle de ubicación.');
      return;
    }

    setIsSubmitting(true);
    const error = await onSubmit(values);
    setIsSubmitting(false);

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
          label={propertyName}
          title="Reportar incidencia"
          subtitle={`Hola, ${session.name}. Cuéntanos qué pasó para enviarlo a la bitácora.`}
          accent="coral"
        />

        <SectionCard title="Área afectada" subtitle="El reporte quedará ligado al historial del activo.">
          {assets.length === 0 ? (
            <Text style={styles.emptyText}>No hay activos registrados todavía.</Text>
          ) : (
            <View style={styles.assetList}>
              {assets.map((asset) => {
                const isSelected = asset.id === values.assetId;

                return (
                  <Pressable
                    key={asset.id}
                    onPress={() => updateValue('assetId', asset.id)}
                    style={({ pressed }) => [
                      styles.assetOption,
                      isSelected && styles.assetOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.assetTopRow}>
                      <Text style={[styles.assetName, isSelected && styles.assetNameSelected]}>
                        {asset.name}
                      </Text>
                      {isSelected ? <StatusChip label="seleccionado" tone="success" /> : null}
                    </View>
                    <Text style={[styles.assetLocation, isSelected && styles.assetLocationSelected]}>
                      {asset.location}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Detalle del reporte" subtitle="Mantén el texto breve y útil para el encargado.">
          <AppInput
            label="Título"
            value={values.title}
            onChangeText={(text) => updateValue('title', text)}
            placeholder="Fuga cerca del lobby"
          />

          <AppInput
            label="Descripción"
            value={values.description}
            onChangeText={(text) => updateValue('description', text)}
            placeholder="Describe la incidencia"
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />

          <AppInput
            label="Detalle de ubicación"
            value={values.locationDetail}
            onChangeText={(text) => updateValue('locationDetail', text)}
            placeholder="Torre A, piso 2, al lado del ascensor"
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <AppButton
            label={isSubmitting ? 'Enviando...' : 'Enviar reporte'}
            onPress={handleSubmit}
          />
          <AppButton label="Volver" onPress={onCancel} variant="secondary" />
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
  assetList: {
    gap: spacing.md,
  },
  assetOption: {
    backgroundColor: colors.sand,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 82,
    padding: spacing.lg,
  },
  assetOptionSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  assetTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  assetName: {
    color: colors.ink,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 22,
  },
  assetNameSelected: {
    color: colors.ivory,
  },
  assetLocation: {
    color: colors.graphite,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  assetLocationSelected: {
    color: colors.tealSoft,
  },
  emptyText: {
    color: colors.graphite,
    fontSize: 15,
    lineHeight: 22,
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
  pressed: {
    opacity: 0.82,
  },
});
