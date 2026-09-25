import React, { useState } from 'react';
import { Opportunity, MatchScoreBreakdown, StudentProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Globe, 
  GraduationCap, 
  DollarSign, 
  FileText, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Sparkles,
  Send,
  Building,
  CheckCircle2
} from 'lucide-react';

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null;
  matchBreakdown?: MatchScoreBreakdown;
  studentProfile?: StudentProfile | null;
  isSaved?: boolean;
  onClose: () => void;
  onToggleSave: (opp: Opportunity) => void;
  onTrackApplication: (opp: Opportunity, status: string, notes?: string) => void;
}

export const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  opportunity,
  matchBreakdown,
  studentProfile,
  isSaved,
  onClose,
  onToggleSave,
  onTrackApplication,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'match' | 'process'>('match');
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('Preparing');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [acknowledgedIneligible, setAcknowledgedIneligible] = useState(false);

  if (!opportunity) return null;

  const score = matchBreakdown?.overallScore ?? 75;
  const isExpired = new Date(opportunity.applicationDeadline) < new Date('2026-09-25');

  const handleConfirmTracking = () => {
    onTrackApplication(opportunity, applicationStatus, applicationNotes);
    setShowApplyConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1.5 flex-wrap">
              <span className="font-semibold text-slate-700">{opportunity.type}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.country}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-emerald-700 font-medium">{opportunity.fundingType}</span>
              {opportunity.isDemo && (
                <>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">Sample Opportunity</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-balance">
              {opportunity.title}
            </h2>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.provider}
              </span>

              {opportunity.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Opportunity
                </span>
              )}

              {opportunity.verifiedBy && (
                <span className="text-[11px] text-slate-600 hidden sm:inline">
                  Verified by: {opportunity.verifiedBy}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleSave(opportunity)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Saved to bookmarks' : 'Save opportunity'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-white shrink-0">
          <button
            onClick={() => setActiveTab('match')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'match'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Match Intelligence & Why You Match
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Benefits
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === 'eligibility'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Eligibility & Requirements
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeTab === 'process'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Application Process & Documents
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* TAB: MATCH INTELLIGENCE */}
          {activeTab === 'match' && (
            <div className="space-y-6">
              
              {/* Top Match Score Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block">
                    Algorithmic Profile Compatibility
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
                      {score}%
                    </span>
                    <span className="text-sm text-slate-300 font-medium">Overall Compatibility Score</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                    Evaluated against degree level, field alignment, GPA, country citizenship, skill overlap, and funding preference.
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
                  <div className="text-xs text-slate-300">Your Current GPA</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                    {studentProfile?.gpa ? studentProfile.gpa.toFixed(2) : '3.85'}
                  </div>
                  <div className="text-[11px] text-slate-400">Req. Min: {opportunity.minimumGpa.toFixed(2)}</div>
                </div>
              </div>

              {/* Match Criteria Breakdown Bars */}
              {matchBreakdown && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    Scoring Model Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Academic Degree Level</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.academicMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.academicMatch}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Field of Study Alignment</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.fieldMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.fieldMatch}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Country & Geographic Eligibility</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.countryMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.countryMatch}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Skills & Technical Overlap</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.skillsMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.skillsMatch}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Career Goals & Interest Match</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.careerMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.careerMatch}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Funding Preference Match</span>
                        <span className="font-mono tabular-nums font-semibold">{matchBreakdown.fundingMatch}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                          style={{ width: `${matchBreakdown.fundingMatch}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Transparent Reasons vs Potential Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Why this matches you */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Why this matches you
                  </div>
                  <ul className="space-y-2">
                    {matchBreakdown?.matchingReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                    {(!matchBreakdown?.matchingReasons || matchBreakdown.matchingReasons.length === 0) && (
                      <li className="text-xs text-emerald-800 italic">
                        General program open to prospective graduate and undergraduate applicants.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Potential Issues & Requirements to Verify */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Requirements & Considerations
                  </div>
                  <ul className="space-y-2">
                    {matchBreakdown?.potentialIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-amber-950">
                        <span className="text-amber-600 font-bold shrink-0">⚠</span>
                        <span className="leading-relaxed">{issue}</span>
                      </li>
                    ))}
                    {(!matchBreakdown?.potentialIssues || matchBreakdown.potentialIssues.length === 0) && (
                      <li className="text-xs text-emerald-800">
                        ✓ No conflicting criteria or disqualifying restrictions detected in your profile.
                      </li>
                    )}
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* TAB: OVERVIEW & BENEFITS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Program Overview</h4>
                <p className="text-slate-700 leading-relaxed">{opportunity.description}</p>
              </div>

              {/* Funding & Value Highlights */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Financial Coverage & Benefits
                </h4>
                <p className="text-sm font-semibold text-slate-900 mb-3">{opportunity.fundingAmount}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {opportunity.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Timeline Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-600 block">Application Deadline</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                    {opportunity.applicationDeadline}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-600 block">Program Start Date</span>
                  <span className="font-mono font-medium text-slate-900 mt-0.5 block">
                    {opportunity.startDate || 'Fall 2027'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-600 block">Duration & Awards</span>
                  <span className="font-medium text-slate-900 mt-0.5 block">
                    {opportunity.duration || '2 Years'} ({opportunity.numberOfAwards || 'Multiple'} awards)
                  </span>
                </div>
              </div>

              {opportunity.contactEmail && (
                <div className="text-xs text-slate-600 pt-2">
                  Official inquiries: <a href={`mailto:${opportunity.contactEmail}`} className="text-indigo-600 hover:underline">{opportunity.contactEmail}</a>
                </div>
              )}
            </div>
          )}

          {/* TAB: ELIGIBILITY & REQUIREMENTS */}
          {activeTab === 'eligibility' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Eligible Study Levels
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {opportunity.degreeLevels.map((lvl, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Eligible Countries & Nationalities
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {opportunity.eligibleCountries.map((c, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Eligible Fields */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Eligible Academic Disciplines</h4>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.eligibleFields.map((field, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Minimum Academic Standing */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Minimum Academic GPA Cutoff</h4>
                  <p className="text-xs text-slate-600">Calculated on a standard 4.0 cumulative GPA scale</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-bold tabular-nums text-slate-900">
                    {opportunity.minimumGpa.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-600 block">/ 4.00</span>
                </div>
              </div>

              {opportunity.ageRequirement && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Age Requirement: </span>
                  {opportunity.ageRequirement}
                </div>
              )}

            </div>
          )}

          {/* TAB: APPLICATION PROCESS & DOCUMENTS */}
          {activeTab === 'process' && (
            <div className="space-y-5">
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Mandatory Submission Documents
                </h4>
                <div className="space-y-2">
                  {opportunity.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {opportunity.applicationProcess && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Selection Workflow</h4>
                  <div className="space-y-2">
                    {opportunity.applicationProcess.map((step, idx) => (
                      <div key={idx} className="p-3 border-l-2 border-indigo-600 bg-slate-50 text-xs text-slate-800 rounded-r-lg">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Ineligible Warning if Criteria Failed */}
          {matchBreakdown?.isIneligible && !acknowledgedIneligible && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Eligibility Notice</p>
                <p className="mt-0.5 text-rose-800">
                  Your current profile does not satisfy one or more mandatory eligibility requirements (e.g. minimum GPA or specific degree level). You may still choose to track or prepare for this opportunity if you plan to fulfill the requirements before applying.
                </p>
                <button
                  onClick={() => setAcknowledgedIneligible(true)}
                  className="mt-2 text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  I understand, proceed anyway
                </button>
              </div>
            </div>
          )}

          {/* Application Tracking Modal Prompt */}
          {showApplyConfirm && (
            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-3 animate-in fade-in">
              <h4 className="font-bold text-indigo-950 text-sm">Add to Application Tracker</h4>
              <p className="text-indigo-900">
                Set the starting stage and add personal notes to track your deadlines and milestones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Current Status</label>
                  <select
                    value={applicationStatus}
                    onChange={(e) => setApplicationStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Notes / Target Milestone</label>
                  <input
                    type="text"
                    placeholder="e.g. Request transcript by next Friday"
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmTracking}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Add to Tracker
                </button>
                <button
                  onClick={() => setShowApplyConfirm(false)}
                  className="px-3 py-2 bg-white text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            <span>Deadline: </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {opportunity.applicationDeadline}
            </span>
            {isExpired && <span className="text-rose-600 font-semibold ml-1.5">(Expired)</span>}
          </div>

          <div className="flex items-center gap-2">
            {!showApplyConfirm && (
              <button
                onClick={() => setShowApplyConfirm(true)}
                disabled={isExpired}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Track in My Applications
              </button>
            )}

            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
