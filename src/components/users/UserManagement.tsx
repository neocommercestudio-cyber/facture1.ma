import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { 
  Users, 
  Crown, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck,
  UserX,
  Key,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

export default function UserManagement() {
  const { user } = useAuth();
  const { 
    users, 
    currentUser, 
    isLoading, 
    canCreateUser, 
    deleteUser, 
    toggleUserStatus, 
    resetUserPassword 
  } = useUserManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState<Record<string, boolean>>({});

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La gestion multi-utilisateurs est réservée aux abonnés PRO. 
            Créez jusqu'à 3 utilisateurs avec des droits personnalisés.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const regularUsers = filteredUsers.filter(u => u.role === 'user');
  const adminUsers = filteredUsers.filter(u => u.role === 'admin');

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await deleteUser(id);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleUserStatus(id);
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Nouveau mot de passe (min 6 caractères):');
    if (newPassword && newPassword.length >= 6) {
      const success = await resetUserPassword(id, newPassword);
      if (success) {
        alert('Mot de passe réinitialisé avec succès');
      } else {
        alert('Erreur lors de la réinitialisation');
      }
    }
  };

  const togglePermissionsView = (userId: string) => {
    setShowPermissions(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getPermissionsList = (permissions: any) => {
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

    return Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => permissionLabels[key as keyof typeof permissionLabels])
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Gestion des Utilisateurs</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les accès et permissions de votre équipe. Fonctionnalité PRO - Maximum 3 utilisateurs.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!canCreateUser}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            canCreateUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
          {!canCreateUser && <span className="text-xs">(Limite atteinte)</span>}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
              <p className="text-sm text-gray-600">Administrateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
              <p className="text-sm text-gray-600">Utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{3 - regularUsers.length}</p>
              <p className="text-sm text-gray-600">Places Restantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rechercher par nom ou email..."
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Utilisateurs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                          : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <Users className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Administrateur
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Utilisateur
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inactif
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePermissionsView(user.id)}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        {showPermissions[user.id] ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Masquer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Voir</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {showPermissions[user.id] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {user.role === 'admin' ? (
                          <span className="text-yellow-600 font-medium">Accès complet</span>
                        ) : (
                          <div className="space-y-1">
                            {getPermissionsList(user.permissions).split(', ').map((perm, idx) => (
                              <div key={idx} className="text-gray-600">• {perm}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => setEditingUser(user.id)}
                            className="text-amber-600 hover:text-amber-700 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`transition-colors ${
                              user.isActive 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={user.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                            title="Réinitialiser mot de passe"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {user.role === 'admin' && (
                        <span className="text-xs text-gray-400 italic">Propriétaire</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Info sur les limites */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800 mb-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Limites de l'abonnement PRO</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Maximum 3 utilisateurs (hors administrateur principal)</p>
          <p>• Chaque utilisateur peut avoir des permissions personnalisées</p>
          <p>• L'administrateur principal a toujours accès complet</p>
          <p>• Utilisateurs créés: {regularUsers.length}/3</p>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={users.find(u => u.id === editingUser)!}
        />
      )}
    </div>
  );
}

function getPermissionsList(permissions: any): string {
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

  return Object.entries(permissions)
    .filter(([_, value]) => value)
    .map(([key, _]) => permissionLabels[key as keyof typeof permissionLabels])
    .join(', ');
}