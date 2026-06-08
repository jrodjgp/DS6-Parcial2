import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Screen } from './src/components/Screen';
import { AdminUsersScreen } from './src/screens/AdminUsersScreen';
import { AlertCenterScreen } from './src/screens/AlertCenterScreen';
import { AssetDetailScreen } from './src/screens/AssetDetailScreen';
import { AssetFormScreen, AssetFormValues } from './src/screens/AssetFormScreen';
import { EventFormScreen, EventFormValues } from './src/screens/EventFormScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PropertySettingsScreen } from './src/screens/PropertySettingsScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ReportPreviewScreen } from './src/screens/ReportPreviewScreen';
import { ResidentHomeScreen } from './src/screens/ResidentHomeScreen';
import { ResidentReportScreen, ResidentReportValues } from './src/screens/ResidentReportScreen';
import { ResidentReportsScreen } from './src/screens/ResidentReportsScreen';
import { UserDashboardScreen } from './src/screens/UserDashboardScreen';
import {
  clearCurrentSession,
  getAssets,
  getCurrentSession,
  getEvents,
  getPropertyProfile,
  getUsers,
  initializeStorage,
  saveAssets,
  saveCurrentSession,
  saveEvents,
  savePropertyProfile,
  saveUsers,
} from './src/services/storage';
import { colors } from './src/theme/colors';
import { radius, shadow, spacing } from './src/theme/spacing';
import { Asset, OperationalEvent, PropertyProfile, Session, User } from './src/types';
import { isValidDateText } from './src/utils/dateUtils';

type AuthRoute = 'login' | 'register';
type ManagerRoute =
  | { name: 'dashboard' }
  | { name: 'alertCenter' }
  | { name: 'propertySettings' }
  | { name: 'reportPreview' }
  | { name: 'assetDetail'; asset: Asset }
  | { name: 'assetForm'; asset?: Asset }
  | { name: 'eventForm'; asset: Asset; event?: OperationalEvent };
type ResidentRoute = 'home' | 'report' | 'reports';

const fallbackPropertyProfile: PropertyProfile = {
  name: 'PH Bahía Central',
  address: 'Ciudad de Panamá',
  contactName: 'Administración Umbral',
  contactPhone: '0000-0000',
  towers: '2',
  units: '96',
  notes: 'Perfil local del PH.',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [managerRoute, setManagerRoute] = useState<ManagerRoute>({ name: 'dashboard' });
  const [residentRoute, setResidentRoute] = useState<ResidentRoute>('home');
  const [propertyProfile, setPropertyProfile] = useState<PropertyProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareApp() {
      await initializeStorage();
      const storedPropertyProfile = await getPropertyProfile();
      const restoredSession = await getCurrentSession();
      let validSession: Session | null = null;

      if (restoredSession) {
        const users = await getUsers();
        const sessionUser = users.find(
          (user) =>
            user.id === restoredSession.userId &&
            user.email.trim().toLowerCase() === restoredSession.email.trim().toLowerCase() &&
            user.role === restoredSession.role,
        );

        if (sessionUser) {
          validSession = {
            userId: sessionUser.id,
            name: sessionUser.name,
            email: sessionUser.email,
            role: sessionUser.role,
            startedAt: restoredSession.startedAt,
          };
        } else {
          await clearCurrentSession();
        }
      }

      if (isMounted) {
        setPropertyProfile(storedPropertyProfile);
        setSession(validSession);
        setIsReady(true);
      }
    }

    prepareApp();

    return () => {
      isMounted = false;
    };
  }, []);

  async function startSession(user: User): Promise<boolean> {
    const newSession: Session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      startedAt: new Date().toISOString(),
    };

    const sessionSaved = await saveCurrentSession(newSession);

    if (!sessionSaved) {
      return false;
    }

    setSession(newSession);
    return true;
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

    const sessionSaved = await startSession(user);

    if (!sessionSaved) {
      return 'No se pudo guardar la sesión local. Reinicia Expo Go y vuelve a intentar.';
    }

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

    const usersSaved = await saveUsers([...users, newUser]);

    if (!usersSaved) {
      return 'No se pudo crear la cuenta. Reinicia Expo Go y vuelve a intentar.';
    }

    const sessionSaved = await startSession(newUser);

    if (!sessionSaved) {
      return 'La cuenta fue creada, pero no se pudo guardar la sesión local.';
    }

    return null;
  }

  async function handleLogout() {
    await clearCurrentSession();
    setSession(null);
    setAuthRoute('login');
    setManagerRoute({ name: 'dashboard' });
    setResidentRoute('home');
  }

  async function handleSavePropertyProfile(profile: PropertyProfile): Promise<string | null> {
    const profileSaved = await savePropertyProfile(profile);

    if (!profileSaved) {
      return 'No se pudo guardar el perfil del PH. Reinicia Expo Go y vuelve a intentar.';
    }

    setPropertyProfile(profile);
    return null;
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

      const assetsSaved = await saveAssets(
        storedAssets.map((storedAsset) =>
          storedAsset.id === asset.id ? updatedAsset : storedAsset,
        ),
      );

      if (!assetsSaved) {
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

    const assetsSaved = await saveAssets([...storedAssets, newAsset]);

    if (!assetsSaved) {
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
    const cleanNextReviewDate = values.nextReviewDate.trim();
    const parsedCost = cleanCost ? Number(cleanCost.replace(',', '.')) : 0;

    if (!isValidDateText(cleanDate)) {
      return 'La fecha debe tener formato YYYY-MM-DD y ser válida.';
    }

    if (cleanNextReviewDate && !isValidDateText(cleanNextReviewDate)) {
      return 'La próxima revisión debe tener formato YYYY-MM-DD.';
    }

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
        managerResponse: values.managerResponse.trim(),
        nextReviewDate: cleanNextReviewDate,
        updatedAt: now,
      };

      const eventsSaved = await saveEvents(
        storedEvents.map((storedEvent) =>
          storedEvent.id === event.id ? updatedEvent : storedEvent,
        ),
      );

      if (!eventsSaved) {
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
      managerResponse: values.managerResponse.trim(),
      nextReviewDate: cleanNextReviewDate,
      createdAt: now,
      updatedAt: now,
    };

    const eventsSaved = await saveEvents([...storedEvents, newEvent]);

    if (!eventsSaved) {
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

    const eventsSaved = await saveEvents(nextEvents);

    if (!eventsSaved) {
      return 'No se pudo eliminar el evento. Reinicia Expo Go y vuelve a intentar.';
    }

    setManagerRoute({ name: 'assetDetail', asset });
    return null;
  }

  async function handleUpdateEventStatus(
    asset: Asset,
    event: OperationalEvent,
    status: OperationalEvent['status'],
  ): Promise<string | null> {
    if (!session || session.role !== 'manager') {
      return 'La sesión del encargado no está disponible.';
    }

    if (asset.userId !== session.userId || event.assetId !== asset.id) {
      return 'No puedes actualizar este evento desde esta sesión.';
    }

    const storedEvents = await getEvents();
    const storedEvent = storedEvents.find((currentEvent) => currentEvent.id === event.id);

    if (!storedEvent) {
      return 'El evento ya no está disponible.';
    }

    const responseByStatus: Record<OperationalEvent['status'], string> = {
      Pendiente: 'Caso pendiente de revisión.',
      'En proceso': `Caso tomado por ${session.name}.`,
      Completado: `Caso completado por ${session.name}.`,
      Cancelado: `Caso cancelado por ${session.name}.`,
    };
    const now = new Date().toISOString();
    const updatedEvent: OperationalEvent = {
      ...storedEvent,
      status,
      managerResponse: responseByStatus[status],
      updatedAt: now,
    };

    const eventsSaved = await saveEvents(
      storedEvents.map((currentEvent) =>
        currentEvent.id === event.id ? updatedEvent : currentEvent,
      ),
    );

    if (!eventsSaved) {
      return 'No se pudo actualizar el evento. Reinicia Expo Go y vuelve a intentar.';
    }

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

    const [assetsSaved, eventsSaved] = await Promise.all([
      saveAssets(nextAssets),
      saveEvents(nextEvents),
    ]);

    if (!assetsSaved || !eventsSaved) {
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
      managerResponse: '',
      nextReviewDate: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const eventsSaved = await saveEvents([...storedEvents, residentReport]);

    if (!eventsSaved) {
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

  const activePropertyProfile = propertyProfile ?? fallbackPropertyProfile;
  const propertyName = activePropertyProfile.name;

  if (!session) {
    if (authRoute === 'register') {
      return (
        <RegisterScreen
          propertyName={propertyName}
          onRegister={handleRegister}
          onGoToLogin={() => setAuthRoute('login')}
        />
      );
    }

    return (
      <LoginScreen
        propertyName={propertyName}
        onLogin={handleLogin}
        onGoToRegister={() => setAuthRoute('register')}
      />
    );
  }

  if (session.role === 'system_admin') {
    return <AdminUsersScreen session={session} onLogout={handleLogout} />;
  }

  if (session.role === 'resident') {
    if (residentRoute === 'reports') {
      return (
        <ResidentReportsScreen
          propertyName={propertyName}
          session={session}
          onBack={() => setResidentRoute('home')}
          onLogout={handleLogout}
        />
      );
    }

    if (residentRoute === 'report') {
      return (
        <ResidentReportScreen
          propertyName={propertyName}
          session={session}
          onCancel={() => setResidentRoute('home')}
          onSubmit={handleSaveResidentReport}
        />
      );
    }

    return (
      <ResidentHomeScreen
        propertyName={propertyName}
        session={session}
        onLogout={handleLogout}
        onReportIncident={() => setResidentRoute('report')}
        onViewReports={() => setResidentRoute('reports')}
      />
    );
  }

  if (managerRoute.name === 'alertCenter') {
    return (
      <AlertCenterScreen
        propertyName={propertyName}
        session={session}
        onBack={() => setManagerRoute({ name: 'dashboard' })}
        onLogout={handleLogout}
        onOpenEvent={(asset, event) => setManagerRoute({ name: 'eventForm', asset, event })}
        onUpdateEventStatus={handleUpdateEventStatus}
      />
    );
  }

  if (managerRoute.name === 'propertySettings') {
    return (
      <PropertySettingsScreen
        profile={activePropertyProfile}
        onBack={() => setManagerRoute({ name: 'dashboard' })}
        onLogout={handleLogout}
        onSave={handleSavePropertyProfile}
      />
    );
  }

  if (managerRoute.name === 'reportPreview') {
    return (
      <ReportPreviewScreen
        profile={activePropertyProfile}
        session={session}
        onBack={() => setManagerRoute({ name: 'dashboard' })}
        onLogout={handleLogout}
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
        onUpdateEventStatus={handleUpdateEventStatus}
      />
    );
  }

  return (
    <UserDashboardScreen
      propertyName={propertyName}
      session={session}
      onCreateAsset={() => setManagerRoute({ name: 'assetForm' })}
      onOpenAlerts={() => setManagerRoute({ name: 'alertCenter' })}
      onOpenPropertySettings={() => setManagerRoute({ name: 'propertySettings' })}
      onOpenReportPreview={() => setManagerRoute({ name: 'reportPreview' })}
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
    borderRadius: radius.xl,
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
