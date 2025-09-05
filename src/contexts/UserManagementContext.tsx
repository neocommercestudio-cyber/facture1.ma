import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteFirebaseUser
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { User, UserPermissions, DEFAULT_USER_PERMISSIONS } from '../types/User';

interface UserManagementContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  canCreateUser: boolean;
  addUser: (userData: {
    name: string;
    email: string;
    password: string;
    permissions: UserPermissions;
  }) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;
  resetUserPassword: (id: string, newPassword: string) => Promise<boolean>;
  checkUserPermission: (permission: keyof UserPermissions) => boolean;
  getUserById: (id: string) => User | undefined;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur peut créer de nouveaux utilisateurs (max 3 pour PRO)
  const canCreateUser = authUser?.company.subscription === 'pro' && 
    users.filter(u => u.role === 'user').length < 3;

  // Écouter les changements des utilisateurs
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    setIsLoading(true);
    const entrepriseId = authUser.id;

    const usersQuery = query(
      collection(db, 'users'),
      where('entrepriseId', '==', entrepriseId)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUsers(usersData);
      
      // Trouver l'utilisateur actuel
      const current = usersData.find(u => u.email === authUser.email);
      setCurrentUser(current || null);
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, authUser]);

  const addUser = async (userData: {
    name: string;
    email: string;
    password: string;
    permissions: UserPermissions;
  }): Promise<boolean> => {
    if (!authUser || authUser.company.subscription !== 'pro') {
      throw new Error('Fonctionnalité réservée aux comptes PRO');
    }

    if (!canCreateUser) {
      throw new Error('Limite de 3 utilisateurs atteinte pour l\'abonnement PRO');
    }

    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUserId = userCredential.user.uid;

      // Ajouter l'utilisateur dans Firestore
      await addDoc(collection(db, 'users'), {
        firebaseId: firebaseUserId,
        name: userData.name,
        email: userData.email,
        role: 'user',
        permissions: userData.permissions,
        isActive: true,
        entrepriseId: authUser.id,
        createdBy: authUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return false;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'users', id), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'users', id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return false;
    }
  };

  const toggleUserStatus = async (id: string): Promise<boolean> => {
    const user = users.find(u => u.id === id);
    if (!user) return false;

    return await updateUser(id, { isActive: !user.isActive });
  };

  const resetUserPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
      // Note: En production, il faudrait utiliser les fonctions Firebase Admin
      // Pour cette démo, on simule la réinitialisation
      console.log(`Réinitialisation du mot de passe pour l'utilisateur ${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return false;
    }
  };

  const checkUserPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin a tous les droits
    return currentUser.permissions[permission];
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const value = {
    users,
    currentUser,
    isLoading,
    canCreateUser,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    checkUserPermission,
    getUserById
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}