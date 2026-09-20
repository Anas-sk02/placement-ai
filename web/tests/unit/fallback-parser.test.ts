import { describe, it, expect } from 'vitest';
import { parsePlacementMessageFallback } from '../../src/lib/ai/fallback-rules';

describe('Deterministic Regex Placement Parser', () => {
  const sampleTelegramNotice = `
📢 *Goldman Sachs Recruitment Drive 2026 Batch*
Role: Summer Analyst / Engineering Trainee
Eligible: CSE, IT, ECE
Criteria: Minimum 7.5 CGPA with no backlogs
Package: 28 LPA CTC
Deadline: 28th October 2026, 6:00 PM
Apply Form: https://forms.gle/gsachs2026
`;

  it('correctly extracts company, role, package, CGPA, and branches', () => {
    const data = parsePlacementMessageFallback(sampleTelegramNotice);

    expect(data.is_placement_related).toBe(true);
    expect(data.company_name).toContain('Goldman Sachs');
    expect(data.role_title).toContain('Summer Analyst');
    expect(data.salary_or_stipend).toContain('28 LPA');
    expect(data.min_cgpa).toBe(7.5);
    expect(data.allowed_branches).toContain('CSE');
    expect(data.allowed_branches).toContain('IT');
    expect(data.application_url).toBe('https://forms.gle/gsachs2026');
  });

  it('detects internship notices and marks opportunity_type as INTERNSHIP', () => {
    const internNotice = `
Uber Summer Internship 2026
Stipend: ₹1,60,000 per month
Eligible: CSE, IT
Register before Friday 6 PM
`;
    const data = parsePlacementMessageFallback(internNotice);
    expect(data.opportunity_type).toBe('INTERNSHIP');
    expect(data.salary_or_stipend).toContain('₹1,60,000');
  });

  it('marks general chatter as not placement related', () => {
    const chatter = `Hey guys, has anyone seen the timetable for tomorrow's chemistry lab?`;
    const data = parsePlacementMessageFallback(chatter);
    expect(data.is_placement_related).toBe(false);
  });
});
