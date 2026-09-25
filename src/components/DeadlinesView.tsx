import React, { useState } from 'react';
import { Opportunity, Application } from '../types';
import { Clock, Calendar, AlertTriangle, ArrowUpRight, CheckCircle2, Filter } from 'lucide-react';

interface DeadlinesViewProps {
  opportunities: Opportunity[];
  applications: Application[];
  onViewOpportunity: (opp: Opportunity) => void;
  onApplyOrTrack: (opp: Opportunity) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  opportunities,
  applications,
  onViewOpportunity,
  onApplyOrTrack,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | '14days' | '30days' | '60days'>('all');

  const today = new Date('2026-09-25');

  const trackedOppIds = new Set(applications.map(a => a.opportunityId));

  // Compute days remaining for published opportunities
  const deadlineItems = opportunities
    .filter(o => o.status === 'Published')
    .map(opp => {
      const d = new Date(opp.applicationDeadline);
      const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        opp,
        diffDays,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isTracked: trackedOppIds.has(opp.id),
        appStatus: applications.find(a => a.opportunityId === opp.id)?.status,
      };
    })
    .filter(item => {
      if (filterPeriod === '14days') return item.diffDays > 0 && item.diffDays <= 14;
      if (filterPeriod === '30days') return item.diffDays > 0 && item.diffDays <= 30;
      if (filterPeriod === '60days') return item.diffDays > 0 && item.diffDays <= 60;
      return true;
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Deadlines Radar & Reminder Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Automated alerts active for 30d, 14d, 7d, 3d, and 24h prior to official portal close.
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterPeriod === 'all' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Deadlines
          </button>
          <button
            onClick={() => setFilterPeriod('14days')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterPeriod === '14days' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Within 14 Days
          </button>
          <button
            onClick={() => setFilterPeriod('30days')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterPeriod === '30days' ? 'bg-white shadow-2xs text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Within 30 Days
          </button>
        </div>
      </div>

      {/* Deadlines Timeline Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {deadlineItems.map(({ opp, diffDays, formattedDate, isTracked, appStatus }) => {
            const isUrgent = diffDays > 0 && diffDays <= 14;
            const isCritical = diffDays > 0 && diffDays <= 5;
            const isExpired = diffDays <= 0;

            return (
              <div 
                key={opp.id}
                onClick={() => onViewOpportunity(opp)}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Countdown Badge */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 border ${
                    isCritical 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : isUrgent 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : isExpired 
                      ? 'bg-slate-100 border-slate-200 text-slate-400' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                  }`}>
                    <span className="text-base font-extrabold leading-none tabular-nums">
                      {isExpired ? '0' : diffDays}
                    </span>
                    <span className="text-[10px] uppercase font-bold leading-none mt-1">
                      {isExpired ? 'Closed' : 'Days'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-0.5">
                      <span className="font-semibold text-slate-700">{opp.type}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span>{opp.country}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-emerald-700 font-medium">{opp.fundingType}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{opp.provider}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Closing Date</span>
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {formattedDate}
                    </span>
                  </div>

                  {isTracked ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Tracking ({appStatus})
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyOrTrack(opp);
                      }}
                      disabled={isExpired}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Track</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
