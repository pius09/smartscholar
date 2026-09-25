export type UserRole = 'student' | 'admin';

export type DegreeLevel = 
  | 'Undergraduate'
  | "Master's"
  | 'PhD'
  | 'Recent Graduate'
  | 'Secondary School Student';

export type OpportunityType = 
  | 'Scholarship'
  | 'Fellowship'
  | 'Internship'
  | 'Grant'
  | 'Competition'
  | 'Research'
  | 'Exchange'
  | 'Volunteer'
  | 'Training'
  | 'Graduate Program';

export type FundingType = 
  | 'Fully Funded'
  | 'Partially Funded'
  | 'Tuition Only'
  | 'Stipend'
  | 'No Funding';

export type ApplicationStatus = 
  | 'Interested'
  | 'Preparing'
  | 'Applied'
  | 'Under Review'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  country: string;
  phone?: string;
  profilePhoto?: string;
  department?: string;
  adminTitle?: string;
  createdAt: string;
}

export interface StudentSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface StudentProfile {
  id: string;
  userId: string;
  institution: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  courseMajor: string;
  currentYear: string;
  gpa: number;
  graduationYear: number;
  academicAchievements: string[];
  skills: StudentSkill[];
  interests: string[];
  careerGoal: string;
  desiredCareer: string;
  preferredIndustries: string[];
  longTermGoals: string;
  preferredCountries: string[];
  remotePreference: boolean;
  fundingPreferences: FundingType[];
  financialNeed: 'High' | 'Moderate' | 'Low' | 'None';
  profileCompletion: number;
  cvUrl?: string;
  cvFileName?: string;
  cvExtractedText?: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  providerLogo?: string;
  description: string;
  type: OpportunityType;
  country: string;
  eligibleCountries: string[]; // e.g. ['All'] or specific countries
  eligibleInstitutions?: string[];
  eligibleFields: string[];
  degreeLevels: DegreeLevel[];
  fundingType: FundingType;
  fundingAmount: string;
  benefits: string[];
  minimumGpa: number;
  ageRequirement?: string;
  requiredDocuments: string[];
  applicationProcess?: string[];
  applicationUrl: string;
  applicationDeadline: string; // ISO date YYYY-MM-DD
  startDate?: string;
  duration?: string;
  numberOfAwards?: number;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Expired' | 'Archived';
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  contactEmail?: string;
  skills: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreBreakdown {
  academicMatch: number;      // 0 - 100
  fieldMatch: number;         // 0 - 100
  countryMatch: number;       // 0 - 100
  skillsMatch: number;        // 0 - 100
  careerMatch: number;        // 0 - 100
  fundingMatch: number;       // 0 - 100
  opportunityTypeMatch: number; // 0 - 100
  overallScore: number;       // 0 - 100
  matchingReasons: string[];
  potentialIssues: string[];
  isIneligible: boolean;
}

export interface Recommendation {
  opportunity: Opportunity;
  matchBreakdown: MatchScoreBreakdown;
}

export interface SavedOpportunity {
  id: string;
  studentId: string;
  opportunityId: string;
  opportunity: Opportunity;
  savedAt: string;
  notes?: string;
}

export interface Application {
  id: string;
  studentId: string;
  opportunityId: string;
  opportunityTitle: string;
  provider: string;
  opportunityType: OpportunityType;
  deadline: string;
  applicationUrl?: string;
  status: ApplicationStatus;
  applicationDate: string;
  notes?: string;
  documents?: { name: string; url: string; type: string }[];
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'recommendation' | 'deadline' | 'application' | 'opportunity' | 'announcement' | 'profile';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface MatchWeights {
  academicWeight: number;      // default 25
  fieldWeight: number;         // default 20
  countryWeight: number;       // default 15
  skillsWeight: number;        // default 15
  careerWeight: number;        // default 10
  fundingWeight: number;       // default 10
  opportunityTypeWeight: number; // default 5
}

export interface AdminAnalytics {
  totalStudents: number;
  totalOpportunities: number;
  verifiedOpportunities: number;
  pendingOpportunities: number;
  totalApplications: number;
  activeUsers: number;
  studentsOverTime: { month: string; count: number }[];
  opportunitiesByCategory: { category: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  topSearchedFields: { field: string; count: number }[];
  countriesDistribution: { country: string; count: number }[];
}
