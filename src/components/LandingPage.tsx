import React from 'react';
import { Opportunity } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Globe, 
  Search,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  opportunities: Opportunity[];
  onGetStarted: () => void;
  onExploreCatalog: () => void;
  onViewOpportunity: (opp: Opportunity) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  opportunities,
  onGetStarted,
  onExploreCatalog,
  onViewOpportunity,
}) => {
  const featuredOpportunities = opportunities.slice(0, 3);

  const categories = [
    { title: 'Scholarships', desc: 'Full-ride and tuition funding across top global universities.', icon: GraduationCap },
    { title: 'Fellowships', desc: 'Prestigious post-graduate, research, and leadership residencies.', icon: Award },
    { title: 'Internships', desc: 'High-impact industry roles with stipends and housing support.', icon: BookOpen },
    { title: 'Grants', desc: 'Seed capital and experimental budgets for student research.', icon: Sparkles },
    { title: 'Competitions', desc: 'Global technology challenges, venture funds, and hackathons.', icon: Layers },
    { title: 'Research Exchanges', desc: 'International lab immersions at CERN, Harvard, and WHO labs.', icon: Globe },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-300 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        
        {/* Background Campus Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img 
            src="/src/assets/images/hero_student_campus_1790369775093.jpg" 
            alt="University campus students"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart Student Opportunity Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
            Find Opportunities That Match Your Future
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Discover scholarships, internships, fellowships, grants, and other educational opportunities personalized to your academic profile, skills, interests, and career goals with transparent match score breakdowns.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreCatalog}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white block tabular-nums">22+</span>
              <span className="text-slate-400">Curated Programs</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 block tabular-nums">100%</span>
              <span className="text-slate-400">Transparent Scoring</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-indigo-400 block tabular-nums">8</span>
              <span className="text-slate-400">Academic Disciplines</span>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Sample Data Compliance Notice */}
      <div className="bg-slate-100/80 border border-slate-200/90 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Academic Demonstration System:</strong> Seeded records represent realistic sample opportunities calibrated for research and demonstration. Verified badges indicate evaluation under admin review criteria.
          </span>
        </div>
      </div>

      {/* Section: How It Works */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">Simple Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">How SmartScholar Works</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From resume upload to deadline reminders, our smart recommendation engine navigates complex eligibility criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-mono font-bold text-indigo-600">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Create Your Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your university, GPA, degree level, and technical skills or upload your CV for automated extraction.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-mono font-bold text-indigo-600">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Tell Us Your Goals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specify your preferred countries, desired career track, and funding requirements (full-ride, stipend, tuition).
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-mono font-bold text-indigo-600">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Get Smart Recommendations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our 7-dimension engine calculates an instant match percentage with transparent checkmarked reasons.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-mono font-bold text-indigo-600">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Apply Before Deadline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track document prep, interviews, and automated alerts for 30d, 14d, 7d, and 24h reminders.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Opportunity Categories */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Opportunity Categories</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Explore all pathways supported in our centralized directory.</p>
          </div>
          <button
            onClick={onExploreCatalog}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View all opportunities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.title}
                onClick={onExploreCatalog}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{cat.title}</h3>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Featured Verified Opportunities */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">Verified Highlights</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Top Global Opportunities</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredOpportunities.map((opp) => (
            <div 
              key={opp.id}
              onClick={() => onViewOpportunity(opp)}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{opp.type}</span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span>{opp.country}</span>
                  </div>
                  {opp.verified && (
                    <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">
                  {opp.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{opp.provider}</p>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-600 block">Funding</span>
                  <span className="font-semibold text-slate-900">{opp.fundingType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-600 block">Deadline</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">{opp.applicationDeadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Why SmartScholar */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-2xs">
        <div className="max-w-2xl mb-8 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">The SmartScholar Edge</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Why Choose SmartScholar?</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Unlike static scholarship blogs with outdated links and unverified claims, SmartScholar brings algorithmic accuracy and administrative verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transparent Match Explanations</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every score shows exactly which criteria matched (degree, GPA, skills) and transparently highlights missing requirements.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>AI Resume & CV Parsing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Server-side extraction parses your CV into structured credentials, eliminating repetitive form entries.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>3-View Application Tracker</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize your pipeline through Kanban columns, detailed spreadsheets, or chronological deadline calendars.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Provider Audit</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Academic deans and verification directors vet official application URLs and eligibility restrictions.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ineligibility Safeguards</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents students from wasting time on programs with hard country or GPA exclusions unless intentionally bypassed.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Deadline Alerts & Reminders</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stay ahead with proactive deadline countdowns and alerts 30 days, 14 days, and 7 days before cutoffs.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="rounded-3xl bg-indigo-600 text-white p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to Find Your Scholarship?</h2>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mx-auto">
          Create your profile in 2 minutes and receive tailored opportunities matched to your academic potential.
        </p>
        <button
          onClick={onGetStarted}
          className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
        >
          Create Free Student Account
        </button>
      </section>

    </div>
  );
};
