import { StudentProfile, OpportunityCriteria, EligibilityResult } from '@/types/student.types';

/**
 * Deterministic Student Placement Eligibility Engine
 * Checks:
 * 1. Graduation Batch Year
 * 2. Minimum CGPA Cutoff
 * 3. Allowed Engineering Branches
 * 4. Maximum Active Backlogs
 * 5. Minimum 10th / 12th Percentage
 */
export function evaluateEligibility(
  student: StudentProfile,
  criteria: OpportunityCriteria
): EligibilityResult {
  const reasons: string[] = [];

  // Check 1: Graduation Batch Year
  if (criteria.batch_years && criteria.batch_years.length > 0) {
    if (!criteria.batch_years.includes(student.graduation_year)) {
      reasons.push(
        `Graduation batch (${student.graduation_year}) does not match required batch: [${criteria.batch_years.join(', ')}]`
      );
    }
  }

  // Check 2: Minimum CGPA Cutoff
  if (criteria.min_cgpa != null && criteria.min_cgpa > 0) {
    if (student.cgpa == null || Number(student.cgpa) < Number(criteria.min_cgpa)) {
      reasons.push(
        `CGPA (${student.cgpa ?? 'Not provided'}) is below minimum cutoff of ${criteria.min_cgpa}`
      );
    }
  }

  // Check 3: Allowed Engineering Branches
  if (criteria.allowed_branches && criteria.allowed_branches.length > 0) {
    const studentBranch = (student.branch || '').toUpperCase().trim();
    const isAllBranches = criteria.allowed_branches.some(
      (b) =>
        b.toUpperCase() === 'ALL' ||
        b.toUpperCase() === 'OPEN FOR ALL' ||
        b.toUpperCase() === 'ANY'
    );

    if (!isAllBranches && studentBranch) {
      const match = criteria.allowed_branches.some((branch) => {
        const b = branch.toUpperCase().trim();
        return (
          b === studentBranch ||
          studentBranch.includes(b) ||
          b.includes(studentBranch)
        );
      });

      if (!match) {
        reasons.push(
          `Branch '${student.branch}' is not listed in eligible branches: [${criteria.allowed_branches.join(', ')}]`
        );
      }
    } else if (!studentBranch && !isAllBranches) {
      reasons.push('Student branch is not specified in profile');
    }
  }

  // Check 4: Active Backlogs
  if (criteria.max_active_backlogs != null) {
    const studentBacklogs = student.active_backlogs || 0;
    if (studentBacklogs > criteria.max_active_backlogs) {
      reasons.push(
        `Active backlogs (${studentBacklogs}) exceeds allowed limit of ${criteria.max_active_backlogs}`
      );
    }
  }

  // Check 5: 10th / 12th percentage if defined
  if (criteria.min_percentage != null && criteria.min_percentage > 0) {
    if (student.percentage != null && student.percentage < criteria.min_percentage) {
      reasons.push(
        `Overall aggregate (${student.percentage}%) is below minimum cutoff of ${criteria.min_percentage}%`
      );
    }
  }

  // Final Decision
  if (reasons.length > 0) {
    return {
      status: 'NOT_ELIGIBLE',
      reasons,
      confidence: 1.0,
    };
  }

  // If no criteria were extracted at all, flag for manual review
  const hasCriteria =
    (criteria.batch_years && criteria.batch_years.length > 0) ||
    (criteria.min_cgpa != null && criteria.min_cgpa > 0) ||
    (criteria.allowed_branches && criteria.allowed_branches.length > 0);

  if (!hasCriteria) {
    return {
      status: 'NEEDS_REVIEW',
      reasons: ['No explicit criteria specified in source notice. Please review.'],
      confidence: 0.6,
    };
  }

  return {
    status: 'ELIGIBLE',
    reasons: ['All academic criteria verified and satisfied.'],
    confidence: 1.0,
  };
}
