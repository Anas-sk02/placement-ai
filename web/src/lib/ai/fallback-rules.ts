import { ExtractedPlacementData } from '@/types/insight.types';
import { OpportunityTypeEnum, UrgencyLevelEnum } from '@/types/database.types';

/**
 * Deterministic Smart Regex & Rule-Based Placement Extractor
 * Provides instant fallback when Gemini API key is not present, quota is exceeded, or offline.
 */
export function parsePlacementMessageFallback(
  text: string,
  referenceTimestamp: string = new Date().toISOString()
): ExtractedPlacementData {
  // Strip emojis, leading symbols, and markdown markers for clean matching
  const clean = text.replace(/\r/g, '');

  // 1. Check if placement related
  const placementKeywords = [
    /placement/i,
    /hiring/i,
    /recruitment/i,
    /recruiting/i,
    /drive/i,
    /internship/i,
    /stipend/i,
    /ctc/i,
    /package/i,
    /lpa/i,
    /cgpa/i,
    /job\s*role/i,
    /eligibility/i,
    /deadline/i,
    /apply/i,
    /link/i,
    /form/i,
    /registration/i,
    /assessment/i,
    /interview/i,
    /grads?/i,
    /graduat(e|ing|ion)/i,
    /passout/i,
    /fresher/i,
    /engineer/i,
    /developer/i,
    /sde\b/i,
    /opening/i,
    /batch/i,
    /https?:\/\//i,
  ];

  const matchedKeywords = placementKeywords.filter((re) => re.test(clean));
  const isPlacement =
    matchedKeywords.length >= 2 ||
    /(?:is\s+hiring|hiring|recruitment|campus\s+drive|internship)/i.test(clean);

  // 2. Extract Company Name and Role Title
  let companyName = 'Unknown Recruiter';
  let roleTitle = 'Software Engineer / Graduate Trainee';

  // Pattern A: "Company is hiring / Hiring Role" (e.g. "Weekday AI is hiring Backend Engineer", "Nike Hiring Software Engineer 1:")
  const hiringHeaderMatch = clean.match(
    /(?:^|\n)[^\w\n]*\*?([A-Za-z0-9\s&.\(\)]{2,35}?)\*?\s+(?:is\s+hiring|hiring|is\s+recruiting)\s+(?:for\s+|an?\s+)?([A-Za-z0-9\s\/\-_()]{2,45}?)(?:\n|:|$|\s+for\s+202|\s+location|\s+experience)/im
  );

  if (hiringHeaderMatch) {
    const compCandidate = hiringHeaderMatch[1].trim().replace(/^[\*\#\-\_\s]+|[\*\#\-\_\s]+$/g, '');
    const roleCandidate = hiringHeaderMatch[2].trim().replace(/^[\*\#\-\_\s]+|[\*\#\-\_\s]+$/g, '');
    if (
      compCandidate.length >= 2 &&
      !compCandidate.toLowerCase().includes('dear') &&
      !compCandidate.toLowerCase().includes('urgent') &&
      !compCandidate.toLowerCase().includes('apply') &&
      !compCandidate.toLowerCase().includes('link')
    ) {
      companyName = compCandidate;
    }
    if (
      roleCandidate.length >= 2 &&
      !roleCandidate.toLowerCase().includes('http') &&
      !roleCandidate.toLowerCase().includes('link')
    ) {
      roleTitle = roleCandidate;
    }
  }

  // Fallback Company Regexes
  if (companyName === 'Unknown Recruiter') {
    const companyRegexes = [
      /(?:company|organization|recruiter|firm)\s*[:\-–]\s*([A-Za-z0-9\s&.\(\)]+?)(?:\n|$|,)/i,
      /(?:^|\n)[^\w\n]*\*?([A-Za-z0-9\s&.]{3,35})\*?\s+(?:Recruitment|Hiring|Off-Campus|Campus|Drive|Internship|Summer|202[4-8])/i,
      /(?:^|\n)[^\w\n]*([A-Za-z0-9\s&.]{3,30})\s*(?:is\s+hiring|off-campus|campus\s+drive|recruitment|virtual\s+drive)/im,
      /(?:drive\s+for|drive\s+by|recruitment\s+for)\s*[:\-–]?\s*([A-Za-z0-9\s&.\(\)]+?)(?:\n|$|\s+for|\s+is|\s+at)/i,
    ];

    for (const re of companyRegexes) {
      const match = clean.match(re);
      if (match && match[1]?.trim()) {
        const candidate = match[1].trim().replace(/^[\*\#\-\_\s]+|[\*\#\-\_\s]+$/g, '');
        if (
          candidate.length > 2 &&
          candidate.length < 40 &&
          !candidate.toLowerCase().includes('dear') &&
          !candidate.toLowerCase().includes('urgent') &&
          !candidate.toLowerCase().includes('tpo') &&
          !candidate.toLowerCase().includes('update')
        ) {
          companyName = candidate;
          break;
        }
      }
    }
  }

  // Fallback for header lines like: "Goldman Sachs Recruitment Drive"
  if (companyName === 'Unknown Recruiter') {
    const headerMatch = clean.match(/(?:^|\n)[^\w\n]*\*?([A-Z][A-Za-z0-9\s&.]{2,30})\*?\s+(?:Summer|Recruitment|Drive|Internship)/i);
    if (headerMatch && headerMatch[1]) {
      companyName = headerMatch[1].trim().replace(/^[\*\#\-\_\s]+|[\*\#\-\_\s]+$/g, '');
    }
  }

  // 3. Extract Role Title if not already found
  if (roleTitle === 'Software Engineer / Graduate Trainee') {
    const roleRegexes = [
      /(?:role|position|profile|designation|job\s*title)\s*[:\-–]\s*([A-Za-z0-9\s\/\-_()]+?)(?:\n|$|,)/i,
      /(?:hiring\s+for|opening\s+for)\s*[:\-–]?\s*([A-Za-z0-9\s\/\-_()]+?)(?:\n|$|,)/i,
    ];

    for (const re of roleRegexes) {
      const match = clean.match(re);
      if (match && match[1]?.trim()) {
        roleTitle = match[1].trim();
        break;
      }
    }
  }

  // 4. Extract CTC / Stipend
  let ctcOrStipend: string | undefined;
  const ctcExplicit = clean.match(
    /(?:ctc|package|salary|stipend|compensation)\s*[:\-–]\s*([^\n;]+)/i
  );

  if (ctcExplicit && ctcExplicit[1]?.trim()) {
    ctcOrStipend = ctcExplicit[1].trim().replace(/^[\*\_\s]+|[\*\_\s]+$/g, '');
  } else {
    const patternMatch = clean.match(
      /(\d+(?:\.\d+)?\s*(?:-|to)\s*\d+(?:\.\d+)?\s*LPA|\d+(?:\.\d+)?\s*LPA|\d+\s*k\s*\/\s*month|₹\s*[\d,]+(?:\s*per\s*month|\s*\/mo|\s*pm)?)/i
    );
    if (patternMatch && patternMatch[1]) {
      ctcOrStipend = patternMatch[1].trim();
    }
  }

  // 5. Extract CGPA Cutoff
  let minCgpa: number | undefined;
  const cgpaMatch = clean.match(
    /(?:cgpa|gpa|cutoff|pointer|criteria)\s*[:\-–]?\s*(?:above|>=|minimum|min)?\s*(\d(?:\.\d+)?)/i
  ) || clean.match(/(\d(?:\.\d+)?)\s*(?:cgpa|gpa|\+?\s*cgpa)/i);

  if (cgpaMatch && cgpaMatch[1]) {
    const val = parseFloat(cgpaMatch[1]);
    if (val >= 4.0 && val <= 10.0) {
      minCgpa = val;
    }
  }

  // 6. Extract Batch Year
  let batchYear: string | undefined;
  const batchMatch = clean.match(/(?:batch|graduating|year\s*of\s*passing|yop)\s*[:\-–]?\s*([0-9\s,\/\-]+(?:batch)?)/i) ||
    clean.match(/\b(202[4-8])\s*(?:batch|passout|graduates)?\b/i);

  if (batchMatch && batchMatch[1]) {
    batchYear = batchMatch[1].trim();
  }

  // 7. Extract Allowed Branches
  const branches: string[] = [];
  const branchPattern = /\b(CSE|IT|ECE|EEE|MECH|CIVIL|AIDS|AIML|CS|MCA|B\.?TECH|B\.?E\.?|M\.?TECH|ALL\s*BRANCHES)\b/gi;
  let bMatch;
  while ((bMatch = branchPattern.exec(clean)) !== null) {
    const b = bMatch[1].toUpperCase();
    if (!branches.includes(b)) {
      branches.push(b);
    }
  }

  // 8. Extract Application URL
  let applicationUrl: string | undefined;
  const urlMatch = clean.match(/https?:\/\/[^\s\)\>\]]+/i);
  if (urlMatch) {
    applicationUrl = urlMatch[0];
  }

  // 9. Opportunity Type
  let oppType: OpportunityTypeEnum = 'JOB';
  if (/internship|stipend|intern\b/i.test(clean)) {
    oppType = 'INTERNSHIP';
  } else if (/hackathon|coding\s*challenge|contest/i.test(clean)) {
    oppType = 'HACKATHON';
  } else if (/assessment|test\s*link|online\s*test/i.test(clean)) {
    oppType = 'ASSESSMENT';
  } else if (/campus\s*drive|pool\s*campus/i.test(clean)) {
    oppType = 'CAMPUS_DRIVE';
  }

  // 10. Estimate Urgency & Deadline
  let urgency: UrgencyLevelEnum = 'MEDIUM';
  if (/urgent|immediate|last\s*call|hurry|closing\s*today|ends\s*in\s*\d+\s*hours/i.test(clean)) {
    urgency = 'CRITICAL';
  } else if (/deadline\s*today|tomorrow/i.test(clean)) {
    urgency = 'HIGH';
  }

  // Extract Deadline Date (approximate)
  let registrationDeadline: string | undefined;
  const deadlineMatch = clean.match(
    /(?:deadline|last\s*date|apply\s*before|register\s*before|closes\s*on)\s*[:\-–]?\s*([A-Za-z0-9\s,:\-\/]+?)(?:\n|$|\.|\()/i
  );

  if (deadlineMatch && deadlineMatch[1]) {
    const rawDate = deadlineMatch[1].trim();
    const parsed = Date.parse(rawDate);
    if (!isNaN(parsed) && parsed > Date.now() - 86400000) {
      registrationDeadline = new Date(parsed).toISOString();
    } else {
      const ref = new Date(referenceTimestamp);
      ref.setHours(ref.getHours() + 48);
      registrationDeadline = ref.toISOString();
    }
  } else if (urgency === 'CRITICAL' || urgency === 'HIGH') {
    const ref = new Date(referenceTimestamp);
    ref.setHours(ref.getHours() + 24);
    registrationDeadline = ref.toISOString();
  }

  return {
    is_placement_related: isPlacement,
    company_name: companyName,
    role_title: roleTitle,
    opportunity_type: oppType,
    batch_year: batchYear,
    salary_or_stipend: ctcOrStipend,
    min_cgpa: minCgpa,
    allowed_branches: branches.length > 0 ? branches : undefined,
    registration_deadline: registrationDeadline,
    application_url: applicationUrl,
    action_required: applicationUrl
      ? `Register via application portal before ${registrationDeadline ? 'deadline' : 'soon'}`
      : 'Submit profile with placement coordinator',
    eligibility_raw: `CGPA: ${minCgpa ?? 'N/A'}, Branches: ${branches.join(', ') || 'All'}, Batch: ${batchYear || '2026'}`,
    urgency,
    confidence_score: isPlacement ? 0.85 : 0.4,
  };
}
