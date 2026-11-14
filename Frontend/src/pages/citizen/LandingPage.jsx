/**
 * CitizenQueue - Public Landing Page
 * 
 * Route: `/`
 * 
 * Reimagined as a modern, high-production Senior High School Admission & Service
 * Orchestration Platform for the Ghanaian educational system post-CSSPS placement.
 */

import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsCitizen } = useAuth();
  const [indexQuery, setIndexQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

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
      desc: 'Verify your assigned school and programme after receiving your official CSSPS placement results.',
      icon: School
    },
    {
      num: '02',
      title: 'Digital Prospectus Checklist',
      desc: 'Review mandatory school supplies, partitioned into general items and boy/girl uniform specifications.',
      icon: ShoppingBag
    },
    {
      num: '03',
      title: 'Document Pre-Verification',
      desc: 'Submit your BECE Result Slip and Birth Certificate online so school administrators can review them before you travel.',
      icon: FileCheck2
    },
    {
      num: '04',
      title: 'Reserve Reporting Slot',
      desc: 'Pick an orderly physical arrival intake window to finalize registration on campus without chaotic queues.',
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
            <Link to="/register" className="hover:text-white underline underline-offset-4">
              New Candidate Registration
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-white underline underline-offset-4">
              Sign In to Candidate Dashboard
            </Link>
            <span>•</span>
            <Link to="/book" className="hover:text-white underline underline-offset-4">
              View Available Reporting Slots
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-cqNavy-800/80">
            <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800">
              <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">450K+</p>
              <p className="text-xs text-slate-400 mt-1">CSSPS Placements Supported</p>
            </div>
            <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800">
              <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">80%</p>
              <p className="text-xs text-slate-400 mt-1">Arrival Queue Reduction</p>
            </div>
            <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800">
              <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">100%</p>
              <p className="text-xs text-slate-400 mt-1">Zero Priority Fees / Fair</p>
            </div>
            <div className="p-4 rounded-2xl bg-cqNavy-900/60 border border-cqNavy-800">
              <p className="text-2xl sm:text-3xl font-black text-cqTeal-300">GES</p>
              <p className="text-xs text-slate-400 mt-1">Standardized Guidelines</p>
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
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cqNavy-950 text-cqTeal-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {step.num}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
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
                <div className="w-10 h-10 rounded-xl bg-cqTeal-50 text-cqTeal-700 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
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
                <div className="w-10 h-10 rounded-xl bg-cqNavy-800 text-cqTeal-300 flex items-center justify-center font-bold border border-cqNavy-700">
                  <Building2 size={20} />
                </div>
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-cqTeal-600">
              Clear Answers
            </h2>
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

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-cqNavy-800 text-cqTeal-400 flex items-center justify-center mx-auto border border-cqNavy-700 shadow-sm">
            <School size={24} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Have Your Placement Slip Ready?
          </h2>

          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Register your candidate admission profile now, review your school’s digital prospectus, and secure your physical reporting slot.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cqTeal-500 hover:bg-cqTeal-400 text-cqNavy-950 font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Register Admission Profile</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cqNavy-800 hover:bg-cqNavy-700 text-white font-semibold text-sm transition-all border border-cqNavy-700"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
