"use client";
import React, { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showSuccess = (msg: string) => toast.success(msg);
  const showError = (msg: string) => toast.error(msg);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
