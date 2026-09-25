import React from 'react';
import { User, StudentProfile, Recommendation, SavedOpportunity, Application, Opportunity } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { 
  Sparkles, 
  Calendar, 
  Bookmark, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  TrendingUp,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  profile: StudentProfile | null;
  recommendations: Recommendation[];
  savedOpportunities: SavedOpportunity[];
  applications: Application[];
  onNavigate: (tab: string) => void;
  onViewOpportunity: (opp: Opportunity) => void;
  onToggleSave: (opp: Opportunity) => void;
  onApplyOrTrack: (opp: Opportunity) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  profile,
  recommendations,
  savedOpportunities,
  applications,
  onNavigate,
  onViewOpportunity,
  onToggleSave,
  onApplyOrTrack,
}) => {
  const topRecommendations = recommendations.slice(0, 6);
  const highestMatch = recommendations.length > 0 ? recommendations[0].matchBreakdown.overallScore : 0;
  
  const savedIds = new Set(savedOpportunities.map(s => s.opportunityId));

  // Determine deadlines approaching soon (within 30 days)
  const today = new Date('2026-09-25');
  const upcomingDeadlines = recommendations
    .map(r => r.opportunity)
    .filter(opp => {
      const d = new Date(opp.applicationDeadline);
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 45;
    })
    .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner & Profile Status */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <GraduationCap className="w-7 h-7 text-indigo-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {user.fullName}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Active Scholar
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {profile?.degreeLevel || "Master's"} in {profile?.fieldOfStudy || 'Computer Science'} · {profile?.institution || 'University'} (GPA: <span className="font-mono font-semibold">{profile?.gpa.toFixed(2) || '3.85'}</span>)
              </p>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="md:border-l md:border-slate-200 md:pl-6 shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-600">Profile Completion</span>
              <span className="font-mono font-bold text-indigo-600 tabular-nums">
                {profile?.profileCompletion || 85}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${profile?.profileCompletion || 85}%` }}
              ></div>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Update academic profile & CV</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-600 block">Top Match Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
                {highestMatch}%
              </span>
              <span className="text-[11px] text-slate-600">High Match</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('recommended')}
            className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <span className="text-xs text-slate-600 block">Recommendations</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
                {recommendations.length}
              </span>
              <span className="text-[11px] text-slate-600">Curated</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('saved')}
            className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <span className="text-xs text-slate-600 block">Saved Bookmarks</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {savedOpportunities.length}
              </span>
              <span className="text-[11px] text-slate-600">Programs</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('applications')}
            className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <span className="text-xs text-slate-600 block">Active Applications</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {applications.length}
              </span>
              <span className="text-[11px] text-slate-600">In Tracker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Deadlines & Urgent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Deadlines Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Upcoming Priority Deadlines
              </h2>
            </div>
            <button
              onClick={() => onNavigate('deadlines')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View full calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingDeadlines.map((opp) => {
              const deadlineDate = new Date(opp.applicationDeadline);
              const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 14;

              // Check if user is already tracking this
              const existingApp = applications.find(a => a.opportunityId === opp.id);

              return (
                <div 
                  key={opp.id}
                  onClick={() => onViewOpportunity(opp)}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {opp.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {opp.provider} · {opp.country} · {opp.fundingType}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-800 block tabular-nums">
                        {opp.applicationDeadline}
                      </span>
                      <span className={`text-[11px] font-mono tabular-nums font-medium ${isUrgent ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                        {daysLeft} days remaining
                      </span>
                    </div>

                    {existingApp ? (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {existingApp.status}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyOrTrack(opp);
                        }}
                        className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tools & Academic Profile Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Smart Scholar Assistant
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Our smart recommendation engine matches your <strong>{profile?.degreeLevel || "Master's"}</strong> degree, <strong>{profile?.gpa.toFixed(2) || '3.85'}</strong> GPA, and <strong>{profile?.skills.length || 7}</strong> technical skills against global eligibility rules.
            </p>

            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2 text-xs mb-4">
              <span className="font-bold text-indigo-950 block">Profile Strengths Detected:</span>
              <div className="flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>First-class honors GPA standing (&gt; 3.75)</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>High demand AI & Computer Science discipline</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Research co-authorship & leadership record</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('discover')}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore All 22+ Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Recommended For You Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recommended For Your Profile
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Ranked with live compatibility breakdown according to your academic standing and preferences.
            </p>
          </div>

          <button
            onClick={() => onNavigate('recommended')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>See all ranked matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topRecommendations.map(({ opportunity, matchBreakdown }) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              matchBreakdown={matchBreakdown}
              isSaved={savedIds.has(opportunity.id)}
              onViewDetails={onViewOpportunity}
              onToggleSave={onToggleSave}
              onApplyOrTrack={onApplyOrTrack}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
