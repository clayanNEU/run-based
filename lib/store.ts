"use client";

import { type ContributionType, todayKey, pointsFor } from "./points";

type Totals = {
  attend: number;
  host: number;
  pace: number;
  supplies: number;
  points: number;
  badges: string[];
  streak: number;
  lastAttendDate?: string;
  __streakDay?: string;
  __hostDay?: string;
  __paceDay?: string;
  __suppliesDay?: string;
};

const defaultTotals: Totals = { attend: 0, host: 0, pace: 0, supplies: 0, points: 0, badges: [], streak: 0 };
const KEY = "sr-totals";

// Hydration-safe localStorage access
function safeLoadFromStorage(): Totals {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      return { ...defaultTotals, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
  }
  return defaultTotals;
}

function safeSaveToStorage(t: Totals) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// Server-safe function that always returns defaults during SSR
export function getTotals(): Totals { 
  return defaultTotals; 
}

// Client-only function for loading actual data
export function getClientTotals(): Totals {
  if (typeof window === "undefined") return defaultTotals;
  return safeLoadFromStorage();
}

export function canDo(type: ContributionType, totals?: Totals): { ok: boolean; reason?: string } {
  const t = totals || getClientTotals();
  const today = todayKey();
  if (type === "ATTEND" && t.lastAttendDate === today) return { ok: false, reason: "Already checked in today ✅" };
  if (type === "HOST" && t.__hostDay === today) return { ok: false, reason: "Host already recorded today ✅" };
  if (type === "PACE" && t.__paceDay === today) return { ok: false, reason: "Pace already recorded today ✅" };
  if (type === "SUPPLIES" && t.__suppliesDay === today) return { ok: false, reason: "Supplies already recorded today ✅" };
  return { ok: true };
}

export function applyContribution(type: ContributionType) {
  const t = getClientTotals();
  const p = pointsFor(type);
  const today = todayKey();

  if (type === "ATTEND") {
    t.attend += 1;
    // streak logic
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
    t.streak = (t.lastAttendDate === yKey) ? (t.streak + 1) : (t.lastAttendDate === today ? t.streak : 1);
    t.lastAttendDate = today;
    t.__streakDay = today;

    if (t.attend === 1 && !t.badges.includes("First Stride")) t.badges.push("First Stride");
    if (t.points + p >= 50 && !t.badges.includes("50 Club")) t.badges.push("50 Club");
  }

  if (type === "HOST") {
    t.host += 1;
    t.__hostDay = today;
    if (!t.badges.includes("First Host")) t.badges.push("First Host");
  }

  if (type === "PACE") {
    t.pace += 1;
    t.__paceDay = today;
  }

  if (type === "SUPPLIES") {
    t.supplies += 1;
    t.__suppliesDay = today;
  }

  t.points += p;
  safeSaveToStorage(t);
  return t;
}
