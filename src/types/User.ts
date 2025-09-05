export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  entrepriseId: string;
  createdBy?: string; // ID de l'admin qui a créé cet utilisateur
}

export interface UserPermissions {
  dashboard: boolean;
  invoices: boolean;
  quotes: boolean;
  clients: boolean;
  products: boolean;
  stockManagement: boolean;
  hrManagement: boolean;
  reports: boolean;
  settings: boolean;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: true,
  invoices: true,
  quotes: true,
  clients: true,
  products: true,
  stockManagement: true,
  hrManagement: true,
  reports: true,
  settings: true,
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  dashboard: true,
  invoices: false,
  quotes: false,
  clients: false,
  products: false,
  stockManagement: false,
  hrManagement: false,
  reports: false,
  settings: false,
};