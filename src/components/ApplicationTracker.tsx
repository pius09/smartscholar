import React, { useState } from 'react';
import { Application, ApplicationStatus, Opportunity } from '../types';
import { 
  Kanban, 
  List, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  FileText,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: Application[];
  opportunities: Opportunity[];
  onUpdateApplication: (id: string, data: Partial<Application>) => void;
  onDeleteApplication: (id: string) => void;
  onCreateApplication: (data: Partial<Application>) => void;
  onViewOpportunityById: (oppId: string) => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  opportunities,
  onUpdateApplication,
  onDeleteApplication,
  onCreateApplication,
  onViewOpportunityById,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Preparing');
  const [newNotes, setNewNotes] = useState('');

  // Kanban status columns
  const kanbanColumns: { status: ApplicationStatus; title: string; color: string }[] = [
    { status: 'Interested', title: 'Interested / Exploring', color: 'border-slate-300 bg-slate-50/50' },
    { status: 'Preparing', title: 'Preparing Documents', color: 'border-blue-300 bg-blue-50/30' },
    { status: 'Applied', title: 'Submitted / Applied', color: 'border-indigo-300 bg-indigo-50/30' },
    { status: 'Under Review', title: 'Under Faculty Review', color: 'border-amber-300 bg-amber-50/30' },
    { status: 'Interview', title: 'Interview Stage', color: 'border-purple-300 bg-purple-50/30' },
    { status: 'Accepted', title: 'Accepted / Awarded', color: 'border-emerald-300 bg-emerald-50/30' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppId) return;

    // Duplicate check
    if (applications.some(a => a.opportunityId === selectedOppId)) {
      alert('You are already tracking this opportunity in your tracker.');
      return;
    }

    const opp = opportunities.find(o => o.id === selectedOppId);
    if (!opp) return;

    onCreateApplication({
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      provider: opp.provider,
      opportunityType: opp.type,
      deadline: opp.applicationDeadline,
      applicationUrl: opp.applicationUrl,
      status: newStatus,
      notes: newNotes,
    });

    setShowAddModal(false);
    setSelectedOppId('');
    setNewNotes('');
  };

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    onUpdateApplication(appId, { status });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage submissions, track committee review milestones, and monitor deadlines across all programs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode segmented switcher */}
          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Add Application Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(({ status, title, color }) => {
            const columnApps = applications.filter(a => a.status === status);

            return (
              <div 
                key={status} 
                className={`rounded-2xl border ${color} p-3.5 flex flex-col min-w-[240px] max-h-[75vh]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800 truncate" title={title}>
                    {title}
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 tabular-nums">
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {columnApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                        <span className="font-semibold text-slate-700">{app.opportunityType}</span>
                        <span className="font-mono tabular-nums">{app.deadline}</span>
                      </div>

                      <h4 
                        onClick={() => onViewOpportunityById(app.opportunityId)}
                        className="font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {app.opportunityTitle}
                      </h4>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{app.provider}</p>

                      {app.notes && (
                        <p className="mt-2 p-1.5 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600 line-clamp-2 italic">
                          "{app.notes}"
                        </p>
                      )}

                      {/* Status advancement options */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 cursor-pointer font-medium"
                        >
                          <option value="Interested">Interested</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interview">Interview</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>

                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}

                  {columnApps.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-600 italic">
                      No applications
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Opportunity & Provider</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Deadline</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div 
                        onClick={() => onViewOpportunityById(app.opportunityId)}
                        className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {app.opportunityTitle}
                      </div>
                      <div className="text-[11px] text-slate-600">{app.provider}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{app.opportunityType}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800">{app.deadline}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800"
                      >
                        <option value="Interested">Interested</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Interview">Interview</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {app.notes || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.applicationUrl && (
                          <a
                            href={app.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Milestones & Deadlines Agenda</h3>
              <p className="text-xs text-slate-600">Chronological timeline of active application cutoffs</p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-700">Reference: Fall 2026 / Spring 2027</span>
          </div>

          <div className="space-y-3">
            {[...applications]
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .map((app) => {
                const today = new Date('2026-09-25');
                const d = new Date(app.deadline);
                const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysDiff <= 14;

                return (
                  <div
                    key={app.id}
                    onClick={() => onViewOpportunityById(app.opportunityId)}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 font-mono shrink-0">
                        <span className="text-[10px] uppercase font-bold leading-none">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xs font-extrabold leading-none mt-0.5">
                          {d.getDate()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{app.opportunityTitle}</h4>
                        <p className="text-xs text-slate-600">{app.provider} · Status: <span className="font-semibold text-indigo-700">{app.status}</span></p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono text-xs font-bold tabular-nums block ${isUrgent ? 'text-amber-700' : 'text-slate-800'}`}>
                        {daysDiff > 0 ? `${daysDiff} days remaining` : 'Deadline passed'}
                      </span>
                      <span className="text-[11px] text-slate-600 block">{app.deadline}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Track New Application</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Select Opportunity</label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white"
                >
                  <option value="">-- Choose an opportunity from catalog --</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.provider}) — Deadline: {opp.applicationDeadline}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white"
                >
                  <option value="Interested">Interested / Exploring</option>
                  <option value="Preparing">Preparing Documents</option>
                  <option value="Applied">Submitted / Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview">Interview</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Personal Notes / Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule TOEFL test, draft 2-page essay"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedOppId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
