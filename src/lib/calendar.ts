export function generateICS({
  title,
  description,
  date,
  location,
}: {
  title: string;
  description: string;
  date: string;
  location?: string;
}): string {
  const eventDate = new Date(date);
  const endDate = new Date(eventDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const reminderDate1 = new Date(eventDate);
  reminderDate1.setDate(reminderDate1.getDate() - 3);

  const reminderDate2 = new Date(eventDate);
  reminderDate2.setDate(reminderDate2.getDate() - 1);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TL;DR Mail//Deadline Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(eventDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:⚠️ DEADLINE: ${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Deadline in 3 days!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Deadline TOMORROW!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Deadline in 2 hours!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return lines;
}

export function generateGoogleCalendarLink({
  title,
  description,
  date,
  location,
}: {
  title: string;
  description: string;
  date: string;
  location?: string;
}): string {
  const eventDate = new Date(date);
  const endDate = new Date(eventDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatForGoogle = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `⚠️ DEADLINE: ${title}`,
    dates: `${formatForGoogle(eventDate)}/${formatForGoogle(endDate)}`,
    details: description,
    ...(location && { location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
