import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Home, Bell, X, Check, ChevronLeft, ChevronUp, Menu, UserCircle, Briefcase, Crown, ShieldCheck, Users, Scale, Archive, Plus, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/notifications";
import { MOCK_EMPLOYEES } from "@/lib/data";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  role?: "beneficiary" | "employee" | "manager";
  step?: number;
  totalSteps?: number;
  stepLabels?: string[];
  onBack?: () => void;
  userName?: string;
  department?: string;
  activeRequests?: number;
  completedRequests?: number;
  primaryColor?: string;
  accentColor?: string;
}

const menuDepartments = [
  { key: "verification", label: "مركز تدقيق الطلبات", icon: ShieldCheck, patterns: ["مركز تدقيق الطلبات", "قسم التدقيق"] },
  { key: "beneficiary_services", label: "قسم خدمات المستفيدين", icon: Users, patterns: ["خدمات المستفيدين"] },
  { key: "judicial", label: "الدوائر القضائية", icon: Scale, patterns: ["الدائرة القضائية", "الدائرة الجزئية", "الدائرة المرورية"] },
  { key: "documents", label: "قسم الوثائق والمحفوظات", icon: Archive, patterns: ["قسم الوثائق والمحفوظات"] },
];

export function PageHeader({
  title,
  subtitle,
  role = "beneficiary",
  onBack,
  primaryColor = "#187860",
}: PageHeaderProps) {
  const [, navigate] = useLocation();
  const { notifications, unreadCount, markAllRead, markRead, portalNotifications, portalUnreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifExpanded, setNotifExpanded] = useState(false);
  const [expandedNotifs, setExpandedNotifs] = useState<Set<string>>(new Set());
  const [selectedNotifs, setSelectedNotifs] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [showEmployeeSubmenu, setShowEmployeeSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu && !showNotifications) return;
    const handleClick = (e: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowEmployeeSubmenu(false);
      }
      if (showNotifications && notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu, showNotifications]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  const handleDeptQuickSelect = (dept: typeof menuDepartments[0]) => {
    const emp = MOCK_EMPLOYEES.find(e =>
      e.status === "active" && dept.patterns.some(p => e.department.includes(p))
    ) || MOCK_EMPLOYEES.find(e => e.status === "active");
    if (emp) {
      sessionStorage.setItem("currentEmployee", JSON.stringify(emp));
      setShowMenu(false);
      setShowEmployeeSubmenu(false);
      if (window.location.pathname === "/employee") {
        window.location.reload();
      } else {
        navigate("/employee");
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 overflow-visible print:hidden">
      <div
        className="bg-white/95 backdrop-blur-md border-b relative z-20"
        style={{ borderColor: "#ebebeb" }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <img src={mojLogo} alt="وزارة العدل" className="w-9 h-9 sm:w-14 sm:h-14 object-contain shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] sm:text-lg font-bold text-[#187860] truncate">{title}</p>
                {subtitle && <p className="text-[10px] sm:text-sm text-[#1F2937]/40 truncate">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={handleBack}
                data-testid="button-back"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#ebebeb]/50 active:bg-[#ebebeb]"
                style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}
              >
                <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#1F2937]/70" />
              </button>
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  data-testid="button-notifications"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] relative"
                  style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}
                >
                  <Bell className="w-5 h-5 text-[#1F2937]/70" />
                  {portalUnreadCount(role) > 0 && (
                    <span
                      className="absolute -top-1 -end-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full text-[9px] font-black flex items-center justify-center"
                      style={{ background: "#B42318", color: "white" }}
                    >
                      {portalUnreadCount(role) > 9 ? "9+" : portalUnreadCount(role)}
                    </span>
                  )}
                </button>

                {showNotifications && (() => {
                    const myNotifs = portalNotifications(role);
                    const myUnread = portalUnreadCount(role);
                    const allSelected = myNotifs.length > 0 && myNotifs.every(n => selectedNotifs.has(n.id));
                    const toggleSelectAll = () => {
                      if (allSelected) setSelectedNotifs(new Set());
                      else setSelectedNotifs(new Set(myNotifs.map(n => n.id)));
                    };
                    const markSelectedRead = () => {
                      selectedNotifs.forEach(id => markRead(id));
                      setSelectedNotifs(new Set());
                    };
                    const markPortalAllRead = () => {
                      myNotifs.forEach(n => { if (!n.read) markRead(n.id); });
                    };
                    const isCompact = !notifExpanded;

                    return (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifications(false); setNotifExpanded(false); }} />
                        <div
                          className={`z-50 shadow-xl border bg-white flex flex-col overflow-hidden rounded-2xl transition-all duration-200 ease-out ${
                            isCompact
                              ? "fixed top-14 start-3 end-3 max-h-[380px] sm:absolute sm:top-full sm:mt-2 sm:start-0 sm:end-auto sm:w-[340px]"
                              : "fixed top-3 start-3 end-3 bottom-3 sm:absolute sm:top-full sm:mt-2 sm:start-0 sm:end-auto sm:bottom-auto sm:w-[400px] sm:max-h-[560px]"
                          }`}
                          style={{ borderColor: "#ebebeb" }}
                          dir="rtl"
                        >
                          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b shrink-0" style={{ borderColor: "#ebebeb" }}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#187860" }}>
                                <Bell className="w-3 h-3 text-white" />
                              </div>
                              <p className="font-bold text-[12px] text-[#1F2937]">الإشعارات</p>
                              {myUnread > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white leading-none" style={{ background: "#B42318" }}>{myUnread}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setNotifExpanded(v => !v)} className="w-6 h-6 rounded-md flex items-center justify-center text-[#1F2937]/35 hover:text-[#1F2937]/60 hover:bg-[#ebebeb]/50 transition-colors" data-testid="button-expand-notifications">
                                {isCompact ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                              </button>
                              <button onClick={() => { setShowNotifications(false); setNotifExpanded(false); }} className="w-6 h-6 rounded-md flex items-center justify-center text-[#1F2937]/35 hover:text-[#1F2937]/60 hover:bg-[#ebebeb]/50 transition-colors" data-testid="button-close-notifications">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {!isCompact && (
                            <div className="flex items-center justify-between px-4 py-1.5 border-b shrink-0 bg-[#FAFAFA]" style={{ borderColor: "#ebebeb" }}>
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-3 h-3 rounded accent-[#187860] cursor-pointer" data-testid="checkbox-select-all" />
                                <span className="text-[10px] font-bold text-[#1F2937]/60">تحديد الكل</span>
                              </label>
                              {selectedNotifs.size > 0 ? (
                                <button onClick={markSelectedRead} className="text-[9px] text-[#187860] font-medium hover:underline" data-testid="button-mark-selected-read">تحديد كمقروء</button>
                              ) : myUnread > 0 ? (
                                <button onClick={markPortalAllRead} className="text-[9px] text-[#187860] font-medium hover:underline" data-testid="button-mark-all-read">تحديد كمقروء</button>
                              ) : null}
                            </div>
                          )}

                          <div className="flex-1 overflow-y-auto min-h-0">
                            {myNotifs.length === 0 ? (
                              <div className="py-10 text-center">
                                <Bell className="w-7 h-7 mx-auto mb-2 text-[#1F2937]/12" />
                                <p className="text-[11px] text-[#1F2937]/30">لا توجد إشعارات</p>
                              </div>
                            ) : (
                              myNotifs.map((notif) => {
                                const isItemExpanded = expandedNotifs.has(notif.id);
                                const isSelected = selectedNotifs.has(notif.id);
                                const bodyTruncated = notif.body.length > 55;
                                const unread = !notif.read;
                                return (
                                  <div
                                    key={notif.id}
                                    className="relative border-b"
                                    style={{ borderColor: "#ebebeb", background: unread ? "rgba(24,120,96,0.05)" : "#fff" }}
                                    data-testid={`notification-item-${notif.id}`}
                                  >
                                    <div className="absolute top-0 bottom-0 end-0 w-[3px]" style={{ background: unread ? "#187860" : "#e0e0e0" }} />
                                    <div className="pe-4 ps-3 py-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[12px] font-bold text-[#1F2937]">{notif.title}</span>
                                            {unread && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#187860" }} />}
                                          </div>
                                          <p className={`text-[11px] text-[#1F2937]/65 leading-[1.65] mt-1 ${!isItemExpanded && bodyTruncated ? "line-clamp-2" : ""}`}>
                                            {notif.body}
                                          </p>
                                          <p className="text-[10px] text-[#1F2937]/35 mt-1.5">{notif.timestamp}</p>
                                        </div>
                                        {!isCompact && (
                                          <input type="checkbox" checked={isSelected}
                                            onChange={() => { const next = new Set(selectedNotifs); if (isSelected) next.delete(notif.id); else next.add(notif.id); setSelectedNotifs(next); }}
                                            className="w-3 h-3 rounded accent-[#187860] cursor-pointer mt-0.5 shrink-0" data-testid={`checkbox-notif-${notif.id}`} />
                                        )}
                                      </div>
                                      {bodyTruncated && (
                                        <button onClick={() => { const next = new Set(expandedNotifs); if (isItemExpanded) next.delete(notif.id); else next.add(notif.id); setExpandedNotifs(next); if (unread) markRead(notif.id); }}
                                          className="flex items-center gap-0.5 mt-1.5 text-[10px] font-medium hover:opacity-70" style={{ color: "#187860" }} data-testid={`button-more-${notif.id}`}>
                                          <Plus className="w-2.5 h-2.5" />
                                          {isItemExpanded ? "أقل" : "المزيد"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {isCompact && myNotifs.length > 0 && (
                            <div className="shrink-0 border-t px-3 py-2 flex items-center justify-between bg-[#FAFAFA]" style={{ borderColor: "#ebebeb" }}>
                              {myUnread > 0 && (
                                <button onClick={markPortalAllRead} className="text-[9px] text-[#187860] font-medium hover:underline" data-testid="button-mark-all-read-compact">تحديد الكل كمقروء</button>
                              )}
                              <button onClick={() => setNotifExpanded(true)} className="text-[9px] text-[#187860] font-medium flex items-center gap-1 hover:underline me-auto" data-testid="button-show-all-notifications">
                                عرض الكل <Maximize2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
              </div>

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => { setShowMenu(v => !v); setShowEmployeeSubmenu(false); }}
                  data-testid="button-menu"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#ebebeb]/50 active:bg-[#ebebeb]"
                  style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}
                >
                  <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#1F2937]/70" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute end-0 top-full mt-1 w-64 rounded-xl shadow-lg border bg-white z-50 overflow-hidden py-1"
                      style={{ borderColor: "#ebebeb" }}
                      dir="rtl"
                    >
                      <button
                        onClick={() => { navigate("/"); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                      >
                        <Home className="w-4 h-4 text-[#1F2937]/40" />
                        <span>الرئيسية</span>
                      </button>
                      <div className="border-t my-1" style={{ borderColor: "#ebebeb" }} />
                      <button
                        onClick={() => { navigate("/beneficiary"); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-[#1F2937]/40" />
                        <span>بوابة المستفيد</span>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowEmployeeSubmenu(!showEmployeeSubmenu)}
                          className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-[#1F2937]/40" />
                          <span className="flex-1 text-start">بوابة الموظف</span>
                          <ChevronLeft className={`w-3.5 h-3.5 text-[#1F2937]/40 transition-transform duration-200 ${showEmployeeSubmenu ? "rotate-[-90deg]" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {showEmployeeSubmenu && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="py-1 ms-6 border-s-2" style={{ borderColor: "#187860" }}>
                                {menuDepartments.map((dept) => {
                                  const DeptIcon = dept.icon;
                                  return (
                                    <button key={dept.key} onClick={() => handleDeptQuickSelect(dept)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 sm:py-2 text-xs text-[#1F2937]/60 hover:bg-[#187860]/[0.04] hover:text-[#187860] active:bg-[#187860]/[0.08] transition-colors whitespace-nowrap"
                                      data-testid={`menu-dept-${dept.key}`}>
                                      <DeptIcon className="w-3.5 h-3.5 text-[#187860]/60" />
                                      <span>{dept.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={() => { navigate("/manager"); setShowMenu(false); setShowEmployeeSubmenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                      >
                        <Crown className="w-4 h-4 text-[#1F2937]/40" />
                        <span>بوابة المدير</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
