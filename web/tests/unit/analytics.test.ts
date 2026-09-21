import { describe, it, expect } from 'vitest';

describe('Placement Analytics & Funnel Calculations', () => {
  it('computes application funnel conversion rate accurately', () => {
    const totalNotices = 40;
    const applied = 10;
    const interviews = 2;
    const offers = 1;

    const applicationRate = (applied / totalNotices) * 100;
    const interviewRate = (interviews / applied) * 100;
    const offerConversionRate = (offers / applied) * 100;

    expect(applicationRate).toBe(25);
    expect(interviewRate).toBe(20);
    expect(offerConversionRate).toBe(10);
  });

  it('categorizes compensation tiers based on LPA cutoff thresholds', () => {
    const packages = [51.0, 44.5, 28.0, 24.0, 14.0, 8.5];

    const superDream = packages.filter((p) => p >= 30.0).length;
    const dream = packages.filter((p) => p >= 15.0 && p < 30.0).length;
    const standard = packages.filter((p) => p < 15.0).length;

    expect(superDream).toBe(2); // 51.0 and 44.5
    expect(dream).toBe(2);      // 28.0 and 24.0
    expect(standard).toBe(2);   // 14.0 and 8.5
  });
});
