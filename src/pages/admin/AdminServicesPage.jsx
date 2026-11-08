/**
 * CitizenQueue - Institutional Service Catalog Management
 * 
 * Route: `/admin/services`
 * 
 * Create, edit, activate, or deactivate school admission services and
 * document requirements checklists.
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  MapPin,
  AlertCircle,
  X,
  Check,
  Building2,
  Trash2
} from 'lucide-react';
import { ServiceService } from '../../services/serviceService';
import { SERVICE_CATEGORIES } from '../../data/mockData';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Admissions & Enrollment',
    location: '',
    durationMinutes: 20,
    description: '',
    requirements: '',
    delayNotice: '',
    instructions: '',
    cancellationPolicy: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const loadServices = () => {
    setServices(ServiceService.getAll());
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      category: 'Admissions & Enrollment',
      location: 'Administration Block, Desk 1',
      durationMinutes: 20,
      description: '',
      requirements: 'Original & 2 photocopies of Placement Slip\nCertified BECE Result Slip\nStudent Birth Certificate copy\n4 Passport-size photographs',
      delayNotice: '',
      instructions: 'Please arrive 15 minutes before your time slot.',
      cancellationPolicy: 'Can be cancelled or rescheduled up to 2 hours prior.'
    });
    setFormErrors({});
    setIsCreating(true);
    setEditingService(null);
  };

  const openEditModal = (srv) => {
    setFormData({
      name: srv.name,
      category: srv.category,
      location: srv.location,
      durationMinutes: srv.durationMinutes,
      description: srv.description,
      requirements: Array.isArray(srv.requirements) ? srv.requirements.join('\n') : '',
      delayNotice: srv.delayNotice || '',
      instructions: srv.instructions || '',
      cancellationPolicy: srv.cancellationPolicy || ''
    });
    setFormErrors({});
    setEditingService(srv);
    setIsCreating(false);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Service title is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.location.trim()) errs.location = 'Physical desk or room is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isCreating) {
      ServiceService.create(formData);
      setFeedback('New school service successfully created!');
    } else if (editingService) {
      ServiceService.update(editingService.id, {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        durationMinutes: Number(formData.durationMinutes),
        description: formData.description.trim(),
        requirements: formData.requirements.split('\n').filter(Boolean),
        delayNotice: formData.delayNotice.trim() || null,
        instructions: formData.instructions.trim(),
        cancellationPolicy: formData.cancellationPolicy.trim()
      });
      setFeedback('Service details updated successfully!');
    }

    setIsCreating(false);
    setEditingService(null);
    loadServices();
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStatus = (id) => {
    ServiceService.toggleStatus(id);
    loadServices();
    setFeedback('Service status toggled.');
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950">
            School Service Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define intake processes, adjust requirements checklists, and publish services.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-cqTeal-600 hover:bg-cqTeal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors self-start"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Floating feedback alert */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-cqNavy-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-cqTeal-500">
          <Check size={16} className="text-cqTeal-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-md border border-cqTeal-200 truncate">
                  {srv.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(srv.id)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                    srv.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="Click to toggle active status"
                >
                  {srv.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <h3 className="font-bold text-base text-cqNavy-950 leading-snug">
                {srv.name}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {srv.description}
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{srv.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>~{srv.durationMinutes} mins per session</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <FileText size={13} className="text-slate-400 shrink-0" />
                  <span>{srv.requirements?.length || 0} document requirements</span>
                </div>
              </div>

              {srv.delayNotice && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold">Notice:</span> {srv.delayNotice}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openEditModal(srv)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                <Edit2 size={13} />
                <span>Edit Configuration</span>
              </button>

              <span className="text-[10px] text-slate-400 font-mono">
                {srv.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Service Create / Edit Modal */}
      {(isCreating || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-cqNavy-950">
                {isCreating ? 'Create School Service Desk' : 'Edit Service Configuration'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingService(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Student Placement Verification & Biometrics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
                {formErrors.name && <p className="text-xs text-rose-600">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white"
                  >
                    {SERVICE_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Estimated Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Physical Desk / Campus Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assembly Hall, West Wing Desk 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
                {formErrors.location && <p className="text-xs text-rose-600">{formErrors.location}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Full Service Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
                {formErrors.description && <p className="text-xs text-rose-600">{formErrors.description}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Document Requirements Checklist (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="One requirement per line..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Citizens will see these exact lines as checkboxes on their confirmation pass.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Administrative Delay / Traffic Notice (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy morning congestion expected due to network validation checks."
                  value={formData.delayNotice}
                  onChange={(e) => setFormData({ ...formData, delayNotice: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cqNavy-950 text-white rounded-lg text-xs font-bold hover:bg-cqNavy-900"
                >
                  Save Service
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
