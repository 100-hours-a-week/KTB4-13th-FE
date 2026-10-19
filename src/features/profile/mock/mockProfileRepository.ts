import { readMockValue, subscribeMockValue, writeMockValue } from "@/common/mock/localMockStore";

export interface MockProfile { imageDataUrl: string | null; nickname: string; }
const STORAGE_KEY = "profile";
const FALLBACK: MockProfile = { imageDataUrl: null, nickname: "책벌레" };

export function getMockProfile() { return readMockValue<MockProfile>(STORAGE_KEY, FALLBACK); }
export function saveMockProfile(profile: MockProfile) { writeMockValue(STORAGE_KEY, profile); }
export function subscribeMockProfile(listener: () => void) { return subscribeMockValue(STORAGE_KEY, listener); }
export function isMockNicknameAvailable(nickname: string) {
  return !["관리자", "북적북적", "운영자"].includes(nickname.trim());
}
