import React from 'react';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { UserPermissions } from '../../types/User';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: keyof UserPermissions;
  fallbackMessage?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission, 
  fallbackMessage 
}: ProtectedRouteProps) {
  const { checkUserPermission, currentUser } = useUserManagement();

  const hasPermission = checkUserPermission(requiredPermission);

  if (!hasPermission) {
    const permissionLabels = {
      dashboard: 'Tableau de bord',
      invoices: 'Factures',
      quotes: 'Devis',
      clients: 'Clients',
      products: 'Produits',
      stockManagement: 'Gestion de Stock',
      hrManagement: 'Gestion Humaine',
      reports: 'Rapports',
      settings: 'Paramètres'
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚫 Accès Refusé
          </h2>
          <p className="text-gray-600 mb-6">
            {fallbackMessage || 
              `Vous n'avez pas les permissions nécessaires pour accéder à la section "${permissionLabels[requiredPermission]}".`
            }
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-amber-800 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Votre profil</span>
            </div>
            <div className="text-xs text-amber-700 space-y-1">
              <p>• <strong>Nom :</strong> {currentUser?.name}</p>
              <p>• <strong>Rôle :</strong> {currentUser?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
              <p>• <strong>Statut :</strong> {currentUser?.isActive ? 'Actif' : 'Inactif'}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Contactez votre administrateur pour obtenir les permissions nécessaires.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}