/**
 * CitizenQueue - 404 Not Found Page
 * 
 * Friendly error page when a requested URL does not match any route.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Calendar } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
        <Compass size={32} className="text-cqTeal-600" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-cqTeal-700">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-cqNavy-950">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          The requested page or administrative resource could not be located. Please check the URL or return to your dashboard.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-cqNavy-950 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-cqNavy-900 shadow-xs"
        >
          <Home size={16} />
          <span>Go Home</span>
        </Link>
        <Link
          to="/book"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-cqTeal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-cqTeal-700 shadow-xs"
        >
          <Calendar size={16} />
          <span>Reporting Schedule</span>
        </Link>
      </div>
    </div>
  );
}
