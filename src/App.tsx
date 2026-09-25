import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  StudentProfile, 
  Opportunity, 
  Recommendation, 
  SavedOpportunity, 
  Application, 
  NotificationItem, 
  AdminAnalytics,
  MatchWeights,
  UserRole
} from './types';
import { api, setAuthToken } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { DiscoverPage } from './components/DiscoverPage';
import { SavedPage } from './components/SavedPage';
import { ApplicationTracker } from './components/ApplicationTracker';
import { DeadlinesView } from './components/DeadlinesView';
import { ProfileView } from './components/ProfileView';
import { OpportunityDetailsModal } from './components/OpportunityDetailsModal';
import { NotificationModal } from './components/NotificationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analytics, setAnalytics] = useState<(AdminAnalytics & { matchWeights: MatchWeights }) | null>(null);
  const [adminStudents, setAdminStudents] = useState<any[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(true);

  // Load user data and content
  const loadData = async () => {
    try {
      setLoading(true);
      // Attempt to load current authenticated user from database token
      const me = await api.getCurrentUser().catch(() => null);
      if (me?.user) {
        setUser(me.user);
        setProfile(me.profile);
      } else {
        setUser(null);
        setProfile(null);
      }

      // Fetch public opportunities catalog
      const opps = await api.getOpportunities().catch(() => []);
      setOpportunities(opps);

      // If user is authenticated, fetch user-specific data from database
      if (me?.user) {
        if (me.user.role === 'admin') {
          const [dash, studs, notifs] = await Promise.all([
            api.getAdminDashboard().catch(() => null),
            api.getAdminStudents().catch(() => []),
            api.getNotifications().catch(() => []),
          ]);
          if (dash) setAnalytics(dash);
          setAdminStudents(studs);
          setNotifications(notifs);
        } else {
          const [recs, saved, apps, notifs] = await Promise.all([
            api.getRecommendations().catch(() => []),
            api.getSavedOpportunities().catch(() => []),
            api.getApplications().catch(() => []),
            api.getNotifications().catch(() => []),
          ]);
          setRecommendations(recs);
          setSavedOpportunities(saved);
          setApplications(apps);
          setNotifications(notifs);
        }
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update view when authenticated user changes
  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 'landing' || activeTab === 'dashboard') {
        setActiveTab('admin-dashboard');
      }
    } else if (user?.role === 'student') {
      if (activeTab === 'landing' || activeTab.startsWith('admin-')) {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Saved opportunity IDs set
  const savedIds = useMemo(() => {
    return new Set(savedOpportunities.map(s => s.opportunityId));
  }, [savedOpportunities]);

  // Match lookup map
  const matchMap = useMemo(() => {
    const map = new Map();
    recommendations.forEach(r => map.set(r.opportunity.id, r.matchBreakdown));
    return map;
  }, [recommendations]);

  // Action Handlers
  const handleToggleSave = async (opp: Opportunity) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedIds.has(opp.id);
    if (isCurrentlySaved) {
      setSavedOpportunities(prev => prev.filter(s => s.opportunityId !== opp.id));
      await api.removeSavedOpportunity(opp.id).catch(console.error);
    } else {
      const tempSaved: SavedOpportunity = {
        id: `save-${Date.now()}`,
        studentId: user.id,
        opportunityId: opp.id,
        opportunity: opp,
        savedAt: new Date().toISOString(),
      };
      setSavedOpportunities(prev => [tempSaved, ...prev]);
      await api.saveOpportunity(opp.id).catch(console.error);
    }
  };

  const handleApplyOrTrack = (opp: Opportunity) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setSelectedOpportunity(opp);
  };

  const handleTrackApplication = async (opp: Opportunity, status: string, notes?: string) => {
    if (!user) return;

    if (applications.some(a => a.opportunityId === opp.id)) {
      alert('You are already tracking an application for this opportunity.');
      return;
    }

    try {
      const newApp = await api.createApplication({
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        provider: opp.provider,
        opportunityType: opp.type,
        deadline: opp.applicationDeadline,
        applicationUrl: opp.applicationUrl,
        status: status as any,
        notes,
      });
      setApplications(prev => [newApp, ...prev]);
      
      const notifs = await api.getNotifications().catch(() => []);
      setNotifications(notifs);
    } catch (err: any) {
      alert(err.message || 'Failed to track application');
    }
  };

  const handleUpdateApplication = async (id: string, data: Partial<Application>) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    await api.updateApplication(id, data).catch(console.error);
  };

  const handleDeleteApplication = async (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    await api.deleteApplication(id).catch(console.error);
  };

  const handleCreateApplication = async (data: Partial<Application>) => {
    try {
      const newApp = await api.createApplication(data);
      setApplications(prev => [newApp, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Failed to add application');
    }
  };

  const handleUpdateProfile = async (profileData: any) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    setProfile(res.profile);

    const recs = await api.getRecommendations().catch(() => []);
    setRecommendations(recs);
  };

  const handleUploadCv = async (data: any) => {
    const res = await api.uploadCv(data);
    if (res?.profile) {
      setProfile(res.profile);
      const recs = await api.getRecommendations().catch(() => []);
      setRecommendations(recs);
      const notifs = await api.getNotifications().catch(() => []);
      setNotifications(notifs);
    }
    return res;
  };

  const handleLogin = async (credentials: { email: string; password?: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
    setProfile(res.profile);
    await loadData();
    setActiveTab(res.user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const handleRegister = async (data: any) => {
    const res = await api.register(data);
    setUser(res.user);
    setProfile(res.profile);
    await loadData();
    if (res.user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('profile'); // Direct student to profile wizard to personalize recommendations
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
    setSavedOpportunities([]);
    setApplications([]);
    setNotifications([]);
    setAnalytics(null);
    setAdminStudents([]);
    setActiveTab('landing');
  };

  // Admin opportunity handlers
  const handleAddOpportunity = async (opp: Partial<Opportunity>) => {
    const created = await api.createOpportunity(opp);
    setOpportunities(prev => [created, ...prev]);
    const recs = await api.getRecommendations().catch(() => []);
    setRecommendations(recs);
  };

  const handleUpdateOpportunity = async (id: string, opp: Partial<Opportunity>) => {
    const updated = await api.updateOpportunity(id, opp);
    setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
    const recs = await api.getRecommendations().catch(() => []);
    setRecommendations(recs);
  };

  const handleDeleteOpportunity = async (id: string) => {
    await api.deleteOpportunity(id);
    setOpportunities(prev => prev.filter(o => o.id !== id));
    setRecommendations(prev => prev.filter(r => r.opportunity.id !== id));
  };

  const handleUpdateWeights = async (weights: MatchWeights) => {
    const updated = await api.updateMatchWeights(weights);
    if (analytics) {
      setAnalytics({ ...analytics, matchWeights: updated });
    }
    const recs = await api.getRecommendations().catch(() => []);
    setRecommendations(recs);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthRole('student');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading && !opportunities.length ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-semibold text-slate-600">Connecting to SmartScholar opportunity database...</p>
          </div>
        ) : (
          <>
            {/* VIEW: Landing Page */}
            {activeTab === 'landing' && (
              <LandingPage
                opportunities={opportunities}
                onGetStarted={() => {
                  setAuthMode('register');
                  setAuthRole('student');
                  setAuthModalOpen(true);
                }}
                onExploreCatalog={() => setActiveTab('discover')}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
              />
            )}

            {/* VIEW: Student Dashboard */}
            {activeTab === 'dashboard' && user?.role === 'student' && (
              <StudentDashboard
                user={user}
                profile={profile}
                recommendations={recommendations}
                savedOpportunities={savedOpportunities}
                applications={applications}
                onNavigate={setActiveTab}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleSave={handleToggleSave}
                onApplyOrTrack={handleApplyOrTrack}
              />
            )}

            {/* VIEW: Discover Marketplace */}
            {activeTab === 'discover' && (
              <DiscoverPage
                opportunities={opportunities}
                recommendations={recommendations}
                savedOpportunityIds={savedIds}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleSave={handleToggleSave}
                onApplyOrTrack={handleApplyOrTrack}
              />
            )}

            {/* VIEW: Recommendations */}
            {activeTab === 'recommended' && user?.role === 'student' && (
              <DiscoverPage
                opportunities={recommendations.map(r => r.opportunity)}
                recommendations={recommendations}
                savedOpportunityIds={savedIds}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleSave={handleToggleSave}
                onApplyOrTrack={handleApplyOrTrack}
                title="Personalized Recommendations"
                subtitle="Calculated by our 7-factor recommendation engine matching your degree level, GPA, field, skills, and preferences."
                defaultOnlyRecommended={true}
              />
            )}

            {/* VIEW: Saved Opportunities */}
            {activeTab === 'saved' && user?.role === 'student' && (
              <SavedPage
                savedOpportunities={savedOpportunities}
                matchMap={matchMap}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
                onRemoveSaved={(oppId) => {
                  const target = opportunities.find(o => o.id === oppId);
                  if (target) handleToggleSave(target);
                }}
                onApplyOrTrack={handleApplyOrTrack}
                onNavigateDiscover={() => setActiveTab('discover')}
              />
            )}

            {/* VIEW: Application Tracker */}
            {activeTab === 'applications' && user?.role === 'student' && (
              <ApplicationTracker
                applications={applications}
                opportunities={opportunities}
                onUpdateApplication={handleUpdateApplication}
                onDeleteApplication={handleDeleteApplication}
                onCreateApplication={handleCreateApplication}
                onViewOpportunityById={(oppId) => {
                  const target = opportunities.find(o => o.id === oppId);
                  if (target) setSelectedOpportunity(target);
                }}
              />
            )}

            {/* VIEW: Deadlines */}
            {activeTab === 'deadlines' && user?.role === 'student' && (
              <DeadlinesView
                opportunities={opportunities}
                applications={applications}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
                onApplyOrTrack={handleApplyOrTrack}
              />
            )}

            {/* VIEW: Profile */}
            {activeTab === 'profile' && user?.role === 'student' && (
              <ProfileView
                user={user}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onUploadCv={handleUploadCv}
              />
            )}

            {/* VIEW: Admin Console */}
            {activeTab.startsWith('admin-') && user?.role === 'admin' && (
              <AdminDashboard
                analytics={analytics}
                opportunities={opportunities}
                students={adminStudents}
                onAddOpportunity={handleAddOpportunity}
                onUpdateOpportunity={handleUpdateOpportunity}
                onDeleteOpportunity={handleDeleteOpportunity}
                onUpdateWeights={handleUpdateWeights}
                onViewOpportunity={(opp) => setSelectedOpportunity(opp)}
              />
            )}

            {/* Unauthenticated / Unauthorized Fallback when accessing protected tabs */}
            {!user && activeTab !== 'landing' && activeTab !== 'discover' && (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 font-bold text-lg">
                  !
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
                <p className="text-xs text-slate-600">
                  Please sign in or create an account as a Student or Administrator to access this section. All data is saved to your account in the database.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthRole('student');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SmartScholar</span>
            <span>—</span>
            <span>Smart Scholarship & Student Opportunity Recommendation System</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('discover')} className="hover:text-indigo-600 cursor-pointer">
              Explore Catalog
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            {!user ? (
              <>
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }} 
                  className="hover:text-indigo-600 cursor-pointer font-medium"
                >
                  Sign In
                </button>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setAuthRole('admin');
                    setAuthModalOpen(true);
                  }} 
                  className="hover:text-indigo-600 cursor-pointer text-slate-500"
                >
                  Administrator Registration
                </button>
              </>
            ) : (
              <span className="text-slate-500 font-medium">
                Signed in as <strong className="text-slate-700">{user.fullName}</strong> ({user.role})
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Modal: Opportunity Details & Match Breakdown */}
      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          matchBreakdown={matchMap.get(selectedOpportunity.id)}
          studentProfile={profile}
          isSaved={savedIds.has(selectedOpportunity.id)}
          onClose={() => setSelectedOpportunity(null)}
          onToggleSave={handleToggleSave}
          onTrackApplication={handleTrackApplication}
        />
      )}

      {/* Modal: Notifications Center */}
      <NotificationModal
        isOpen={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkRead={async (id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
          await api.markNotificationRead(id).catch(console.error);
        }}
        onMarkAllRead={async () => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          await api.markAllNotificationsRead().catch(console.error);
        }}
        onNavigate={(link) => {
          if (link.startsWith('/applications')) setActiveTab('applications');
          else if (link.startsWith('/profile')) setActiveTab('profile');
          else if (link.startsWith('/admin')) setActiveTab('admin-dashboard');
          else if (link.startsWith('/opportunities/')) {
            const oppId = link.split('/')[2];
            const found = opportunities.find(o => o.id === oppId);
            if (found) setSelectedOpportunity(found);
          }
        }}
      />

      {/* Modal: Authentication & Registration (Student or Administrator) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

    </div>
  );
}
