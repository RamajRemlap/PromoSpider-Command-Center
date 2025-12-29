
import { HarvestSchedule } from '../types';

/**
 * Simulates the next N run times for a schedule, incorporating jitter.
 * 
 * @param schedule The schedule configuration
 * @param count Number of future runs to calculate
 * @returns Array of Date objects representing next run times
 */
export const calculateNextRuns = (schedule: HarvestSchedule, count: number = 5): Date[] => {
  const runs: Date[] = [];
  let currentTime = new Date();

  // Simple Cron-like parser simulation (Simplified for demo)
  // Assuming basic patterns like "0 * * * *" (hourly) or "0 0 * * *" (daily)
  
  // Base interval in minutes based on simple heuristics from cron string
  let intervalMinutes = 60; // Default hourly
  if (schedule.cronExpression.includes("*/15")) intervalMinutes = 15;
  if (schedule.cronExpression.includes("0 0")) intervalMinutes = 1440; // Daily
  if (schedule.cronExpression.includes("*/4")) intervalMinutes = 240; // Every 4h

  for (let i = 0; i < count; i++) {
    // 1. Calculate Base Time (Perfect Schedule)
    const baseTime = new Date(currentTime.getTime() + (intervalMinutes * 60 * 1000));
    
    // 2. Apply Jitter (Randomness)
    // If jitter is 30 mins, we add random value between -30 and +30
    const jitterMs = schedule.jitterMinutes * 60 * 1000;
    const randomOffset = (Math.random() * jitterMs * 2) - jitterMs;
    
    const randomizedTime = new Date(baseTime.getTime() + randomOffset);
    
    runs.push(randomizedTime);
    currentTime = baseTime; // Advance base time for next iteration
  }

  return runs;
};

export const formatRunTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
         ` (${date.toLocaleDateString()})`;
};
