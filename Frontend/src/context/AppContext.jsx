/**
 * CitizenQueue - Global Application Context
 * 
 * Provides global non-blocking toast notifications, notification dismissal,
 * and application-level feedback states.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a toast notification
   * @param {string} message - Notification text
   * @param {'success'|'error'|'warning'|'info'} type - Toast type
   * @param {number} duration - Auto-dismiss timeout in ms
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  /**
   * Remove a specific toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Global Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-700';
          let Icon = Info;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-900 text-emerald-100 border-emerald-700';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-900 text-rose-100 border-rose-700';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-900 text-amber-100 border-amber-700';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgClass}`}
              role="alert"
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium leading-snug">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

