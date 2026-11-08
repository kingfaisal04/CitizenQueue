/**
 * CitizenQueue - Public & Citizen Layout
 * 
 * Clean, production-grade layout wrapper with responsive Navbar,
 * dynamic page content, and institutional Footer.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
