import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Building2,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  onOpenAuth,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab(user ? (isAdmin ? 'admin-dashboard' : 'dashboard') : 'landing')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-hidden cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              S
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                SmartScholar
              </span>
              <span className="text-[10px] text-slate-600 block -mt-0.5">
                Opportunity Intelligence
              </span>
            </div>
          </button>

          {/* Role badge */}
          {user && (
            <span className="hidden sm:inline-flex items-center text-xs font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              {isAdmin ? 'Admin Console' : 'Student Portal'}
            </span>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {!user ? (
            <>
              <button
                onClick={() => setActiveTab('landing')}
                className={`transition-colors py-1 cursor-pointer ${activeTab === 'landing' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`transition-colors py-1 cursor-pointer ${activeTab === 'discover' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Explore Catalog
              </button>
            </>
          ) : isStudent ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'dashboard' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'discover' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab('recommended')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'recommended' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Recommendations
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'saved' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Saved
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'applications' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Tracker
              </button>
              <button
                onClick={() => setActiveTab('deadlines')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'deadlines' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Deadlines
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'admin-dashboard' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('admin-opportunities')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'admin-opportunities' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Manage Opportunities
              </button>
              <button
                onClick={() => setActiveTab('admin-students')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'admin-students' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Students Directory
              </button>
              <button
                onClick={() => setActiveTab('admin-weights')}
                className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${activeTab === 'admin-weights' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
              >
                Match Weights
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: User actions & Login */}
        <div className="flex items-center gap-3">
          
          {user ? (
            <>
              {/* Notifications Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-2xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                    {user.profilePhoto ? (
                      <img 
                        src={user.profilePhoto} 
                        alt={user.fullName} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-900 leading-none">{user.fullName}</p>
                    <p className="text-slate-600 text-[11px] capitalize mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                      <p className="text-slate-600 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        Signed in as {user.role === 'admin' ? 'Administrator' : 'Student'}
                      </div>
                    </div>

                    {isStudent && (
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        My Academic Profile & CV
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => setActiveTab('admin-dashboard')}
                        className="w-full text-left px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Administrator Console
                      </button>
                    )}

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Create Account
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
