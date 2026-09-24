import { DeadlineItem } from '@/types/deadline.types';

/**
 * Format a Date to UTC string for iCal (YYYYMMDDTHHMMSSZ)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a Google Calendar "Add Event" URL for a single placement deadline
 */
export function generateGoogleCalendarUrl(deadline: DeadlineItem): string {
  const startDate = new Date(deadline.deadline_at);
  // Default duration is 1 hour leading up to deadline
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const startFormatted = formatIcsDate(startDate);
  const endFormatted = formatIcsDate(endDate);

  const title = encodeURIComponent(`[Deadline] ${deadline.company_name} — ${deadline.title}`);
  const details = encodeURIComponent(
    `Placement & OA Deadline for ${deadline.company_name}.\n\nRole: ${deadline.title}\nStatus: ${deadline.status}\n${
      deadline.action_url ? `Registration / Portal Link: ${deadline.action_url}\n\n` : ''
    }Tracked automatically by PlaceMint AI.`
  );
  const location = encodeURIComponent(deadline.action_url || 'Online Campus Placement Portal');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}&add=urgent`;
}

/**
 * Generates a standard .ics (iCalendar) file string for a single deadline with alarm triggers
 */
export function generateIcsFile(deadline: DeadlineItem): string {
  return generateMultiIcsFile([deadline]);
}

/**
 * Generates a standard .ics (iCalendar) file string for multiple deadlines
 */
export function generateMultiIcsFile(deadlines: DeadlineItem[]): string {
  const now = formatIcsDate(new Date());

  const events = deadlines.map((d) => {
    const startDate = new Date(d.deadline_at);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const uid = `${d.id || Math.random().toString(36).substring(2)}@placemint.ai`;

    const summary = `[Deadline] ${d.company_name} — ${d.title}`;
    const description = `Placement drive registration / OA deadline for ${d.company_name} (${d.title}). ${
      d.action_url ? `Link: ${d.action_url}` : ''
    } Tracked by PlaceMint AI.`;

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatIcsDate(startDate)}
DTEND:${formatIcsDate(endDate)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${d.action_url || 'Online Placement Portal'}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${d.company_name} deadline in 24 hours!
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Urgent: ${d.company_name} deadline in 1 hour!
END:VALARM
END:VEVENT`;
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlaceMint AI//Placement Deadlines//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Placement Deadlines (PlaceMint AI)
X-WR-TIMEZONE:UTC
${events.join('\n')}
END:VCALENDAR`;
}

/**
 * Triggers a browser file download for the .ics content
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
