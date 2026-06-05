import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Screen } from './src/components/Screen';
import { AdminUsersScreen } from './src/screens/AdminUsersScreen';
import { AssetFormScreen, AssetFormValues } from './src/screens/AssetFormScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ResidentHomeScreen } from './src/screens/ResidentHomeScreen';
import { UserDashboardScreen } from './src/screens/UserDashboardScreen';
import {
  clearCurrentSession,
  getAssets,
  getCurrentSession,
  getEvents,
  getUsers,
  initializeStorage,
  saveAssets,
  saveCurrentSession,
  saveEvents,
  saveUsers,
} from './src/services/storage';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { Asset, Session, User } from './src/types';

type AuthRoute = 'login' | 'register';
type ManagerRoute =
  | { name: 'dashboard' }
  | { name: 'assetForm'; asset?: Asset };

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [managerRoute, setManagerRoute] = useState<ManagerRoute>({ name: 'dashboard' });
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
    setManagerRoute({ name: 'dashboard' });
  }

  async function handleSaveAsset(values: AssetFormValues, asset?: Asset): Promise<string | null> {
    if (!session || session.role !== 'manager') {
      return 'La sesión del encargado no está disponible.';
    }

    const storedAssets = await getAssets();
    const cleanName = values.name.trim();
    const cleanLocation = values.location.trim();
    const duplicateAsset = storedAssets.some(
      (storedAsset) =>
        storedAsset.userId === session.userId &&
        storedAsset.id !== asset?.id &&
        storedAsset.name.trim().toLowerCase() === cleanName.toLowerCase() &&
        storedAsset.location.trim().toLowerCase() === cleanLocation.toLowerCase(),
    );

    if (duplicateAsset) {
      return 'Ya existe un activo con ese nombre y ubicación.';
    }

    const now = new Date().toISOString();

    if (asset) {
      const updatedAsset: Asset = {
        ...asset,
        name: cleanName,
        category: values.category.trim(),
        location: cleanLocation,
        status: values.status,
        priority: values.priority,
        provider: values.provider.trim(),
        notes: values.notes.trim(),
        updatedAt: now,
      };

      await saveAssets(
        storedAssets.map((storedAsset) =>
          storedAsset.id === asset.id ? updatedAsset : storedAsset,
        ),
      );

      const verifiedAssets = await getAssets();
      const wasUpdated = verifiedAssets.some(
        (storedAsset) =>
          storedAsset.id === asset.id &&
          storedAsset.name === updatedAsset.name &&
          storedAsset.location === updatedAsset.location,
      );

      if (!wasUpdated) {
        return 'No se pudo guardar el cambio. Reinicia Expo Go y vuelve a intentar.';
      }

      setManagerRoute({ name: 'dashboard' });
      return null;
    }

    const newAsset: Asset = {
      id: `asset-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      userId: session.userId,
      name: cleanName,
      category: values.category.trim(),
      location: cleanLocation,
      status: values.status,
      priority: values.priority,
      provider: values.provider.trim(),
      notes: values.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await saveAssets([...storedAssets, newAsset]);

    const verifiedAssets = await getAssets();
    const wasCreated = verifiedAssets.some((storedAsset) => storedAsset.id === newAsset.id);

    if (!wasCreated) {
      return 'No se pudo crear el activo. Reinicia Expo Go y vuelve a intentar.';
    }

    setManagerRoute({ name: 'dashboard' });
    return null;
  }

  async function handleDeleteAsset(asset: Asset): Promise<string | null> {
    if (!session || session.role !== 'manager') {
      return 'La sesión del encargado no está disponible.';
    }

    if (asset.userId !== session.userId) {
      return 'No puedes eliminar un activo de otro encargado.';
    }

    const [storedAssets, storedEvents] = await Promise.all([getAssets(), getEvents()]);
    const nextAssets = storedAssets.filter((storedAsset) => storedAsset.id !== asset.id);
    const nextEvents = storedEvents.filter((event) => event.assetId !== asset.id);

    await Promise.all([saveAssets(nextAssets), saveEvents(nextEvents)]);

    const [verifiedAssets, verifiedEvents] = await Promise.all([getAssets(), getEvents()]);
    const assetStillExists = verifiedAssets.some((storedAsset) => storedAsset.id === asset.id);
    const linkedEventsStillExist = verifiedEvents.some((event) => event.assetId === asset.id);

    if (assetStillExists || linkedEventsStillExist) {
      return 'No se pudo eliminar el activo por completo. Reinicia Expo Go y vuelve a intentar.';
    }

    setManagerRoute({ name: 'dashboard' });
    return null;
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

  if (managerRoute.name === 'assetForm') {
    return (
      <AssetFormScreen
        asset={managerRoute.asset}
        onCancel={() => setManagerRoute({ name: 'dashboard' })}
        onDelete={handleDeleteAsset}
        onSave={handleSaveAsset}
      />
    );
  }

  return (
    <UserDashboardScreen
      session={session}
      onCreateAsset={() => setManagerRoute({ name: 'assetForm' })}
      onEditAsset={(asset) => setManagerRoute({ name: 'assetForm', asset })}
      onLogout={handleLogout}
    />
  );
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
