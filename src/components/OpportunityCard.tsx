import React from 'react';
import { Opportunity, MatchScoreBreakdown } from '../types';
import { Bookmark, CheckCircle2, Calendar, ArrowUpRight, Award, ShieldCheck } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchBreakdown?: MatchScoreBreakdown;
  isSaved?: boolean;
  onViewDetails: (opp: Opportunity) => void;
  onToggleSave: (opp: Opportunity) => void;
  onApplyOrTrack: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  matchBreakdown,
  isSaved,
  onViewDetails,
  onToggleSave,
  onApplyOrTrack,
}) => {
  const matchScore = matchBreakdown?.overallScore;

  // Format deadline date
  const deadlineDate = new Date(opportunity.applicationDeadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const today = new Date('2026-09-25');
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysRemaining > 0 && daysRemaining <= 21;
  const isExpired = daysRemaining <= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top unboxed metadata line with typographic separators */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">{opportunity.type}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>{opportunity.country}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-emerald-700 font-medium">{opportunity.fundingType}</span>
            {opportunity.isDemo && (
              <>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">Sample Data</span>
              </>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSaved
                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label="Save opportunity"
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Title and Provider */}
        <div className="mb-3">
          <h3 
            onClick={() => onViewDetails(opportunity)}
            className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer text-balance"
          >
            {opportunity.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-600 font-medium">{opportunity.provider}</p>
            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {opportunity.description}
        </p>

        {/* Match Score & Value Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-600 block">Match Score</span>
            {matchScore !== undefined ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`font-mono text-sm font-bold tabular-nums ${
                  matchScore >= 85 
                    ? 'text-emerald-700' 
                    : matchScore >= 70 
                    ? 'text-amber-700' 
                    : 'text-slate-700'
                }`}>
                  {matchScore}% Match
                </span>
                {matchBreakdown?.isIneligible && (
                  <span className="text-[10px] text-rose-600 font-medium">Criteria check</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-600 italic">Sign in to calculate</span>
            )}
          </div>

          <div>
            <span className="text-[11px] text-slate-600 block">Funding Value</span>
            <span className="font-medium text-slate-900 text-xs block truncate mt-0.5" title={opportunity.fundingAmount}>
              {opportunity.fundingAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Action Buttons */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Deadline:</span>
            <span className={`font-mono font-medium tabular-nums ${isUrgent ? 'text-amber-700 font-semibold' : ''}`}>
              {formattedDeadline}
            </span>
          </div>

          {daysRemaining > 0 ? (
            <span className={`text-[11px] font-mono tabular-nums ${isUrgent ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
              {daysRemaining}d left
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-rose-600">Expired</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(opportunity)}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-center"
          >
            Details & Match
          </button>
          <button
            onClick={() => onApplyOrTrack(opportunity)}
            disabled={isExpired}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
              isExpired
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            <span>Apply / Track</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
