/**
 * CitizenQueue - Institutional Prospectus Management
 * 
 * Route: `/admin/prospectus`
 * 
 * Allows school administrators to configure the official Senior High School
 * digital prospectus, define mandatory specifications, add new items, and specify
 * which items require photo pre-inspection.
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Camera,
  X,
  Search,
  School,
  Sparkles
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import { PROSPECTUS_CATEGORIES } from '../../data/mockData';

export default function AdminProspectusPage() {
  const [prospectus, setProspectus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for Add/Edit Requirement
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothing and Uniforms',
    specification: '',
    description: '',
    quantity: '1 piece',
    requiresPhotoReview: false,
    referenceNotes: ''
  });
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setProspectus(AdmissionService.getProspectus());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Clothing and Uniforms',
      specification: '',
      description: '',
      quantity: '1 piece',
      requiresPhotoReview: false,
      referenceNotes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      specification: item.specification,
      description: item.description || '',
      quantity: item.quantity || '1 piece',
      requiresPhotoReview: Boolean(item.requiresPhotoReview),
      referenceNotes: item.referenceNotes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the school prospectus?`)) {
      AdmissionService.deleteProspectusRequirement(id);
      loadData();
      showToast(`Removed "${name}" from prospectus.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specification.trim()) return;

    if (editingItem) {
      AdmissionService.updateProspectusRequirement(editingItem.id, formData);
      showToast(`Updated "${formData.name}" specifications.`);
    } else {
      AdmissionService.addProspectusRequirement(formData);
      showToast(`Added new requirement "${formData.name}".`);
    }

    loadData();
    setShowModal(false);
  };

  // Filtered requirements
  const filteredList = prospectus.filter((item) => {
    const matchesCat =
      selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-200">
            <School size={12} />
            <span>School Regulations & Prospectus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 mt-1">
            Digital Prospectus Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define official clothing, bedding, stationery, and boarding equipment requirements for Achimota School.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>Add New Requirement</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search prospectus items or specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 text-slate-900"
            />
          </div>

          <span className="text-xs text-slate-500">
            Total Requirements: <strong>{prospectus.length} Items</strong>
          </span>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PROSPECTUS_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cqNavy-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Required Specification</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Photo Pre-Check</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-[11px] font-semibold text-cqNavy-800 bg-cqNavy-50 px-2.5 py-1 rounded-md">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-4 px-4 max-w-xs">
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {item.specification}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-800">{item.quantity}</span>
                  </td>

                  <td className="py-4 px-4">
                    {item.requiresPhotoReview ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        <Camera size={12} />
                        Photo Required
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Optional</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit requirement"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete requirement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Requirement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Edit Prospectus Requirement' : 'Add New Prospectus Requirement'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Metal Trunk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    {PROSPECTUS_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 pairs"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Required Exact Specification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Maximum dimensions: 90cm (L) x 50cm (W) x 40cm (H). Galvanized sheet metal only."
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description / Guidelines (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or campus regulations regarding this item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="requiresPhoto"
                  checked={formData.requiresPhotoReview}
                  onChange={(e) => setFormData({ ...formData, requiresPhotoReview: e.target.checked })}
                  className="w-4 h-4 rounded text-cqTeal-600 focus:ring-cqTeal-500 border-slate-300"
                />
                <label htmlFor="requiresPhoto" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Require Student Item Photograph Submission
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 rounded-xl shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Create Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-cqNavy-800 flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className="text-cqTeal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
