import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

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
      <View style={styles.hero}>
        <Text style={styles.kicker}>Acceso operativo</Text>
        <Text style={styles.title}>Umbral</Text>
        <Text style={styles.subtitle}>Bitácora operativa para PHs</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesión</Text>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.guayacanGold,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.lift,
  },
  kicker: {
    color: colors.mistGreen,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.cardIvory,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.mistGreen,
    fontSize: 18,
    lineHeight: 25,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
    ...shadow.soft,
  },
  cardTitle: {
    color: colors.umbralInk,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  error: {
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
