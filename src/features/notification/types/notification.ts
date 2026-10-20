export interface NotificationItem {
  body: string;
  createdAt: string;
  notificationId: number;
  readAt: string | null;
  title: string;
}

export interface NotificationList {
  notifications: NotificationItem[];
  unreadCount: number;
}
