import { describe, it, expect } from 'vitest';
import { calculateReminders, formatTimeRemaining } from '../../src/lib/business/reminder-scheduler';

describe('Deadline & Reminder Offset Engine', () => {
  it('calculates future reminder trigger offsets for 24h, 6h, 1h', () => {
    const now = new Date('2026-10-20T10:00:00Z');
    // Deadline is 30 hours in the future
    const deadline = new Date('2026-10-21T16:00:00Z').toISOString();

    const reminders = calculateReminders(deadline, [24, 6, 1], now);

    // 30h - 24h = +6h (future)
    // 30h - 6h = +24h (future)
    // 30h - 1h = +29h (future)
    expect(reminders.length).toBe(3);
    expect(reminders[0].offset_hours).toBe(24);
    expect(reminders[1].offset_hours).toBe(6);
    expect(reminders[2].offset_hours).toBe(1);
  });

  it('drops past reminder offsets when deadline is only 4 hours away', () => {
    const now = new Date('2026-10-20T10:00:00Z');
    const deadline = new Date('2026-10-20T14:00:00Z').toISOString(); // 4 hours away

    const reminders = calculateReminders(deadline, [24, 6, 1], now);

    // 24h before is past -> dropped
    // 6h before is past -> dropped
    // 1h before (+3h from now) -> kept
    expect(reminders.length).toBe(1);
    expect(reminders[0].offset_hours).toBe(1);
  });
});
