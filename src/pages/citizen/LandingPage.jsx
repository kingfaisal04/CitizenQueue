/**
 * CitizenQueue - Public Landing Page
 * 
 * Route: `/`
 * 
 * Reimagined as a modern Senior High School Admission & Service Orchestration Platform.
 * Communicates the platform vision, coordinates pre-arrival administrative tasks,
 * highlights student/guardian and school benefits, and outlines future capabilities.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  FileCheck2,
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  School,
  ShoppingBag,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const workflowSteps = [
    {
      num: '01',
      title: 'Confirm Placement & Bio-data',
      desc: 'Enter your verified CSSPS placement details, confirm enrolled programme, and register primary guardian emergency contacts.',
      icon: School
    },
    {
      num: '02',
      title: 'Digital Prospectus & Item Check',
      desc: 'Inspect exact uniform cuts, trunk dimensions, and stationery specifications. Upload item photos for early desk feedback.',
      icon: ShoppingBag
    },
    {
      num: '03',
      title: 'Upload Documents for Review',
      desc: 'Submit scanned copies of your BECE slip, Placement Slip, and Birth Certificate for preliminary verification before travelling.',
      icon: FileCheck2
    },
    {
      num: '04',
      title: 'Schedule Your Reporting Slot',
      desc: 'Once pre-arrival readiness is confirmed, book a reserved physical arrival slot to finalize registration without chaotic queues.',
      icon: CalendarCheck
    }
  ];

  const studentBenefits = [
    'No more waking up at 4:00 AM to hold informal spots in physical queues on school grounds.',
    'Eliminate repeated journeys caused by forgotten photocopies or incorrect trunk sizes.',
    'Clear, categorized digital prospectus with exact dimensions and preliminary item photo checks.',
    'Dignified, predictable reporting appointments matched to the school’s daily intake capacity.'
  ];

  const institutionBenefits = [
    'Smooth out morning crowd spikes and prevent campus traffic congestion during admission week.',
    'Incoming students arrive with pre-screened documents and compliant prospectus items.',
    'Real-time administrative visibility over checked-in candidates versus scheduled arrivals.',
    'Proactively identify administrative bottlenecks before they manifest as physical queues.'
  ];

  const faqs = [
    {
      q: 'Does CitizenQueue replace the Computerized School Selection and Placement System (CSSPS)?',
      a: 'No. CSSPS handles student placement into senior high schools. CitizenQueue steps in AFTER you receive your placement to coordinate the administrative admission and onboarding process before you physically arrive on campus.'
    },
    {
      q: 'Does preliminary photo approval replace physical inspection of prospectus items?',
      a: 'No. Preliminary photo submission allows school administrators to flag incorrect items early (such as oversized trunks or non-conforming uniforms). However, mandatory physical inspection of items and original certificates is still conducted by house masters on reporting day.'
    },
    {
      q: 'Do I have to pay to book an admission appointment?',
      a: 'Absolutely not. CitizenQueue operates under strict fairness principles. There is no paid prioritization, VIP queue jumping, or fee charged for scheduling your reporting slot.'
    },
    {
      q: 'Can I reschedule my reporting appointment if travel plans change?',
      a: 'Yes. You can manage, reschedule, or cancel your reporting slot from your student dashboard, which automatically releases the seat back to other families in real time.'
    },
    {
      q: 'What documents must I bring on reporting day?',
      a: 'Even after uploading documents online, you must present original copies of your BECE Result Slip, CSSPS Placement Form, Birth Certificate, and Passport Photographs in an envelope on your scheduled reporting day.'
    }
  ];

  const futureModules = [
    {
      title: 'Official CSSPS Automated Integration',
      desc: 'Direct programmatic sync with the CSSPS database to auto-populate placement slips without manual entry.',
      status: 'Coming Later'
    },
    {
      title: 'Authorized NIA / Ghana Card Identity Verification',
      desc: 'Secure identity confirmation connecting directly with National Identification Authority APIs.',
      status: 'Coming Later'
    },
    {
      title: 'SMS & WhatsApp Appointment Alerts',
      desc: 'Automated SMS reminders with time slot tokens and reporting desk directions for guardians.',
      status: 'Coming Later'
    },
    {
      title: 'USSD Access for Non-Smartphone Users',
      desc: 'A *920# shortcode service allowing guardians without internet access to confirm reporting dates.',
      status: 'Coming Later'
    },
    {
      title: 'Boarding House Dynamic Bed Allocation',
      desc: 'Automated dormitory cubicle assignment based on verified medical conditions and arrival schedules.',
      status: 'Coming Later'
    },
    {
      title: 'AI-Assisted Waiting Time Predictions',
      desc: 'Predictive queue analytics forecasting desk processing speeds based on historical admission flow.',
      status: 'Coming Later'
    }
  ];

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200">
        
        {/* Decorative blur spheres */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cqTeal-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cqNavy-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cqTeal-50 border border-cqTeal-200 text-cqTeal-800 text-xs font-semibold shadow-xs">
              <School size={14} className="text-cqTeal-600" />
              <span>Senior High School Admission & Service Orchestration</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-cqNavy-950 tracking-tight leading-[1.1]">
              Your Admission Journey. <span className="text-cqTeal-600">Simplified.</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Manage your admission requirements, submit documents, track your readiness and schedule your school reporting visit, all from one platform.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm shadow-md transition-all group"
              >
                <span>Get Started</span>
                <ArrowRight size={16} className="text-cqTeal-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-colors"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Reassurance text */}
            <p className="text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Designed for Ghanaian Senior High Schools • Free for students and parents</span>
            </p>
          </div>

          {/* Admission Preview Mockup Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cqTeal-700 bg-cqTeal-50 px-2 py-0.5 rounded">
                  Live Admission Orchestration
                </span>
                <h3 className="text-base font-bold text-cqNavy-950 mt-1">
                  Achimota Senior High School — 2026 Admissions
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={13} />
                  Pre-Arrival Screening Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Candidate</p>
                <p className="text-xs font-bold text-slate-900 truncate">Emmanuel Mensah</p>
                <p className="text-[10px] text-cqTeal-600 font-mono">101245089</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Programme</p>
                <p className="text-xs font-bold text-slate-900">General Science</p>
                <p className="text-[10px] text-slate-500">Boarding Status</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Readiness Score</p>
                <p className="text-xs font-bold text-emerald-700">82% Verified</p>
                <p className="text-[10px] text-slate-500">Stage 5 of 9</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Reporting Slot</p>
                <p className="text-xs font-bold text-slate-900">27 Oct, 08:30 AM</p>
                <p className="text-[10px] text-cqNavy-700 font-mono">CQ-2026-882101</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW CITIZENQUEUE WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-cqTeal-600 uppercase tracking-widest">
              Four-Step Digital Journey
            </span>
            <h2 className="text-3xl font-black text-cqNavy-950 sm:text-4xl">
              How CitizenQueue Works
            </h2>
            <p className="text-sm text-slate-600">
              Coordinating administrative tasks online before physical arrival saves hours of waiting and prevents unnecessary journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50 hover:bg-slate-100/70 rounded-3xl p-6 border border-slate-200 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-cqTeal-600">
                        <Icon size={22} />
                      </div>
                      <span className="text-2xl font-black text-slate-300 font-mono">
                        {step.num}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BENEFITS COMPARISON: STUDENTS VS INSTITUTIONS */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-cqTeal-600 uppercase tracking-widest">
              Impact & Value
            </span>
            <h2 className="text-3xl font-black text-cqNavy-950 sm:text-4xl">
              Built for Families and Schools Alike
            </h2>
            <p className="text-sm text-slate-600">
              Transforming admission from a chaotic physical bottleneck into an orderly service orchestration experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Student & Guardian Benefits */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cqTeal-50 text-cqTeal-700 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cqNavy-950">For Students & Guardians</h3>
                  <p className="text-xs text-slate-500">Clarity, convenience and peace of mind</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {studentBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-cqTeal-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution Benefits */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cqNavy-950">For Senior High Schools</h3>
                  <p className="text-xs text-slate-500">Operational control and queue prevention</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {institutionBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-cqNavy-800 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FUTURE CAPABILITIES (VISUAL PLACEHOLDERS ONLY) */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
              <Sparkles size={12} />
              <span>Product Roadmap & Architecture</span>
            </div>
            <h2 className="text-3xl font-black text-cqNavy-950 sm:text-4xl">
              Future Capabilities & Expansion
            </h2>
            <p className="text-sm text-slate-600">
              CitizenQueue is designed to expand across Ghanaian public services. These planned integrations are clearly designated as future modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureModules.map((module, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {module.status}
                  </span>
                  <Sparkles size={14} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{module.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{module.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-slate-400 italic">
            * Note: Demonstration only. Future modules will require formal inter-agency agreements and authorized API credentials before deployment.
          </p>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-cqTeal-600 uppercase tracking-widest">
              Answers & Policies
            </span>
            <h2 className="text-3xl font-black text-cqNavy-950">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about navigating your senior high school admission with CitizenQueue.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-cqTeal-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cqTeal-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-16 bg-cqNavy-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-900 px-3 py-1 rounded-full border border-cqNavy-800">
            <Sparkles size={12} />
            <span>Ready to Begin?</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start Your Admission Journey Today
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Take control of your Senior High School admission onboarding before arriving on campus. No stress, no unorganized lines.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cqTeal-600 hover:bg-cqTeal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Student Command Centre</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cqNavy-900 hover:bg-cqNavy-800 text-slate-200 font-bold text-sm border border-cqNavy-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Staff Portal</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
