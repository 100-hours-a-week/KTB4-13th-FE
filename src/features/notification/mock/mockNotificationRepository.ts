import { readMockValue, writeMockValue } from "@/common/mock/localMockStore";

export interface MockNotification {
  body: string;
  createdAt: string;
  id: string;
  isRead: boolean;
  link: string | null;
  title: string;
}

const STORAGE_KEY = "notifications-v2";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1_000).toISOString();
}

function createSeed(): MockNotification[] {
  return [
    { body: "주문하신 책의 결제가 완료되었어요.", createdAt: hoursAgo(1), id: "order-paid", isRead: false, link: "/my/orders", title: "결제가 완료됐어요" },
    { body: "취향에 꼭 맞는 새 책을 발견했어요. 지금 확인해 보세요.", createdAt: hoursAgo(18), id: "recommendation", isRead: false, link: "/catalog/recommendations", title: "오늘의 책 추천이 도착했어요" },
    { body: "장바구니에 담아둔 책이 기다리고 있어요.", createdAt: hoursAgo(72), id: "cart", isRead: true, link: "/cart", title: "잊은 책은 없나요?" },
  ];
}

export function getMockNotifications() {
  return readMockValue<MockNotification[]>(STORAGE_KEY, createSeed());
}

export function readMockNotification(id: string) {
  writeMockValue(STORAGE_KEY, getMockNotifications().map((item) => item.id === id ? { ...item, isRead: true } : item));
}

export function readAllMockNotifications() {
  writeMockValue(STORAGE_KEY, getMockNotifications().map((item) => ({ ...item, isRead: true })));
}
