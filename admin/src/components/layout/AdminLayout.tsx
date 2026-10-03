import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useAdmin } from '../../context/AdminContext';

export const AdminLayout: React.FC = () => {
  const { currentUser, isBackendConnected, backendError, syncWithBackend } = useAdmin();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <TopHeader />
        <main className="w-full pt-20 px-8 pb-12 max-w-[1600px] flex-1">
          {!isBackendConnected && backendError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Backend Server Offline</h4>
                  <p className="text-xs text-red-700/90 mt-0.5">
                    {backendError} (Port 4000). Ensure the backend service is running to view, verify, and update registry data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => syncWithBackend()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
