import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedPlacementData } from '@/types/insight.types';

const SYSTEM_PROMPT = `
You are the PlaceMint AI Placement Notice Parser. Your job is to extract structured placement and internship opportunity details from unstructured Telegram notices broadcasted by college Placement Officers (TPO) or company recruiters.

Analyze the provided notice carefully and respond with a strict JSON object following this schema:
{
  "is_placement_related": boolean,
  "company_name": string (clean official company name, e.g. "Google", "Goldman Sachs", "Amazon"),
  "role_title": string (e.g. "Software Development Engineer", "Graduate Analyst"),
  "opportunity_type": "JOB" | "INTERNSHIP" | "ASSESSMENT" | "CODING_TEST" | "CAMPUS_DRIVE" | "HACKATHON" | "WORKSHOP_TRAINING" | "OTHER",
  "batch_year": string (e.g. "2026", "2025 & 2026"),
  "salary_or_stipend": string (e.g. "₹24 LPA", "₹1.5 Lakh/month", "₹8 - 12 LPA"),
  "min_cgpa": number (e.g. 7.5, null if not mentioned),
  "allowed_branches": string[] (e.g. ["CSE", "IT", "ECE"], ["ALL"]),
  "max_active_backlogs": number (e.g. 0, null if not mentioned),
  "registration_deadline": string (ISO 8601 UTC timestamp or null),
  "event_timestamp": string (ISO 8601 UTC timestamp for PPT or test date, or null),
  "application_url": string (valid URL or null),
  "action_required": string (concise instruction for student, e.g. "Fill Google Form before 6 PM"),
  "eligibility_raw": string (verbatim snippet summarizing eligibility),
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence_score": number (between 0.0 and 1.0)
}

If the notice is not about a job, drive, internship, or placement event (e.g. random chatter or general college announcement), set "is_placement_related" to false.
`;

export async function parseWithGemini(
  rawText: string,
  messageTimestamp: string
): Promise<ExtractedPlacementData | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\nNotice Posted Timestamp: ${messageTimestamp}\n\nRaw Telegram Notice:\n${rawText}`;
  const response = await model.generateContent(prompt);
  const responseText = response.response?.text();

  if (!responseText) {
    return null;
  }

  try {
    const parsed = JSON.parse(responseText);
    return parsed as ExtractedPlacementData;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', responseText, err);
    return null;
  }
}
