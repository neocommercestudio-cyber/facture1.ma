import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import { LicenseProvider } from './contexts/LicenseContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import HomePage from './components/home/HomePage';
import UnifiedLogin from './components/auth/UnifiedLogin';
import Dashboard from './components/dashboard/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProtectedRoute from './components/layout/ProtectedRoute';
import InvoicesList from './components/invoices/InvoicesList';
import CreateInvoice from './components/invoices/CreateInvoice';
import QuotesList from './components/quotes/QuotesList';
import CreateQuote from './components/quotes/CreateQuote';
import ClientsList from './components/clients/ClientsList';
import ProductsList from './components/products/ProductsList';
import Settings from './components/settings/Settings';
import Reports from './components/reports/Reports';
import UserManagement from './components/users/UserManagement';
import LicenseAlert from './components/license/LicenseAlert';
import UpgradePage from './components/license/UpgradePage';
import ExpiryAlert from './components/license/ExpiryAlert';
import ProUpgradeSuccess from './components/license/ProUpgradeSuccess';
import { useLicense } from './contexts/LicenseContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import StockManagement from './components/stock/StockManagement';
import HRManagement from './components/hr/HRManagement';

function AppContent() {
  const { user, isAuthenticated, showExpiryAlert, setShowExpiryAlert, expiredDate } = useAuth();
  const { showSuccessModal, setShowSuccessModal, upgradeExpiryDate } = useLicense();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpgradePage, setShowUpgradePage] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LicenseAlert onUpgrade={() => setShowUpgradePage(true)} />
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        onUpgrade={() => setShowUpgradePage(true)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute requiredPermission="dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredPermission="dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute requiredPermission="invoices">
                <InvoicesList />
              </ProtectedRoute>
            } />
            <Route path="/invoices/create" element={
              <ProtectedRoute requiredPermission="invoices">
                <CreateInvoice />
              </ProtectedRoute>
            } />
            <Route path="/quotes" element={
              <ProtectedRoute requiredPermission="quotes">
                <QuotesList />
              </ProtectedRoute>
            } />
            <Route path="/quotes/create" element={
              <ProtectedRoute requiredPermission="quotes">
                <CreateQuote />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute requiredPermission="clients">
                <ClientsList />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute requiredPermission="products">
                <ProductsList />
              </ProtectedRoute>
            } />
            <Route path="/stock-management" element={
              <ProtectedRoute requiredPermission="stockManagement">
                <StockManagement />
              </ProtectedRoute>
            } />
            <Route path="/hr-management" element={
              <ProtectedRoute requiredPermission="hrManagement">
                <HRManagement />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="reports">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute 
                requiredPermission="settings"
                fallbackMessage="Seuls les administrateurs peuvent gérer les utilisateurs."
              >
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="settings">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      
      {showUpgradePage && (
        <UpgradePage onClose={() => setShowUpgradePage(false)} />
      )}
      
      {showExpiryAlert && expiredDate && (
        <ExpiryAlert
          isOpen={showExpiryAlert}
          onRenew={() => {
            setShowExpiryAlert(false);
            setShowUpgradePage(true);
          }}
          onLater={() => setShowExpiryAlert(false)}
          expiryDate={expiredDate}
        />
      )}
      
      {showSuccessModal && upgradeExpiryDate && (
        <ProUpgradeSuccess
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          expiryDate={upgradeExpiryDate}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <UserManagementProvider>
              <LicenseProvider>
                <AppContent />
              </LicenseProvider>
            </UserManagementProvider>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;