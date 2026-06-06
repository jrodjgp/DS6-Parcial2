import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { HeaderHero } from '../components/HeaderHero';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onGoToRegister: () => void;
};

export function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setMessage('');

    if (!email.trim() || !password.trim()) {
      setMessage('Ingresa correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const error = await onLogin(email, password);
    setIsSubmitting(false);

    if (error) {
      setMessage(error);
    }
  }

  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <HeaderHero
        label="PH Bahía Central"
        title="Umbral"
        subtitle="La memoria operativa de tu PH"
        centered
      />

      <SectionCard
        title="Iniciar sesión"
        subtitle="Acceso local para administración, residentes y demostración académica."
      >
        <AppInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@umbral.pa"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Escribe tu contraseña"
          secureTextEntry
        />

        {message ? <Text style={styles.error}>{message}</Text> : null}

        <AppButton
          label={isSubmitting ? 'Validando...' : 'Entrar'}
          onPress={handleSubmit}
        />
        <AppButton
          label="Crear cuenta de encargado"
          onPress={onGoToRegister}
          variant="secondary"
        />
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
