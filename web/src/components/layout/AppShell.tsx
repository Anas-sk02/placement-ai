'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastProvider } from '../ui/Toast';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
};
