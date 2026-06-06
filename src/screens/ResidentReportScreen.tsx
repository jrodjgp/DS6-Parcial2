import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
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
  session: Session;
  onCancel: () => void;
  onSubmit: (values: ResidentReportValues) => Promise<string | null>;
};

export function ResidentReportScreen({
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
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <StatusChip label="incidencia" tone="info" />
          <Text style={styles.title}>Reportar incidencia</Text>
          <Text style={styles.subtitle}>Hola, {session.name}. Cuéntanos qué pasó.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.optionGroup}>
            <Text style={styles.fieldLabel}>Activo o área</Text>
            {assets.length === 0 ? (
              <Text style={styles.emptyText}>No hay activos registrados todavía.</Text>
            ) : (
              <View style={styles.optionWrap}>
                {assets.map((asset) => {
                  const isSelected = asset.id === values.assetId;

                  return (
                    <Pressable
                      key={asset.id}
                      onPress={() => updateValue('assetId', asset.id)}
                      style={({ pressed }) => [
                        styles.option,
                        isSelected && styles.optionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {asset.name}
                      </Text>
                      <Text style={[styles.optionSubtext, isSelected && styles.optionTextSelected]}>
                        {asset.location}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

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
        </View>
      </ScrollView>
    </Screen>
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
    fontSize: 30,
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
  optionGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.umbralInk,
    fontSize: 15,
    fontWeight: '700',
  },
  optionWrap: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.mistGreen,
    borderColor: colors.deepCanopy,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.isthmusTeal,
    borderColor: colors.isthmusTeal,
  },
  optionText: {
    color: colors.deepCanopy,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  optionSubtext: {
    color: colors.graphite,
    fontSize: 13,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: colors.cardIvory,
  },
  emptyText: {
    color: colors.graphite,
    fontSize: 15,
    lineHeight: 22,
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
  pressed: {
    opacity: 0.78,
  },
});
