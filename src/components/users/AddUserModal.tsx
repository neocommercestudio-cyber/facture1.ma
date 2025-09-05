import React, { useState } from 'react';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { UserPermissions, DEFAULT_USER_PERMISSIONS } from '../../types/User';
import Modal from '../common/Modal';
import { Shield, Users, Eye, EyeOff } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { addUser } = useUserManagement();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_USER_PERMISSIONS);

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
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Tous les champs obligatoires doivent être remplis');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
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
      const success = await addUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        permissions
      });

      if (success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setPermissions(DEFAULT_USER_PERMISSIONS);
        onClose();
        alert('Utilisateur créé avec succès !');
      } else {
        alert('Erreur lors de la création de l\'utilisateur');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création de l\'utilisateur');
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
    setPermissions(DEFAULT_USER_PERMISSIONS);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel Utilisateur" size="lg">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
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

        {/* Résumé des permissions sélectionnées */}
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
            {isLoading ? 'Création...' : 'Créer Utilisateur'}
          </button>
        </div>
      </form>
    </Modal>
  );
}