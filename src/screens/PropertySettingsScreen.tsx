import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { PropertyProfile } from '../types';

type PropertySettingsScreenProps = {
  profile: PropertyProfile;
  onBack: () => void;
  onLogout: () => void;
  onSave: (profile: PropertyProfile) => Promise<string | null>;
};

export function PropertySettingsScreen({
  profile,
  onBack,
  onLogout,
  onSave,
}: PropertySettingsScreenProps) {
  const [values, setValues] = useState<PropertyProfile>(profile);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof PropertyProfile>(key: Key, value: PropertyProfile[Key]) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setMessage('');

    if (!values.name.trim()) {
      setMessage('El nombre del PH es obligatorio.');
      return;
    }

    setIsSaving(true);
    const error = await onSave({
      ...values,
      name: values.name.trim(),
      address: values.address.trim(),
      contactName: values.contactName.trim(),
      contactPhone: values.contactPhone.trim(),
      towers: values.towers.trim(),
      units: values.units.trim(),
      notes: values.notes.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsSaving(false);

    if (error) {
      setMessage(error);
      return;
    }

    setMessage('Perfil del PH actualizado.');
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
          label="configuración"
          title="Perfil del PH"
          subtitle="Datos locales usados en el dashboard, reportes y vista residente."
          accent="blue"
        />

        <SectionCard title="Datos del conjunto" subtitle="Personaliza Umbral para la demo.">
          <AppInput
            label="Nombre del PH"
            value={values.name}
            onChangeText={(text) => updateValue('name', text)}
            placeholder="PH Bahía Central"
          />
          <AppInput
            label="Dirección"
            value={values.address}
            onChangeText={(text) => updateValue('address', text)}
            placeholder="Ciudad de Panamá"
          />
          <AppInput
            label="Contacto"
            value={values.contactName}
            onChangeText={(text) => updateValue('contactName', text)}
            placeholder="Administración"
          />
          <AppInput
            label="Teléfono"
            value={values.contactPhone}
            onChangeText={(text) => updateValue('contactPhone', text)}
            placeholder="0000-0000"
            keyboardType="phone-pad"
          />
          <AppInput
            label="Torres"
            value={values.towers}
            onChangeText={(text) => updateValue('towers', text)}
            placeholder="2"
            keyboardType="number-pad"
          />
          <AppInput
            label="Unidades"
            value={values.units}
            onChangeText={(text) => updateValue('units', text)}
            placeholder="96"
            keyboardType="number-pad"
          />
          <AppInput
            label="Notas"
            value={values.notes}
            onChangeText={(text) => updateValue('notes', text)}
            placeholder="Detalle general del PH"
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <AppButton label={isSaving ? 'Guardando...' : 'Guardar perfil'} onPress={handleSave} />
          <AppButton label="Volver al panel" onPress={onBack} variant="secondary" />
          <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
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
    backgroundColor: colors.tealSoft,
    borderRadius: radius.md,
    color: colors.canopy,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
});
