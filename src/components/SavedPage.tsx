import React, { useState } from 'react';
import { SavedOpportunity, Opportunity, MatchScoreBreakdown } from '../types';
import { Bookmark, Calendar, Trash2, ArrowUpRight, ExternalLink, Edit3, Check, Globe } from 'lucide-react';

interface SavedPageProps {
  savedOpportunities: SavedOpportunity[];
  matchMap: Map<string, MatchScoreBreakdown>;
  onViewOpportunity: (opp: Opportunity) => void;
  onRemoveSaved: (opportunityId: string) => void;
  onApplyOrTrack: (opp: Opportunity) => void;
  onNavigateDiscover: () => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  savedOpportunities,
  matchMap,
  onViewOpportunity,
  onRemoveSaved,
  onApplyOrTrack,
  onNavigateDiscover,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const handleStartEdit = (id: string, currentNotes?: string) => {
    setEditingNotesId(id);
    setNotesDraft(currentNotes || '');
  };

  const handleSaveNotes = (savedId: string) => {
    const item = savedOpportunities.find(s => s.id === savedId);
    if (item) {
      item.notes = notesDraft;
    }
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Bookmarked scholarships and programs you are considering or preparing to submit.
          </p>
        </div>

        <span className="font-mono text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-800 self-start sm:self-auto tabular-nums">
          {savedOpportunities.length} Bookmarks
        </span>
      </div>

      {/* Bookmarks List */}
      {savedOpportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No saved opportunities yet</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Browse our catalog of verified opportunities and bookmark programs to track them here.
          </p>
          <button
            onClick={onNavigateDiscover}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedOpportunities.map(({ id, opportunity, savedAt, notes }) => {
            const breakdown = matchMap.get(opportunity.id);
            const score = breakdown?.overallScore;
            const isEditing = editingNotesId === id;

            return (
              <div 
                key={id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top unboxed metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{opportunity.type}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span>{opportunity.country}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-emerald-700 font-medium">{opportunity.fundingType}</span>
                    </div>

                    <button
                      onClick={() => onRemoveSaved(opportunity.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onViewOpportunity(opportunity)}
                    className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {opportunity.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">{opportunity.provider}</p>

                  {/* Value and Match */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div>
                      <span className="text-[11px] text-slate-600 block">Match Score</span>
                      <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                        {score !== undefined ? `${score}% Match` : 'Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 block">Deadline</span>
                      <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {opportunity.applicationDeadline}
                      </span>
                    </div>
                  </div>

                  {/* User Personal Notes Section */}
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2.5 text-xs mb-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-1">
                      <span>Personal Notes</span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(id, notes)}
                          className="text-amber-700 hover:text-amber-900 font-normal flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-1.5 mt-1">
                        <textarea
                          rows={2}
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="e.g., Reach out to Prof. Garcia for reference letter"
                          className="w-full p-2 bg-white border border-amber-200 rounded-md text-xs text-slate-800"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(id)}
                            className="px-2.5 py-0.5 text-[11px] bg-amber-600 text-white font-medium rounded hover:bg-amber-700 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 italic">
                        {notes || 'No personal notes added yet. Click edit to add reminders.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onViewOpportunity(opportunity)}
                    className="w-1/2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onApplyOrTrack(opportunity)}
                    className="w-1/2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Track / Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
