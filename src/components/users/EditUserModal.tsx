import React, { useState } from 'react';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { User, UserPermissions } from '../../types/User';
import Modal from '../common/Modal';
import { Shield, Users } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { updateUser } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [permissions, setPermissions] = useState<UserPermissions>(user.permissions);

  const permissionLabels = {
    dashboard: { label: 'Tableau de bord', description: 'Accès aux statistiques générales' },
    invoices: { label: 'Factures', description: 'Créer, modifier et gérer les factures' },
    quotes: { label: 'Devis', description: 'Créer, modifier et gérer les devis' },
    clients: { label: 'Clients', description: 'Gérer la base de données clients' },
    products: { label: 'Produits', description: 'Gérer le catalogue produits' },
    stockManagement: { label: 'Gestion de Stock', description: 'Accès aux rapports de stock avancés' },
    hrManagement: { label: 'Gestion Humaine', description: 'Gérer les employés et congés' },
    reports: { label: 'Rapports Financiers', description: 'Accès aux analyses financières' },
    settings: { label: 'Paramètres', description: 'Modifier les paramètres de l\'entreprise' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Le nom et l\'email sont obligatoires');
      return;
    }

    // Vérifier qu'au moins une permission est accordée
    const hasPermissions = Object.values(permissions).some(value => value);
    if (!hasPermissions) {
      alert('Veuillez accorder au moins une permission à cet utilisateur');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        permissions
      });

      if (success) {
        onClose();
        alert('Utilisateur modifié avec succès !');
      } else {
        alert('Erreur lors de la modification de l\'utilisateur');
      }
    } catch (error) {
      alert('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionChange = (permission: keyof UserPermissions, value: boolean) => {
    setPermissions({
      ...permissions,
      [permission]: value
    });
  };

  const selectAllPermissions = () => {
    const allTrue = Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof UserPermissions] = true;
      return acc;
    }, {} as UserPermissions);
    setPermissions(allTrue);
  };

  const clearAllPermissions = () => {
    const allFalse = Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof UserPermissions] = false;
      return acc;
    }, {} as UserPermissions);
    setPermissions(allFalse);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier Utilisateur" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations utilisateur */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Informations Utilisateur</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de l'utilisateur"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (login) *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="utilisateur@entreprise.com"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions d'Accès</span>
            </h4>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAllPermissions}
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                onClick={clearAllPermissions}
                className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Tout désélectionner
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(permissionLabels).map(([key, info]) => (
              <label
                key={key}
                className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  permissions[key as keyof UserPermissions]
                    ? 'border-blue-300 bg-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={permissions[key as keyof UserPermissions]}
                  onChange={(e) => handlePermissionChange(key as keyof UserPermissions, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{info.label}</div>
                  <div className="text-xs text-gray-600">{info.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Résumé des permissions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Résumé des Accès</h4>
          <div className="text-sm text-green-800">
            {Object.values(permissions).some(value => value) ? (
              <p>
                Cet utilisateur aura accès à : {' '}
                <strong>
                  {Object.entries(permissions)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => permissionLabels[key as keyof typeof permissionLabels].label)
                    .join(', ')}
                </strong>
              </p>
            ) : (
              <p className="text-red-600">⚠️ Aucune permission accordée</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Modification...' : 'Modifier Utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}