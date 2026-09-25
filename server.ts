import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { MOCK_OPPORTUNITIES, INITIAL_MATCH_WEIGHTS } from './src/data/mockOpportunities.js';
import { rankOpportunities, calculateMatchScore } from './src/services/recommendationEngine.js';
import {
  User,
  UserRole,
  StudentProfile,
  Opportunity,
  Application,
  NotificationItem,
  SavedOpportunity,
  MatchWeights,
} from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize Google Gen AI client with telemetry user agent
let genAiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Persistent Database Store
export type StoredUser = User & { password?: string };

interface DatabaseState {
  users: StoredUser[];
  profiles: Record<string, StudentProfile>;
  opportunities: Opportunity[];
  saved: SavedOpportunity[];
  applications: Application[];
  notifications: NotificationItem[];
  matchWeights: MatchWeights;
  activeSessions: Record<string, string>; // token -> userId
}

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const db: DatabaseState = {
  users: [
    {
      id: 'usr-student-1',
      fullName: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      password: 'password123',
      role: 'student',
      country: 'Canada',
      phone: '+1 (555) 234-8901',
      profilePhoto: '/src/assets/images/avatar_student_sarah_1790369786359.jpg',
      createdAt: '2026-08-01T09:00:00Z',
    },
    {
      id: 'usr-student-2',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@polytechnic.edu',
      password: 'password123',
      role: 'student',
      country: 'United States',
      phone: '+1 (555) 789-1234',
      createdAt: '2026-08-15T11:00:00Z',
    },
    {
      id: 'usr-admin-1',
      fullName: 'Dr. Marcus Vance',
      email: 'marcus.vance@smartscholar.org',
      password: 'admin123',
      role: 'admin',
      country: 'United Kingdom',
      phone: '+44 20 7946 0991',
      department: 'Admissions & Global Scholarships',
      adminTitle: 'Director of Academic Affairs',
      profilePhoto: '/src/assets/images/avatar_scholar_director_1790369796220.jpg',
      createdAt: '2026-06-01T08:00:00Z',
    },
  ],
  profiles: {
    'usr-student-1': {
      id: 'prof-1',
      userId: 'usr-student-1',
      institution: 'University of Toronto',
      degreeLevel: "Master's",
      fieldOfStudy: 'Computer Science',
      courseMajor: 'Machine Learning & Systems',
      currentYear: 'Year 2',
      gpa: 3.85,
      graduationYear: 2027,
      academicAchievements: [
        'Dean’s Honor List 2024–2026',
        'Lead Author, NeurIPS Climate & ML Workshop Paper 2025',
        'Governor General’s Academic Bronze Medal nominee',
      ],
      skills: [
        { name: 'Programming', proficiency: 'Expert' },
        { name: 'Research', proficiency: 'Advanced' },
        { name: 'Machine Learning', proficiency: 'Advanced' },
        { name: 'Data Analysis', proficiency: 'Advanced' },
        { name: 'Python', proficiency: 'Expert' },
        { name: 'Leadership', proficiency: 'Intermediate' },
        { name: 'Writing', proficiency: 'Advanced' },
      ],
      interests: [
        'Technology',
        'Artificial Intelligence',
        'Data Science',
        'Environment',
        'Engineering',
      ],
      careerGoal: 'Founding an AI-driven climate intelligence research laboratory',
      desiredCareer: 'AI Research Scientist & Computational Ecologist',
      preferredIndustries: ['Deep Tech', 'Climate Tech', 'Academic Research', 'Biotechnology'],
      longTermGoals: 'Lead planetary computational initiatives and mentor next-generation female engineers in high-performance computing.',
      preferredCountries: ['United Kingdom', 'Switzerland', 'United States', 'Germany', 'Canada'],
      remotePreference: true,
      fundingPreferences: ['Fully Funded', 'Stipend'],
      financialNeed: 'Moderate',
      profileCompletion: 95,
      updatedAt: '2026-09-20T14:00:00Z',
    },
    'usr-student-2': {
      id: 'prof-2',
      userId: 'usr-student-2',
      institution: 'Georgia Institute of Technology',
      degreeLevel: 'Undergraduate',
      fieldOfStudy: 'Mechanical Engineering',
      courseMajor: 'Robotics and Mechatronics',
      currentYear: 'Senior Year',
      gpa: 3.65,
      graduationYear: 2027,
      academicAchievements: ['FIRST Robotics National Finalist', 'Undergraduate Research Fellowship Award'],
      skills: [
        { name: 'CAD / Modeling', proficiency: 'Advanced' },
        { name: 'Programming', proficiency: 'Intermediate' },
        { name: 'Robotics', proficiency: 'Advanced' },
        { name: 'Project Management', proficiency: 'Intermediate' },
      ],
      interests: ['Engineering', 'Technology', 'Renewable Energy', 'Aerospace'],
      careerGoal: 'Robotics Design Engineer for clean maritime logistics',
      desiredCareer: 'Robotics Automation Engineer',
      preferredIndustries: ['Robotics', 'Clean Energy', 'Autonomous Systems'],
      longTermGoals: 'Lead development of zero-emission autonomous vehicles.',
      preferredCountries: ['Germany', 'Sweden', 'Japan', 'United States'],
      remotePreference: false,
      fundingPreferences: ['Fully Funded', 'Partially Funded'],
      financialNeed: 'High',
      profileCompletion: 85,
      updatedAt: '2026-09-18T10:00:00Z',
    },
  },
  opportunities: [...MOCK_OPPORTUNITIES],
  saved: [
    {
      id: 'save-1',
      studentId: 'usr-student-1',
      opportunityId: 'opp-1',
      opportunity: MOCK_OPPORTUNITIES[0],
      savedAt: '2026-09-15T10:00:00Z',
      notes: 'Priority choice. Need to request 2 recommendation letters from Prof. Hastings by Oct 15.',
    },
    {
      id: 'save-2',
      studentId: 'usr-student-1',
      opportunityId: 'opp-10',
      opportunity: MOCK_OPPORTUNITIES[9],
      savedAt: '2026-09-18T16:20:00Z',
      notes: 'Forming a 2-person team with Liam for the NeurIPS workshop presentation.',
    },
    {
      id: 'save-3',
      studentId: 'usr-student-1',
      opportunityId: 'opp-16',
      opportunity: MOCK_OPPORTUNITIES[15],
      savedAt: '2026-09-22T08:45:00Z',
      notes: 'Erasmus Mundus triple master program in Sorbonne / Leuven / Munich.',
    },
  ],
  applications: [
    {
      id: 'app-1',
      studentId: 'usr-student-1',
      opportunityId: 'opp-1',
      opportunityTitle: 'Global Tech Leadership Fellowship',
      provider: 'Turing-Schmidt Foundation',
      opportunityType: 'Fellowship',
      deadline: '2026-11-15',
      applicationUrl: 'https://example.org/turing-fellowship',
      status: 'Preparing',
      applicationDate: '2026-09-16T12:00:00Z',
      notes: 'Drafted statement of purpose. Pending IELTS score sheet verification.',
      documents: [
        { name: 'CV_Sarah_Chen_2026.pdf', url: '#', type: 'CV' },
        { name: 'SOP_Turing_Draft_v2.docx', url: '#', type: 'Statement of Purpose' },
      ],
      updatedAt: '2026-09-22T10:00:00Z',
    },
    {
      id: 'app-2',
      studentId: 'usr-student-1',
      opportunityId: 'opp-5',
      opportunityTitle: 'Stanford Knight-Hennessy Global Scholars Program',
      provider: 'Stanford University',
      opportunityType: 'Scholarship',
      deadline: '2026-10-08',
      applicationUrl: 'https://knight-hennessy.stanford.edu',
      status: 'Applied',
      applicationDate: '2026-09-20T15:30:00Z',
      notes: 'Submitted online portal. Video statement recorded and linked.',
      documents: [
        { name: 'KH_Application_Summary.pdf', url: '#', type: 'Application Summary' },
        { name: 'Official_Transcripts_UofT.pdf', url: '#', type: 'Transcripts' },
      ],
      updatedAt: '2026-09-20T15:30:00Z',
    },
    {
      id: 'app-3',
      studentId: 'usr-student-1',
      opportunityId: 'opp-14',
      opportunityTitle: 'McKinsey & Co. Global Young Leaders Summer Associate',
      provider: 'McKinsey & Company',
      opportunityType: 'Internship',
      deadline: '2026-10-02',
      applicationUrl: 'https://www.mckinsey.com/careers/students',
      status: 'Interview',
      applicationDate: '2026-09-05T09:00:00Z',
      notes: 'First round case interview scheduled for Thursday Oct 1st at 2:00 PM EST.',
      documents: [{ name: 'Resume_Consulting_Focus.pdf', url: '#', type: 'Resume' }],
      updatedAt: '2026-09-24T18:00:00Z',
    },
    {
      id: 'app-4',
      studentId: 'usr-student-1',
      opportunityId: 'opp-10',
      opportunityTitle: 'AI for Climate Resilience Data Challenge',
      provider: 'DeepMind Earth Foundation',
      opportunityType: 'Competition',
      deadline: '2026-10-18',
      applicationUrl: 'https://example.org/deepmind-climate-challenge',
      status: 'Under Review',
      applicationDate: '2026-09-12T14:00:00Z',
      notes: 'Notebook submitted. Benchmark test scores currently in top 8 percentile.',
      documents: [{ name: 'Technical_Report_v1.pdf', url: '#', type: 'Technical Report' }],
      updatedAt: '2026-09-19T11:00:00Z',
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'usr-student-1',
      title: 'Upcoming Deadline Alert',
      message: 'The Stanford Knight-Hennessy Global Scholars Program deadline is in 13 days (October 8, 2026).',
      type: 'deadline',
      isRead: false,
      link: '/applications',
      createdAt: '2026-09-25T08:00:00Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-student-1',
      title: '94% Match Recommendation',
      message: 'Global Tech Leadership Fellowship matches your Master’s Computer Science profile and ML research publications.',
      type: 'recommendation',
      isRead: false,
      link: '/opportunities/opp-1',
      createdAt: '2026-09-24T14:30:00Z',
    },
    {
      id: 'notif-3',
      userId: 'usr-student-1',
      title: 'Application Milestone Update',
      message: 'McKinsey & Co. moved your application to the Interview round. Check preparation resources.',
      type: 'application',
      isRead: true,
      link: '/applications',
      createdAt: '2026-09-24T18:05:00Z',
    },
    {
      id: 'notif-4',
      userId: 'usr-student-1',
      title: 'Official Opportunity Verified',
      message: 'DAAD Helmut-Schmidt Public Policy & Law Scholarship was verified by the academic verification board.',
      type: 'opportunity',
      isRead: true,
      link: '/opportunities/opp-3',
      createdAt: '2026-09-21T09:15:00Z',
    },
  ],
  matchWeights: { ...INITIAL_MATCH_WEIGHTS },
  activeSessions: {},
};

// Database persistence helpers
function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      if (loaded.users && Array.isArray(loaded.users)) {
        db.users = loaded.users;
        db.profiles = loaded.profiles || {};
        db.opportunities = loaded.opportunities || [...MOCK_OPPORTUNITIES];
        db.saved = loaded.saved || [];
        db.applications = loaded.applications || [];
        db.notifications = loaded.notifications || [];
        db.matchWeights = loaded.matchWeights || { ...INITIAL_MATCH_WEIGHTS };
        db.activeSessions = loaded.activeSessions || {};
        console.log(`[SmartScholar DB] Loaded ${db.users.length} users, ${db.opportunities.length} opportunities from database.json`);
        return;
      }
    }
  } catch (err) {
    console.warn('Could not read existing database.json, initializing fresh seed:', err);
  }
  // If not existing, write initial seed to file
  saveDatabase();
  console.log('[SmartScholar DB] Initialized and saved initial database seed to database.json');
}

// Initialize database from file or seed
loadDatabase();

// Current authenticated user helper - strictly evaluates token against active sessions
function getAuthUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;
  const userId = db.activeSessions[token];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

// ----------------------------------------------------
// AUTH ROUTES (Student or Admin Registration & Login)
// ----------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { 
    role, 
    fullName, 
    email, 
    password, 
    country, 
    phone, 
    studentType, 
    fieldOfStudy, 
    institution,
    department,
    adminTitle 
  } = req.body;
  
  if (!fullName || !email || !password) {
    res.status(400).json({ error: 'Full name, email address, and password are required.' });
    return;
  }

  const userRole: UserRole = role === 'admin' ? 'admin' : 'student';

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
    return;
  }

  const newUserId = `usr-${userRole}-${Date.now()}`;
  const newUser: StoredUser = {
    id: newUserId,
    fullName: fullName.trim(),
    email: email.trim(),
    password: password.trim(),
    role: userRole,
    country: country || (userRole === 'admin' ? 'Global' : 'Canada'),
    phone: phone ? phone.trim() : undefined,
    department: userRole === 'admin' ? (department || 'Admissions & Scholarships') : undefined,
    adminTitle: userRole === 'admin' ? (adminTitle || 'Scholarship Administrator') : undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // If student account, create default academic profile
  if (userRole === 'student') {
    db.profiles[newUserId] = {
      id: `prof-${Date.now()}`,
      userId: newUserId,
      institution: institution || 'State University',
      degreeLevel: (studentType as any) || 'Undergraduate',
      fieldOfStudy: fieldOfStudy || 'Computer Science',
      courseMajor: fieldOfStudy || 'General',
      currentYear: 'Year 1',
      gpa: 3.5,
      graduationYear: 2028,
      academicAchievements: [],
      skills: [
        { name: 'Research', proficiency: 'Intermediate' },
        { name: 'Writing', proficiency: 'Intermediate' },
      ],
      interests: ['Technology', 'Education'],
      careerGoal: 'Pursue graduate research and international opportunities',
      desiredCareer: 'Software Engineer & Researcher',
      preferredIndustries: ['Technology', 'Research'],
      longTermGoals: 'Contribute positively to academic innovation and global opportunities.',
      preferredCountries: ['United States', 'United Kingdom', 'Canada', 'Germany'],
      remotePreference: true,
      fundingPreferences: ['Fully Funded'],
      financialNeed: 'Moderate',
      profileCompletion: 45,
      updatedAt: new Date().toISOString(),
    };
  }

  // Generate unique token
  const token = `token-${newUserId}-${Date.now()}`;
  db.activeSessions[token] = newUserId;

  // Add welcome notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: newUserId,
    title: userRole === 'admin' ? 'Administrator Account Created' : 'Welcome to SmartScholar',
    message: userRole === 'admin'
      ? 'Your administrator portal is active. You can publish opportunities, audit eligibility, and monitor analytics.'
      : 'Your student account is created. Complete your academic profile to unlock personalized opportunity recommendations.',
    type: userRole === 'admin' ? 'announcement' : 'opportunity',
    isRead: false,
    link: userRole === 'admin' ? '/admin/dashboard' : '/profile',
    createdAt: new Date().toISOString(),
  });

  // Permanently save to database
  saveDatabase();

  const userSafe = { ...newUser };
  delete userSafe.password;

  res.json({
    token,
    user: userSafe,
    profile: db.profiles[newUserId] || null,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    res.status(401).json({ error: 'No account found with this email. Please create a Student or Admin account first.' });
    return;
  }

  // Check password if set
  if (user.password && password && user.password !== password.trim()) {
    res.status(401).json({ error: 'Incorrect password. Please try again.' });
    return;
  }

  const token = `token-${user.id}-${Date.now()}`;
  db.activeSessions[token] = user.id;

  saveDatabase();

  const userSafe = { ...user };
  delete userSafe.password;

  res.json({
    token,
    user: userSafe,
    profile: db.profiles[user.id] || null,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    delete db.activeSessions[token];
    saveDatabase();
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const userSafe = { ...user };
  delete userSafe.password;

  res.json({
    user: userSafe,
    profile: db.profiles[user.id] || null,
  });
});

// ----------------------------------------------------
// PROFILE & CV ROUTES
// ----------------------------------------------------

app.get('/api/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const profile = db.profiles[user.id] || db.profiles['usr-student-1'];
  res.json({ user, profile });
});

app.put('/api/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const currentProfile = db.profiles[user.id] || {
    id: `prof-${user.id}`,
    userId: user.id,
    institution: '',
    degreeLevel: 'Undergraduate',
    fieldOfStudy: '',
    courseMajor: '',
    currentYear: '',
    gpa: 3.5,
    graduationYear: 2028,
    academicAchievements: [],
    skills: [],
    interests: [],
    careerGoal: '',
    desiredCareer: '',
    preferredIndustries: [],
    longTermGoals: '',
    preferredCountries: [],
    remotePreference: false,
    fundingPreferences: ['Fully Funded'],
    financialNeed: 'Moderate',
    profileCompletion: 50,
    updatedAt: new Date().toISOString(),
  };

  const updatedProfile: StudentProfile = {
    ...currentProfile,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate profile completion percentage
  let score = 0;
  if (updatedProfile.institution) score += 10;
  if (updatedProfile.degreeLevel) score += 10;
  if (updatedProfile.fieldOfStudy) score += 10;
  if (updatedProfile.gpa > 0) score += 15;
  if (updatedProfile.skills && updatedProfile.skills.length >= 3) score += 15;
  if (updatedProfile.interests && updatedProfile.interests.length >= 2) score += 10;
  if (updatedProfile.careerGoal) score += 15;
  if (updatedProfile.preferredCountries && updatedProfile.preferredCountries.length >= 1) score += 10;
  if (updatedProfile.cvUrl || updatedProfile.cvFileName) score += 5;
  updatedProfile.profileCompletion = Math.min(100, Math.max(20, score));

  db.profiles[user.id] = updatedProfile;

  // Also update user name / country if sent
  if (req.body.fullName || req.body.country || req.body.phone) {
    const userIndex = db.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      db.users[userIndex] = {
        ...db.users[userIndex],
        fullName: req.body.fullName || db.users[userIndex].fullName,
        country: req.body.country || db.users[userIndex].country,
        phone: req.body.phone || db.users[userIndex].phone,
      };
    }
  }

  saveDatabase();

  const userFound = db.users.find(u => u.id === user.id);
  const userSafe = userFound ? { ...userFound } : user;
  delete (userSafe as any).password;

  res.json({
    user: userSafe,
    profile: updatedProfile,
  });
});

// CV / Resume upload with intelligent AI parsing
app.post('/api/profile/cv', async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { fileName, fileContent, rawText } = req.body;
  const textToParse = rawText || (fileContent ? Buffer.from(fileContent.split(',')[1] || fileContent, 'base64').toString('utf-8') : '');

  let extractedData = {
    institution: '',
    degreeLevel: '',
    fieldOfStudy: '',
    gpa: 0,
    skills: [] as string[],
    achievements: [] as string[],
    workExperience: [] as string[],
    projects: [] as string[],
    extractedSummary: '',
  };

  // If Gemini API is available, perform intelligent semantic extraction
  if (genAiClient && textToParse.length > 30) {
    try {
      const prompt = `You are an expert academic CV analyzer for scholarships and research fellowships. Extract structured academic information from this student resume/CV text:\n\n${textToParse.slice(0, 4000)}\n\nReturn a clean JSON object matching the requested schema.`;
      
      const response = await genAiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degreeLevel: { type: Type.STRING, description: "Undergraduate, Master's, PhD, or Recent Graduate" },
              fieldOfStudy: { type: Type.STRING },
              gpa: { type: Type.NUMBER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              workExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              extractedSummary: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      extractedData = { ...extractedData, ...parsed };
    } catch (err) {
      console.warn('Gemini CV parsing error, falling back to heuristic parser:', err);
    }
  }

  // Fallback heuristic extraction if Gemini was not used or produced empty values
  if (!extractedData.fieldOfStudy && textToParse) {
    const lower = textToParse.toLowerCase();
    if (lower.includes('computer science') || lower.includes('software')) extractedData.fieldOfStudy = 'Computer Science';
    else if (lower.includes('engineering')) extractedData.fieldOfStudy = 'Engineering';
    else if (lower.includes('medicine') || lower.includes('health')) extractedData.fieldOfStudy = 'Medicine';
    else if (lower.includes('business') || lower.includes('finance')) extractedData.fieldOfStudy = 'Business';

    const gpaMatch = textToParse.match(/GPA[:\s]+([0-4]\.[0-9]{1,2})/i);
    if (gpaMatch && gpaMatch[1]) extractedData.gpa = parseFloat(gpaMatch[1]);

    const commonSkills = ['Python', 'Java', 'Data Analysis', 'Research', 'Machine Learning', 'Leadership', 'Communication', 'Project Management'];
    extractedData.skills = commonSkills.filter(s => lower.includes(s.toLowerCase()));
  }

  // Update profile with extracted details
  const currentProfile = db.profiles[user.id] || db.profiles['usr-student-1'];
  const newSkills = [...currentProfile.skills];
  if (extractedData.skills && extractedData.skills.length > 0) {
    for (const skillName of extractedData.skills) {
      if (!newSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
        newSkills.push({ name: skillName, proficiency: 'Intermediate' });
      }
    }
  }

  const updatedProfile: StudentProfile = {
    ...currentProfile,
    institution: extractedData.institution || currentProfile.institution,
    degreeLevel: (extractedData.degreeLevel as any) || currentProfile.degreeLevel,
    fieldOfStudy: extractedData.fieldOfStudy || currentProfile.fieldOfStudy,
    gpa: extractedData.gpa > 0 ? extractedData.gpa : currentProfile.gpa,
    skills: newSkills,
    academicAchievements: Array.from(new Set([...currentProfile.academicAchievements, ...(extractedData.achievements || [])])),
    cvFileName: fileName || 'uploaded_cv.pdf',
    cvUrl: '#',
    cvExtractedText: extractedData.extractedSummary || textToParse.slice(0, 500),
    profileCompletion: Math.min(100, currentProfile.profileCompletion + 10),
    updatedAt: new Date().toISOString(),
  };

  db.profiles[user.id] = updatedProfile;

  // Add notification about CV extraction
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'CV Information Extracted',
    message: `Successfully extracted ${extractedData.skills.length} skills and updated your academic profile.`,
    type: 'profile',
    isRead: false,
    link: '/profile',
    createdAt: new Date().toISOString(),
  });

  saveDatabase();

  res.json({
    success: true,
    extractedData,
    profile: updatedProfile,
  });
});

// ----------------------------------------------------
// OPPORTUNITIES & RECOMMENDATIONS ROUTES
// ----------------------------------------------------

app.get('/api/opportunities', (req: Request, res: Response) => {
  let list = [...db.opportunities];
  const { search, type, funding, level, country, status, deadline, minGpa } = req.query;

  // Filter out expired or non-published for normal students unless admin requested
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    list = list.filter(o => o.status === 'Published');
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.provider.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.country.toLowerCase().includes(q) ||
      o.eligibleFields.some(f => f.toLowerCase().includes(q)) ||
      o.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (type && typeof type === 'string' && type !== 'All') {
    list = list.filter(o => o.type === type);
  }

  if (funding && typeof funding === 'string' && funding !== 'All') {
    list = list.filter(o => o.fundingType === funding);
  }

  if (level && typeof level === 'string' && level !== 'All') {
    list = list.filter(o => o.degreeLevels.includes(level as any));
  }

  if (country && typeof country === 'string' && country !== 'All') {
    list = list.filter(o => o.country.toLowerCase() === country.toLowerCase() || o.country === 'Global');
  }

  if (status && typeof status === 'string' && status !== 'All') {
    list = list.filter(o => o.status === status);
  }

  if (minGpa && typeof minGpa === 'string') {
    const g = parseFloat(minGpa);
    if (!isNaN(g)) {
      list = list.filter(o => o.minimumGpa <= g);
    }
  }

  if (deadline && typeof deadline === 'string') {
    const today = new Date('2026-09-25');
    if (deadline === 'closing-soon') {
      list = list.filter(o => {
        const d = new Date(o.applicationDeadline);
        const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
      });
    } else if (deadline === 'this-month') {
      list = list.filter(o => {
        const d = new Date(o.applicationDeadline);
        const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 60;
      });
    }
  }

  res.json(list);
});

app.get('/api/opportunities/:id', (req: Request, res: Response) => {
  const opp = db.opportunities.find(o => o.id === req.params.id);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }
  res.json(opp);
});

// Personalized recommendations for logged in student
app.get('/api/recommendations', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const profile = db.profiles[user.id] || db.profiles['usr-student-1'];
  const publishedOpps = db.opportunities.filter(o => o.status === 'Published');
  const ranked = rankOpportunities(profile, user.country, publishedOpps, db.matchWeights);

  res.json(ranked);
});

app.get('/api/recommendations/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const opp = db.opportunities.find(o => o.id === req.params.id);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  const profile = db.profiles[user.id] || db.profiles['usr-student-1'];
  const breakdown = calculateMatchScore(profile, user.country, opp, db.matchWeights);

  res.json({
    opportunity: opp,
    matchBreakdown: breakdown,
  });
});

// ----------------------------------------------------
// SAVED OPPORTUNITIES ROUTES
// ----------------------------------------------------

app.get('/api/saved', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const saved = db.saved.filter(s => s.studentId === user.id);
  res.json(saved);
});

app.post('/api/opportunities/:id/save', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const opp = db.opportunities.find(o => o.id === req.params.id);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  const existing = db.saved.find(s => s.studentId === user.id && s.opportunityId === opp.id);
  if (existing) {
    res.json(existing);
    return;
  }

  const savedItem: SavedOpportunity = {
    id: `save-${Date.now()}`,
    studentId: user.id,
    opportunityId: opp.id,
    opportunity: opp,
    savedAt: new Date().toISOString(),
    notes: req.body.notes || '',
  };

  db.saved.push(savedItem);
  saveDatabase();
  res.json(savedItem);
});

app.delete('/api/opportunities/:id/save', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  db.saved = db.saved.filter(s => !(s.studentId === user.id && s.opportunityId === req.params.id));
  saveDatabase();
  res.json({ success: true });
});

// ----------------------------------------------------
// APPLICATIONS TRACKER ROUTES
// ----------------------------------------------------

app.get('/api/applications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const userApps = db.applications.filter(a => a.studentId === user.id);
  res.json(userApps);
});

app.post('/api/applications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { opportunityId, status, notes, documents } = req.body;
  const opp = db.opportunities.find(o => o.id === opportunityId);

  // Check for duplicate application
  const existing = db.applications.find(a => a.studentId === user.id && a.opportunityId === opportunityId);
  if (existing) {
    res.status(400).json({ error: 'You have already tracked or submitted an application for this opportunity.' });
    return;
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    studentId: user.id,
    opportunityId: opp ? opp.id : opportunityId,
    opportunityTitle: opp ? opp.title : req.body.opportunityTitle || 'Opportunity Application',
    provider: opp ? opp.provider : req.body.provider || 'Provider',
    opportunityType: opp ? opp.type : 'Scholarship',
    deadline: opp ? opp.applicationDeadline : '2026-12-31',
    applicationUrl: opp ? opp.applicationUrl : '',
    status: status || 'Interested',
    applicationDate: new Date().toISOString(),
    notes: notes || '',
    documents: documents || [],
    updatedAt: new Date().toISOString(),
  };

  db.applications.unshift(newApp);

  // Notification for application creation
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Application Added to Tracker',
    message: `You are tracking ${newApp.opportunityTitle} with status: ${newApp.status}.`,
    type: 'application',
    isRead: false,
    link: '/applications',
    createdAt: new Date().toISOString(),
  });

  saveDatabase();

  res.json(newApp);
});

app.put('/api/applications/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const appIndex = db.applications.findIndex(a => a.id === req.params.id && (a.studentId === user.id || user.role === 'admin'));
  if (appIndex === -1) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const oldStatus = db.applications[appIndex].status;
  const updatedApp: Application = {
    ...db.applications[appIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.applications[appIndex] = updatedApp;

  // Add notification if status changed
  if (req.body.status && req.body.status !== oldStatus) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: updatedApp.studentId,
      title: 'Application Status Updated',
      message: `${updatedApp.opportunityTitle} status moved to: ${updatedApp.status}`,
      type: 'application',
      isRead: false,
      link: '/applications',
      createdAt: new Date().toISOString(),
    });
  }

  saveDatabase();

  res.json(updatedApp);
});

app.delete('/api/applications/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  db.applications = db.applications.filter(a => !(a.id === req.params.id && a.studentId === user.id));
  saveDatabase();
  res.json({ success: true });
});

// ----------------------------------------------------
// NOTIFICATIONS ROUTES
// ----------------------------------------------------

app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const notifs = db.notifications.filter(n => n.userId === user.id);
  res.json(notifs);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    saveDatabase();
  }
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user) {
    db.notifications.forEach(n => {
      if (n.userId === user.id) n.isRead = true;
    });
    saveDatabase();
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT ROUTES
// ----------------------------------------------------

app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  const totalStudents = db.users.filter(u => u.role === 'student').length + 184; // realistic active students metric
  const totalOpportunities = db.opportunities.length;
  const verifiedOpportunities = db.opportunities.filter(o => o.verified).length;
  const pendingOpportunities = db.opportunities.filter(o => o.status === 'Pending Review' || !o.verified).length;
  const totalApplications = db.applications.length + 342;

  // Categories distribution
  const categoryCounts: Record<string, number> = {};
  db.opportunities.forEach(o => {
    categoryCounts[o.type] = (categoryCounts[o.type] || 0) + 1;
  });
  const opportunitiesByCategory = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  // Application status distribution
  const statusCounts: Record<string, number> = {
    Interested: 85,
    Preparing: 62,
    Applied: 110,
    'Under Review': 45,
    Interview: 22,
    Accepted: 14,
    Rejected: 8,
  };
  db.applications.forEach(a => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });
  const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  res.json({
    totalStudents,
    totalOpportunities,
    verifiedOpportunities,
    pendingOpportunities,
    totalApplications,
    activeUsers: totalStudents + 12,
    studentsOverTime: [
      { month: 'Apr 2026', count: 48 },
      { month: 'May 2026', count: 72 },
      { month: 'Jun 2026', count: 95 },
      { month: 'Jul 2026', count: 124 },
      { month: 'Aug 2026', count: 156 },
      { month: 'Sep 2026', count: 187 },
    ],
    opportunitiesByCategory,
    applicationsByStatus,
    topSearchedFields: [
      { field: 'Computer Science', count: 482 },
      { field: 'Data Science & AI', count: 395 },
      { field: 'Engineering', count: 310 },
      { field: 'Medicine & Public Health', count: 260 },
      { field: 'Business & Finance', count: 215 },
      { field: 'Environmental Science', count: 180 },
    ],
    countriesDistribution: [
      { country: 'United Kingdom', count: 6 },
      { country: 'United States', count: 5 },
      { country: 'Switzerland', count: 3 },
      { country: 'Canada', count: 2 },
      { country: 'Germany', count: 2 },
      { country: 'Global', count: 2 },
      { country: 'Australia', count: 1 },
      { country: 'Japan', count: 1 },
    ],
    matchWeights: db.matchWeights,
  });
});

app.get('/api/admin/students', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  const students = db.users
    .filter(u => u.role === 'student')
    .map(u => ({
      user: u,
      profile: db.profiles[u.id] || null,
      applicationsCount: db.applications.filter(a => a.studentId === u.id).length,
      savedCount: db.saved.filter(s => s.studentId === u.id).length,
    }));

  res.json(students);
});

app.get('/api/admin/opportunities', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }
  res.json(db.opportunities);
});

app.post('/api/admin/opportunities', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  const newOpp: Opportunity = {
    id: `opp-${Date.now()}`,
    title: req.body.title || 'Untitled Opportunity',
    provider: req.body.provider || 'Provider Organization',
    description: req.body.description || '',
    type: req.body.type || 'Scholarship',
    country: req.body.country || 'Global',
    eligibleCountries: req.body.eligibleCountries || ['All'],
    eligibleFields: req.body.eligibleFields || ['Computer Science'],
    degreeLevels: req.body.degreeLevels || ["Master's"],
    fundingType: req.body.fundingType || 'Fully Funded',
    fundingAmount: req.body.fundingAmount || 'Competitive Support',
    benefits: req.body.benefits || ['Tuition coverage', 'Living stipend'],
    minimumGpa: typeof req.body.minimumGpa === 'number' ? req.body.minimumGpa : 3.0,
    ageRequirement: req.body.ageRequirement,
    requiredDocuments: req.body.requiredDocuments || ['Transcripts', 'CV', 'Letters of Recommendation'],
    applicationUrl: req.body.applicationUrl || 'https://example.org/apply',
    applicationDeadline: req.body.applicationDeadline || '2026-12-31',
    status: req.body.status || 'Published',
    verified: req.body.verified ?? true,
    verifiedAt: req.body.verified ? new Date().toISOString() : undefined,
    verifiedBy: req.body.verified ? user.fullName : undefined,
    contactEmail: req.body.contactEmail || 'admissions@example.org',
    skills: req.body.skills || ['Research', 'Writing'],
    isDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.opportunities.unshift(newOpp);
  saveDatabase();
  res.json(newOpp);
});

app.put('/api/admin/opportunities/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  const index = db.opportunities.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }

  const updatedOpp: Opportunity = {
    ...db.opportunities[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  if (req.body.verified !== undefined && req.body.verified !== db.opportunities[index].verified) {
    if (req.body.verified) {
      updatedOpp.verifiedAt = new Date().toISOString();
      updatedOpp.verifiedBy = user.fullName;
    } else {
      updatedOpp.verifiedAt = undefined;
      updatedOpp.verifiedBy = undefined;
    }
  }

  db.opportunities[index] = updatedOpp;
  saveDatabase();
  res.json(updatedOpp);
});

app.delete('/api/admin/opportunities/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  db.opportunities = db.opportunities.filter(o => o.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

app.put('/api/admin/match-weights', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }

  db.matchWeights = {
    ...db.matchWeights,
    ...req.body,
  };

  saveDatabase();
  res.json(db.matchWeights);
});

// ----------------------------------------------------
// STATIC / VITE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartScholar full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
