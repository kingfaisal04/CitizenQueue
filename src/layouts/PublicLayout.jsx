/**
 * CitizenQueue - Public & Citizen Layout
 * 
 * Standard wrapper with Demo Banner, Main Navbar, Dynamic Page Outlet, and Footer.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import DemoBanner from '../components/common/DemoBanner';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
