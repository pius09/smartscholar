import React, { useState, useEffect } from 'react';
import { DegreeLevel, UserRole } from '../types';
import { X, LogIn, UserPlus, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onLogin: (credentials: { email: string; password?: string }) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  initialRole = 'student',
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('Canada');
  const [phone, setPhone] = useState('');

  // Student specific fields
  const [studentType, setStudentType] = useState<DegreeLevel>('Undergraduate');
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science');
  const [institution, setInstitution] = useState('');

  // Admin specific fields
  const [department, setDepartment] = useState('Scholarship & Admissions Directorate');
  const [adminTitle, setAdminTitle] = useState('Scholarship Administrator');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    if (initialRole) setRole(initialRole);
    setError('');
  }, [initialMode, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await onLogin({ email, password });
      } else {
        if (role === 'student') {
          await onRegister({
            role: 'student',
            fullName,
            email,
            password,
            country,
            phone,
            studentType,
            fieldOfStudy,
            institution,
          });
        } else {
          await onRegister({
            role: 'admin',
            fullName,
            email,
            password,
            country,
            phone,
            department,
            adminTitle,
            institution,
          });
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {mode === 'login' 
                ? 'Sign In to SmartScholar' 
                : role === 'student' ? 'Create Student Account' : 'Create Administrator Account'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {mode === 'login' 
                ? 'Access your saved opportunities, profile, and applications in the database' 
                : 'All accounts and credentials are saved directly to the database.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Register: Role Selection Toggle */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block text-xs">
              Select Account Type:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Student Account</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Recommendations & tracking</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  role === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Administrator</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Manage opportunities & students</div>
                </div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'admin' ? 'e.g. Dr. Eleanor Price' : 'e.g. Jonathan Davis'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {role === 'student' ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Degree Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={studentType}
                        onChange={(e) => setStudentType(e.target.value as DegreeLevel)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Master's">Master's</option>
                        <option value="PhD">PhD</option>
                        <option value="Recent Graduate">Recent Graduate</option>
                        <option value="Secondary School Student">Secondary School</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Field of Study <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Computer Science"
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      University / Institution <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. University of Toronto"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Department / Unit <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Academic Review Board"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Official Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Admissions Officer"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Organization / University / Foundation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SmartScholar Governance Board"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder={role === 'admin' && mode === 'register' ? 'admin@organization.org' : 'student@university.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer mt-3"
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Sign In to Your Account' 
                : role === 'admin' 
                  ? 'Create Administrator Account & Save' 
                  : 'Create Student Account & Save'}
          </button>
        </form>

        {/* Existing Seed Database Accounts Helper (for easy testing without manual typing) */}
        {mode === 'login' && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">
              Quick Test Seeded Accounts in Database:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => fillQuickCredentials('sarah.chen@university.edu', 'password123')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer text-left"
              >
                <div className="font-bold text-slate-900 text-xs">Sarah Chen (Student)</div>
                <div className="text-[10px] text-slate-600 truncate">sarah.chen@university.edu</div>
                <div className="text-[10px] font-mono text-indigo-600 mt-0.5">pass: password123</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('marcus.vance@smartscholar.org', 'admin123')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer text-left"
              >
                <div className="font-bold text-slate-900 text-xs">Dr. Vance (Admin)</div>
                <div className="text-[10px] text-slate-600 truncate">marcus.vance@smartscholar.org</div>
                <div className="text-[10px] font-mono text-indigo-600 mt-0.5">pass: admin123</div>
              </button>
            </div>
          </div>
        )}

        <div className="pt-1 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Create Student or Admin Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
