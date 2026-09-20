/**
 * Calculates reminder trigger times based on deadline and requested offset hours.
 * Only returns future reminder timestamps.
 */
export function calculateReminders(
  deadlineIso: string,
  offsetsHours: number[] = [24, 6, 1],
  now: Date = new Date()
): { scheduled_for: string; offset_hours: number }[] {
  const deadlineDate = new Date(deadlineIso);
  const deadlineMs = deadlineDate.getTime();
  const nowMs = now.getTime();

  if (isNaN(deadlineMs) || deadlineMs <= nowMs) {
    return [];
  }

  const results: { scheduled_for: string; offset_hours: number }[] = [];

  for (const offset of offsetsHours) {
    const scheduledMs = deadlineMs - offset * 60 * 60 * 1000;
    if (scheduledMs > nowMs) {
      results.push({
        scheduled_for: new Date(scheduledMs).toISOString(),
        offset_hours: offset,
      });
    }
  }

  return results;
}

/**
 * Formats time remaining in a human-friendly string (e.g. "3 hours left", "Tomorrow, 6:00 PM")
 */
export function formatTimeRemaining(deadlineIso: string): { text: string; isUrgent: boolean; isOverdue: boolean } {
  const deadline = new Date(deadlineIso);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (isNaN(diffMs)) {
    return { text: 'Invalid date', isUrgent: false, isOverdue: false };
  }

  if (diffMs < 0) {
    return { text: 'Overdue', isUrgent: false, isOverdue: true };
  }

  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { text: `${mins}m left`, isUrgent: true, isOverdue: false };
  }

  if (diffHours < 24) {
    const hours = Math.floor(diffHours);
    return { text: `${hours}h left`, isUrgent: diffHours <= 6, isOverdue: false };
  }

  if (diffDays === 1) {
    return { text: 'Tomorrow', isUrgent: false, isOverdue: false };
  }

  return { text: `${diffDays} days left`, isUrgent: false, isOverdue: false };
}
