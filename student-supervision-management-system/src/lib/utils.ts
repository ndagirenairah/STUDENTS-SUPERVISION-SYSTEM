import { randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateProductivityScore(
  attendanceScore: number,
  activityScore: number,
  taskCompletionScore: number,
  evidenceScore: number,
  supervisorRating: number
): number {
  // Weighted average: Attendance (20%), Activity (25%), Tasks (25%), Evidence (20%), Rating (10%)
  return Math.round(
    attendanceScore * 0.2 +
    activityScore * 0.25 +
    taskCompletionScore * 0.25 +
    evidenceScore * 0.2 +
    supervisorRating * 0.1
  );
}

export function calculateRiskLevel(
  productivityScore: number,
  flags: string[]
): { level: 'low' | 'medium' | 'high'; reasons: string[] } {
  const reasons: string[] = [];
  let riskPoints = 0;

  if (productivityScore < 40) {
    riskPoints += 3;
    reasons.push('Productivity score below 40');
  } else if (productivityScore < 60) {
    riskPoints += 1;
    reasons.push('Productivity score below 60');
  }

  flags.forEach((flag) => {
    riskPoints += 1;
    reasons.push(flag);
  });

  if (riskPoints >= 3) return { level: 'high', reasons };
  if (riskPoints >= 1) return { level: 'medium', reasons };
  return { level: 'low', reasons };
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getCheckInStatus(checkInTime: Date): 'on_time' | 'late' {
  const hours = checkInTime.getHours();
  const minutes = checkInTime.getMinutes();
  // On time if before 8:30 AM
  if (hours < 8 || (hours === 8 && minutes <= 30)) {
    return 'on_time';
  }
  return 'late';
}
