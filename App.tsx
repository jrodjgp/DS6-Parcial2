import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Screen } from './src/components/Screen';
import { AdminUsersScreen } from './src/screens/AdminUsersScreen';
import { AssetDetailScreen } from './src/screens/AssetDetailScreen';
import { AssetFormScreen, AssetFormValues } from './src/screens/AssetFormScreen';
import { EventFormScreen, EventFormValues } from './src/screens/EventFormScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ResidentHomeScreen } from './src/screens/ResidentHomeScreen';
import { ResidentReportScreen, ResidentReportValues } from './src/screens/ResidentReportScreen';
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
import { shadow, spacing } from './src/theme/spacing';
import { Asset, OperationalEvent, Session, User } from './src/types';

type AuthRoute = 'login' | 'register';
type ManagerRoute =
  | { name: 'dashboard' }
  | { name: 'assetDetail'; asset: Asset }
  | { name: 'assetForm'; asset?: Asset }
  | { name: 'eventForm'; asset: Asset; event?: OperationalEvent };
type ResidentRoute = 'home' | 'report';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [managerRoute, setManagerRoute] = useState<ManagerRoute>({ name: 'dashboard' });
  const [residentRoute, setResidentRoute] = useState<ResidentRoute>('home');
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
    setResidentRoute('home');
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

      if (managerRoute.name === 'assetForm' && managerRoute.asset) {
        setManagerRoute({ name: 'assetDetail', asset: updatedAsset });
      } else {
        setManagerRoute({ name: 'dashboard' });
      }

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

  async function handleSaveEvent(
    values: EventFormValues,
    asset: Asset,
    event?: OperationalEvent,
  ): Promise<string | null> {
    if (!session || session.role !== 'manager') {
      return 'La sesión del encargado no está disponible.';
    }

    if (asset.userId !== session.userId) {
      return 'No puedes modificar eventos de un activo de otro encargado.';
    }

    const cleanTitle = values.title.trim();
    const cleanDate = values.date.trim();
    const cleanCost = values.cost.trim();
    const parsedCost = cleanCost ? Number(cleanCost.replace(',', '.')) : 0;

    if (!Number.isFinite(parsedCost)) {
      return 'El costo debe ser un número válido.';
    }

    const storedEvents = await getEvents();
    const now = new Date().toISOString();

    if (event) {
      const updatedEvent: OperationalEvent = {
        ...event,
        type: values.type,
        title: cleanTitle,
        description: values.description.trim(),
        date: cleanDate,
        cost: parsedCost,
        status: values.status,
        provider: values.provider.trim(),
        responsible: values.responsible.trim(),
        nextReviewDate: values.nextReviewDate.trim(),
        updatedAt: now,
      };

      await saveEvents(
        storedEvents.map((storedEvent) =>
          storedEvent.id === event.id ? updatedEvent : storedEvent,
        ),
      );

      const verifiedEvents = await getEvents();
      const wasUpdated = verifiedEvents.some(
        (storedEvent) =>
          storedEvent.id === event.id &&
          storedEvent.title === updatedEvent.title &&
          storedEvent.status === updatedEvent.status,
      );

      if (!wasUpdated) {
        return 'No se pudo guardar el evento. Reinicia Expo Go y vuelve a intentar.';
      }

      setManagerRoute({ name: 'assetDetail', asset });
      return null;
    }

    const newEvent: OperationalEvent = {
      id: `event-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      assetId: asset.id,
      type: values.type,
      title: cleanTitle,
      description: values.description.trim(),
      date: cleanDate,
      cost: parsedCost,
      status: values.status,
      provider: values.provider.trim(),
      responsible: values.responsible.trim(),
      createdBy: session.userId,
      nextReviewDate: values.nextReviewDate.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await saveEvents([...storedEvents, newEvent]);

    const verifiedEvents = await getEvents();
    const wasCreated = verifiedEvents.some((storedEvent) => storedEvent.id === newEvent.id);

    if (!wasCreated) {
      return 'No se pudo crear el evento. Reinicia Expo Go y vuelve a intentar.';
    }

    setManagerRoute({ name: 'assetDetail', asset });
    return null;
  }

  async function handleDeleteEvent(
    asset: Asset,
    event: OperationalEvent,
  ): Promise<string | null> {
    if (!session || session.role !== 'manager') {
      return 'La sesión del encargado no está disponible.';
    }

    if (asset.userId !== session.userId || event.assetId !== asset.id) {
      return 'No puedes eliminar este evento desde esta sesión.';
    }

    const storedEvents = await getEvents();
    const nextEvents = storedEvents.filter((storedEvent) => storedEvent.id !== event.id);

    await saveEvents(nextEvents);

    const verifiedEvents = await getEvents();
    const eventStillExists = verifiedEvents.some((storedEvent) => storedEvent.id === event.id);

    if (eventStillExists) {
      return 'No se pudo eliminar el evento. Reinicia Expo Go y vuelve a intentar.';
    }

    setManagerRoute({ name: 'assetDetail', asset });
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

  async function handleSaveResidentReport(values: ResidentReportValues): Promise<string | null> {
    if (!session || session.role !== 'resident') {
      return 'La sesión del residente no está disponible.';
    }

    const storedAssets = await getAssets();
    const selectedAsset = storedAssets.find((asset) => asset.id === values.assetId);

    if (!selectedAsset) {
      return 'Selecciona un activo o área existente.';
    }

    const now = new Date();
    const reportDate = now.toISOString().split('T')[0];
    const cleanDescription = values.description.trim();
    const cleanLocationDetail = values.locationDetail.trim();
    const storedEvents = await getEvents();
    const residentReport: OperationalEvent = {
      id: `event-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      assetId: selectedAsset.id,
      type: 'Incidencia',
      title: values.title.trim(),
      description: `${cleanDescription}\n\nDetalle de ubicación: ${cleanLocationDetail}`,
      date: reportDate,
      cost: 0,
      status: 'Pendiente',
      provider: '',
      responsible: session.name,
      createdBy: session.userId,
      nextReviewDate: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await saveEvents([...storedEvents, residentReport]);

    const verifiedEvents = await getEvents();
    const wasCreated = verifiedEvents.some((event) => event.id === residentReport.id);

    if (!wasCreated) {
      return 'No se pudo enviar el reporte. Reinicia Expo Go y vuelve a intentar.';
    }

    setResidentRoute('home');
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
    if (residentRoute === 'report') {
      return (
        <ResidentReportScreen
          session={session}
          onCancel={() => setResidentRoute('home')}
          onSubmit={handleSaveResidentReport}
        />
      );
    }

    return (
      <ResidentHomeScreen
        session={session}
        onLogout={handleLogout}
        onReportIncident={() => setResidentRoute('report')}
      />
    );
  }

  if (managerRoute.name === 'assetForm') {
    return (
      <AssetFormScreen
        asset={managerRoute.asset}
        onCancel={() =>
          managerRoute.asset
            ? setManagerRoute({ name: 'assetDetail', asset: managerRoute.asset })
            : setManagerRoute({ name: 'dashboard' })
        }
        onDelete={handleDeleteAsset}
        onSave={handleSaveAsset}
      />
    );
  }

  if (managerRoute.name === 'eventForm') {
    return (
      <EventFormScreen
        asset={managerRoute.asset}
        event={managerRoute.event}
        onCancel={() => setManagerRoute({ name: 'assetDetail', asset: managerRoute.asset })}
        onDelete={handleDeleteEvent}
        onSave={handleSaveEvent}
      />
    );
  }

  if (managerRoute.name === 'assetDetail') {
    return (
      <AssetDetailScreen
        asset={managerRoute.asset}
        onAddEvent={(asset) => setManagerRoute({ name: 'eventForm', asset })}
        onBack={() => setManagerRoute({ name: 'dashboard' })}
        onDeleteAsset={handleDeleteAsset}
        onDeleteEvent={handleDeleteEvent}
        onEditAsset={(asset) => setManagerRoute({ name: 'assetForm', asset })}
        onEditEvent={(asset, event) => setManagerRoute({ name: 'eventForm', asset, event })}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <UserDashboardScreen
      session={session}
      onCreateAsset={() => setManagerRoute({ name: 'assetForm' })}
      onOpenAsset={(asset) => setManagerRoute({ name: 'assetDetail', asset })}
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
    ...shadow.lift,
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
