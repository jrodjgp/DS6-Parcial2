export type UserRole = 'system_admin' | 'manager' | 'resident';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
};

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  startedAt: string;
};

export type PropertyProfile = {
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  towers: string;
  units: string;
  notes: string;
  updatedAt: string;
};

export type AssetStatus = 'Operativo' | 'En revisión' | 'Fuera de servicio';

export type AssetPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export type Asset = {
  id: string;
  userId: string;
  name: string;
  category: string;
  location: string;
  status: AssetStatus;
  priority: AssetPriority;
  provider: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type OperationalEventType =
  | 'Mantenimiento'
  | 'Incidencia'
  | 'Inspección'
  | 'Reparación'
  | 'Limpieza'
  | 'Cotización'
  | 'Visita técnica'
  | 'Garantía';

export type OperationalEventStatus = 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';

export type OperationalEvent = {
  id: string;
  assetId: string;
  type: OperationalEventType;
  title: string;
  description: string;
  date: string;
  cost: number;
  status: OperationalEventStatus;
  provider: string;
  responsible: string;
  createdBy: string;
  managerResponse?: string;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
};

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
