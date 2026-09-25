import { Opportunity, StudentProfile, MatchWeights, MatchScoreBreakdown, Recommendation } from '../types';
import { INITIAL_MATCH_WEIGHTS } from '../data/mockOpportunities';

export function calculateMatchScore(
  student: StudentProfile,
  studentCountry: string,
  opportunity: Opportunity,
  weights: MatchWeights = INITIAL_MATCH_WEIGHTS
): MatchScoreBreakdown {
  const matchingReasons: string[] = [];
  const potentialIssues: string[] = [];
  let isIneligible = false;

  // 1. Academic Match (Degree Level & GPA)
  let academicScore = 0;
  const degreeMatches = opportunity.degreeLevels.includes(student.degreeLevel);
  if (degreeMatches) {
    academicScore += 50;
    matchingReasons.push(`Your degree level (${student.degreeLevel}) is directly eligible.`);
  } else {
    potentialIssues.push(`Opportunity requires degree level: ${opportunity.degreeLevels.join(', ')} (Your current level: ${student.degreeLevel}).`);
    // Soft ineligibility if degree level mismatch
    if (student.degreeLevel === 'Secondary School Student' && opportunity.degreeLevels.includes('PhD')) {
      isIneligible = true;
    }
  }

  // GPA Evaluation
  if (opportunity.minimumGpa <= 0) {
    academicScore += 50;
  } else if (student.gpa >= opportunity.minimumGpa) {
    academicScore += 50;
    matchingReasons.push(`Your GPA (${student.gpa.toFixed(2)}) meets the minimum requirement (${opportunity.minimumGpa.toFixed(2)}).`);
  } else {
    const gpaDelta = opportunity.minimumGpa - student.gpa;
    if (gpaDelta <= 0.2) {
      academicScore += 25; // close
      potentialIssues.push(`Minimum GPA is ${opportunity.minimumGpa.toFixed(2)} — your current GPA is ${student.gpa.toFixed(2)} (near cutoff).`);
    } else {
      potentialIssues.push(`Minimum GPA requirement is ${opportunity.minimumGpa.toFixed(2)} — your current GPA is ${student.gpa.toFixed(2)}.`);
      if (gpaDelta > 0.5) {
        isIneligible = true;
      }
    }
  }

  // 2. Field of Study Match
  let fieldScore = 0;
  const normalizedStudentField = student.fieldOfStudy.toLowerCase();
  const normalizedCourse = (student.courseMajor || '').toLowerCase();
  
  const fieldMatches = opportunity.eligibleFields.some(f => {
    const normF = f.toLowerCase();
    return (
      normF.includes(normalizedStudentField) ||
      normalizedStudentField.includes(normF) ||
      (normalizedCourse && (normF.includes(normalizedCourse) || normalizedCourse.includes(normF)))
    );
  });

  if (fieldMatches) {
    fieldScore = 100;
    matchingReasons.push(`Your field of study (${student.fieldOfStudy}) matches the eligible disciplines.`);
  } else {
    // Check partial overlap with student interests
    const interestOverlap = student.interests.some(interest =>
      opportunity.eligibleFields.some(f => f.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(f.toLowerCase()))
    );
    if (interestOverlap) {
      fieldScore = 60;
      matchingReasons.push(`Relates to your stated secondary academic interests.`);
    } else {
      fieldScore = 20;
      potentialIssues.push(`Eligible fields listed: ${opportunity.eligibleFields.slice(0, 3).join(', ')}.`);
    }
  }

  // 3. Country Eligibility Match
  let countryScore = 0;
  const isAllCountries = opportunity.eligibleCountries.includes('All') || opportunity.eligibleCountries.includes('International');
  const studentCountryEligible = isAllCountries || opportunity.eligibleCountries.some(c => c.toLowerCase() === studentCountry.toLowerCase());

  if (studentCountryEligible) {
    countryScore += 60;
    if (isAllCountries) {
      matchingReasons.push(`Open to applicants from all nationalities and countries.`);
    } else {
      matchingReasons.push(`Your country of residence (${studentCountry}) is explicitly eligible.`);
    }
  } else {
    potentialIssues.push(`Country restriction: Only applicants from ${opportunity.eligibleCountries.slice(0, 4).join(', ')} are eligible.`);
    isIneligible = true;
  }

  // Preferred Destination Match
  const destinationMatch = (student.preferredCountries || []).some(
    c => c.toLowerCase() === opportunity.country.toLowerCase() || c.toLowerCase() === 'any' || opportunity.country === 'Global'
  );
  if (destinationMatch || (student.preferredCountries && student.preferredCountries.length === 0)) {
    countryScore += 40;
    if (destinationMatch && opportunity.country !== 'Global') {
      matchingReasons.push(`Host location in ${opportunity.country} matches your preferred study destinations.`);
    }
  } else {
    countryScore += 10;
  }
  countryScore = Math.min(100, countryScore);

  // 4. Skills Match
  let skillsScore = 0;
  const studentSkillNames = student.skills.map(s => s.name.toLowerCase());
  const matchingSkills = opportunity.skills.filter(os => 
    studentSkillNames.some(ss => ss.includes(os.toLowerCase()) || os.toLowerCase().includes(ss))
  );

  if (opportunity.skills.length === 0) {
    skillsScore = 80;
  } else {
    const skillRatio = matchingSkills.length / Math.min(opportunity.skills.length, 5);
    skillsScore = Math.min(100, Math.round(skillRatio * 100));
    if (matchingSkills.length > 0) {
      matchingReasons.push(`Matches ${matchingSkills.length} of your key skills: ${matchingSkills.join(', ')}.`);
    } else {
      potentialIssues.push(`Recommended skills: ${opportunity.skills.slice(0, 3).join(', ')}.`);
    }
  }

  // 5. Career & Interest Match
  let careerScore = 50; // baseline
  const careerGoalText = `${student.careerGoal || ''} ${student.desiredCareer || ''} ${(student.preferredIndustries || []).join(' ')} ${student.longTermGoals || ''}`.toLowerCase();
  
  const relevantInCareer = opportunity.eligibleFields.some(f => careerGoalText.includes(f.toLowerCase())) ||
    opportunity.title.toLowerCase().split(' ').some(w => w.length > 4 && careerGoalText.includes(w));

  const interestCount = student.interests.filter(int => 
    opportunity.description.toLowerCase().includes(int.toLowerCase()) ||
    opportunity.eligibleFields.some(f => f.toLowerCase().includes(int.toLowerCase()))
  ).length;

  if (relevantInCareer) {
    careerScore += 35;
    matchingReasons.push(`Aligns closely with your stated career vision: "${student.desiredCareer || student.careerGoal}".`);
  }
  if (interestCount > 0) {
    careerScore += 15;
    matchingReasons.push(`Spans ${interestCount} of your chosen areas of personal interest.`);
  }
  careerScore = Math.min(100, careerScore);

  // 6. Funding Preference Match
  let fundingScore = 50;
  const studentWantsFullFunding = student.fundingPreferences?.includes('Fully Funded');
  if (opportunity.fundingType === 'Fully Funded') {
    fundingScore = 100;
    if (studentWantsFullFunding) {
      matchingReasons.push(`Provides full funding, satisfying your priority funding preference.`);
    } else {
      matchingReasons.push(`Comprehensive full-ride funding coverage.`);
    }
  } else if (student.fundingPreferences?.includes(opportunity.fundingType)) {
    fundingScore = 90;
    matchingReasons.push(`Funding model (${opportunity.fundingType}) matches your profile settings.`);
  } else if (opportunity.fundingType === 'Partially Funded' || opportunity.fundingType === 'Stipend') {
    fundingScore = 70;
  } else {
    fundingScore = 30;
    potentialIssues.push(`Funding coverage is ${opportunity.fundingType}.`);
  }

  // 7. Opportunity Type Match
  let oppTypeScore = 75; // baseline
  if (opportunity.type === 'Scholarship' || opportunity.type === 'Fellowship') {
    oppTypeScore = 95;
  } else if (opportunity.type === 'Internship') {
    oppTypeScore = student.degreeLevel === 'Undergraduate' || student.degreeLevel === "Master's" ? 90 : 70;
  }

  // Check upcoming deadline
  const today = new Date('2026-09-25');
  const deadlineDate = new Date(opportunity.applicationDeadline);
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7 && diffDays > 0) {
    potentialIssues.push(`Application deadline approaches soon (${diffDays} days remaining: ${opportunity.applicationDeadline}).`);
  } else if (diffDays <= 0) {
    potentialIssues.push(`Application deadline has passed (${opportunity.applicationDeadline}).`);
    isIneligible = true;
  }

  // Weighted Total Calculation
  const totalWeight =
    weights.academicWeight +
    weights.fieldWeight +
    weights.countryWeight +
    weights.skillsWeight +
    weights.careerWeight +
    weights.fundingWeight +
    weights.opportunityTypeWeight;

  const rawWeightedSum =
    (academicScore * weights.academicWeight) +
    (fieldScore * weights.fieldWeight) +
    (countryScore * weights.countryWeight) +
    (skillsScore * weights.skillsWeight) +
    (careerScore * weights.careerWeight) +
    (fundingScore * weights.fundingWeight) +
    (oppTypeScore * weights.opportunityTypeWeight);

  let overallScore = Math.round(rawWeightedSum / (totalWeight || 100));

  // Cap score if hard ineligible
  if (isIneligible && overallScore > 58) {
    overallScore = 58;
  }

  return {
    academicMatch: Math.min(100, academicScore),
    fieldMatch: Math.min(100, fieldScore),
    countryMatch: Math.min(100, countryScore),
    skillsMatch: Math.min(100, skillsScore),
    careerMatch: Math.min(100, careerScore),
    fundingMatch: Math.min(100, fundingScore),
    opportunityTypeMatch: Math.min(100, oppTypeScore),
    overallScore: Math.max(10, Math.min(99, overallScore)),
    matchingReasons,
    potentialIssues,
    isIneligible,
  };
}

export function rankOpportunities(
  student: StudentProfile,
  studentCountry: string,
  opportunities: Opportunity[],
  weights: MatchWeights = INITIAL_MATCH_WEIGHTS
): Recommendation[] {
  return opportunities
    .map(opportunity => ({
      opportunity,
      matchBreakdown: calculateMatchScore(student, studentCountry, opportunity, weights)
    }))
    .sort((a, b) => b.matchBreakdown.overallScore - a.matchBreakdown.overallScore);
}
