/**
 * CitizenQueue - Institutional Student Application Management
 * 
 * Route: `/admin/students`
 * 
 * Allows school admissions staff to search, filter, and inspect admitted students,
 * monitor readiness progress, review student files, and track onboarding stages.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  School,
  X
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('All');
  const [readinessFilter, setReadinessFilter] = useState('All');
  const [sortBy, setSortBy] = useState('readiness'); // 'readiness' | 'name' | 'stage'
  
  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = () => {
    setStudents(AdmissionService.getAdmittedStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return students
      .filter((std) => {
        const matchesQuery =
          !q ||
          std.name.toLowerCase().includes(q) ||
          std.indexNumber.includes(q) ||
          std.programme.toLowerCase().includes(q) ||
          std.guardianName?.toLowerCase().includes(q);

        const matchesProgramme =
          programmeFilter === 'All' || std.programme === programmeFilter;

        let matchesReadiness = true;
        if (readinessFilter === 'Ready') {
          matchesReadiness = std.readinessScore >= 80;
        } else if (readinessFilter === 'In Progress') {
          matchesReadiness = std.readinessScore >= 40 && std.readinessScore < 80;
        } else if (readinessFilter === 'Action Needed') {
          matchesReadiness = std.readinessScore < 40 || std.documentsCount?.changes > 0 || std.prospectusCount?.photosChanges > 0;
        }

        return matchesQuery && matchesProgramme && matchesReadiness;
      })
      .sort((a, b) => {
        if (sortBy === 'readiness') return b.readinessScore - a.readinessScore;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stage') return (b.admissionStage || 1) - (a.admissionStage || 1);
        return 0;
      });
  }, [students, searchQuery, programmeFilter, readinessFilter, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-200">
            <School size={12} />
            <span>Admissions Register</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 mt-1">
            Student Application Cohort
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor admitted candidate pre-arrival readiness, verify submitted documents, and view allocated reporting slots.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
            Total Cohort: <strong>{students.length} Students</strong>
          </span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, index number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 text-slate-900"
            />
          </div>

          {/* Programme Filter */}
          <div>
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
            >
              <option value="All">All Programmes</option>
              <option value="General Science">General Science</option>
              <option value="General Arts">General Arts</option>
              <option value="Business">Business</option>
              <option value="Visual Arts">Visual Arts</option>
              <option value="Home Economics">Home Economics</option>
              <option value="Agricultural Science">Agricultural Science</option>
            </select>
          </div>

          {/* Readiness Filter */}
          <div>
            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
            >
              <option value="All">All Readiness Levels</option>
              <option value="Ready">Ready for Reporting (80%+)</option>
              <option value="In Progress">In Progress (40-79%)</option>
              <option value="Action Needed">Action Required (&lt;40% or Changes)</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
            >
              <option value="readiness">Sort by Readiness Score</option>
              <option value="stage">Sort by Admission Stage</option>
              <option value="name">Sort by Student Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Candidate Details</th>
                <th className="py-3.5 px-4">Programme & Status</th>
                <th className="py-3.5 px-4">Readiness & Stage</th>
                <th className="py-3.5 px-4">Document Submissions</th>
                <th className="py-3.5 px-4">Prospectus Progress</th>
                <th className="py-3.5 px-4">Reporting Slot</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => {
                const isReady = std.readinessScore >= 80;
                return (
                  <tr
                    key={std.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm">{std.name}</p>
                        <p className="font-mono text-slate-500 text-[11px]">{std.indexNumber}</p>
                        <p className="text-[10px] text-slate-400">Guardian: {std.guardianName}</p>
                      </div>
                    </td>

                    {/* Programme & Res Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800">{std.programme}</span>
                        <span className={`block text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                          std.residentialStatus === 'Boarding'
                            ? 'bg-cqNavy-50 text-cqNavy-900 border border-cqNavy-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {std.residentialStatus}
                        </span>
                      </div>
                    </td>

                    {/* Readiness Bar & Stage */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 w-32">
                        <div className="flex items-center justify-between">
                          <span className={`font-black text-xs ${
                            isReady ? 'text-emerald-700' : 'text-slate-800'
                          }`}>
                            {std.readinessScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            Stage {std.admissionStage || 1}/9
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isReady ? 'bg-emerald-500' : 'bg-cqTeal-600'
                            }`}
                            style={{ width: `${std.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Documents */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {std.documentsCount?.accepted || 0} accepted
                        </span>
                        {std.documentsCount?.changes > 0 && (
                          <span className="block text-rose-600 font-bold">
                            {std.documentsCount.changes} need correction
                          </span>
                        )}
                        {std.documentsCount?.pending > 0 && (
                          <span className="block text-amber-700 font-medium">
                            {std.documentsCount.pending} pending review
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Prospectus */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="text-slate-800 font-semibold">
                          {std.prospectusCount?.purchased || 0}/{std.prospectusCount?.total || 15} items
                        </span>
                        {std.prospectusCount?.photosPending > 0 && (
                          <span className="block text-purple-700 font-bold">
                            {std.prospectusCount.photosPending} photos awaiting review
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Reporting Slot */}
                    <td className="py-4 px-4">
                      {std.appointment ? (
                        <div className="space-y-1">
                          <StatusBadge status={std.appointment.status} size="sm" />
                          <p className="text-[10px] text-slate-500">
                            {std.appointment.date} • {std.appointment.time}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Not scheduled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(std)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                      >
                        <Eye size={13} />
                        <span>Inspect File</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Users size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-800">No student records match filter criteria</p>
            <p className="text-xs text-slate-500">Try resetting your search query or programme filter.</p>
          </div>
        )}
      </div>

      {/* Student Dossier Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-cqTeal-700 bg-cqTeal-50 px-2 py-0.5 rounded">
                  Student Admission Dossier
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-slate-500">BECE Index: {selectedStudent.indexNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Programme</p>
                <p className="font-bold text-slate-900">{selectedStudent.programme}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Residential Status</p>
                <p className="font-bold text-slate-900">{selectedStudent.residentialStatus}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Readiness Score</p>
                <p className="font-bold text-emerald-700">{selectedStudent.readinessScore}% (Stage {selectedStudent.admissionStage || 1})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Guardian Name</p>
                <p className="font-bold text-slate-900">{selectedStudent.guardianName || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Guardian Contact</p>
                <p className="font-bold text-slate-900">{selectedStudent.guardianPhone || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500">Reporting Status</p>
                <p className="font-bold text-slate-900">
                  {selectedStudent.appointment ? selectedStudent.appointment.status : 'Unscheduled'}
                </p>
              </div>
            </div>

            {/* Document Checklist Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Document Verification Breakdown</h4>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
                  {selectedStudent.documentsCount?.accepted || 0} Provisionally Accepted
                </span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-semibold">
                  {selectedStudent.documentsCount?.pending || 0} Awaiting Desk Review
                </span>
                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-semibold">
                  {selectedStudent.documentsCount?.changes || 0} Corrections Requested
                </span>
              </div>
            </div>

            {/* Reporting Slot Details */}
            {selectedStudent.appointment && (
              <div className="p-4 bg-cqNavy-50 rounded-2xl border border-cqNavy-200 space-y-2 text-xs text-cqNavy-900">
                <h4 className="font-bold">Scheduled Arrival Slot</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <span><strong>Date:</strong> {selectedStudent.appointment.date}</span>
                  <span><strong>Time:</strong> {selectedStudent.appointment.time}</span>
                  <span><strong>Token:</strong> {selectedStudent.appointment.referenceNumber}</span>
                  <StatusBadge status={selectedStudent.appointment.status} size="sm" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-cqNavy-950 rounded-xl hover:bg-cqNavy-900"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
