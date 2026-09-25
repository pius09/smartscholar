import React, { useState } from 'react';
import { Opportunity, AdminAnalytics, MatchWeights, DegreeLevel, FundingType, OpportunityType } from '../types';
import { 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  FileText, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sliders, 
  SlidersHorizontal,
  BarChart3,
  Globe,
  Award,
  ExternalLink,
  Save,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  analytics: (AdminAnalytics & { matchWeights: MatchWeights }) | null;
  opportunities: Opportunity[];
  students: any[];
  onAddOpportunity: (opp: Partial<Opportunity>) => Promise<void>;
  onUpdateOpportunity: (id: string, opp: Partial<Opportunity>) => Promise<void>;
  onDeleteOpportunity: (id: string) => Promise<void>;
  onUpdateWeights: (weights: MatchWeights) => Promise<void>;
  onViewOpportunity: (opp: Opportunity) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  analytics,
  opportunities,
  students,
  onAddOpportunity,
  onUpdateOpportunity,
  onDeleteOpportunity,
  onUpdateWeights,
  onViewOpportunity,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'students' | 'weights'>('overview');
  
  // Weights state
  const [weights, setWeights] = useState<MatchWeights>(analytics?.matchWeights || {
    academicWeight: 25,
    fieldWeight: 20,
    countryWeight: 15,
    skillsWeight: 15,
    careerWeight: 10,
    fundingWeight: 10,
    opportunityTypeWeight: 5,
  });
  const [weightsSaved, setWeightsSaved] = useState(false);

  // Add/Edit Opportunity Modal
  const [showOppModal, setShowOppModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  const [oppTitle, setOppTitle] = useState('');
  const [oppProvider, setOppProvider] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppType, setOppType] = useState<OpportunityType>('Scholarship');
  const [oppCountry, setOppCountry] = useState('Global');
  const [oppFundingType, setOppFundingType] = useState<FundingType>('Fully Funded');
  const [oppFundingAmount, setOppFundingAmount] = useState('Full Tuition + Monthly Stipend');
  const [oppMinGpa, setOppMinGpa] = useState<number>(3.2);
  const [oppDeadline, setOppDeadline] = useState('2026-12-15');
  const [oppUrl, setOppUrl] = useState('https://example.org/apply');
  const [oppFields, setOppFields] = useState('Computer Science, Engineering, Mathematics');
  const [oppLevels, setOppLevels] = useState<DegreeLevel[]>(["Master's", 'PhD']);
  const [oppVerified, setOppVerified] = useState(true);

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setOppTitle('');
    setOppProvider('');
    setOppDescription('');
    setOppType('Scholarship');
    setOppCountry('Global');
    setOppFundingType('Fully Funded');
    setOppFundingAmount('Full Tuition + Monthly Stipend');
    setOppMinGpa(3.2);
    setOppDeadline('2026-12-15');
    setOppUrl('https://example.org/apply');
    setOppFields('Computer Science, Engineering, Data Science');
    setOppLevels(["Master's", 'PhD']);
    setOppVerified(true);
    setShowOppModal(true);
  };

  const handleOpenEdit = (opp: Opportunity) => {
    setEditingOpp(opp);
    setOppTitle(opp.title);
    setOppProvider(opp.provider);
    setOppDescription(opp.description);
    setOppType(opp.type);
    setOppCountry(opp.country);
    setOppFundingType(opp.fundingType);
    setOppFundingAmount(opp.fundingAmount);
    setOppMinGpa(opp.minimumGpa);
    setOppDeadline(opp.applicationDeadline);
    setOppUrl(opp.applicationUrl);
    setOppFields(opp.eligibleFields.join(', '));
    setOppLevels(opp.degreeLevels);
    setOppVerified(opp.verified);
    setShowOppModal(true);
  };

  const handleSaveOppForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldsArray = oppFields.split(',').map(f => f.trim()).filter(Boolean);

    const payload: Partial<Opportunity> = {
      title: oppTitle,
      provider: oppProvider,
      description: oppDescription,
      type: oppType,
      country: oppCountry,
      fundingType: oppFundingType,
      fundingAmount: oppFundingAmount,
      minimumGpa: Number(oppMinGpa),
      applicationDeadline: oppDeadline,
      applicationUrl: oppUrl,
      eligibleFields: fieldsArray,
      degreeLevels: oppLevels,
      verified: oppVerified,
      status: 'Published',
    };

    if (editingOpp) {
      await onUpdateOpportunity(editingOpp.id, payload);
    } else {
      await onAddOpportunity(payload);
    }

    setShowOppModal(false);
  };

  const handleToggleVerified = async (opp: Opportunity) => {
    await onUpdateOpportunity(opp.id, { verified: !opp.verified });
  };

  const handleTogglePublished = async (opp: Opportunity) => {
    const nextStatus = opp.status === 'Published' ? 'Draft' : 'Published';
    await onUpdateOpportunity(opp.id, { status: nextStatus as any });
  };

  const handleSaveWeights = async () => {
    await onUpdateWeights(weights);
    setWeightsSaved(true);
    setTimeout(() => setWeightsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Administrator Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Admin Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Global catalog governance, opportunity verification, student cohorts, and recommendation engine weights.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white shadow-2xs text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'opportunities' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Opportunities ({opportunities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'students' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students Directory</span>
        </button>
        <button
          onClick={() => setActiveTab('weights')}
          className={`py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'weights' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Recommendation Engine Weights</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Total Students</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
                {analytics?.totalStudents || 186}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Total Opportunities</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
                {opportunities.length}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Verified Programs</span>
              <span className="font-mono text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">
                {opportunities.filter(o => o.verified).length}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Unverified / Pending</span>
              <span className="font-mono text-2xl font-bold text-amber-700 mt-1 block tabular-nums">
                {opportunities.filter(o => !o.verified).length}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Applications Tracked</span>
              <span className="font-mono text-2xl font-bold text-indigo-700 mt-1 block tabular-nums">
                {analytics?.totalApplications || 346}
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-600 font-medium block">Active Monthly Cohort</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
                {analytics?.activeUsers || 198}
              </span>
            </div>
          </div>

          {/* SVG Data Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Student Registrations Growth Over Time */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Growth Trajectory</h3>
                  <p className="text-xs text-slate-600">Registered applicants across the last 6 months</p>
                </div>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>

              {/* Bar visualization */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                {(analytics?.studentsOverTime || [
                  { month: 'Apr 26', count: 48 },
                  { month: 'May 26', count: 72 },
                  { month: 'Jun 26', count: 95 },
                  { month: 'Jul 26', count: 124 },
                  { month: 'Aug 26', count: 156 },
                  { month: 'Sep 26', count: 187 },
                ]).map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="font-mono text-[10px] text-slate-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div 
                      className="w-full max-w-[42px] bg-indigo-600/90 hover:bg-indigo-600 rounded-t-md transition-all duration-300"
                      style={{ height: `${(item.count / 200) * 100}%` }}
                    ></div>
                    <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap mt-1">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Opportunities by Category */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Catalog Opportunity Distribution</h3>
                  <p className="text-xs text-slate-600">Active opportunities categorized by type</p>
                </div>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { category: 'Scholarships', count: 9, max: 12, color: 'bg-indigo-600' },
                  { category: 'Fellowships', count: 4, max: 12, color: 'bg-purple-600' },
                  { category: 'Internships', count: 3, max: 12, color: 'bg-blue-600' },
                  { category: 'Competitions', count: 3, max: 12, color: 'bg-amber-600' },
                  { category: 'Grants & Research', count: 3, max: 12, color: 'bg-emerald-600' },
                ].map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.category}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{cat.count} programs</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${(cat.count / cat.max) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 2: Most Popular Fields & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Most Searched Academic Fields</h3>
              <p className="text-xs text-slate-600 mb-4">Student query frequency by academic discipline</p>
              
              <div className="divide-y divide-slate-100 text-xs">
                {(analytics?.topSearchedFields || []).map((f) => (
                  <div key={f.field} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{f.field}</span>
                    <span className="font-mono text-slate-600 tabular-nums">{f.count} searches</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Host Country Destinations</h3>
              <p className="text-xs text-slate-600 mb-4">Geographic location of active opportunities</p>
              
              <div className="divide-y divide-slate-100 text-xs">
                {(analytics?.countriesDistribution || []).map((c) => (
                  <div key={c.country} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{c.country}</span>
                    <span className="font-mono text-slate-600 tabular-nums">{c.count} programs</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: OPPORTUNITIES MANAGEMENT */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Live Opportunity Management Table</span>
            <span className="text-slate-600 font-mono tabular-nums">{opportunities.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title & Provider</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Country</th>
                  <th className="py-3 px-4 font-semibold">Funding</th>
                  <th className="py-3 px-4 font-semibold">Min GPA</th>
                  <th className="py-3 px-4 font-semibold">Deadline</th>
                  <th className="py-3 px-4 font-semibold">Verification Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div 
                        onClick={() => onViewOpportunity(opp)}
                        className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {opp.title}
                      </div>
                      <div className="text-[11px] text-slate-600">{opp.provider}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{opp.type}</td>
                    <td className="py-3.5 px-4 text-slate-700">{opp.country}</td>
                    <td className="py-3.5 px-4 font-medium text-emerald-800">{opp.fundingType}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800">{opp.minimumGpa.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800">{opp.applicationDeadline}</td>
                    
                    {/* Verification Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleVerified(opp)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${
                          opp.verified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{opp.verified ? 'Verified' : 'Pending Review'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(opp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Edit opportunity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${opp.title}"?`)) {
                              onDeleteOpportunity(opp.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Delete opportunity"
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

      {/* TAB 3: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Registered Student Profiles</span>
            <span className="text-slate-600 font-mono tabular-nums">{students.length} Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name & Email</th>
                  <th className="py-3 px-4 font-semibold">Degree Level</th>
                  <th className="py-3 px-4 font-semibold">Field of Study</th>
                  <th className="py-3 px-4 font-semibold">Institution</th>
                  <th className="py-3 px-4 font-semibold">GPA</th>
                  <th className="py-3 px-4 font-semibold">Applications</th>
                  <th className="py-3 px-4 font-semibold">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((item) => (
                  <tr key={item.user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{item.user.fullName}</div>
                      <div className="text-[11px] text-slate-600">{item.user.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.profile?.degreeLevel || 'Undergraduate'}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.profile?.fieldOfStudy || 'Computer Science'}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.profile?.institution || 'University'}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-emerald-800">
                      {item.profile?.gpa ? item.profile.gpa.toFixed(2) : '3.85'}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800">
                      {item.applicationsCount || 0} active
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.user.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATION WEIGHTS CONFIGURATOR */}
      {activeTab === 'weights' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Configurable Recommendation Algorithm Weights
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Adjust the weight contribution of each factor in calculating the overall Match Score (0–100%) for all students.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Academic Match (Degree Level & GPA Cutoff)</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.academicWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.academicWeight}
                onChange={(e) => setWeights({ ...weights, academicWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Field of Study Match</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.fieldWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.fieldWeight}
                onChange={(e) => setWeights({ ...weights, fieldWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Country Eligibility & Preferred Destination</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.countryWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.countryWeight}
                onChange={(e) => setWeights({ ...weights, countryWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Skills Overlap Match</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.skillsWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.skillsWeight}
                onChange={(e) => setWeights({ ...weights, skillsWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Career Interest & Long-Term Goals Match</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.careerWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.careerWeight}
                onChange={(e) => setWeights({ ...weights, careerWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Funding Preference (Full-ride vs Partial)</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.fundingWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.fundingWeight}
                onChange={(e) => setWeights({ ...weights, fundingWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Opportunity Type Match</span>
                <span className="font-mono tabular-nums text-indigo-700">{weights.opportunityTypeWeight}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={weights.opportunityTypeWeight}
                onChange={(e) => setWeights({ ...weights, opportunityTypeWeight: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Sum check */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono text-xs">
              <span>Total Algorithmic Base:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {weights.academicWeight + weights.fieldWeight + weights.countryWeight + weights.skillsWeight + weights.careerWeight + weights.fundingWeight + weights.opportunityTypeWeight}%
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveWeights}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Algorithm Configuration</span>
              </button>
              {weightsSaved && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Saved and active!
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Opportunity Modal */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingOpp ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h3>
              <button onClick={() => setShowOppModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOppForm} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="e.g. Oxford-Clarendon Graduate Scholarship"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provider / Host Institution</label>
                  <input
                    type="text"
                    required
                    value={oppProvider}
                    onChange={(e) => setOppProvider(e.target.value)}
                    placeholder="e.g. University of Oxford"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Opportunity Category</label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Scholarship">Scholarship</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Internship">Internship</option>
                    <option value="Grant">Grant</option>
                    <option value="Competition">Competition</option>
                    <option value="Research">Research</option>
                    <option value="Graduate Program">Graduate Program</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Host Country</label>
                  <input
                    type="text"
                    required
                    value={oppCountry}
                    onChange={(e) => setOppCountry(e.target.value)}
                    placeholder="e.g. United Kingdom, Global, Germany"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Funding Type</label>
                  <select
                    value={oppFundingType}
                    onChange={(e) => setOppFundingType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partially Funded">Partially Funded</option>
                    <option value="Tuition Only">Tuition Only</option>
                    <option value="Stipend">Stipend</option>
                    <option value="No Funding">No Funding</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Funding Amount & Value</label>
                  <input
                    type="text"
                    required
                    value={oppFundingAmount}
                    onChange={(e) => setOppFundingAmount(e.target.value)}
                    placeholder="e.g. £45,000 / year + Full Tuition"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Minimum GPA Cutoff</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="4.0"
                    value={oppMinGpa}
                    onChange={(e) => setOppMinGpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={oppDeadline}
                    onChange={(e) => setOppDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Application URL</label>
                  <input
                    type="url"
                    required
                    value={oppUrl}
                    onChange={(e) => setOppUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Eligible Academic Fields (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={oppFields}
                  onChange={(e) => setOppFields(e.target.value)}
                  placeholder="Computer Science, Engineering, Mathematics, Law"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={oppDescription}
                  onChange={(e) => setOppDescription(e.target.value)}
                  placeholder="Provide comprehensive details on fellowship goals, research mentors, and residency obligations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="oppVerifiedCheck"
                  checked={oppVerified}
                  onChange={(e) => setOppVerified(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="oppVerifiedCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Mark as officially Verified by Administrator
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOppModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingOpp ? 'Update Opportunity' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
