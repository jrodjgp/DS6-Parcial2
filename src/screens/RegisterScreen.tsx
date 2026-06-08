import { useState } from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type RegisterScreenProps = {
  propertyName: string;
  onRegister: (name: string, email: string, password: string) => Promise<string | null>;
  onGoToLogin: () => void;
};

export function RegisterScreen({ propertyName, onRegister, onGoToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage('Completa nombre, correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const error = await onRegister(name, email, password);
    setIsSubmitting(false);

    if (error) {
      setMessage(error);
    }
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <HeaderHero
        label={propertyName}
        title="Crear cuenta"
        subtitle="El registro crea un usuario manager para pruebas académicas."
        accent="blue"
      />

      <SectionCard title="Datos de acceso" subtitle="Usa un correo único para entrar al panel operativo.">
        <AppInput
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Nombre del encargado"
        />
        <AppInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="encargado@ph.pa"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Crea una contraseña"
          secureTextEntry
        />

        {message ? <Text style={styles.error}>{message}</Text> : null}

        <AppButton
          label={isSubmitting ? 'Creando...' : 'Crear y entrar'}
          onPress={handleSubmit}
        />
        <AppButton label="Volver al login" onPress={onGoToLogin} variant="secondary" />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.coralAlerta,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
});
