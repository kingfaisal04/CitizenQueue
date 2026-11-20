/**
 * CitizenQueue - Public Landing Page
 * 
 * Route: `/`
 * 
 * Reimagined as a modern, high-production Senior High School Admission & Service
 * Orchestration Platform for the Ghanaian educational system post-CSSPS placement.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  FileCheck2,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  School,
  ShoppingBag,
  ChevronDown,
  Search,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InstitutionService } from '../../services/institutionService';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsCitizen } = useAuth();
  const [indexQuery, setIndexQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // Live System Analytics State (Computed from MongoDB Atlas database)
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalSchools: 0,
    queueReductionRate: 80,
    totalCapacity: 0,
    verificationRate: 100,
    isLive: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLiveAnalytics() {
      try {
        const data = await InstitutionService.getPublicAnalytics();
        if (isMounted && data) {
          setAnalytics({
            totalStudents: data.totalStudents ?? 0,
            totalSchools: data.totalSchools ?? 0,
            queueReductionRate: data.queueReductionRate ?? 80,
            totalCapacity: data.totalCapacity ?? 0,
            verificationRate: data.verificationRate ?? 100,
            isLive: true,
          });
        }
      } catch (err) {
        console.warn('System analytics fallback to default operational baselines:', err);
      }
    }
    loadLiveAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (indexQuery.trim()) {
      loginAsCitizen({
        name: 'Emmanuel Mensah',
        beceIndexNumber: indexQuery.trim(),
        assignedSchool: 'Achimota Senior High School',
        programme: 'General Science',
        residentialStatus: 'Boarding'
      });
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const workflowSteps = [
    {
      num: '01',
      title: 'Confirm Placement & Bio-Data',
      icon: School
    },
    {
      num: '02',
      title: 'Digital Prospectus Checklist',
      icon: ShoppingBag
    },
    {
      num: '03',
      title: 'Document Pre-Verification',
      icon: FileCheck2
    },
    {
      num: '04',
      title: 'Reserve Reporting Slot',
      icon: CalendarCheck
    }
  ];

  const studentBenefits = [
    'No more waking up at 4:00 AM to rush for informal spots in school compound queues.',
    'Eliminate repeated journeys caused by missing photocopies or incorrect uniform tailoring.',
    'Clear digital prospectus with exact quantities, measurements, and acquired checklists.',
    'Predictable, scheduled arrival time slots matched to your school’s daily staff intake capacity.'
  ];

  const institutionBenefits = [
    'Eliminate morning crowd spikes and chaotic admission-week campus congestion.',
    'Incoming candidates arrive with pre-screened documents and compliant supplies.',
    'Live dashboard tracking arrivals, verified candidates, and pending admissions.',
    'Proactively identify administrative bottlenecks before they manifest as physical queues.'
  ];

  const faqs = [
    {
      q: 'Does CitizenQueue replace CSSPS?',
      a: 'No. CSSPS handles student placement. CitizenQueue coordinates the administrative admission process AFTER placement is received, preparing students before they physically report.'
    },
    {
      q: 'Do students still need to report physically on campus?',
      a: 'Yes. Online preliminary document screening dramatically accelerates verification, but in-person identity verification and physical original inspection on reporting day remain mandatory by Ghana Education Service regulations.'
    },
    {
      q: 'Is there any fee to book a reporting appointment?',
      a: 'No. CitizenQueue operates under strict queue fairness principles. There is zero fee and zero paid priority jumping for appointments.'
    },
    {
      q: 'Can parents reschedule their arrival date?',
      a: 'Yes. Reporting appointments can be easily rescheduled from the candidate dashboard, which instantly releases the slot back to other families in real time.'
    },
    {
      q: 'What should we bring on our scheduled reporting day?',
      a: 'Bring your physical originals (BECE slip, placement form, birth certificate, passport photos) and acquired prospectus supplies in compliance with your school’s checklist.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cqTeal-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute -top-24 right-10 w-72 h-72 bg-cqTeal-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cqNavy-800/90 border border-cqNavy-700 text-xs font-semibold text-cqTeal-300 shadow-sm">
            <School size={14} className="text-cqTeal-400" />
            <span>Ghana Senior High School Admission Orchestration</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Senior High School Admissions,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cqTeal-300 via-cqTeal-400 to-emerald-400">
              Simplified.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Verify credentials, check your prospectus, and reserve your reporting slot in minutes.
          </p>

          {/* Quick BECE Placement Lookup Box */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl">
            <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter 10-Digit BECE Index Number..."
                  value={indexQuery}
                  onChange={(e) => setIndexQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cqTeal-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cqTeal-500 hover:bg-cqTeal-400 text-cqNavy-950 font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Check Status</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 pt-2">
            {/* <Link to="/register" className="hover:text-white underline underline-offset-4">
              New Candidate Registration
            </Link> */}
        
            {/* <Link to="/login" className="hover:text-white underline underline-offset-4">
              Sign In to Candidate Dashboard
            </Link>
             */}
            <Link to="/book" className="hover:text-white">
              View Available Reporting Slots
            </Link>
          </div>

          {/* Real-time System Analysis Bar */}
          <div className="pt-10 max-w-4xl mx-auto border-t border-cqNavy-800/80 space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-cqTeal-300 font-mono tracking-wide uppercase text-[10px]">
                {analytics.isLive ? 'Live System Operational Analysis' : 'Operational System Metrics'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800 hover:border-cqTeal-500/30 transition-colors">
                <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">
                  {analytics.totalStudents > 0 ? analytics.totalStudents.toLocaleString() : '0'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Active Candidate Placements</p>
              </div>

              <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800 hover:border-cqTeal-500/30 transition-colors">
                <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">
                  {analytics.queueReductionRate}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Arrival Queue Reduction</p>
              </div>

              <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800 hover:border-cqTeal-500/30 transition-colors">
                <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">
                  {analytics.totalSchools > 0 ? analytics.totalSchools : '0'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Participating Institutions</p>
              </div>

              <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800 hover:border-cqTeal-500/30 transition-colors">
                <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">
                  {analytics.totalCapacity > 0 ? `${(analytics.totalCapacity / 1000).toFixed(1)}K` : `${analytics.verificationRate}%`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {analytics.totalCapacity > 0 ? 'Intake Slots Allocated' : 'Pre-Screened Clearance'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP WORKFLOW JOURNEY */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cqTeal-600">
              Orderly Four-Stage Journey
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-cqNavy-950 tracking-tight">
              From Placement Slip to Campus Enrollment
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Complete administrative prerequisites at your own pace before stepping onto school grounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-cqTeal-300 hover:shadow-md transition-all space-y-4 group"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-cqNavy-950 text-cqTeal-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DUAL BENEFIT PERSPECTIVES (STUDENTS VS SCHOOLS) */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cqTeal-600">
              Why CitizenQueue Works
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-cqNavy-950 tracking-tight">
              Built for Families and School Administrators
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
          
                <h3 className="text-xl font-bold text-slate-900">
                  For Students and Guardians
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Eliminating the anxiety and uncertainty of traveling to campus without clear requirements.
                </p>

                <ul className="space-y-3 pt-2">
                  {studentBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle2 size={16} className="text-cqTeal-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cqTeal-700 hover:text-cqTeal-800"
                >
                  <span>Register Student Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* School Administration Card */}
            <div className="p-8 rounded-3xl bg-cqNavy-950 text-white border border-cqNavy-900 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
               
                <h3 className="text-xl font-bold text-white">
                  For School Heads & Desk Officers
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Controlling daily campus intake quotas and expediting document verification.
                </p>

                <ul className="space-y-3 pt-2">
                  {institutionBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                      <CheckCircle2 size={16} className="text-cqTeal-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-cqNavy-900">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cqTeal-300 hover:text-cqTeal-200"
                >
                  <span>Access Staff Desk Console</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            
            <h3 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-cqTeal-700"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cqTeal-600' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
