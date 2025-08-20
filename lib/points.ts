export const TYPES = { ATTEND: 1, HOST: 2, PACE: 3, SUPPLIES: 4 } as const;

export const WEIGHTS: Record<number, number> = {
  [TYPES.ATTEND]: 10,
  [TYPES.HOST]: 50,
  [TYPES.PACE]: 20,
  [TYPES.SUPPLIES]: 15,
};

export type ContributionType = keyof typeof TYPES;

export function pointsFor(type: ContributionType) {
  return WEIGHTS[TYPES[type]];
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
