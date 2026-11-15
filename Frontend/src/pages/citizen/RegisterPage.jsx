/**
 * CitizenQueue - Authentication: Sign Up & Candidate Registration Page
 * 
 * Route: `/register` (and `/signup`)
 * 
 * Allows new students and guardians to register their admission profile,
 * specify CSSPS placement information, guardian emergency details, and
 * generate their Admission Command Centre profile with 1-click test fill support.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  Shield,
  Phone,
  Mail,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  FileCheck2,
  Calendar,
  Search,
  X,
  Check,
  ChevronDown,
  MapPin,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InstitutionService } from '../../services/institutionService';

// Fallback catalog of Ghanaian Senior High Schools (Category A & B)
const FALLBACK_SCHOOLS = [
  { id: 'inst-1', schoolId: 'inst-1', name: 'Achimota Senior High School', shortName: 'Achimota', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-2', schoolId: 'inst-2', name: 'Prempeh College', shortName: 'Prempeh', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-3', schoolId: 'inst-3', name: 'Tamale Senior High School', shortName: 'Tamasco', region: 'Northern', town: 'Tamale', category: 'Category A' },
  { id: 'inst-4', schoolId: 'inst-4', name: 'Presbyterian Boys\' Secondary School (PRESEC Legon)', shortName: 'PRESEC Legon', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-5', schoolId: 'inst-5', name: 'Mfantsipim School', shortName: 'Kwabotwe', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-6', schoolId: 'inst-6', name: 'Wesley Girls\' High School', shortName: 'Wey Gey Hey', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-7', schoolId: 'inst-7', name: 'Opoku Ware School', shortName: 'OWASS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-8', schoolId: 'inst-8', name: 'Adisadel College', shortName: 'Adisco', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-9', schoolId: 'inst-9', name: 'St. Augustine\'s College', shortName: 'Augusco', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-10', schoolId: 'inst-10', name: 'Accra Academy', shortName: 'Bleoo', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-11', schoolId: 'inst-11', name: 'Holy Child School', shortName: 'Holico', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-12', schoolId: 'inst-12', name: 'St. Peter\'s Senior High School (PERSCO)', shortName: 'PERSCO', region: 'Eastern', town: 'Nkwatia', category: 'Category A' },
  { id: 'inst-13', schoolId: 'inst-13', name: 'Aburi Girls\' Senior High School', shortName: 'ABUGISS', region: 'Eastern', town: 'Aburi', category: 'Category A' },
  { id: 'inst-14', schoolId: 'inst-14', name: 'St. Louis Senior High School', shortName: 'St. Louis', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-15', schoolId: 'inst-15', name: 'Kumasi High School', shortName: 'KUHIS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-16', schoolId: 'inst-16', name: 'Yaa Asantewaa Girls\' Senior High School', shortName: 'YAGSHS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-17', schoolId: 'inst-17', name: 'Pope John Senior High School and Minor Seminary', shortName: 'POJOSS', region: 'Eastern', town: 'Koforidua', category: 'Category A' },
  { id: 'inst-18', schoolId: 'inst-18', name: 'Ghana National College', shortName: 'Ghanacoll', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-19', schoolId: 'inst-19', name: 'Keta Senior High Technical School', shortName: 'Ketasco', region: 'Volta', town: 'Keta', category: 'Category A' },
  { id: 'inst-20', schoolId: 'inst-20', name: 'Ghana Secondary Technical School (GSTS)', shortName: 'GSTS', region: 'Western', town: 'Takoradi', category: 'Category A' },
  { id: 'inst-21', schoolId: 'inst-21', name: 'Mawuli School', shortName: 'Mawuli', region: 'Volta', town: 'Ho', category: 'Category A' },
  { id: 'inst-22', schoolId: 'inst-22', name: 'St. Rose\'s Senior High School', shortName: 'ROSEC', region: 'Eastern', town: 'Akwatia', category: 'Category A' },
  { id: 'inst-23', schoolId: 'inst-23', name: 'Bishop Herman College', shortName: 'BIHECO', region: 'Volta', town: 'Kpando', category: 'Category A' },
  { id: 'inst-24', schoolId: 'inst-24', name: 'Archbishop Porter Girls\' Secondary School', shortName: 'APGSS', region: 'Western', town: 'Takoradi', category: 'Category A' },
  { id: 'inst-25', schoolId: 'inst-25', name: 'Sunyani Senior High School', shortName: 'SUSEC', region: 'Bono', town: 'Sunyani', category: 'Category B' },
  { id: 'inst-26', schoolId: 'inst-26', name: 'Bolgatanga Senior High School', shortName: 'Big BOSS', region: 'Upper East', town: 'Bolgatanga', category: 'Category B' },
  { id: 'inst-27', schoolId: 'inst-27', name: 'Wa Senior High School', shortName: 'WASEC', region: 'Upper West', town: 'Wa', category: 'Category B' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    beceIndexNumber: '',
    assignedSchool: 'Achimota Senior High School',
    schoolId: 'inst-1',
    programme: 'General Science',
    residentialStatus: 'Boarding',
    aggregateScore: '08',
    juniorHighSchool: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    guardianEmail: '',
    homeTown: '',
    pin: '',
    confirmPin: ''
  });

  const [showPin, setShowPin] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // School Autocomplete States
  const [schools, setSchools] = useState(FALLBACK_SCHOOLS);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('Achimota Senior High School');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef(null);
  const schoolInputRef = useRef(null);

  // Load institutions from database on mount, merging with rich fallback catalog
  useEffect(() => {
    let isMounted = true;
    const fetchSchools = async () => {
      try {
        const liveSchools = await InstitutionService.getAll();
        if (isMounted && Array.isArray(liveSchools) && liveSchools.length > 0) {
          const map = new Map();
          // Add backend live schools
          liveSchools.forEach((s) => {
            const key = (s.name || '').toLowerCase().trim();
            if (key) {
              map.set(key, {
                id: s.schoolId || s._id || s.id || `sch-${map.size + 1}`,
                schoolId: s.schoolId || s._id || s.id,
                name: s.name,
                shortName: s.shortName || s.name,
                region: s.region || 'Ghana',
                town: s.town || '',
                category: s.category || 'Senior High School'
              });
            }
          });
          // Merge fallback catalog without overriding database entries
          FALLBACK_SCHOOLS.forEach((fallback) => {
            const key = fallback.name.toLowerCase().trim();
            if (!map.has(key)) {
              map.set(key, fallback);
            }
          });
          setSchools(Array.from(map.values()));
        }
      } catch {
        // Fallback catalog remains active if API is uncontactable
      }
    };
    fetchSchools();
    return () => { isMounted = false; };
  }, []);

  // Close floating suggestions dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setIsSchoolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Dynamic filter for suggestions as the candidate types
  const filteredSchools = useMemo(() => {
    const q = (schoolSearchQuery || '').trim().toLowerCase();
    if (!q) {
      return schools.slice(0, 10);
    }
    return schools.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const shortMatch = s.shortName ? s.shortName.toLowerCase().includes(q) : false;
      const regionMatch = s.region ? s.region.toLowerCase().includes(q) : false;
      const townMatch = s.town ? s.town.toLowerCase().includes(q) : false;
      return nameMatch || shortMatch || regionMatch || townMatch;
    }).slice(0, 12);
  }, [schools, schoolSearchQuery]);

  const handleSelectSchool = (school) => {
    setFormData((prev) => ({
      ...prev,
      assignedSchool: school.name,
      schoolId: school.schoolId || school.id || 'inst-1'
    }));
    setSchoolSearchQuery(school.name);
    setIsSchoolDropdownOpen(false);
    setFormError('');
  };

  const handleSchoolInputChange = (e) => {
    const val = e.target.value;
    setSchoolSearchQuery(val);
    setFormData((prev) => ({
      ...prev,
      assignedSchool: val
    }));
    setIsSchoolDropdownOpen(true);
    setFormError('');
  };

  const handleClearSchool = () => {
    setSchoolSearchQuery('');
    setFormData((prev) => ({
      ...prev,
      assignedSchool: '',
      schoolId: ''
    }));
    setIsSchoolDropdownOpen(true);
    if (schoolInputRef.current) {
      schoolInputRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  // 1-Click Fill Demo Candidate
  const handleFillDemoData = () => {
    setFormData({
      fullName: 'Emmanuel Mensah',
      beceIndexNumber: '101245089',
      assignedSchool: 'Achimota Senior High School',
      schoolId: 'inst-1',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      aggregateScore: '08',
      juniorHighSchool: "St. Theresa's Basic School, Kaneshie",
      guardianName: 'Kwame Mensah',
      guardianRelation: 'Father',
      guardianPhone: '+233 24 411 2233',
      guardianEmail: 'kwame.mensah@example.com',
      homeTown: 'Kasoa, Central Region',
      pin: 'Password123!',
      confirmPin: 'Password123!'
    });
    setSchoolSearchQuery('Achimota Senior High School');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Please enter the student full name.');
      return;
    }

    if (!formData.beceIndexNumber.trim() || formData.beceIndexNumber.trim().length < 8) {
      setFormError('Please enter a valid BECE Index Number (minimum 8-10 digits).');
      return;
    }

    if (!formData.assignedSchool || !formData.assignedSchool.trim()) {
      setFormError('Please select or enter your assigned Senior High School.');
      return;
    }

    if (!formData.guardianName.trim()) {
      setFormError('Parent or Guardian full name is required.');
      return;
    }

    if (!formData.guardianPhone.trim()) {
      setFormError('Parent or Guardian contact phone number is mandatory.');
      return;
    }

    if (!formData.pin || formData.pin.length < 8) {
      setFormError('Account password must be at least 8 characters long.');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setFormError('Account password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerCandidate({
        fullName: formData.fullName.trim(),
        beceIndexNumber: formData.beceIndexNumber.trim(),
        assignedSchool: formData.assignedSchool.trim(),
        schoolId: formData.schoolId || 'inst-1',
        programme: formData.programme,
        residentialStatus: formData.residentialStatus,
        aggregateScore: formData.aggregateScore,
        juniorHighSchool: formData.juniorHighSchool,
        guardianName: formData.guardianName.trim(),
        guardianRelation: formData.guardianRelation,
        guardianPhone: formData.guardianPhone.trim(),
        guardianEmail: formData.guardianEmail.trim() || undefined,
        homeTown: formData.homeTown,
        password: formData.pin || 'Password123!',
        confirmPassword: formData.confirmPin || 'Password123!'
      });

      if (res.success) {
        setFormSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      } else {
        setFormError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-cqNavy-950 text-cqTeal-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <School size={24} />
        </div>
        <h1 className="text-3xl font-black text-cqNavy-950 tracking-tight">
          Register Admission Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Create your digital profile after receiving your CSSPS placement. Coordinate prospectus requirements, submit documents, and reserve your reporting slot.
        </p>
      </div>

      {/* Subtle evaluation autofill helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-2 text-slate-500">
        {/* <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Shield size={14} className="text-cqTeal-600 shrink-0" />
          Official 2026 Academic Cycle Senior High School Pre-Screening
        </span> */}
        {/* <button
          type="button"
          onClick={handleFillDemoData}
          className="inline-flex items-center gap-1 text-cqTeal-700 hover:text-cqTeal-800 font-semibold hover:underline self-start sm:self-auto"
        >
          <Sparkles size={13} />
          <span>Quick fill sample candidate</span>
        </button> */}
      </div>

      {/* Main Registration Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>Registration completed! Opening your Admission Command Centre...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Candidate Bio-data & Placement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <School size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  1. Candidate & Placement Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Student Full Name 
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    placeholder="Surname, First & Other Names"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    BECE Index Number 
                  </label>
                  <input
                    type="text"
                    required
                    name="beceIndexNumber"
                    placeholder="e.g. 101245089"
                    value={formData.beceIndexNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-mono"
                  />
                </div>

                <div className="space-y-1 relative" ref={schoolDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Assigned Senior High School *
                    </label>
                    <span className="text-[10px] text-cqTeal-600 font-medium hidden sm:inline">
                      Type to search school
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={15} />
                    </div>
                    <input
                      ref={schoolInputRef}
                      type="text"
                      required
                      placeholder="Type school name e.g. Achimota, PRESEC, Prempeh..."
                      value={schoolSearchQuery}
                      onChange={handleSchoolInputChange}
                      onFocus={() => setIsSchoolDropdownOpen(true)}
                      className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium transition-colors"
                      autoComplete="off"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-0.5">
                      {schoolSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSchool}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Clear school selection"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsSchoolDropdownOpen((prev) => !prev)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Toggle suggestions list"
                      >
                        <ChevronDown
                          size={15}
                          className={`transform transition-transform duration-200 ${
                            isSchoolDropdownOpen ? 'rotate-180 text-cqTeal-600' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Floating Suggestions Dropdown */}
                  {isSchoolDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Suggested Senior High Schools ({filteredSchools.length})</span>
                        <span className="text-[10px] text-slate-400">Select to assign</span>
                      </div>

                      <div className="overflow-y-auto divide-y divide-slate-50 py-1">
                        {filteredSchools.length > 0 ? (
                          filteredSchools.map((school) => {
                            const isSelected = formData.assignedSchool === school.name;
                            return (
                              <button
                                key={school.id || school.schoolId || school.name}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSchool(school);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 hover:bg-teal-50/70 transition-colors flex items-start justify-between gap-3 group ${
                                  isSelected ? 'bg-cqTeal-50/80' : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-bold truncate ${
                                        isSelected ? 'text-cqTeal-900' : 'text-slate-800 group-hover:text-cqTeal-900'
                                      }`}
                                    >
                                      {school.name}
                                    </span>
                                    {school.shortName && school.shortName !== school.name && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                                        {school.shortName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                    {school.region && (
                                      <span className="flex items-center gap-0.5">
                                        <MapPin size={11} className="text-slate-400 shrink-0" />
                                        <span>{school.region}</span>
                                      </span>
                                    )}
                                    {school.town && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <span>{school.town}</span>
                                      </>
                                    )}
                                    {school.category && (
                                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                        {school.category}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="shrink-0 mt-1 text-cqTeal-600">
                                    <Check size={16} />
                                  </div>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center space-y-1.5">
                            <p className="text-xs font-semibold text-slate-700">
                              No matching registered school found
                            </p>
                            <p className="text-[11px] text-slate-500">
                              You can continue typing <strong>"{schoolSearchQuery}"</strong> to register with your custom school name.
                            </p>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setIsSchoolDropdownOpen(false);
                              }}
                              className="mt-1 text-xs font-bold text-cqTeal-700 hover:text-cqTeal-800 hover:underline"
                            >
                              Use "{schoolSearchQuery}" as assigned school
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Enrolled Academic Programme *
                  </label>
                  <select
                    name="programme"
                    value={formData.programme}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    <option value="General Science">General Science</option>
                    <option value="General Arts">General Arts</option>
                    <option value="Business">Business</option>
                    <option value="Visual Arts">Visual Arts</option>
                    <option value="Home Economics">Home Economics</option>
                    <option value="Agricultural Science">Agricultural Science</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Residential Status *
                  </label>
                  <select
                    name="residentialStatus"
                    value={formData.residentialStatus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium"
                  >
                    <option value="Boarding">Boarding Student</option>
                    <option value="Day">Day Student</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    BECE Raw Aggregate Score
                  </label>
                  <input
                    type="text"
                    name="aggregateScore"
                    placeholder="e.g. 08"
                    value={formData.aggregateScore}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Junior High School (JHS) Attended
                  </label>
                  <input
                    type="text"
                    name="juniorHighSchool"
                    placeholder="e.g. St. Theresa's Basic School"
                    value={formData.juniorHighSchool}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Guardian Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Parent or Guardian Emergency Contacts
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="guardianName"
                    placeholder="e.g. Kwame Mensah"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Relationship to Student *
                  </label>
                  <input
                    type="text"
                    name="guardianRelation"
                    placeholder="e.g. Father, Mother, Guardian"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Phone size={12} className="text-cqTeal-600" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="guardianPhone"
                    placeholder="e.g. +233 24 411 2233"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                  <p className="text-[10px] text-slate-400">Used for account sign-in & SMS password recovery OTP.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Mail size={12} className="text-cqTeal-600" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    placeholder="e.g. kwame.mensah@example.com"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                  <p className="text-[10px] text-slate-400">Used for digital receipts & email password recovery OTP.</p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Home Town & Region
                  </label>
                  <input
                    type="text"
                    name="homeTown"
                    placeholder="e.g. Kasoa, Central Region"
                    value={formData.homeTown}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Access Code */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Lock size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  3. Account Password
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter secure password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    name="confirmPin"
                    placeholder="Re-enter password"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>
            </div>

            {/* Security and Privacy Notice */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Shield size={15} className="text-cqTeal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Data Protection:</strong> In compliance with the Ghana Data Protection Act (Act 843), your candidate information is encrypted and accessible strictly by your placed school's authorized registry desk.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              <span>Complete Registration!</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card (4 Cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Real-time Candidate Badge Preview */}
          <div className="bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-white rounded-3xl p-6 border border-cqNavy-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cqNavy-800 text-xs">
              <span className="text-cqTeal-400 font-bold uppercase tracking-wider text-[10px]">
                Student Admission Pass
              </span>
              <span className="bg-cqNavy-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                CSSPS 2026
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-black text-white truncate">
                {formData.fullName || 'Candidate Full Name'}
              </p>
              <p className="text-xs text-cqTeal-300 font-mono">
                Index: {formData.beceIndexNumber || '101245089'}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-cqNavy-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">School:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px] text-right">
                  {formData.assignedSchool}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Programme:</span>
                <span className="font-semibold text-slate-200">
                  {formData.programme}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Residence:</span>
                <span className="font-semibold text-cqTeal-300">
                  {formData.residentialStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Pre-arrival file will be initialized upon registration</span>
            </div>
          </div>

          {/* Already have an account card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Already Registered an Account?
            </h4>
            <p className="text-xs text-slate-500">
              If your candidate profile was already created, proceed directly to the sign-in portal.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* School Staff Registration Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <p className="text-xs text-slate-600">
              Are you a school administrator or housemaster?
            </p>
            <Link
              to="/admin/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cqNavy-950 hover:text-cqTeal-700 hover:underline"
            >
              <Shield size={13} className="text-cqTeal-600" />
              <span>Register Institutional Staff Profile</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
