import React, { useState } from 'react';
import { User, StudentProfile, StudentSkill, DegreeLevel, FundingType } from '../types';
import { 
  User as UserIcon, 
  GraduationCap, 
  Wrench, 
  Heart, 
  Target, 
  Sliders, 
  Upload, 
  FileText, 
  Check, 
  Sparkles, 
  Plus, 
  X, 
  AlertCircle,
  Save
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  profile: StudentProfile | null;
  onUpdateProfile: (data: Partial<StudentProfile> & { fullName?: string; country?: string; phone?: string }) => Promise<void>;
  onUploadCv: (data: { fileName: string; rawText?: string; fileContent?: string }) => Promise<any>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profile,
  onUpdateProfile,
  onUploadCv,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'skills' | 'goals' | 'cv'>('academic');

  // Form states
  const [fullName, setFullName] = useState(user.fullName);
  const [country, setCountry] = useState(user.country);
  const [phone, setPhone] = useState(user.phone || '');

  const [institution, setInstitution] = useState(profile?.institution || '');
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(profile?.degreeLevel || "Master's");
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.fieldOfStudy || '');
  const [courseMajor, setCourseMajor] = useState(profile?.courseMajor || '');
  const [currentYear, setCurrentYear] = useState(profile?.currentYear || 'Year 2');
  const [gpa, setGpa] = useState<number>(profile?.gpa ?? 3.85);
  const [graduationYear, setGraduationYear] = useState<number>(profile?.graduationYear ?? 2027);

  const [achievementInput, setAchievementInput] = useState('');
  const [achievements, setAchievements] = useState<string[]>(profile?.academicAchievements || []);

  const [skills, setSkills] = useState<StudentSkill[]>(profile?.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [desiredCareer, setDesiredCareer] = useState(profile?.desiredCareer || '');
  const [careerGoal, setCareerGoal] = useState(profile?.careerGoal || '');
  const [longTermGoals, setLongTermGoals] = useState(profile?.longTermGoals || '');

  const [preferredCountries, setPreferredCountries] = useState<string[]>(profile?.preferredCountries || ['United Kingdom', 'Canada', 'United States']);
  const [newCountryInput, setNewCountryInput] = useState('');

  const [remotePreference, setRemotePreference] = useState(profile?.remotePreference ?? true);
  const [fundingPreferences, setFundingPreferences] = useState<FundingType[]>(profile?.fundingPreferences || ['Fully Funded', 'Stipend']);

  // CV Upload state
  const [cvText, setCvText] = useState('');
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [cvParseResult, setCvParseResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available options
  const allDegreeLevels: DegreeLevel[] = ['Undergraduate', "Master's", 'PhD', 'Recent Graduate', 'Secondary School Student'];
  const allInterests = [
    'Technology', 'Engineering', 'Medicine', 'Business', 'Agriculture', 
    'Law', 'Education', 'Science', 'Environment', 'Artificial Intelligence', 
    'Cybersecurity', 'Blockchain', 'Data Science'
  ];
  const allFundingTypes: FundingType[] = ['Fully Funded', 'Partially Funded', 'Tuition Only', 'Stipend', 'No Funding'];

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setAchievements([...achievements, achievementInput.trim()]);
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkillName.trim() && !skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleFundingPreference = (fund: FundingType) => {
    if (fundingPreferences.includes(fund)) {
      setFundingPreferences(fundingPreferences.filter(f => f !== fund));
    } else {
      setFundingPreferences([...fundingPreferences, fund]);
    }
  };

  const handleAddCountry = () => {
    if (newCountryInput.trim() && !preferredCountries.includes(newCountryInput.trim())) {
      setPreferredCountries([...preferredCountries, newCountryInput.trim()]);
      setNewCountryInput('');
    }
  };

  const handleRemoveCountry = (c: string) => {
    setPreferredCountries(preferredCountries.filter(item => item !== c));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateProfile({
        fullName,
        country,
        phone,
        institution,
        degreeLevel,
        fieldOfStudy,
        courseMajor,
        currentYear,
        gpa: Number(gpa),
        graduationYear: Number(graduationYear),
        academicAchievements: achievements,
        skills,
        interests,
        desiredCareer,
        careerGoal,
        longTermGoals,
        preferredCountries,
        remotePreference,
        fundingPreferences,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleParseCv = async () => {
    if (!cvText.trim()) return;
    setIsParsingCv(true);
    try {
      const res = await onUploadCv({
        fileName: 'academic_cv_pasted.txt',
        rawText: cvText,
      });

      if (res && res.extractedData) {
        setCvParseResult(res.extractedData);
        // Pre-populate fields if returned
        if (res.extractedData.institution) setInstitution(res.extractedData.institution);
        if (res.extractedData.fieldOfStudy) setFieldOfStudy(res.extractedData.fieldOfStudy);
        if (res.extractedData.gpa && res.extractedData.gpa > 0) setGpa(res.extractedData.gpa);
        if (res.extractedData.skills && res.extractedData.skills.length > 0) {
          const newExtractedSkills = res.extractedData.skills.map((s: string) => ({
            name: s,
            proficiency: 'Intermediate' as const,
          }));
          setSkills(prev => {
            const names = new Set(prev.map(p => p.name.toLowerCase()));
            const added = newExtractedSkills.filter((s: StudentSkill) => !names.has(s.name.toLowerCase()));
            return [...prev, ...added];
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse CV.');
    } finally {
      setIsParsingCv(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Save Button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Profile & CV Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Keep your credentials, skills, and funding preferences updated for accurate recommendation ranking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" />
              Saved successfully!
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        <div className="border-b border-slate-200 bg-slate-50/60 px-6 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'academic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Academic Information
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'skills' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Skills & Interests
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'goals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            Career Goals & Preferences
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'personal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cv' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            CV & Resume Parser
          </button>
        </div>

        <div className="p-6 md:p-8 text-xs text-slate-800">
          
          {/* TAB 1: ACADEMIC */}
          {activeTab === 'academic' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">University / Academic Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University of Toronto"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Degree Level</label>
                  <select
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white font-medium"
                  >
                    {allDegreeLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Major / Course Specialization</label>
                  <input
                    type="text"
                    value={courseMajor}
                    onChange={(e) => setCourseMajor(e.target.value)}
                    placeholder="e.g. Machine Learning & Computational Systems"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cumulative GPA / CGPA (4.0 Scale)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="4.0"
                    value={gpa}
                    onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white tabular-nums"
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Used to verify cutoffs for high-honor scholarships.</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(parseInt(e.target.value, 10) || 2027)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white tabular-nums"
                  />
                </div>
              </div>

              {/* Achievements */}
              <div className="pt-4 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-2">Honors, Awards & Publications</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Dean’s Honor List 2025, NeurIPS Climate Workshop Author"
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAchievement(); } }}
                  />
                  <button
                    onClick={handleAddAchievement}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span>{ach}</span>
                      <button onClick={() => handleRemoveAchievement(idx)} className="text-slate-400 hover:text-rose-600 p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SKILLS & INTERESTS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 max-w-3xl">
              {/* Skills Manager */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2">Technical & Soft Skills</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Python, Research, Project Management, C++)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span 
                      key={s.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">({s.proficiency})</span>
                      <button onClick={() => handleRemoveSkill(s.name)} className="text-slate-400 hover:text-rose-600 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div className="pt-4 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-1">Academic & Global Interests</label>
                <p className="text-[11px] text-slate-600 mb-3">Select domains you wish to pursue for fellowships and grants:</p>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CAREER GOALS & PREFERENCES */}
          {activeTab === 'goals' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Desired Career / Role</label>
                <input
                  type="text"
                  value={desiredCareer}
                  onChange={(e) => setDesiredCareer(e.target.value)}
                  placeholder="e.g. AI Research Scientist & Climate Modeler"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Career Goal & Vision</label>
                <textarea
                  rows={2}
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Founding an AI-driven climate intelligence research laboratory"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Funding Preferences */}
              <div className="pt-4 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-2">Funding Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {allFundingTypes.map((fund) => {
                    const isSelected = fundingPreferences.includes(fund);
                    return (
                      <button
                        key={fund}
                        onClick={() => toggleFundingPreference(fund)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {fund}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Countries */}
              <div className="pt-4 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-2">Preferred Study Destinations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add country (e.g. United Kingdom, Germany, Japan)"
                    value={newCountryInput}
                    onChange={(e) => setNewCountryInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCountry(); } }}
                  />
                  <button
                    onClick={handleAddCountry}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {preferredCountries.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-slate-800">
                      <span>{c}</span>
                      <button onClick={() => handleRemoveCountry(c)} className="text-slate-400 hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country of Citizenship / Residence</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <p className="text-[11px] text-slate-600 mt-1">Directly used by recommendation engine to check nationality eligibility.</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* TAB 5: CV PARSER */}
          {activeTab === 'cv' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Intelligent CV / Resume Analyzer
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Paste your CV or resume content below. Our server-side AI model extracts your academic qualifications, GPA, skills, and projects, automatically pre-populating your profile for high-match recommendations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Paste Resume / CV Plain Text</label>
                <textarea
                  rows={8}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste text from your PDF / Word resume here:
e.g.
Sarah Chen
University of Toronto, Master's Computer Science (Machine Learning)
GPA: 3.85 / 4.0
Skills: Python, PyTorch, Distributed Systems, Research, Data Analysis, Leadership
Experience: AI Research Intern at Vector Institute..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              <button
                onClick={handleParseCv}
                disabled={isParsingCv || !cvText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isParsingCv ? 'Analyzing CV with Gemini...' : 'Extract & Update Profile'}</span>
              </button>

              {/* Extraction Results preview */}
              {cvParseResult && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600" />
                    CV Information Successfully Extracted & Applied!
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded border border-emerald-100">
                      <span className="text-[10px] text-slate-600 block">Institution</span>
                      <span className="font-semibold">{cvParseResult.institution || 'Recognized'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-100">
                      <span className="text-[10px] text-slate-600 block">Degree Level</span>
                      <span className="font-semibold">{cvParseResult.degreeLevel || 'Graduate'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-100">
                      <span className="text-[10px] text-slate-600 block">GPA Extracted</span>
                      <span className="font-mono font-bold">{cvParseResult.gpa || '3.85'}</span>
                    </div>
                  </div>

                  {cvParseResult.skills && cvParseResult.skills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-950 block mb-1">
                        Skills Added to Profile:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cvParseResult.skills.map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-emerald-200 rounded text-[11px] text-emerald-900">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
