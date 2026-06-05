import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { StatusChip } from '../components/StatusChip';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Session } from '../types';

type ResidentHomeScreenProps = {
  session: Session;
  onLogout: () => void;
};

export function ResidentHomeScreen({ session, onLogout }: ResidentHomeScreenProps) {
  return (
    <Screen>
      <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
      <View style={styles.card}>
        <StatusChip label="resident" tone="info" />
        <Text style={styles.title}>Inicio residente</Text>
        <Text style={styles.body}>
          Hola, {session.name}. Esta vista queda reservada para reportes simples de incidencias.
        </Text>
        <Text style={styles.note}>Placeholder opcional: reportar una incidencia al manager.</Text>
        <AppButton label="Cerrar sesión" onPress={onLogout} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardIvory,
    borderColor: colors.caribeBlue,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
  },
  title: {
    color: colors.umbralInk,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    color: colors.deepCanopy,
    fontSize: 17,
    lineHeight: 24,
  },
  note: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 20,
  },
});
