import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '../../src/lib/business/eligibility-checker';
import { StudentProfile } from '../../src/types/student.types';

describe('Deterministic Student Eligibility Engine', () => {
  const studentCSE: StudentProfile = {
    user_id: 's-1',
    full_name: 'Anas Shaikh',
    degree: 'B.Tech',
    branch: 'CSE',
    graduation_year: 2026,
    cgpa: 8.5,
    active_backlogs: 0,
    history_backlogs: 0,
    skills: ['Java', 'Next.js'],
  };

  it('approves an eligible candidate meeting CGPA, branch, and batch criteria', () => {
    const result = evaluateEligibility(studentCSE, {
      min_cgpa: 7.5,
      allowed_branches: ['CSE', 'IT', 'ECE'],
      batch_years: [2026],
      max_active_backlogs: 0,
    });

    expect(result.status).toBe('ELIGIBLE');
    expect(result.reasons.length).toBe(1);
  });

  it('rejects candidate if CGPA is below cutoff', () => {
    const result = evaluateEligibility(studentCSE, {
      min_cgpa: 9.0,
      allowed_branches: ['CSE'],
      batch_years: [2026],
    });

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.reasons[0]).toContain('below minimum cutoff');
  });

  it('rejects candidate if branch is not in allowed list', () => {
    const studentMech: StudentProfile = {
      ...studentCSE,
      branch: 'MECH',
    };

    const result = evaluateEligibility(studentMech, {
      min_cgpa: 7.0,
      allowed_branches: ['CSE', 'IT'],
      batch_years: [2026],
    });

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.reasons[0]).toContain("Branch 'MECH' is not listed");
  });

  it('rejects candidate if graduation batch year does not match', () => {
    const result = evaluateEligibility(studentCSE, {
      batch_years: [2025],
    });

    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.reasons[0]).toContain('Graduation batch (2026) does not match');
  });

  it('flags NEEDS_REVIEW when no criteria are present in notice', () => {
    const result = evaluateEligibility(studentCSE, {});
    expect(result.status).toBe('NEEDS_REVIEW');
  });
});
