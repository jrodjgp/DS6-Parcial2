import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type RegisterScreenProps = {
  onRegister: (name: string, email: string, password: string) => Promise<string | null>;
  onGoToLogin: () => void;
};

export function RegisterScreen({ onRegister, onGoToLogin }: RegisterScreenProps) {
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
      <View style={styles.header}>
        <Text style={styles.kicker}>Nuevo encargado</Text>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>El registro crea un usuario manager para pruebas académicas.</Text>
      </View>

      <View style={styles.card}>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.caribeBlue,
    borderBottomWidth: 6,
    borderRadius: radius.xl,
    padding: spacing.xl,
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
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.mistGreen,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.mistGreen,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  error: {
    color: colors.coralAlerta,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
