export const ConsentSchema = { analytics: false, ads: false, geo: false } as const;
export type ConsentState = typeof ConsentSchema;

let state: ConsentState = { analytics: false, ads: false, geo: false };
export function getConsent() { return state; }
export function setConsent(patch: Partial<ConsentState>) { state = { ...state, ...patch }; }
export function hasConsent(key: keyof ConsentState) { return state[key]; }
