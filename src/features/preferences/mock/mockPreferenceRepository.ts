import { readMockValue, writeMockValue } from "@/common/mock/localMockStore";

export interface MockPreference { id: string; source: string; text: string; }
const STORAGE_KEY = "preferences";
const SEED: MockPreference[] = [
  { id: "calm", source: "대화에서", text: "잠들기 전 편안하게 읽을 수 있는 에세이를 좋아해요." },
  { id: "mystery", source: "선택한 책에서", text: "반전이 있지만 지나치게 잔인하지 않은 미스터리를 선호해요." },
  { id: "length", source: "취향 설정에서", text: "한 권을 오래 끌지 않도록 350쪽 이하의 책을 자주 골라요." },
];
export function getMockPreferences() { return readMockValue<MockPreference[]>(STORAGE_KEY, SEED); }
export function deleteMockPreference(id: string) { const item = getMockPreferences().find((entry) => entry.id === id) ?? null; writeMockValue(STORAGE_KEY, getMockPreferences().filter((entry) => entry.id !== id)); return item; }
export function restoreMockPreference(item: MockPreference) { writeMockValue(STORAGE_KEY, [item, ...getMockPreferences().filter((entry) => entry.id !== item.id)]); }
export function clearMockPreferences() { writeMockValue<MockPreference[]>(STORAGE_KEY, []); }
