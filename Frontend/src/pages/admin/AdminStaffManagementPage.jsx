/**
 * CitizenQueue - Institutional Staff, Role Assignment & Institution Key Desk
 *
 * Route: `/admin/staff`
 *
 * Allows primary School Administrators (Headmasters / Heads of Admissions) to:
 * 1. View, copy, and regenerate their school's Institution Authorization Key
 * 2. Pre-assign system Roles to Staff IDs before officers onboard
 * 3. Manage registered staff accounts (change roles, update Staff ID, suspend/reactivate)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  UserPlus,
  Users,
  Shield,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  BadgeCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

const ROLE_OPTIONS = [
  { value: 'school_admin', label: 'School Administrator (Full Access)' },
  { value: 'academic_officer', label: 'Academic Affairs Officer' },
  { value: 'finance_officer', label: 'Finance / Bursary Officer' },
  { value: 'housemaster', label: 'Housemaster / Housemistress' },
  { value: 'registrar', label: 'Registrar / Records Officer' },
  { value: 'library_officer', label: 'Library Clearance Officer' },
  { value: 'collection_officer', label: 'Collection / Desk Officer' }
];

const ROLE_BADGE_STYLES = {
  admin: 'bg-cqNavy-950 text-cqTeal-300',
  school_admin: 'bg-cqNavy-950 text-cqTeal-300',
  super_admin: 'bg-purple-900 text-purple-100',
  academic_officer: 'bg-sky-50 text-sky-800 border border-sky-200',
  finance_officer: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  housemaster: 'bg-amber-50 text-amber-800 border border-amber-200',
  registrar: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  library_officer: 'bg-teal-50 text-teal-800 border border-teal-200',
  collection_officer: 'bg-slate-100 text-slate-700 border border-slate-200'
};

const formatRoleLabel = (role) => {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  if (found) return found.label.split(' (')[0];
  if (role === 'admin') return 'School Administrator';
  return role || 'Staff';
};

export default function AdminStaffManagementPage() {
  const location = useLocation();
  const { currentUser, isSchoolManager } = useAuth();

  const [school, setSchool] = useState(null);
  const [roster, setRoster] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    location.state?.welcomeMessage || ''
  );

  // Key UI State
  const [showKey, setShowKey] = useState(Boolean(location.state?.newInstitutionKey));
  const [copiedKey, setCopiedKey] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Roster Assignment Form State
  const [rosterForm, setRosterForm] = useState({
    staffId: '',
    fullName: '',
    assignedRole: 'academic_officer',
    designation: '',
    department: ''
  });
  const [isAddingRoster, setIsAddingRoster] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getInstitutionStaffOverview();
      if (res.success && res.data) {
        setSchool(res.data.school || null);
        setRoster(Array.isArray(res.data.roster) ? res.data.roster : []);
        setStaff(Array.isArray(res.data.staff) ? res.data.staff : []);
      } else {
        setErrorMsg(res.error || 'Could not load institutional staff configuration.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load staff management data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSchoolManager) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isSchoolManager, loadData]);

  const handleCopyKey = async () => {
    const keyVal = school?.authorizationKey || location.state?.newInstitutionKey;
    if (!keyVal) return;
    try {
      await navigator.clipboard.writeText(keyVal);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      setSuccessMsg(`Institution Key: ${keyVal}`);
    }
  };

  const handleRotateKey = async () => {
    setIsRotating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminService.regenerateInstitutionKey();
      if (res.success && res.data) {
        setSchool((prev) => ({
          ...prev,
          authorizationKey: res.data.authorizationKey,
          authorizationKeyUpdatedAt: res.data.authorizationKeyUpdatedAt
        }));
        setShowKey(true);
        setConfirmRotate(false);
        setSuccessMsg('Institution Authorization Key rotated successfully. Previous key is no longer valid.');
      } else {
        setErrorMsg(res.error || 'Failed to regenerate key.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to regenerate key.');
    } finally {
      setIsRotating(false);
    }
  };

  const handleAddRoster = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!rosterForm.staffId.trim()) {
      setErrorMsg('Please enter a Staff ID to assign a role.');
      return;
    }

    setIsAddingRoster(true);
    try {
      const res = await adminService.addStaffRosterEntry({
        staffId: rosterForm.staffId.trim().toUpperCase(),
        fullName: rosterForm.fullName.trim(),
        assignedRole: rosterForm.assignedRole,
        designation: rosterForm.designation.trim(),
        department: rosterForm.department.trim()
      });

      if (res.success) {
        setSuccessMsg(
          `Assigned role "${formatRoleLabel(rosterForm.assignedRole)}" to Staff ID ${rosterForm.staffId.trim().toUpperCase()}.`
        );
        setRosterForm({
          staffId: '',
          fullName: '',
          assignedRole: 'academic_officer',
          designation: '',
          department: ''
        });
        await loadData();
      } else {
        setErrorMsg(res.error || 'Could not assign role to Staff ID.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add Staff ID assignment.');
    } finally {
      setIsAddingRoster(false);
    }
  };

  const handleRemoveRoster = async (staffId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminService.removeStaffRosterEntry(staffId);
      if (res.success) {
        setRoster((prev) => prev.filter((item) => item.staffId !== staffId));
        setSuccessMsg(`Removed pre-authorized Staff ID ${staffId} from roster.`);
      } else {
        setErrorMsg(res.error || 'Failed to remove roster entry.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove roster entry.');
    }
  };

  const handleUpdateStaff = async (userId, updates, label) => {
    setUpdatingUserId(userId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminService.updateStaffMember(userId, updates);
      if (res.success && res.data) {
        setStaff((prev) =>
          prev.map((member) => (member._id === userId ? { ...member, ...res.data } : member))
        );
        setSuccessMsg(label || 'Staff member updated successfully.');
      } else {
        setErrorMsg(res.error || 'Failed to update staff member.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update staff member.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!isSchoolManager) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-black text-cqNavy-950">
            Primary School Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Viewing the Institution Authorization Key and assigning staff roles is restricted to{' '}
            <strong>School Administrators</strong>. Your current account role is{' '}
            <span className="font-semibold text-cqNavy-950">{formatRoleLabel(currentUser?.role)}</span>.
          </p>
        </div>
      </div>
    );
  }

  const displayKey = school?.authorizationKey || location.state?.newInstitutionKey || '—';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cqTeal-700 bg-cqTeal-50 px-2.5 py-1 rounded-full border border-cqTeal-200 mb-2">
            <Shield size={12} />
            <span>Institution Access Control</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
            Staff Roles & Institution Key
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your school&apos;s onboarding key, pre-assign roles by Staff ID, and update active officer permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-cqTeal-600' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Institution Authorization Key Card */}
      <div className="bg-gradient-to-br from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white rounded-3xl p-6 sm:p-7 border border-cqNavy-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-cqTeal-400 text-xs font-bold uppercase tracking-wider">
              <KeyRound size={15} />
              <span>Institution Authorization Key</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Building2 size={18} className="text-cqTeal-400 shrink-0" />
              <span>{school?.name || currentUser?.institutionName || 'Your Institution'}</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verified officers need this key alongside their assigned <strong>Staff ID</strong> when signing up at{' '}
              <code className="px-1.5 py-0.5 rounded bg-cqNavy-800 text-cqTeal-300">/admin/register</code>.
              Rotating this key immediately invalidates the old key for new signups.
            </p>
            {school && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span>School ID: <strong className="text-slate-200 font-mono">{school.schoolId}</strong></span>
                <span>•</span>
                <span>{school.city}, {school.region}</span>
                {school.authorizationKeyUpdatedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Updated {new Date(school.authorizationKeyUpdatedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-cqNavy-900/90 border border-cqNavy-700 rounded-2xl p-4 sm:p-5 space-y-3 min-w-[270px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Onboarding Key
              </span>
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="text-xs text-cqTeal-300 hover:text-white flex items-center gap-1"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showKey ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-cqNavy-950 px-4 py-3 rounded-xl border border-cqNavy-800">
              <code className="text-base sm:text-lg font-black tracking-widest text-cqTeal-300 font-mono">
                {showKey ? displayKey : 'CQ-••••-••••••'}
              </code>
              <button
                type="button"
                onClick={handleCopyKey}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cqNavy-800 hover:bg-cqNavy-700 text-xs font-bold text-white transition-colors"
                title="Copy key to clipboard"
              >
                {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {!confirmRotate ? (
              <button
                type="button"
                onClick={() => setConfirmRotate(true)}
                className="w-full py-2 rounded-xl border border-cqNavy-700 hover:bg-cqNavy-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Rotate / Regenerate Key</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isRotating}
                  onClick={handleRotateKey}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-cqNavy-950 font-bold text-xs transition-colors"
                >
                  {isRotating ? 'Rotating...' : 'Confirm Rotate'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRotate(false)}
                  className="px-3 py-2 rounded-xl bg-cqNavy-800 hover:bg-cqNavy-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Pre-Assign Role by Staff ID & Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assign Role to Staff ID Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cqTeal-50 text-cqTeal-700 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign Role by Staff ID</h3>
              <p className="text-[11px] text-slate-500">
                Pre-authorize an officer&apos;s Staff ID so they automatically get this role upon registration.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddRoster} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                GES / Institutional Staff ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GES-482910 or ACH-FIN-02"
                value={rosterForm.staffId}
                onChange={(e) => setRosterForm((p) => ({ ...p, staffId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Assigned System Role *
              </label>
              <select
                value={rosterForm.assignedRole}
                onChange={(e) => setRosterForm((p) => ({ ...p, assignedRole: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Staff Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Grace Mensah"
                value={rosterForm.fullName}
                onChange={(e) => setRosterForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bursar"
                  value={rosterForm.designation}
                  onChange={(e) => setRosterForm((p) => ({ ...p, designation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Office"
                  value={rosterForm.department}
                  onChange={(e) => setRosterForm((p) => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAddingRoster}
              className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <BadgeCheck size={16} className="text-cqTeal-400" />
              <span>{isAddingRoster ? 'Assigning Role...' : 'Assign Role to Staff ID'}</span>
            </button>
          </form>
        </div>

        {/* Right: Pre-Authorized Staff ID Roster (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pre-Authorized Staff ID Roster ({roster.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                When an officer registers using one of these Staff IDs + your Institution Key, their role is applied automatically.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-xs text-slate-500">Loading staff roster...</div>
          ) : roster.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BadgeCheck size={24} className="text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No Staff IDs pre-assigned yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Use the form on the left to bind a Staff ID (e.g. <span className="font-mono">GES-482910</span>) to a role before the officer signs up.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 pr-3">Staff ID</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {roster.map((entry) => (
                    <tr key={entry._id || entry.staffId} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-3">
                        <p className="font-mono font-bold text-slate-900">{entry.staffId}</p>
                        {(entry.fullName || entry.department) && (
                          <p className="text-[11px] text-slate-500">
                            {[entry.fullName, entry.department].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ROLE_BADGE_STYLES[entry.assignedRole] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatRoleLabel(entry.assignedRole)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {entry.status === 'claimed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 size={12} />
                            Claimed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <KeyRound size={12} />
                            Pending Signup
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {entry.status !== 'claimed' ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoster(entry.staffId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            title="Remove Staff ID assignment"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Registered Staff Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Registered Institutional Staff ({staff.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Change any officer&apos;s system role or suspend access in real time.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">Loading registered staff...</div>
        ) : staff.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">No registered staff accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 pr-3">Officer & Contact</th>
                  <th className="py-2.5 px-3">Staff ID</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 pl-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {staff.map((member) => {
                  const isSelf = member._id === currentUser?._id;
                  const isUpdating = updatingUserId === member._id;
                  const isSuspended = member.accountStatus === 'suspended';

                  return (
                    <tr key={member._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{member.name}</span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cqTeal-50 text-cqTeal-700 font-bold border border-cqTeal-200">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{member.email}</p>
                        {(member.designation || member.department) && (
                          <p className="text-[10px] text-slate-400">
                            {[member.designation, member.department].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">
                        {member.staffId || '—'}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          disabled={isSelf || isUpdating}
                          value={member.role === 'admin' ? 'school_admin' : member.role}
                          onChange={(e) =>
                            handleUpdateStaff(
                              member._id,
                              { role: e.target.value },
                              `Updated ${member.name}'s role to ${formatRoleLabel(e.target.value)}.`
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label.split(' (')[0]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 pl-3 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-400">Primary Admin</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateStaff(
                                member._id,
                                { accountStatus: isSuspended ? 'active' : 'suspended' },
                                `${member.name}'s account has been ${isSuspended ? 'reactivated' : 'suspended'}.`
                              )
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {isSuspended ? <UserCheck size={13} /> : <UserX size={13} />}
                            <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
