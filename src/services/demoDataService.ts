import { Asset, OperationalEvent, User } from '../types';
import { getAssets, getEvents, getUsers, saveAssets, saveEvents, saveUsers } from './storage';

const DEMO_MANAGER_ID = 'demo-manager-umbral';
const DEMO_RESIDENT_ID = 'demo-resident-umbral';

const DEMO_ASSET_IDS = {
  waterPump: 'demo-asset-bomba-agua',
  gate: 'demo-asset-porton-electrico',
  pool: 'demo-asset-piscina',
};

const DEMO_EVENT_IDS = {
  pumpMaintenance: 'demo-event-mantenimiento-bomba',
  gateIncident: 'demo-event-incidencia-porton',
  poolCleaning: 'demo-event-limpieza-piscina',
  pumpInspection: 'demo-event-inspeccion-bomba',
};

const DEMO_MANAGER_EMAIL = 'manager@umbral.pa';
const DEMO_RESIDENT_EMAIL = 'residente@umbral.pa';

function getDemoDates() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + 10);

  return {
    now: now.toISOString(),
    today,
    nextReviewDate: nextReview.toISOString().split('T')[0],
  };
}

export async function loadDemoData(): Promise<boolean> {
  const { now, today, nextReviewDate } = getDemoDates();
  const [users, assets, events] = await Promise.all([getUsers(), getAssets(), getEvents()]);

  const demoUsers: User[] = [
    {
      id: DEMO_MANAGER_ID,
      name: 'María Administradora',
      email: DEMO_MANAGER_EMAIL,
      password: 'manager123',
      role: 'manager',
      createdAt: now,
    },
    {
      id: DEMO_RESIDENT_ID,
      name: 'Carlos Residente',
      email: DEMO_RESIDENT_EMAIL,
      password: 'residente123',
      role: 'resident',
      createdAt: now,
    },
  ];

  const nextUsers = [
    ...users.filter(
      (user) =>
        user.id !== DEMO_MANAGER_ID &&
        user.id !== DEMO_RESIDENT_ID &&
        user.email !== DEMO_MANAGER_EMAIL &&
        user.email !== DEMO_RESIDENT_EMAIL,
    ),
    ...demoUsers,
  ];

  const demoAssets: Asset[] = [
    {
      id: DEMO_ASSET_IDS.waterPump,
      userId: DEMO_MANAGER_ID,
      name: 'Bomba de agua principal',
      category: 'Sistema hidráulico',
      location: 'Cuarto de bombas',
      status: 'Operativo',
      priority: 'Crítica',
      provider: 'HidroService Panamá',
      notes: 'Equipo crítico para presión y abastecimiento del PH.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_ASSET_IDS.gate,
      userId: DEMO_MANAGER_ID,
      name: 'Portón eléctrico',
      category: 'Acceso',
      location: 'Entrada principal',
      status: 'En revisión',
      priority: 'Alta',
      provider: 'Accesos PTY',
      notes: 'Controla entrada vehicular y requiere seguimiento de motor.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_ASSET_IDS.pool,
      userId: DEMO_MANAGER_ID,
      name: 'Piscina',
      category: 'Área común',
      location: 'Nivel social',
      status: 'Operativo',
      priority: 'Media',
      provider: 'AquaClean',
      notes: 'Área común con mantenimiento recurrente semanal.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const nextAssets = [
    ...assets.filter((asset) => !Object.values(DEMO_ASSET_IDS).includes(asset.id)),
    ...demoAssets,
  ];

  const demoEvents: OperationalEvent[] = [
    {
      id: DEMO_EVENT_IDS.pumpMaintenance,
      assetId: DEMO_ASSET_IDS.waterPump,
      type: 'Mantenimiento',
      title: 'Mantenimiento preventivo',
      description: 'Revisión de presión, sellos y tablero de control.',
      date: today,
      cost: 85,
      status: 'Completado',
      provider: 'HidroService Panamá',
      responsible: 'María Administradora',
      createdBy: DEMO_MANAGER_ID,
      nextReviewDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_EVENT_IDS.gateIncident,
      assetId: DEMO_ASSET_IDS.gate,
      type: 'Incidencia',
      title: 'Portón abre con demora',
      description: 'El motor tarda más de lo normal al abrir en horas pico.',
      date: today,
      cost: 0,
      status: 'Pendiente',
      provider: 'Accesos PTY',
      responsible: 'María Administradora',
      createdBy: DEMO_MANAGER_ID,
      nextReviewDate: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_EVENT_IDS.poolCleaning,
      assetId: DEMO_ASSET_IDS.pool,
      type: 'Limpieza',
      title: 'Limpieza completada',
      description: 'Aspirado, control de PH y revisión visual de bordes.',
      date: today,
      cost: 45,
      status: 'Completado',
      provider: 'AquaClean',
      responsible: 'AquaClean',
      createdBy: DEMO_MANAGER_ID,
      nextReviewDate: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_EVENT_IDS.pumpInspection,
      assetId: DEMO_ASSET_IDS.waterPump,
      type: 'Inspección',
      title: 'Inspección programada',
      description: 'Seguimiento preventivo antes del siguiente ciclo mensual.',
      date: today,
      cost: 0,
      status: 'Pendiente',
      provider: 'HidroService Panamá',
      responsible: 'María Administradora',
      createdBy: DEMO_MANAGER_ID,
      nextReviewDate,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const nextEvents = [
    ...events.filter((event) => !Object.values(DEMO_EVENT_IDS).includes(event.id)),
    ...demoEvents,
  ];

  const results = await Promise.all([
    saveUsers(nextUsers),
    saveAssets(nextAssets),
    saveEvents(nextEvents),
  ]);

  return results.every(Boolean);
}

export async function clearDemoData(): Promise<boolean> {
  const [users, assets, events] = await Promise.all([getUsers(), getAssets(), getEvents()]);
  const demoAssetIds = Object.values(DEMO_ASSET_IDS);
  const demoEventIds = Object.values(DEMO_EVENT_IDS);

  const results = await Promise.all([
    saveUsers(
      users.filter(
        (user) =>
          user.id !== DEMO_MANAGER_ID &&
          user.id !== DEMO_RESIDENT_ID &&
          user.email !== DEMO_MANAGER_EMAIL &&
          user.email !== DEMO_RESIDENT_EMAIL,
      ),
    ),
    saveAssets(assets.filter((asset) => !demoAssetIds.includes(asset.id))),
    saveEvents(
      events.filter(
        (event) =>
          !demoEventIds.includes(event.id) && !demoAssetIds.includes(event.assetId),
      ),
    ),
  ]);

  return results.every(Boolean);
}
