import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Screen } from './src/components/Screen';
import { AdminUsersScreen } from './src/screens/AdminUsersScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ResidentHomeScreen } from './src/screens/ResidentHomeScreen';
import { UserDashboardScreen } from './src/screens/UserDashboardScreen';
import {
  clearCurrentSession,
  getCurrentSession,
  getUsers,
  initializeStorage,
  saveCurrentSession,
  saveUsers,
} from './src/services/storage';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { Session, User } from './src/types';

type AuthRoute = 'login' | 'register';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareApp() {
      await initializeStorage();
      const restoredSession = await getCurrentSession();

      if (isMounted) {
        setSession(restoredSession);
        setIsReady(true);
      }
    }

    prepareApp();

    return () => {
      isMounted = false;
    };
  }, []);

  async function startSession(user: User) {
    const newSession: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      startedAt: new Date().toISOString(),
    };

    await saveCurrentSession(newSession);
    setSession(newSession);
  }

  async function handleLogin(email: string, password: string): Promise<string | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const users = await getUsers();
    const user = users.find(
      (item) => item.email.trim().toLowerCase() === cleanEmail && item.password === cleanPassword,
    );

    if (!user) {
      return 'Credenciales inválidas. Revisa el correo y la contraseña.';
    }

    await startSession(user);
    return null;
  }

  async function handleRegister(
    name: string,
    email: string,
    password: string,
  ): Promise<string | null> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const users = await getUsers();
    const emailExists = users.some((user) => user.email.trim().toLowerCase() === cleanEmail);

    if (emailExists) {
      return 'Ya existe una cuenta registrada con ese correo.';
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'manager',
      createdAt: now,
    };

    await saveUsers([...users, newUser]);
    await startSession(newUser);
    return null;
  }

  async function handleLogout() {
    await clearCurrentSession();
    setSession(null);
    setAuthRoute('login');
  }

  if (!isReady) {
    return (
      <Screen>
        <StatusBar barStyle="light-content" backgroundColor={colors.umbralInk} />
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Umbral</Text>
          <Text style={styles.loadingText}>Preparando la bitácora local...</Text>
        </View>
      </Screen>
    );
  }

  if (!session) {
    if (authRoute === 'register') {
      return (
        <RegisterScreen
          onRegister={handleRegister}
          onGoToLogin={() => setAuthRoute('login')}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoToRegister={() => setAuthRoute('register')}
      />
    );
  }

  if (session.role === 'system_admin') {
    return <AdminUsersScreen session={session} onLogout={handleLogout} />;
  }

  if (session.role === 'resident') {
    return <ResidentHomeScreen session={session} onLogout={handleLogout} />;
  }

  return <UserDashboardScreen session={session} onLogout={handleLogout} />;
}

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: colors.deepCanopy,
    borderBottomColor: colors.guayacanGold,
    borderBottomWidth: 6,
    marginTop: spacing.xl,
    padding: spacing.xl,
  },
  loadingTitle: {
    color: colors.cardIvory,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 0,
  },
  loadingText: {
    color: colors.mistGreen,
    fontSize: 17,
    marginTop: spacing.sm,
  },
});
