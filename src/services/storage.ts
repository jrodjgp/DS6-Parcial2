import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Asset,
  AssetPriority,
  AssetStatus,
  OperationalEvent,
  OperationalEventStatus,
  OperationalEventType,
  Session,
  User,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  users: 'umbral_users',
  assets: 'umbral_assets',
  events: 'umbral_events',
  session: 'umbral_session',
} as const;

const ADMIN_USER: User = {
  id: 'admin-umbral',
  name: 'Admin Umbral',
  email: 'admin@umbral.pa',
  password: 'admin123',
  role: 'system_admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const USER_ROLES: readonly UserRole[] = ['system_admin', 'manager', 'resident'];

const ASSET_STATUSES: readonly AssetStatus[] = [
  'Operativo',
  'En revisión',
  'Fuera de servicio',
];

const ASSET_PRIORITIES: readonly AssetPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

const EVENT_TYPES: readonly OperationalEventType[] = [
  'Mantenimiento',
  'Incidencia',
  'Inspección',
  'Reparación',
  'Limpieza',
  'Cotización',
  'Visita técnica',
  'Garantía',
];

const EVENT_STATUSES: readonly OperationalEventStatus[] = [
  'Pendiente',
  'En proceso',
  'Completado',
  'Cancelado',
];

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return isString(value) && options.includes(value as T);
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.email) &&
    isString(value.password) &&
    isOneOf(value.role, USER_ROLES) &&
    isString(value.createdAt)
  );
}

function isSession(value: unknown): value is Session {
  return (
    isRecord(value) &&
    isString(value.userId) &&
    isString(value.name) &&
    isString(value.email) &&
    isOneOf(value.role, USER_ROLES) &&
    isString(value.startedAt)
  );
}

function isAsset(value: unknown): value is Asset {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.name) &&
    isString(value.category) &&
    isString(value.location) &&
    isOneOf(value.status, ASSET_STATUSES) &&
    isOneOf(value.priority, ASSET_PRIORITIES) &&
    isString(value.provider) &&
    isString(value.notes) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isOperationalEvent(value: unknown): value is OperationalEvent {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.assetId) &&
    isOneOf(value.type, EVENT_TYPES) &&
    isString(value.title) &&
    isString(value.description) &&
    isString(value.date) &&
    isNumber(value.cost) &&
    isOneOf(value.status, EVENT_STATUSES) &&
    isString(value.provider) &&
    isString(value.responsible) &&
    isString(value.createdBy) &&
    isString(value.nextReviewDate) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures should not crash the app during academic testing.
  }
}

async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Removing a missing or damaged key should also stay safe.
  }
}

async function getValidArray<T>(
  key: string,
  isValidItem: (value: unknown) => value is T,
): Promise<T[]> {
  const value = await readJson<unknown>(key, []);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isValidItem);
}

export async function initializeStorage(): Promise<void> {
  const users = await getUsers();

  if (users.length === 0) {
    await saveUsers([ADMIN_USER]);
  }
}

export async function getUsers(): Promise<User[]> {
  return getValidArray<User>(STORAGE_KEYS.users, isUser);
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeJson(STORAGE_KEYS.users, users);
}

export async function getCurrentSession(): Promise<Session | null> {
  const session = await readJson<unknown>(STORAGE_KEYS.session, null);

  if (!isSession(session)) {
    return null;
  }

  return session;
}

export async function saveCurrentSession(session: Session): Promise<void> {
  await writeJson(STORAGE_KEYS.session, session);
}

export async function clearCurrentSession(): Promise<void> {
  await removeKey(STORAGE_KEYS.session);
}

export async function getAssets(): Promise<Asset[]> {
  return getValidArray<Asset>(STORAGE_KEYS.assets, isAsset);
}

export async function saveAssets(assets: Asset[]): Promise<void> {
  await writeJson(STORAGE_KEYS.assets, assets);
}

export async function getEvents(): Promise<OperationalEvent[]> {
  return getValidArray<OperationalEvent>(STORAGE_KEYS.events, isOperationalEvent);
}

export async function saveEvents(events: OperationalEvent[]): Promise<void> {
  await writeJson(STORAGE_KEYS.events, events);
}

export async function clearAllAppData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.users,
      STORAGE_KEYS.assets,
      STORAGE_KEYS.events,
      STORAGE_KEYS.session,
    ]);
  } catch {
    await Promise.all([
      removeKey(STORAGE_KEYS.users),
      removeKey(STORAGE_KEYS.assets),
      removeKey(STORAGE_KEYS.events),
      removeKey(STORAGE_KEYS.session),
    ]);
  }
}
