import React, { useState, useMemo } from 'react';
import { Opportunity, Recommendation, MatchScoreBreakdown } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Calendar, 
  DollarSign, 
  Globe, 
  Sparkles,
  ShieldCheck,
  ArrowUpDown
} from 'lucide-react';

interface DiscoverPageProps {
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  savedOpportunityIds: Set<string>;
  onViewOpportunity: (opp: Opportunity) => void;
  onToggleSave: (opp: Opportunity) => void;
  onApplyOrTrack: (opp: Opportunity) => void;
  title?: string;
  subtitle?: string;
  defaultOnlyRecommended?: boolean;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  opportunities,
  recommendations,
  savedOpportunityIds,
  onViewOpportunity,
  onToggleSave,
  onApplyOrTrack,
  title = 'Discover Opportunities',
  subtitle = 'Search and filter scholarships, fellowships, and grants tailored to your educational path.',
  defaultOnlyRecommended = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedMatch, setSelectedMatch] = useState(defaultOnlyRecommended ? '70+' : 'All');
  const [selectedDeadline, setSelectedDeadline] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'deadline-soon' | 'newest'>('match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Map opportunityId -> matchBreakdown
  const matchMap = useMemo(() => {
    const map = new Map<string, MatchScoreBreakdown>();
    recommendations.forEach(r => {
      map.set(r.opportunity.id, r.matchBreakdown);
    });
    return map;
  }, [recommendations]);

  // Unique lists for filter options
  const opportunityTypes = ['All', 'Scholarship', 'Fellowship', 'Internship', 'Grant', 'Competition', 'Research', 'Graduate Program'];
  const fundingTypes = ['All', 'Fully Funded', 'Partially Funded', 'Stipend', 'Tuition Only'];
  const degreeLevels = ['All', 'Undergraduate', "Master's", 'PhD', 'Recent Graduate'];
  const countries = ['All', 'United Kingdom', 'United States', 'Canada', 'Germany', 'Switzerland', 'Japan', 'Australia', 'Sweden', 'Global'];

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];
    const today = new Date('2026-09-25');

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o => 
        o.title.toLowerCase().includes(q) ||
        o.provider.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.eligibleFields.some(f => f.toLowerCase().includes(q)) ||
        o.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // 2. Type Filter
    if (selectedType !== 'All') {
      result = result.filter(o => o.type === selectedType);
    }

    // 3. Funding Filter
    if (selectedFunding !== 'All') {
      result = result.filter(o => o.fundingType === selectedFunding);
    }

    // 4. Study Level Filter
    if (selectedLevel !== 'All') {
      result = result.filter(o => o.degreeLevels.includes(selectedLevel as any));
    }

    // 5. Country Filter
    if (selectedCountry !== 'All') {
      result = result.filter(o => o.country.toLowerCase() === selectedCountry.toLowerCase() || o.country === 'Global');
    }

    // 6. Match Threshold Filter
    if (selectedMatch !== 'All') {
      const minMatch = parseInt(selectedMatch, 10);
      result = result.filter(o => {
        const score = matchMap.get(o.id)?.overallScore || 0;
        return score >= minMatch;
      });
    }

    // 7. Deadline Filter
    if (selectedDeadline === 'closing-soon') {
      result = result.filter(o => {
        const d = new Date(o.applicationDeadline);
        const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
      });
    } else if (selectedDeadline === 'this-quarter') {
      result = result.filter(o => {
        const d = new Date(o.applicationDeadline);
        const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 90;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'match') {
        const scoreA = matchMap.get(a.id)?.overallScore || 0;
        const scoreB = matchMap.get(b.id)?.overallScore || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'deadline-soon') {
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [
    opportunities, 
    searchQuery, 
    selectedType, 
    selectedFunding, 
    selectedLevel, 
    selectedCountry, 
    selectedMatch, 
    selectedDeadline, 
    sortBy, 
    matchMap
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedFunding('All');
    setSelectedLevel('All');
    setSelectedCountry('All');
    setSelectedMatch('All');
    setSelectedDeadline('All');
    setSortBy('match');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="max-w-3xl">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Global Search Input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, provider, field (e.g., Computer Science, Law, AI, Medicine), or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Multi-Faceted Filters Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          {/* Filter 1: Type */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Opportunity Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer"
            >
              {opportunityTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Funding */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Funding Level</label>
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer"
            >
              {fundingTypes.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Filter 3: Study Level */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Degree Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer"
            >
              {degreeLevels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Filter 4: Country */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Host Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer"
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter 5: Match Percentage */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Match Percentage</label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer font-medium text-emerald-800"
            >
              <option value="All">All Matches</option>
              <option value="90">90%+ Match</option>
              <option value="80">80%+ Match</option>
              <option value="70">70%+ Match</option>
            </select>
          </div>

          {/* Filter 6: Deadline */}
          <div>
            <label className="text-slate-600 font-medium block mb-1">Deadline Horizon</label>
            <select
              value={selectedDeadline}
              onChange={(e) => setSelectedDeadline(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white cursor-pointer"
            >
              <option value="All">Any Deadline</option>
              <option value="closing-soon">Closing within 30 days</option>
              <option value="this-quarter">Closing within 90 days</option>
            </select>
          </div>

        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-900 font-semibold tabular-nums">
              {filteredOpportunities.length}
            </span>
            <span className="text-slate-600">opportunities found</span>

            {(selectedType !== 'All' || selectedFunding !== 'All' || selectedLevel !== 'All' || selectedCountry !== 'All' || selectedMatch !== 'All' || selectedDeadline !== 'All' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="ml-3 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            )}
          </div>

          {/* Sort By & View Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 font-medium cursor-pointer"
              >
                <option value="match">Highest Compatibility Match</option>
                <option value="deadline-soon">Closing Soonest</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Opportunities List / Grid View */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No opportunities match your current filters</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, broadening the degree level, or resetting match filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              matchBreakdown={matchMap.get(opp.id)}
              isSaved={savedOpportunityIds.has(opp.id)}
              onViewDetails={onViewOpportunity}
              onToggleSave={onToggleSave}
              onApplyOrTrack={onApplyOrTrack}
            />
          ))}
        </div>
      ) : (
        /* High-Density List View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
          {filteredOpportunities.map((opp) => {
            const breakdown = matchMap.get(opp.id);
            const score = breakdown?.overallScore;
            const isSaved = savedOpportunityIds.has(opp.id);

            return (
              <div 
                key={opp.id} 
                onClick={() => onViewOpportunity(opp)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 max-w-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 flex-wrap">
                    <span className="font-semibold text-slate-700">{opp.type}</span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span>{opp.country}</span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-emerald-700 font-medium">{opp.fundingType}</span>
                    {opp.verified && (
                      <>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="text-emerald-800 font-medium flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    {opp.provider} · {opp.fundingAmount}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Match Score</span>
                    {score !== undefined ? (
                      <span className={`font-mono text-sm font-bold tabular-nums ${
                        score >= 85 ? 'text-emerald-700' : score >= 70 ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {score}% Match
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">--</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Deadline</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
                      {opp.applicationDeadline}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(opp);
                      }}
                      className={`p-2 rounded-lg border text-xs cursor-pointer ${
                        isSaved ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Saved' : 'Save'}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyOrTrack(opp);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Apply / Track
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
