import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { MOCK_NOTIFICATIONS, type AppNotification, type NotificationType } from "./data";
import { ArrowUpRight, Zap, CheckCircle, Clock, Settings, type LucideIcon } from "lucide-react";

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  portalNotifications: (portal: "beneficiary" | "employee" | "manager") => AppNotification[];
  portalUnreadCount: (portal: "beneficiary" | "employee" | "manager") => number;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const STORAGE_KEY = "moj_notifications";
const NOTIF_VERSION_KEY = "moj_notifications_v";
const NOTIF_VERSION = "5";

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const storedVersion = localStorage.getItem(NOTIF_VERSION_KEY);
      if (storedVersion !== NOTIF_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(NOTIF_VERSION_KEY, NOTIF_VERSION);
        return MOCK_NOTIFICATIONS;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotif: AppNotification = {
      ...n,
      id: `n${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const portalNotifications = useCallback((portal: "beneficiary" | "employee" | "manager") => {
    return notifications.filter(n => n.portal === portal);
  }, [notifications]);

  const portalUnreadCount = useCallback((portal: "beneficiary" | "employee" | "manager") => {
    return notifications.filter(n => n.portal === portal && !n.read).length;
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead, clearAll, portalNotifications, portalUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  referral: { label: "إحالة", color: "#187860", bg: "rgba(14,59,46,0.1)", icon: ArrowUpRight },
  fasttrack: { label: "طارئ", color: "#B42318", bg: "rgba(180,35,24,0.1)", icon: Zap },
  completed: { label: "مكتمل", color: "#075e4a", bg: "rgba(7,94,74,0.1)", icon: CheckCircle },
  overdue: { label: "متأخر", color: "#ec9a18", bg: "rgba(199,168,108,0.1)", icon: Clock },
  system: { label: "نظام", color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: Settings },
};
