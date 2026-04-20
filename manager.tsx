import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MojFooter from "@/components/moj-footer";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ComposedChart, AreaChart, Area
} from "recharts";
import {
  Users, Building2, FileText, TrendingUp, Plus, Edit2, Trash2, Snowflake,
  Search, Download, RefreshCw, AlertTriangle, Clock, CheckCircle, ArrowLeftRight,
  Trophy, Medal, Star, BarChart2, Printer, FileCheck, Zap, XCircle,
  Shield, Activity, TrendingDown, Server, Wifi, Database, ChevronRight,
  ArrowUpRight, ArrowDownRight, Minus, Filter, X, Mail, LayoutGrid, List,
  Upload, Paperclip, ClipboardList, SlidersHorizontal, Send, MessageSquare, BarChart3, RotateCcw, Copy, Eye
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RequestStatusBadge } from "@/components/request-status-badge";
import { RequestTimeline } from "@/components/request-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MOCK_REQUESTS, MOCK_EMPLOYEES, MOCK_DEPARTMENTS, DAILY_STATS, MONTHLY_PERFORMANCE,
  SATISFACTION_DATA, COURT_DISTRIBUTION_DATA, WEEKLY_REPORT_DATA,
  MOCK_AUDIT_LOG, SYSTEM_HEALTH, BOTTLENECK_DATA, CIRCUITS, CIRCUIT_EMPLOYEES, DOCS_EMPLOYEES,
  getCircuitLabel, getRequestTypeLabel, formatDate, getSlaStatus, isOverSla, getDepartmentSection,
  loadTickets, saveTickets, REFERRAL_DEPARTMENTS, initializeTickets, INITIAL_TICKETS,
  type Request, type RequestStatus, type Employee, type Department, type AuditEntry, type Ticket
} from "@/lib/data";

const REQUESTS_KEY = "moj_requests";
const DATA_VERSION_KEY = "moj_data_version";
const CURRENT_DATA_VERSION = "15";

function downloadAttachment(att: { name: string; data: string }) {
  const link = document.createElement("a");
  link.href = att.data;
  link.download = att.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function fileToBase64(file: File): Promise<{ name: string; type: string; size: number; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function migrateStoredData() {
  const ver = localStorage.getItem(DATA_VERSION_KEY);
  if (ver !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.removeItem("moj_tickets");
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }
}

const _empIdToName = new Map(MOCK_EMPLOYEES.map(e => [e.id, e.name]));
function resolveEmployeeName(req: Request): Request {
  if (req.assignedTo && _empIdToName.has(req.assignedTo)) {
    return { ...req, assignedTo: _empIdToName.get(req.assignedTo)! };
  }
  return req;
}

function loadAllRequests(): Request[] {
  try {
    migrateStoredData();
    const stored = localStorage.getItem(REQUESTS_KEY);
    const storedList: Request[] = stored ? JSON.parse(stored) : [];
    const storedById = new Map(storedList.map(r => [r.id, r]));
    const mockIds = new Set(MOCK_REQUESTS.map(r => r.id));
    const mockWithOverrides = MOCK_REQUESTS.map(r => storedById.get(r.id) ?? r);
    const beneficiaryItems = storedList.filter(r => !mockIds.has(r.id));
    return [...beneficiaryItems, ...mockWithOverrides].map(resolveEmployeeName);
  } catch { return MOCK_REQUESTS; }
}
function persistRequestUpdate(updatedItem: Request) {
  try {
    const stored: Request[] = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
    const idx = stored.findIndex(r => r.id === updatedItem.id);
    if (idx >= 0) { stored[idx] = updatedItem; } else { stored.push(updatedItem); }
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(stored));
  } catch {}
}

function LiveWorkloadBoard() {
  const [data, setData] = useState(BOTTLENECK_DATA.map(d => ({
    ...d,
    pending: Math.floor(Math.random() * 20) + 5,
    avgWait: Math.floor(Math.random() * 30) + 2,
    trend: Math.random() > 0.5 ? "up" : "down" as "up" | "down" | "stable"
  })));
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(d => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const newPending = Math.max(0, d.pending + change);
        const newTrend = change > 0 ? "up" : change < 0 ? "down" : "stable";
        return { ...d, pending: newPending, trend: newTrend as any };
      }));
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPending = data.reduce((sum, d) => sum + d.pending, 0);
  const mostOverloaded = [...data].sort((a, b) => b.pending - a.pending)[0];

  const chartData = data.map(d => ({
    name: d.section,
    معلق: d.pending,
    مكتمل: Math.floor(d.pending * 1.5)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات المعلقة</p>
              <h3 className="text-3xl font-black text-primary">{totalPending}</h3>
            </div>
            <Activity className="w-8 h-8 text-primary opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-[#B42318]/[0.04] border-transparent">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">القسم الأكثر انشغالاً</p>
              <h3 className="text-lg font-medium text-foreground">{mostOverloaded.section}</h3>
              <p className="text-[11px] text-[#B42318]/70">{mostOverloaded.pending} طلب معلق</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#B42318]/[0.08] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#B42318]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#187860]/[0.06] animate-pulse" />
        <p className="text-xs text-muted-foreground">تحديث حي تلقائي (كل 5 ثوانٍ) - آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((dept, i) => {
          const isHigh = dept.avgWait > 24;
          const isMedium = dept.avgWait >= 8 && dept.avgWait <= 24;
          const statusColor = isHigh ? "text-[#B42318]" : isMedium ? "text-[#ec9a18]" : "text-[#187860]";
          const bgColor = isHigh ? "bg-[#B42318]/[0.06] dark:bg-[#B42318]/[0.04]" : isMedium ? "bg-[#ec9a18]/[0.06] dark:bg-[#ec9a18]/[0.04]" : "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04]";

          return (
            <motion.div key={dept.section}>
              <Card className={`overflow-hidden hover-elevate ${bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm truncate flex-1">{dept.section}</p>
                    {dept.trend === "up" ? <ArrowUpRight className="w-4 h-4 text-[#B42318]" /> : 
                     dept.trend === "down" ? <ArrowDownRight className="w-4 h-4 text-[#187860]" /> : 
                     <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{dept.pending}</span>
                    <span className="text-xs text-muted-foreground">طلب معلق</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">متوسط الانتظار</span>
                    <span className={`text-sm font-bold ${statusColor}`}>{dept.avgWait} ساعة</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">توزيع ضغط العمل (معلق مقابل مكتمل)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide reversed />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} orientation="right" />
                <Tooltip />
                <Legend />
                <Bar dataKey="معلق" name="طلبات معلقة" fill="#B42318" radius={[4, 0, 0, 4]} barSize={20} />
                <Bar dataKey="مكتمل" name="طلبات مكتملة" fill="#075e4a" radius={[4, 0, 0, 4]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportButtons({ requests, auditLog, onSendEmail, onSendMonthlyCsat }: { requests: Request[], auditLog: AuditEntry[], onSendEmail: () => void, onSendMonthlyCsat: () => void }) {
  const { toast } = useToast();

  const exportReport = () => {
    const headers = ["رقم الطلب", "الحالة", "اسم مقدم الطلب", "نوع الطلب", "الدائرة", "تاريخ التقديم", "الموعد النهائي"];
    const rows = requests.map(r => [
      r.trackingNumber,
      r.status,
      r.applicantName,
      getRequestTypeLabel(r.requestType, true),
      getCircuitLabel(r.circuit),
      r.createdAt,
      r.slaDeadline
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_الطلبات_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "تم تصدير الملف بنجاح" });
  };

  const exportDetailedPDF = () => {
    const completed = requests.filter(r => r.status === "completed").length;
    const processing = requests.filter(r => r.status === "processing").length;
    const referred = requests.filter(r => r.status === "referred").length;
    const overdue = requests.filter(r => {
      const d = new Date(r.slaDeadline).getTime();
      return r.status !== "completed" && d < Date.now();
    }).length;
    const rated = requests.filter(r => r.rating);
    const avgRating = rated.length > 0 ? (rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length).toFixed(1) : "N/A";

    const auditHeaders = ["الإجراء", "المستخدم", "التاريخ", "التفاصيل"];
    const auditRows = auditLog.slice(0, 20).map(a => [a.action, a.employeeName, a.timestamp, a.targetLabel || "-"]);

    const content = [
      "╔══════════════════════════════════════════════════════╗",
      "║       تقرير تفصيلي منصة الوثائق القضائية         ║",
      "║             وزارة العدل                             ║",
      "╚══════════════════════════════════════════════════════╝",
      "",
      `تاريخ الإصدار: ${new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura")}`,
      `وقت الإصدار: ${new Date().toLocaleTimeString("ar-SA")}`,
      "",
      "━━━━━━ الملخص التنفيذي ━━━━━━",
      `إجمالي الطلبات: ${requests.length}`,
      `المكتملة: ${completed}`,
      `قيد المعالجة: ${processing}`,
      `المحالة: ${referred}`,
      `المتأخرة: ${overdue}`,
      `متوسط التقييم: ${avgRating} / 5`,
      "",
      "━━━━━━ تفاصيل الطلبات ━━━━━━",
      ...requests.map(r => [
        `  رقم: ${r.trackingNumber} | ${getRequestTypeLabel(r.requestType, true)}`,
        `  الحالة: ${r.status} | مقدم الطلب: ${r.applicantName}`,
        `  الدائرة: ${getCircuitLabel(r.circuit)} | تاريخ التقديم: ${r.createdAt}`,
        `  الموعد النهائي: ${r.slaDeadline}${r.rating ? ` | التقييم: ${r.rating}/5` : ""}`,
        "  ─────────────────────────────────",
      ]).flat(),
      "",
      "━━━━━━ سجل التدقيق (آخر 20 إجراء) ━━━━━━",
      auditHeaders.join(" | "),
      "────────────────────────────────────────",
      ...auditRows.map(r => r.join(" | ")),
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "مبادرة مقدمة من الموظف/ محمد بخيت حميد المعبدي",
      "mbmaabdi@moj.gov.sa",
      "نموذج تشغيلي تجريبي جميع الحقوق محفوظة © 2026",
    ].join("\n");

    const blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `تقرير_تفصيلي_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    toast({ title: "تم تصدير التقرير التفصيلي بنجاح" });
  };

  const reportActions = [
    { label: "طباعة التقرير", desc: "طباعة لوحة التحكم مباشرة", icon: Printer, onClick: () => window.print(), testId: "button-export-pdf" },
    { label: "تصدير التقرير", desc: "تصدير بيانات الطلبات كملف CSV", icon: Download, onClick: exportReport, testId: "button-export-excel" },
    { label: "تقرير نصي تفصيلي", desc: "تقرير شامل مع سجل التدقيق", icon: FileText, onClick: exportDetailedPDF, testId: "button-export-detailed" },
    { label: "إرسال تقرير بريدي", desc: "إرسال ملخص أسبوعي عبر البريد", icon: Mail, onClick: onSendEmail, testId: "button-send-email" },
    { label: "تقرير رضا المستفيدين", desc: "استطلاع الرضا الشهري", icon: Users, onClick: onSendMonthlyCsat, testId: "button-monthly-csat" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {reportActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.testId}
            data-testid={action.testId}
            onClick={action.onClick}
            className="flex items-center gap-4 p-4 rounded-xl text-right bg-white border border-[#ebebeb] hover:border-[#187860]/30 hover:bg-[#187860]/[0.02] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#187860]/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#187860]/[0.1] transition-colors">
              <Icon className="w-5 h-5 text-[#187860]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1F2937]">{action.label}</p>
              <p className="text-[11px] text-[#1F2937]/50 mt-0.5">{action.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#1F2937]/20 group-hover:text-[#187860]/50 transition-colors flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

function PrintableReport({ stats }: { stats: any }) {
  return (
    <div id="print-report" className="hidden print:block p-8 bg-white text-black" dir="rtl">
      <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary mb-2">تقرير منصة وزارة العدل</h1>
          <p className="text-lg">لوحة تحكم المدير - الملخص التنفيذي</p>
        </div>
        <div className="text-start">
          <p className="font-bold">تاريخ التقرير: {new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura")}</p>
          <p className="text-sm">وقت الاستخراج: {new Date().toLocaleTimeString("ar-SA")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-s-4 border-primary ps-3">الإحصائيات العامة</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#ebebeb] rounded-lg">
              <p className="text-sm text-[#1F2937]/60">إجمالي الطلبات</p>
              <p className="text-2xl font-black">{stats.total}</p>
            </div>
            <div className="p-4 bg-[#ebebeb] rounded-lg">
              <p className="text-sm text-[#1F2937]/60">مكتملة</p>
              <p className="text-2xl font-black text-[#075e4a]">{stats.completed}</p>
            </div>
            <div className="p-4 bg-[#ebebeb] rounded-lg">
              <p className="text-sm text-[#1F2937]/60">قيد المعالجة</p>
              <p className="text-2xl font-black text-[#ec9a18]">{stats.processing}</p>
            </div>
            <div className="p-4 bg-[#ebebeb] rounded-lg">
              <p className="text-sm text-[#1F2937]/60">متجاوزة للموعد المحدد</p>
              <p className="text-2xl font-black text-[#B42318]">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold border-s-4 border-primary ps-3">الموارد البشرية</h2>
          <div className="space-y-2">
            <div className="flex justify-between p-3 border-b">
              <span>عدد الموظفين النشطين</span>
              <span className="font-bold">{stats.employees}</span>
            </div>
            <div className="flex justify-between p-3 border-b">
              <span>عدد الأقسام</span>
              <span className="font-bold">{stats.departments}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-bold border-s-4 border-primary ps-3">الأداء الأسبوعي</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ebebeb]">
              <th className="border p-3 text-right">اليوم</th>
              <th className="border p-3 text-right">مكتمل</th>
              <th className="border p-3 text-right">قيد المعالجة</th>
              <th className="border p-3 text-right">محال</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_STATS.map(s => (
              <tr key={s.day}>
                <td className="border p-3">{s.day}</td>
                <td className="border p-3">{s.completed}</td>
                <td className="border p-3">{s.processing}</td>
                <td className="border p-3">{s.referred}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-20 flex justify-between items-end border-t pt-8">
        <div className="text-center w-48">
          <p className="font-bold mb-8">اعتماد المدير العام</p>
          <div className="border-b border-black w-full h-10"></div>
        </div>
        <p className="text-xs text-[#1F2937]/50">تم إنشاء هذا التقرير آلياً عبر النظام القضائي الموحد</p>
      </div>
      <div className="print-footer mt-8 text-center border-t-2 pt-4" style={{ borderColor: "#187860" }}>
        <p className="text-xs text-[#1F2937]/60">منصة الوثائق القضائية وزارة العدل المملكة العربية السعودية</p>
        <p className="text-xs text-[#1F2937]/50">مبادرة مقدمة من الموظف/ محمد بخيت حميد المعبدي mbmaabdi@moj.gov.sa</p>
      </div>
    </div>
  );
}

function EnhancedAuditLog({ logs }: { logs: AuditEntry[] }) {
  const [filter, setFilter] = useState<string>("All");
  const { toast } = useToast();

  const filteredLogs = filter === "All" ? logs : logs.filter(l => l.action.includes(filter));

  const exportAuditCSV = () => {
    const headers = ["التاريخ", "الموظف", "الإجراء", "التفاصيل"];
    const rows = filteredLogs.map(l => [l.timestamp, l.employeeName, l.action, `${l.targetLabel} (${l.before} -> ${l.after})`]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `سجل_التدقيق_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    toast({ title: "تم تصدير سجل التدقيق" });
  };

  const getActionColor = (action: string) => {
    if (action.includes("قبول")) return "bg-[#187860]/5 text-[#187860] dark:bg-[#187860]/[0.06] dark:text-[#187860]";
    if (action.includes("رفض")) return "bg-[#B42318]/10 text-[#B42318] dark:bg-[#B42318]/[0.06] dark:text-[#B42318]";
    if (action.includes("إحالة")) return "bg-[#187860]/5 text-[#187860] dark:bg-[#187860]/[0.06] dark:text-[#ebebeb]";
    if (action.includes("إغلاق")) return "bg-[#187860]/5 text-[#187860] dark:bg-[#187860]/[0.06] dark:text-[#187860]";
    if (action.includes("إرفاق")) return "bg-[#ebebeb]/15 text-[#187860] dark:bg-[#187860]/5 dark:text-[#ebebeb]";
    return "bg-[#ebebeb] text-[#1F2937] dark:bg-[#187860] dark:text-[#1F2937]/50";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>سجل العمليات والتدقيق</CardTitle>
          <Button variant="outline" size="sm" onClick={exportAuditCSV}>
            <Download className="w-4 h-4 me-1" /> تصدير السجل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "قبول", "رفض", "إحالة", "إغلاق", "إرفاق"].map(f => (
            <Button 
              key={f} 
              size="sm" 
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "All" ? "الكل" : f}
            </Button>
          ))}
        </div>
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(log.employeeName ?? "م").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm">{log.employeeName}</p>
                  <span className="text-[11px] text-muted-foreground">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">المعرّف: {log.targetId}</span>
                </div>
                <p className="text-xs text-muted-foreground">{log.targetLabel} ({log.before} → {log.after})</p>
                {log.action.includes("إحالة") && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] bg-muted/50 p-2 rounded">
                    <span>خدمات المستفيدين</span>
                    <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-bold text-primary">القسم المختص</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnimatedCounter({ value, label, color, icon: Icon }: { value: number; label: string; color: string; icon: any }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 25);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color }}>{displayed}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}


const PRIORITY_COLORS = {
  high: { bg: "bg-[#B42318]/[0.06] dark:bg-[#B42318]/[0.04]", badge: "bg-[#B42318]/10 text-[#B42318] dark:text-[#B42318]", label: "عالية" },
  medium: { bg: "bg-[#ec9a18]/[0.06] dark:bg-[#ec9a18]/[0.04]", badge: "bg-[#ec9a18]/10 text-[#ec9a18] dark:text-[#ec9a18]", label: "متوسطة" },
  low: { bg: "bg-[#ebebeb]/10 dark:bg-[#187860]/[0.04]", badge: "bg-[#ebebeb]/15 text-[#187860] dark:text-[#ebebeb]", label: "منخفضة" },
};

const PIE_COLORS = ["#187860", "#C7A86C", "#ebebeb"];

const BADGE_CONFIG = {
  gold: { icon: Trophy, color: "#C7A86C", bg: "rgba(199,168,108,0.15)", label: "ذهبي" },
  silver: { icon: Medal, color: "#ebebeb", bg: "rgba(148,163,184,0.15)", label: "فضي" },
  bronze: { icon: Medal, color: "#C7A86C", bg: "rgba(199,168,108,0.15)", label: "برونزي" },
};

const processingTimeData = [
  { type: "نسخة مصدقة", متوسط: 2.3, مستهدف: 3 },
  { type: "اطلاع على أوراق", متوسط: 1.1, مستهدف: 2 },
  { type: "نسخة بديلة", متوسط: 3.8, مستهدف: 4 },
];

const peakHoursData = [
  { ساعة: "8ص", عدد: 3 }, { ساعة: "9ص", عدد: 8 }, { ساعة: "10ص", عدد: 14 },
  { ساعة: "11ص", عدد: 11 }, { ساعة: "12ظ", عدد: 6 }, { ساعة: "1م", عدد: 4 },
  { ساعة: "2م", عدد: 9 }, { ساعة: "3م", عدد: 7 }, { ساعة: "4م", عدد: 3 },
];

const heatmapData = [
  { circuit: "العامة",           sun: 2, mon: 4, tue: 3, wed: 5, thu: 1 },
  { circuit: "التجارية",         sun: 2, mon: 3, tue: 1, wed: 3, thu: 2 },
  { circuit: "الجزائية",         sun: 3, mon: 2, tue: 4, wed: 3, thu: 2 },
  { circuit: "العمالية",         sun: 1, mon: 1, tue: 2, wed: 2, thu: 1 },
  { circuit: "الأحوال الشخصية",  sun: 1, mon: 3, tue: 2, wed: 4, thu: 2 },
  { circuit: "الاستئناف",        sun: 2, mon: 2, tue: 3, wed: 2, thu: 1 },
];
const heatmapDays = [
  { key: "sun", label: "الأحد" }, { key: "mon", label: "الاثنين" },
  { key: "tue", label: "الثلاثاء" }, { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
];

const deptComparisonData = [
  { name: "خدمات المستفيدين", مكتمل: 18, معالجة: 7 },
  { name: "الدوائر القضائية", مكتمل: 12, معالجة: 5 },
  { name: "الوثائق والمحفوظات", مكتمل: 9, معالجة: 3 },
];

const weeklyComparisonData = [
  { day: "الأحد", هذا_الأسبوع: 4, الأسبوع_الماضي: 3 },
  { day: "الاثنين", هذا_الأسبوع: 7, الأسبوع_الماضي: 5 },
  { day: "الثلاثاء", هذا_الأسبوع: 5, الأسبوع_الماضي: 6 },
  { day: "الأربعاء", هذا_الأسبوع: 9, الأسبوع_الماضي: 4 },
  { day: "الخميس", هذا_الأسبوع: 6, الأسبوع_الماضي: 7 },
];
const thisWeekTotal = weeklyComparisonData.reduce((s, d) => s + d.هذا_الأسبوع, 0);
const lastWeekTotal = weeklyComparisonData.reduce((s, d) => s + d.الأسبوع_الماضي, 0);
const weeklyChange = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

function WeeklyReportCard({ onPrint }: { onPrint: () => void }) {
  const d = WEEKLY_REPORT_DATA;
  return (
    <Card data-testid="weekly-report-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base">التقرير الأسبوعي التلقائي</CardTitle>
            <p className="text-muted-foreground text-xs mt-1">{d.weekLabel}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onPrint} data-testid="button-print-report">
              <Printer className="w-4 h-4 me-1" />طباعة
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => {
                const content = [
                  "=== التقرير الأسبوعي وزارة العدل ===",
                  d.weekLabel,
                  "",
                  `إجمالي الطلبات: ${d.totalRequests}`,
                  `المكتملة: ${d.completed}`,
                  `قيد المعالجة: ${d.processing}`,
                  `المحالة: ${d.referred}`,
                  `متوسط وقت الاستجابة: ${d.avgResponseTime}`,
                  `مؤشر رضا المستفيدين: ${d.satisfactionScore}/5`,
                  `نسبة الالتزام بالمواعيد: ${d.slaCompliance}%`,
                  "",
                  `أفضل موظف: ${d.topEmployee} (${d.topEmployeeRequests} طلب)`,
                  "",
                  "مبادرة مقدمة من الموظف/ محمد بخيت حميد المعبدي – نموذج تشغيلي تجريبي",
                ].join("\n");
                const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `weekly_report_${new Date().toISOString().split("T")[0]}.txt`;
                a.click();
              }}
              data-testid="button-download-report"
            >
              <Download className="w-4 h-4 me-1" />تحميل
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "إجمالي الطلبات", value: d.totalRequests, color: "#187860" },
            { label: "مكتملة", value: d.completed, color: "#075e4a" },
            { label: "متوسط الاستجابة", value: d.avgResponseTime, color: "#C7A86C", isText: true },
            { label: "الالتزام بالمواعيد", value: `${d.slaCompliance}%`, color: "#187860", isText: true },
          ].map(({ label, value, color, isText }) => (
            <div key={label} className="rounded-lg p-3 bg-muted/30 text-center">
              <p className="text-xl font-black" style={{ color }}>{value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3 flex items-center gap-3"
          style={{ background: "rgba(199,168,108,0.08)", border: "1px solid rgba(199,168,108,0.25)" }}>
          <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: "#C7A86C" }} />
          <div>
            <p className="font-bold text-sm">أفضل موظف هذا الأسبوع</p>
            <p className="text-muted-foreground text-xs">{d.topEmployee} أنجز {d.topEmployeeRequests} طلباً</p>
          </div>
          <div className="ms-auto text-lg font-black" style={{ color: "#C7A86C" }}>
            {d.satisfactionScore}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardSection({ employees }: { employees: Employee[] }) {
  const sorted = [...employees].filter((e) => e.status === "active").sort((a, b) => b.requestsHandled - a.requestsHandled);
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);

  return (
    <Card data-testid="leaderboard-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: "#C7A86C" }} />
          لوحة الشرف أفضل الموظفين
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-4">
          {[top[1], top[0], top[2]].map((emp, idx) => {
            if (!emp) return null;
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const badgeKey = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";
            const badge = BADGE_CONFIG[badgeKey];
            const isFirst = rank === 1;
            return (
              <motion.div key={emp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center text-center ${isFirst ? "order-2" : idx === 0 ? "order-1" : "order-3"}`}
                data-testid={`leaderboard-row-${emp.id}`}>
                <div className="relative mb-1.5">
                  <div className={`${isFirst ? "w-14 h-14 sm:w-16 sm:h-16" : "w-11 h-11 sm:w-12 sm:h-12"} rounded-full flex items-center justify-center text-white font-bold text-sm border-2`}
                    style={{ background: badge.color === "#ebebeb" ? "#94a3b8" : badge.color, borderColor: badge.color === "#ebebeb" ? "#94a3b8" : badge.color }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                    style={{ background: badge.color === "#ebebeb" ? "#94a3b8" : badge.color }}>
                    {rank}
                  </div>
                </div>
                <p className="font-bold text-xs text-foreground truncate max-w-[80px] sm:max-w-[100px]">{emp.name.split(" ").slice(0, 2).join(" ")}</p>
                <p className="font-black text-sm mt-0.5" style={{ color: badge.color === "#ebebeb" ? "#94a3b8" : badge.color }}>{emp.requestsHandled}</p>
                {emp.avgRating && (
                  <p className="text-[11px] flex items-center gap-0.5 text-muted-foreground">
                    {emp.avgRating} <Star className="w-2.5 h-2.5 fill-[#C7A86C] text-[#C7A86C]" />
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
        {rest.length > 0 && (
          <div className="border-t border-border/50 pt-2 space-y-1">
            {rest.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                data-testid={`leaderboard-row-${emp.id}`}>
                <span className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 4}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "#187860" }}>
                  {emp.name.charAt(0)}
                </div>
                <p className="flex-1 text-xs font-semibold text-foreground truncate">{emp.name}</p>
                <span className="text-xs font-bold text-[#187860]">{emp.requestsHandled}</span>
                {emp.avgRating && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    {emp.avgRating}<Star className="w-2.5 h-2.5 fill-[#C7A86C] text-[#C7A86C]" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CourtDistributionMap() {
  const data = COURT_DISTRIBUTION_DATA;
  const total = data.reduce((sum, d) => sum + d.requests, 0);
  const circuits = data.filter(d => d.group === "circuits");
  const documents = data.filter(d => d.group === "documents");
  const circuitsTotal = circuits.reduce((s, d) => s + d.requests, 0);
  const documentsTotal = documents.reduce((s, d) => s + d.requests, 0);

  return (
    <Card data-testid="court-distribution-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-5 h-5" style={{ color: "#187860" }} />
          توزيع الطلبات على الدوائر القضائية وقسم الوثائق
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center" dir="ltr">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={2} dataKey="requests">
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} طلب`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#187860" }} />
                <span className="text-xs text-muted-foreground">الدوائر القضائية ({circuitsTotal})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#C7A86C" }} />
                <span className="text-xs text-muted-foreground">قسم الوثائق ({documentsTotal})</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate">{d.name}</span>
                    <span className="text-sm font-bold" style={{ color: d.color }}>{d.requests}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <motion.div className="h-1.5 rounded-full" style={{ background: d.color }}
                      initial={{ width: 0 }} animate={{ width: `${(d.requests / total) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{Math.round((d.requests / total) * 100)}% من الإجمالي</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagerPage() {
  const [requests, setRequests] = useState<Request[]>(() => loadAllRequests());
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [managerPage, setManagerPage] = useState(1);
  const MANAGER_PAGE_SIZE = 10;
  useEffect(() => { setManagerPage(1); }, [searchQuery, statusFilter]);
  const [showManagerSearch, setShowManagerSearch] = useState(false);
  const [expandedManagerCard, setExpandedManagerCard] = useState<string | null>(null);
  const [managerRejectTarget, setManagerRejectTarget] = useState<string | null>(null);
  const [managerRejectReason, setManagerRejectReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(() => initializeTickets());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [managerActiveTab, setManagerActiveTab] = useState("overview");
  const { toast } = useToast();

  const [newEmployee, setNewEmployee] = useState({ name: "", username: "", department: "", status: "active" as "active" | "frozen" });
  const [newDept, setNewDept] = useState({ name: "", type: "general" as any });

  const [slaAlertDismissed, setSlaAlertDismissed] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<"overdue" | "tickets" | "expiring" | "duplicates" | null>(null);
  const [objectionRejectForm, setObjectionRejectForm] = useState<string | null>(null);
  const [objectionRejectReason, setObjectionRejectReason] = useState("");

  const [referTicketId, setReferTicketId] = useState<string | null>(null);
  const [referDept, setReferDept] = useState("");
  const [referNote, setReferNote] = useState("");

  const [circuitReferReqId, setCircuitReferReqId] = useState<string | null>(null);
  const [circuitReferValue, setCircuitReferValue] = useState("");
  const [circuitReferEmployee, setCircuitReferEmployee] = useState("");
  const [docsReferReqId, setDocsReferReqId] = useState<string | null>(null);
  const [docsReferEmployee, setDocsReferEmployee] = useState("");

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [monthlyCsatOpen, setMonthlyCsatOpen] = useState(false);
  const [monthlyCsatSending, setMonthlyCsatSending] = useState(false);

  useEffect(() => {
    const sync = () => {
      setRequests(() => loadAllRequests());
      setTickets(loadTickets().length > 0 ? loadTickets() : initializeTickets());
    };
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 4000);
    return () => { window.removeEventListener("storage", sync); clearInterval(interval); };
  }, []);

  const stats = {
    total: requests.length,
    processing: requests.filter((r) => r.status === "processing").length,
    referred: requests.filter((r) => r.status === "referred").length,
    completed: requests.filter((r) => r.status === "completed").length,
    employees: employees.length,
    departments: departments.length,
    overdue: requests.filter((r) => isOverSla(r.slaDeadline, r.status)).length,
  };

  const csatData = useMemo(() => {
    const rated = requests.filter(r => r.rating);
    const avg = rated.length > 0 ? rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length : 4.8;
    const dist = [1, 2, 3, 4, 5].map(s => ({ star: s, count: rated.filter(r => r.rating === s).length }));
    return { avg: avg.toFixed(1), dist, comments: rated.filter(r => r.ratingComment).slice(0, 3), total: rated.length };
  }, [requests]);

  const employeePerformanceData = useMemo(() => {
    return employees.slice(0, 5).map((emp) => ({
      name: emp.name.split(" ")[0],
      مكتمل: Math.floor(Math.random() * 15) + 5,
      معالجة: Math.floor(Math.random() * 8) + 2,
    }));
  }, [employees]);

  useEffect(() => {
    if (stats.overdue >= 5) setSlaAlertDismissed(false);
  }, [stats.overdue]);

  const pieData = [
    { name: "مكتمل", value: stats.completed },
    { name: "قيد المعالجة", value: stats.processing },
    { name: "محال", value: stats.referred },
  ];

  const filtered = requests.filter((r) => {
    const matchSearch = !searchQuery ||
      r.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseNumber.includes(searchQuery) ||
      (r.judgmentNumber || "").includes(searchQuery) ||
      r.applicantName.includes(searchQuery);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRequests(loadAllRequests());
      setIsRefreshing(false);
      toast({ title: "تم تحديث لوحة التحكم" });
    }, 800);
  };

  const toggleFreeze = (id: string) => {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status: e.status === "active" ? "frozen" : "active" } : e));
    toast({ title: "تم تحديث حالة الموظف" });
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "تم حذف الموظف" });
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.username) return;
    const emp: Employee = { ...newEmployee, id: Math.random().toString(36).slice(2), status: "active", requestsHandled: 0, avgResponseTime: "-", avgRating: undefined };
    setEmployees((prev) => [...prev, emp]);
    setAddEmployeeOpen(false);
    setNewEmployee({ name: "", username: "", department: "", status: "active" });
    toast({ title: "تم إضافة الموظف بنجاح" });
  };

  const addDepartment = () => {
    if (!newDept.name) return;
    const dept: Department = { ...newDept, id: Math.random().toString(36).slice(2), employeesCount: 0, requestsCount: 0 };
    setDepartments((prev) => [...prev, dept]);
    setAddDeptOpen(false);
    setNewDept({ name: "", type: "general" });
    toast({ title: "تم إضافة القسم بنجاح" });
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "تم حذف القسم" });
  };

  const handleUpdateRequestStatus = (id: string, status: RequestStatus) => {
    setRequests((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, status } : r);
      const updatedItem = updated.find(r => r.id === id);
      if (updatedItem) persistRequestUpdate(updatedItem);
      return updated;
    });
    toast({ title: "تم تحديث حالة الطلب" });
  };

  const resolveTicket = (id: string) => {
    const fresh = loadTickets();
    const updated = fresh.map((t) => t.id === id ? { ...t, status: "resolved" as const, resolvedDate: new Date().toISOString().split("T")[0] } : t);
    saveTickets(updated);
    setTickets(updated);
    toast({ title: "تم إغلاق التذكرة" });
  };

  const reopenTicket = (id: string) => {
    const fresh = loadTickets();
    const updated = fresh.map((t) => t.id === id ? {
      ...t,
      status: "open" as const,
      resolvedDate: undefined,
      employeeResponse: undefined,
      respondedBy: undefined,
      respondedAt: undefined,
      returnNote: undefined,
      returnedAt: undefined,
      referredToDept: undefined,
      referralNote: undefined,
      referredAt: undefined,
    } : t);
    saveTickets(updated);
    setTickets(updated);
    toast({ title: "تم إعادة فتح التذكرة" });
  };

  const referTicketToDept = () => {
    if (!referTicketId || !referDept) return;
    const deptLabel = REFERRAL_DEPARTMENTS.find(d => d.value === referDept)?.label || referDept;
    const fresh = loadTickets();
    const updated = fresh.map((t) => t.id === referTicketId ? {
      ...t,
      status: "referred" as const,
      referredToDept: referDept,
      referralNote: referNote || undefined,
      referredAt: new Date().toISOString(),
      employeeResponse: undefined,
      respondedBy: undefined,
      respondedAt: undefined,
      returnNote: undefined,
      returnedAt: undefined,
    } : t);
    saveTickets(updated);
    setTickets(updated);
    setReferTicketId(null);
    setReferDept("");
    setReferNote("");
    toast({ title: `تم إحالة التذكرة إلى ${deptLabel}` });
  };

  const printReport = () => {
    window.print();
  };

  const overdueRequests = requests.filter((r) => isOverSla(r.slaDeadline, r.status));
  const pendingReviewRequests = requests.filter((r) => r.status === "processing" || r.status === "referred" || r.status === "pending");
  const processedRequests = requests.filter((r) => r.status === "completed" || r.status === "rejected" || r.status === "objected");
  const soonExpiring = requests.filter(r => {
    if (r.status === "completed") return false;
    const remaining = new Date(r.slaDeadline).getTime() - Date.now();
    return remaining > 0 && remaining <= 24 * 60 * 60 * 1000;
  });
  const openTickets = tickets.filter((t) => t.status === "open");

  const duplicateCases = useMemo(() => {
    const caseMap: Record<string, typeof requests> = {};
    requests.forEach(r => {
      if (r.caseNumber) {
        if (!caseMap[r.caseNumber]) caseMap[r.caseNumber] = [];
        caseMap[r.caseNumber].push(r);
      }
    });
    return Object.entries(caseMap).filter(([, reqs]) => reqs.length > 1);
  }, [requests]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <PrintableReport stats={stats} />
      <PageHeader
        title="لوحة تحكم المدير"
        subtitle="إدارة شاملة للنظام والأداء والموارد"
        role="manager"
        userName="البراء بن سليمان الربعي"
        department=""
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8 print:hidden" dir="rtl">
        <AnimatePresence>
          {!slaAlertDismissed && (overdueRequests.length > 0 || soonExpiring.length > 0 || openTickets.filter((t) => t.priority === "high").length > 0 || duplicateCases.length > 0) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-xl border border-[#ebebeb] bg-white overflow-hidden"
              data-testid="manager-alert-banner">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#ebebeb] bg-[#ebebeb]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B42318]" />
                  <span className="text-xs font-bold text-[#1F2937]">التنبيهات</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSlaAlertDismissed(true)}
                  className="h-7 w-7 text-[#1F2937]/40 hover:text-[#1F2937]"
                  data-testid="button-dismiss-sla-alert">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {overdueRequests.length > 0 && (
                  <button onClick={() => setExpandedAlert(expandedAlert === "overdue" ? null : "overdue")}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      expandedAlert === "overdue" ? "bg-[#B42318] text-white border-[#B42318]" : "bg-[#B42318]/[0.06] text-[#B42318] border-[#B42318]/10 hover:bg-[#B42318]/[0.12]"
                    }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {overdueRequests.length} طلب متأخر
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedAlert === "overdue" ? "rotate-90" : ""}`} />
                  </button>
                )}
                {openTickets.filter((t) => t.priority === "high").length > 0 && (
                  <button onClick={() => setExpandedAlert(expandedAlert === "tickets" ? null : "tickets")}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      expandedAlert === "tickets" ? "bg-[#B42318] text-white border-[#B42318]" : "bg-[#B42318]/[0.06] text-[#B42318] border-[#B42318]/10 hover:bg-[#B42318]/[0.12]"
                    }`}>
                    {openTickets.filter((t) => t.priority === "high").length} تذكرة عالية الأولوية
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedAlert === "tickets" ? "rotate-90" : ""}`} />
                  </button>
                )}
                {soonExpiring.length > 0 && (
                  <button onClick={() => setExpandedAlert(expandedAlert === "expiring" ? null : "expiring")}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      expandedAlert === "expiring" ? "bg-[#ec9a18] text-white border-[#ec9a18]" : "bg-[#ec9a18]/[0.08] text-[#ec9a18] border-[#ec9a18]/15 hover:bg-[#ec9a18]/[0.15]"
                    }`}>
                    <Clock className="w-3 h-3" />
                    {soonExpiring.length} {soonExpiring.length === 1 ? "طلب قارب" : "طلبات قاربت"} على الانتهاء
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedAlert === "expiring" ? "rotate-90" : ""}`} />
                  </button>
                )}
                {duplicateCases.length > 0 && (
                  <button onClick={() => setExpandedAlert(expandedAlert === "duplicates" ? null : "duplicates")}
                    data-testid="alert-duplicate-cases"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      expandedAlert === "duplicates" ? "bg-[#187860] text-white border-[#187860]" : "bg-[#187860]/[0.06] text-[#187860] border-[#187860]/15 hover:bg-[#187860]/[0.12]"
                    }`}>
                    <Users className="w-3 h-3" />
                    {duplicateCases.length} {duplicateCases.length === 1 ? "قضية مكررة" : "قضايا مكررة"}
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedAlert === "duplicates" ? "rotate-90" : ""}`} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {expandedAlert === "overdue" && overdueRequests.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#ebebeb] overflow-hidden">
                    <div className="px-4 py-3 space-y-2 bg-[#B42318]/[0.02]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Array.from(new Set(overdueRequests.map(r => r.assignedTo).filter(Boolean))).map((emp, i) => {
                          const count = overdueRequests.filter(r => r.assignedTo === emp).length;
                          return (
                            <span key={i} className="text-[11px] bg-white text-[#B42318] px-2 py-1 rounded-md font-medium border border-[#ebebeb]">
                              <Users className="w-3 h-3 inline me-1" />{emp} ({count})
                            </span>
                          );
                        })}
                      </div>
                      {overdueRequests.slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#ebebeb] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[#B42318]">{r.trackingNumber}</span>
                            <span className="text-[#1F2937]/60">{r.applicantName}</span>
                          </div>
                          <span className="text-[11px] text-[#1F2937]/40">{r.slaDeadline}</span>
                        </div>
                      ))}
                      {overdueRequests.length > 5 && <p className="text-[11px] text-[#1F2937]/40 text-center">+{overdueRequests.length - 5} طلبات أخرى</p>}
                    </div>
                  </motion.div>
                )}
                {expandedAlert === "tickets" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#ebebeb] overflow-hidden">
                    <div className="px-4 py-3 space-y-2 bg-[#B42318]/[0.02]">
                      {openTickets.filter(t => t.priority === "high").map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#ebebeb] text-xs">
                          <span className="font-bold text-[#1F2937]">{t.title}</span>
                          <span className="text-[11px] text-[#1F2937]/40">{t.date}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {expandedAlert === "expiring" && soonExpiring.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#ebebeb] overflow-hidden">
                    <div className="px-4 py-3 space-y-2 bg-[#ec9a18]/[0.02]">
                      {soonExpiring.slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#ebebeb] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[#ec9a18]">{r.trackingNumber}</span>
                            <span className="text-[#1F2937]/60">{r.applicantName}</span>
                          </div>
                          <span className="text-[11px] text-[#1F2937]/40">{r.slaDeadline}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {expandedAlert === "duplicates" && duplicateCases.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#ebebeb] overflow-hidden">
                    <div className="px-4 py-3 space-y-3 bg-[#187860]/[0.02]">
                      {duplicateCases.map(([caseNum, reqs]) => (
                        <div key={caseNum} className="bg-white rounded-xl border border-[#ebebeb] overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#ebebeb] border-b border-[#ebebeb]">
                            <FileText className="w-3.5 h-3.5 text-[#187860]" />
                            <span className="text-xs font-bold text-[#187860]">قضية رقم {caseNum}</span>
                            <span className="text-[11px] bg-[#187860]/[0.07] text-[#187860] px-2 py-0.5 rounded-md font-medium ms-auto">{reqs.length} طلبات</span>
                          </div>
                          <div className="divide-y divide-[#ebebeb]">
                            {reqs.map(r => (
                              <div key={r.id} className="flex items-center justify-between px-3 py-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#1F2937]">{r.trackingNumber}</span>
                                  <span className="text-[#1F2937]/60">{r.applicantName}</span>
                                </div>
                                <span className="text-[11px] text-[#1F2937]/40">{r.createdAt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-8">
          {[
            { label: "إجمالي الطلبات", value: stats.total, color: "#187860", icon: FileText },
            { label: "قيد المعالجة", value: stats.processing, color: "#ec9a18", icon: Clock },
            { label: "مكتملة", value: stats.completed, color: "#075e4a", icon: CheckCircle },
            { label: "متأخرة", value: stats.overdue, color: "#B42318", icon: AlertTriangle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <CardContent className="p-4">
                  <AnimatedCounter value={s.value} label={s.label} color={s.color} icon={s.icon} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={managerActiveTab} onValueChange={(v) => setManagerActiveTab(v)} dir="rtl">
          <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="inline-flex w-max gap-2">
              {[
                { cat: "dashboard", label: "لوحة التحكم", icon: BarChart2, tabs: ["overview", "charts", "analytics"] },
                { cat: "requests", label: "الطلبات", icon: FileText, tabs: ["requests", "pending-review", "processed", "overdue", "escalated", "objections", "duplicates"], badge: overdueRequests.length + pendingReviewRequests.length },
                { cat: "team", label: "الفريق", icon: Users, tabs: ["employees", "departments", "workload"] },
                { cat: "reports", label: "التقارير", icon: Printer, tabs: ["reports"] },
                { cat: "tickets", label: "التذاكر", icon: ClipboardList, tabs: ["tickets"], badge: tickets.filter(t => t.status === "returned").length },
                { cat: "system", label: "النظام", icon: Shield, tabs: ["audit", "health", "bottleneck"] },
              ].map((group) => {
                const Icon = group.icon;
                const isActive = group.tabs.includes(managerActiveTab);
                return (
                  <button
                    key={group.cat}
                    data-testid={`cat-${group.cat}`}
                    onClick={() => setManagerActiveTab(group.tabs[0] as any)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all border whitespace-nowrap ${
                      isActive
                        ? "bg-[#187860] text-white border-[#187860]"
                        : "bg-white text-[#1F2937] border-[#ebebeb] hover:border-[#187860]/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {group.label}
                    {group.badge && group.badge > 0 && (
                      <span className={`text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                        isActive ? "bg-white/20 text-white" : "bg-[#B42318]/10 text-[#B42318]"
                      }`}>{group.badge}</span>
                    )}
                  </button>
                );
              })}
              </div>
            </div>

            {(() => {
              const catMap: Record<string, { value: string; label: string; icon?: any; badge?: number }[]> = {
                dashboard: [
                  { value: "overview", label: "نظرة عامة" },
                  { value: "charts", label: "الإحصاءات" },
                  { value: "analytics", label: "التحليلات", icon: BarChart2 },
                ],
                requests: [
                  { value: "requests", label: "جميع الطلبات" },
                  { value: "pending-review", label: "قيد النظر", icon: Clock, badge: pendingReviewRequests.length },
                  { value: "processed", label: "المعالجة", icon: FileCheck, badge: processedRequests.length },
                  { value: "overdue", label: "المتأخرة", icon: AlertTriangle, badge: overdueRequests.length },
                  { value: "escalated", label: "المصعّدة", icon: TrendingUp, badge: requests.filter(r => r.isFastTrack).length },
                  { value: "objections", label: "الاعتراضات", icon: AlertTriangle },
                  { value: "duplicates", label: "المكررة", icon: Users, badge: duplicateCases.length },
                ],
                team: [
                  { value: "employees", label: "الموظفون" },
                  { value: "departments", label: "الأقسام" },
                  { value: "workload", label: "الإشغال الحي", icon: Activity },
                ],
                reports: [
                  { value: "reports", label: "التقارير" },
                ],
                tickets: [
                  { value: "tickets", label: "التذاكر" },
                ],
                system: [
                  { value: "audit", label: "التدقيق", icon: Shield },
                  { value: "health", label: "صحة النظام", icon: Activity },
                  { value: "bottleneck", label: "الاختناقات", icon: TrendingDown },
                ],
              };
              const activeCat = Object.entries(catMap).find(([, tabs]) => tabs.some(t => t.value === managerActiveTab));
              if (!activeCat) return null;
              const [, subTabs] = activeCat;
              if (subTabs.length <= 1) return null;
              return (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                <TabsList className="inline-flex w-max h-auto gap-1 p-1">
                  {subTabs.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <TabsTrigger
                        key={sub.value}
                        value={sub.value}
                        data-testid={`tab-manager-${sub.value}`}
                        className="text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap flex items-center gap-1"
                        onClick={() => setManagerActiveTab(sub.value as any)}
                      >
                        {SubIcon && <SubIcon className={`w-3 h-3 hidden sm:block ${sub.value === "overdue" ? "text-[#B42318]" : ""}`} />}
                        {sub.label}
                        {sub.badge && sub.badge > 0 && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 ms-1">{sub.badge}</Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                </div>
              );
            })()}
          </div>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="hover-elevate overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      الأداء الأسبوعي مقارنة الطلبات
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C7A86C]/[0.06] rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C7A86C]" />
                        <span className="text-[11px] font-medium text-[#C7A86C]">هذا الأسبوع: {thisWeekTotal}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ebebeb]/80 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                        <span className="text-[11px] font-medium text-[#1F2937]/70">الأسبوع الماضي: {lastWeekTotal}</span>
                      </div>
                      <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${weeklyChange >= 0 ? "text-[#187860] bg-[#187860]/[0.06]" : "text-[#B42318] bg-[#B42318]/[0.06]"}`}>
                        {weeklyChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(weeklyChange)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={weeklyComparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} reversed />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} orientation="right" />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        />
                        <Legend iconType="circle" payload={[
                          { value: "هذا الأسبوع", type: "circle", color: "#C7A86C" },
                          { value: "الأسبوع الماضي", type: "circle", color: "#ebebeb" },
                        ]} />
                        <Bar dataKey="هذا_الأسبوع" name="هذا الأسبوع" fill="#C7A86C" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="الأسبوع_الماضي" name="الأسبوع الماضي" fill="#ebebeb" radius={[4, 4, 0, 0]} barSize={30} />
                        <Line type="monotone" dataKey="هذا_الأسبوع" stroke="#187860" strokeWidth={2} dot={{ fill: "#187860", r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <WeeklyReportCard onPrint={printReport} />
              <CourtDistributionMap />
            </div>
          </TabsContent>

          <TabsContent value="workload">
            <LiveWorkloadBoard />
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>إدارة الطلبات</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5">
                      <button
                        className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setViewMode("list")} title="عرض قائمة" data-testid="button-manager-view-list">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setViewMode("grid")} title="عرض شبكة" data-testid="button-manager-view-grid">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleRefresh} data-testid="button-manager-refresh">
                      <RefreshCw className={`w-4 h-4 me-1 ${isRefreshing ? "animate-spin" : ""}`} />تحديث
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => {
                        const content = filtered.map((r) => `${r.trackingNumber}\t${r.applicantName}\t${r.status}`).join("\n");
                        const blob = new Blob([`رقم الطلب\tاسم مقدم الطلب\tالحالة\n${content}`], { type: "text/plain" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = "requests_report.txt";
                        a.click();
                        toast({ title: "تم تصدير التقرير بنجاح" });
                      }} data-testid="button-export-report">
                      <Download className="w-4 h-4 me-1" />تصدير
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setShowManagerSearch(v => !v)}
                      data-testid="button-toggle-manager-search"
                      className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-all ${
                        showManagerSearch
                          ? "bg-[#187860] text-white"
                          : "bg-white text-[#6B7280] border border-[#ebebeb] hover:border-[#187860]/30"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">بحث وفلترة</span>
                      {(searchQuery || statusFilter !== "all") && !showManagerSearch && (
                        <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-[#187860]">
                          {[searchQuery, statusFilter !== "all"].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      {filtered.length === requests.length ? `${requests.length} طلب` : `${filtered.length} من ${requests.length}`}
                    </span>
                  </div>

                  <AnimatePresence>
                    {showManagerSearch && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 rounded-2xl bg-white p-4 border mb-3" style={{ borderColor: "#ebebeb" }}>
                          <div className="relative">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1F2937]/40 pointer-events-none" />
                            <input
                              placeholder="ابحث برقم الطلب أو الاسم..."
                              className="w-full ps-12 pe-10 py-3.5 rounded-2xl text-sm bg-[#ebebeb] border-none focus:outline-none focus:ring-2 focus:ring-[#187860]/20 placeholder:text-[#1F2937]/40"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              data-testid="input-manager-search"
                              autoFocus
                            />
                            {searchQuery && (
                              <button className="absolute end-4 top-1/2 -translate-y-1/2 text-[#1F2937]/40 hover:text-[#1F2937]/70 transition-colors" onClick={() => setSearchQuery("")}>
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                            <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-manager-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">جميع الحالات</SelectItem>
                              <SelectItem value="processing">قيد المعالجة</SelectItem>
                              <SelectItem value="referred">محال</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="rejected">مرفوض</SelectItem>
                              <SelectItem value="objected">معترض عليه</SelectItem>
                            </SelectContent>
                          </Select>
                          {(searchQuery || statusFilter !== "all") && (
                            <div className="flex justify-end">
                              <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="text-[11px] text-[#1F2937]/40 hover:text-[#1F2937]/70 underline" data-testid="button-clear-manager-filters">
                                مسح الفلاتر
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                  {(() => { const _t = Math.max(1, Math.ceil(filtered.length / MANAGER_PAGE_SIZE)); const _p = Math.min(managerPage, _t); return filtered.slice((_p - 1) * MANAGER_PAGE_SIZE, _p * MANAGER_PAGE_SIZE); })().map((req, i) => {
                    const sla = getSlaStatus(req.slaDeadline, req.status);
                    const overdue = isOverSla(req.slaDeadline, req.status);
                    const isExpanded = expandedManagerCard === req.id;
                    return (
                      <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`border rounded-xl p-4 bg-card hover-elevate ${overdue ? "border-[#B42318]/25" : "border-border"}`}
                        dir="rtl"
                        data-testid={`row-manager-request-${req.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <RequestStatusBadge status={req.status} size="sm" />
                            {overdue && <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#B42318]/[0.07] text-[#B42318] font-medium">تجاوز الموعد</span>}
                            {req.isFastTrack && <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#ec9a18]/[0.07] text-[#ec9a18] font-medium flex items-center gap-0.5"><Zap className="w-3 h-3" />مصعّد</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                            <span className="font-bold text-sm font-mono">{req.trackingNumber}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                          <div className="text-center">
                            <p className="text-[11px] text-muted-foreground mb-0.5">مقدم الطلب</p>
                            <p className="text-xs font-medium text-foreground truncate">{req.applicantName}</p>
                          </div>
                          <div className="text-center border-x border-[#ebebeb]">
                            <p className="text-[11px] text-muted-foreground mb-0.5">الجهة</p>
                            <p className="text-xs font-medium text-foreground truncate px-1">{req.court || "-"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] text-muted-foreground mb-0.5">التاريخ</p>
                            <p className="text-xs font-medium text-foreground">{formatDate(req.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          {req.assignedTo && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#187860]" />
                              <span className="font-medium text-[#187860]">الموظف: {req.assignedTo}</span>
                            </span>
                          )}
                          {req.referredTo && (
                            <span className="inline-flex items-center gap-1">
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>محال إلى: {req.referredTo}</span>
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 font-semibold ${sla.color}`}>
                            <Clock className="w-3 h-3" />{sla.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#ebebeb]">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3 rounded-xl" onClick={() => setSelectedRequest(req)} data-testid={`button-manager-view-${req.id}`}>
                            <Eye className="w-3 h-3 me-1" />عرض
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3 rounded-xl"
                            onClick={() => setExpandedManagerCard(isExpanded ? null : req.id)}
                            data-testid={`button-manager-actions-${req.id}`}>
                            <SlidersHorizontal className="w-3 h-3 me-1" />إجراءات
                          </Button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "#ebebeb" }}>
                                <p className="text-xs font-bold text-muted-foreground">صلاحيات المدير</p>

                                {(req.status === "completed" || req.status === "rejected") && (
                                  <p className="text-xs text-muted-foreground py-2">لا توجد إجراءات متاحة الطلب {req.status === "completed" ? "مكتمل" : "مرفوض"}</p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                  {req.status !== "completed" && req.status !== "rejected" && (
                                      <Select onValueChange={(v) => handleUpdateRequestStatus(req.id, v as RequestStatus)}>
                                        <SelectTrigger className="h-9 text-xs rounded-xl bg-[#ebebeb] border-none w-auto min-w-[120px]" data-testid={`select-manager-status-${req.id}`}>
                                          <SelectValue placeholder="تغيير الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="processing">قيد المعالجة</SelectItem>
                                          <SelectItem value="completed">مكتمل</SelectItem>
                                        </SelectContent>
                                      </Select>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {req.status !== "completed" && req.status !== "rejected" && req.status !== "referred" && (
                                    <>
                                      <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl"
                                        onClick={() => { setCircuitReferReqId(req.id); setCircuitReferValue(""); }}
                                        data-testid={`button-refer-judicial-${req.id}`}>
                                        <ArrowLeftRight className="w-3 h-3 me-1" />إحالة للدائرة
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl"
                                        onClick={() => { setDocsReferReqId(req.id); setDocsReferEmployee(""); }}
                                        data-testid={`button-refer-docs-${req.id}`}>
                                        <ArrowLeftRight className="w-3 h-3 me-1" />إحالة للوثائق
                                      </Button>
                                    </>
                                  )}

                                  {req.status === "referred" && (
                                    <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl"
                                      onClick={() => {
                                        setRequests(prev => {
                                          const updated = prev.map(r => r.id === req.id ? { ...r, status: "processing" as RequestStatus, referredTo: undefined, referralSection: undefined } : r);
                                          const item = updated.find(r => r.id === req.id);
                                          if (item) persistRequestUpdate(item);
                                          return updated;
                                        });
                                        toast({ title: "تم إعادة الطلب لقيد المعالجة" });
                                      }}
                                      data-testid={`button-return-${req.id}`}>
                                      <RefreshCw className="w-3 h-3 me-1" />إعادة للمعالجة
                                    </Button>
                                  )}

                                  {!req.isFastTrack && req.status !== "completed" && req.status !== "rejected" && (
                                    <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl border-[#ec9a18]/30 text-[#ec9a18] hover:bg-[#ec9a18]/5"
                                      onClick={() => {
                                        setRequests(prev => {
                                          const updated = prev.map(r => r.id === req.id ? { ...r, isFastTrack: true } : r);
                                          const item = updated.find(r => r.id === req.id);
                                          if (item) persistRequestUpdate(item);
                                          return updated;
                                        });
                                        toast({ title: "تم تصعيد الطلب" });
                                      }}
                                      data-testid={`button-escalate-${req.id}`}>
                                      <Zap className="w-3 h-3 me-1" />تصعيد
                                    </Button>
                                  )}

                                  {req.status !== "completed" && req.status !== "rejected" && (
                                    <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl border-[#B42318]/20 text-[#B42318] hover:bg-[#B42318]/5"
                                      onClick={() => {
                                        if (managerRejectTarget === req.id) {
                                          setManagerRejectTarget(null);
                                          setManagerRejectReason("");
                                        } else {
                                          setManagerRejectTarget(req.id);
                                        }
                                      }}
                                      data-testid={`button-reject-${req.id}`}>
                                      <XCircle className="w-3 h-3 me-1" />رفض
                                    </Button>
                                  )}
                                </div>

                                <AnimatePresence>
                                  {managerRejectTarget === req.id && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                      <div className="rounded-xl p-3 space-y-2 bg-[#B42318]/[0.03]">
                                        <p className="text-[11px] font-medium text-foreground/70">سبب الرفض</p>
                                        <input
                                          className="w-full rounded-lg text-xs p-2.5 bg-white border border-[#ebebeb] focus:outline-none focus:ring-2 focus:ring-[#B42318]/20"
                                          placeholder="أدخل سبب الرفض..."
                                          value={managerRejectReason}
                                          onChange={(e) => setManagerRejectReason(e.target.value)}
                                          data-testid={`input-reject-reason-${req.id}`}
                                        />
                                        <div className="flex gap-2 justify-end">
                                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setManagerRejectTarget(null); setManagerRejectReason(""); }}>إلغاء</Button>
                                          <Button size="sm" className="text-xs h-7 bg-[#B42318] hover:bg-[#B42318]/90 text-white"
                                            disabled={!managerRejectReason.trim()}
                                            onClick={() => {
                                              setRequests(prev => {
                                                const updated = prev.map(r => r.id === req.id ? { ...r, status: "rejected" as RequestStatus, rejectionReason: managerRejectReason.trim() } : r);
                                                const item = updated.find(r => r.id === req.id);
                                                if (item) persistRequestUpdate(item);
                                                return updated;
                                              });
                                              toast({ title: "تم رفض الطلب" });
                                              setManagerRejectTarget(null);
                                              setManagerRejectReason("");
                                            }}
                                            data-testid={`button-confirm-reject-${req.id}`}>
                                            <XCircle className="w-3 h-3 me-1" />تأكيد الرفض
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
                <Pagination total={filtered.length} page={Math.min(managerPage, Math.max(1, Math.ceil(filtered.length / MANAGER_PAGE_SIZE)))} pageSize={MANAGER_PAGE_SIZE} onChange={setManagerPage} testIdPrefix="manager-pagination" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">توزيع الطلبات</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                      <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">الطلبات اليومية</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={DAILY_STATS} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} reversed />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} orientation="right" />
                      <Tooltip />
                      <Bar dataKey="completed" name="مكتمل" fill="#075e4a" radius={[3,3,0,0]} />
                      <Bar dataKey="processing" name="قيد المعالجة" fill="#C7A86C" radius={[3,3,0,0]} />
                      <Bar dataKey="referred" name="محال" fill="#d4d4d4" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>


            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    التحليلات الذكية للأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="processing-time" className="w-full" dir="rtl">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="processing-time">وقت المعالجة</TabsTrigger>
                      <TabsTrigger value="employee-perf">أداء الموظفين</TabsTrigger>
                      <TabsTrigger value="peak-hours">ساعات الذروة</TabsTrigger>
                    </TabsList>

                    <TabsContent value="processing-time">
                      <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={processingTimeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" unit=" يوم" reversed />
                            <YAxis dataKey="type" type="category" width={120} tick={{ fontSize: 12 }} orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="متوسط" name="متوسط المعالجة" fill="#187860" radius={[4, 0, 0, 4]} barSize={30} />
                            <Line type="monotone" dataKey="مستهدف" name="المستهدف" stroke="#B42318" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#B42318", r: 4 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4 text-center">يقارن هذا الرسم متوسط وقت إنجاز المعاملات مقابل الهدف المحدد لكل نوع.</p>
                    </TabsContent>

                    <TabsContent value="employee-perf">
                      <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={employeePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" reversed />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="مكتمل" name="طلبات مكتملة" stackId="a" fill="#075e4a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="معالجة" name="قيد المعالجة" stackId="a" fill="#C7A86C" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>

                    <TabsContent value="peak-hours">
                      <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={peakHoursData}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#187860" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#187860" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="ساعة" reversed />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Area type="monotone" dataKey="عدد" name="عدد الطلبات" stroke="#187860" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">مؤشر رضا المستفيدين (شهري)</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={SATISFACTION_DATA}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} reversed />
                      <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} orientation="right" />
                      <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}`]} />
                      <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                      <Line type="monotone" dataKey="نسخة_مصدقة" name="نسخة مصدقة" stroke="#187860" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="اطلاع" name="اطلاع على أوراق الدعوى" stroke="#C7A86C" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="نسخة_بديلة" name="نسخة بديلة للوثائق" stroke="#075e4a" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#C7A86C]" />
                    ملخص رضا المستفيدين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl" style={{ background: "rgba(199,168,108,0.08)", border: "1px solid rgba(199,168,108,0.25)" }}>
                      <p className="text-5xl font-black" style={{ color: "#C7A86C" }}>{csatData.avg}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-5 h-5 ${parseFloat(csatData.avg) >= s ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{csatData.total} تقييم</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold mb-3">توزيع التقييمات</p>
                      {[5, 4, 3, 2, 1].map(s => {
                        const item = csatData.dist.find(d => d.star === s);
                        const count = item?.count ?? 0;
                        const pct = csatData.total > 0 ? Math.round((count / csatData.total) * 100) : 0;
                        return (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="w-6 text-start font-bold">{s}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s >= 4 ? "#187860" : s === 3 ? "#ec9a18" : "#B42318" }} />
                            </div>
                            <span className="w-8 text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-bold">آخر التعليقات</p>
                      {csatData.comments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">لا توجد تعليقات بعد</p>
                      ) : csatData.comments.map((r, i) => (
                        <div key={i} className="rounded-xl p-3 text-xs" style={{ background: "rgba(24,120,96,0.04)", border: "1px solid rgba(24,120,96,0.06)" }}>
                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${(r.rating ?? 0) >= s ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{r.ratingComment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      تحليل رضا المستفيدين حسب نوع الخدمة
                    </p>
                    <div className="h-[250px] w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { service: "نسخة مصدقة", تقييم: 4.5, مستهدف: 4.0 },
                          { service: "اطلاع على أوراق", تقييم: 4.2, مستهدف: 4.0 },
                          { service: "نسخة بديلة", تقييم: 3.8, مستهدف: 4.0 },
                          { service: "سرعة الاستجابة", تقييم: 4.1, مستهدف: 4.5 },
                          { service: "سهولة الاستخدام", تقييم: 4.6, مستهدف: 4.0 },
                          { service: "جودة الوثيقة", تقييم: 4.4, مستهدف: 4.0 },
                        ]}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="service" tick={{ fontSize: 10, fill: "#1F2937" }} />
                          <Radar name="التقييم الفعلي" dataKey="تقييم" stroke="#187860" fill="#187860" fillOpacity={0.2} strokeWidth={2} />
                          <Radar name="المستهدف" dataKey="مستهدف" stroke="#C7A86C" fill="#C7A86C" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                          <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">يقارن هذا الرسم تقييم كل خدمة مع المستوى المستهدف</p>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-bold mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-primary" />
                      اتجاه الرضا الشهري
                    </p>
                    <div className="h-[200px] w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: "يناير", تقييم: 4.1, ردود: 45 },
                          { month: "فبراير", تقييم: 4.0, ردود: 52 },
                          { month: "مارس", تقييم: 4.3, ردود: 48 },
                          { month: "أبريل", تقييم: 4.2, ردود: 61 },
                          { month: "مايو", تقييم: 4.5, ردود: 55 },
                          { month: "يونيو", تقييم: 4.4, ردود: 67 },
                        ]}>
                          <defs>
                            <linearGradient id="colorCsat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C7A86C" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#C7A86C" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} reversed />
                          <YAxis domain={[3.5, 5]} tick={{ fontSize: 10 }} orientation="right" />
                          <Tooltip formatter={(v: any, name: string) => [name === "تقييم" ? `${v}` : v, name === "تقييم" ? "متوسط التقييم" : "عدد الردود"]} />
                          <Area type="monotone" dataKey="تقييم" stroke="#C7A86C" fill="url(#colorCsat)" strokeWidth={3} dot={{ fill: "#C7A86C", r: 4 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" style={{ color: "#187860" }} />
                    خريطة حرارة الطلبات حسب الدائرة ويوم الأسبوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-right p-2 font-semibold text-muted-foreground w-24">الدائرة</th>
                          {heatmapDays.map(d => (
                            <th key={d.key} className="p-2 font-semibold text-muted-foreground text-center">{d.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.map(row => {
                          const vals = heatmapDays.map(d => row[d.key as keyof typeof row] as number);
                          const maxVal = Math.max(...vals);
                          return (
                            <tr key={row.circuit}>
                              <td className="p-2 font-semibold text-foreground text-xs">{row.circuit}</td>
                              {heatmapDays.map(d => {
                                const val = row[d.key as keyof typeof row] as number;
                                const intensity = maxVal > 0 ? val / maxVal : 0;
                                return (
                                  <td key={d.key} className="p-1">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto font-bold text-sm transition-all"
                                      style={{
                                        background: `rgba(24,120,96,${0.1 + intensity * 0.8})`,
                                        color: intensity > 0.55 ? "white" : "#187860",
                                      }}>
                                      {val}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">اللون الأغمق = طلبات أكثر في تلك الدائرة ذلك اليوم</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-primary" />
                    مقارنة الشهر الحالي بالسابق
                  </CardTitle>
                </CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={[
                      { metric: "طلبات جديدة", حالي: 142, سابق: 118 },
                      { metric: "مكتملة", حالي: 128, سابق: 103 },
                      { metric: "متوسط الإنجاز (ساعة)", حالي: 18, سابق: 26 },
                      { metric: "رضا المستفيدين %", حالي: 94, سابق: 88 },
                      { metric: "طلبات متأخرة", حالي: 3, سابق: 11 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="metric" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} reversed />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} orientation="right" />
                      <Tooltip />
                      <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                      <Bar dataKey="سابق" name="الشهر السابق" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="حالي" name="الشهر الحالي" fill="#187860" radius={[4, 4, 0, 0]} barSize={20} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "نمو الطلبات", value: "+20%", color: "#187860" },
                      { label: "تحسّن الإنجاز", value: "+31%", color: "#187860" },
                      { label: "تقليل التأخير", value: "-73%", color: "#C7A86C" },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#ebebeb] rounded-lg p-2 text-center" data-testid={`stat-comparison-${i}`}>
                        <p className="text-sm font-black" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    مقارنة أداء الأقسام الأسبوعية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptComparisonData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} reversed />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} orientation="right" />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                        <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                        <Bar dataKey="مكتمل" name="مكتملة" fill="#075e4a" radius={[4, 4, 0, 0]} barSize={32} />
                        <Bar dataKey="معالجة" name="قيد المعالجة" fill="#C7A86C" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <div className="space-y-6">
              <LeaderboardSection employees={employees} />
              <Card>
                <CardHeader><CardTitle className="text-base">مقارنة الأداء الشهري للموظفين</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={MONTHLY_PERFORMANCE}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} reversed />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} orientation="right" />
                      <Tooltip />
                      <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                      <Line type="monotone" dataKey="ahmed" name="أحمد الحربي" stroke="#187860" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="fatima" name="فاطمة العتيبي" stroke="#C7A86C" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="ali" name="علي المطيري" stroke="#075e4a" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>إدارة الموظفين</CardTitle>
                    <Button style={{ background: "#C7A86C", color: "white" }}
                      onClick={() => setAddEmployeeOpen(true)} data-testid="button-add-employee">
                      <Plus className="w-4 h-4 me-1" />إضافة موظف
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employees.map((emp, i) => {
                      const rank = [...employees].filter((e) => e.status === "active").sort((a, b) => b.requestsHandled - a.requestsHandled).findIndex((e) => e.id === emp.id);
                      const badgeKey = rank === 0 ? "gold" : rank === 1 ? "silver" : rank === 2 ? "bronze" : null;
                      const badge = badgeKey ? BADGE_CONFIG[badgeKey] : null;

                      return (
                        <motion.div key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`border border-border rounded-lg p-4 ${emp.status === "frozen" ? "opacity-60" : ""}`}
                          data-testid={`row-employee-${emp.id}`}>
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ background: emp.status === "frozen" ? "#ebebeb" : "#187860" }}>
                                  {emp.name.charAt(0)}
                                </div>
                                {badge && (
                                  <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: badge.bg, border: `1px solid ${badge.color}` }}>
                                    <badge.icon className="w-3 h-3" style={{ color: badge.color }} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{emp.name}</p>
                                <p className="text-muted-foreground text-xs">{emp.department}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant={emp.status === "active" ? "default" : "secondary"} className="text-xs">
                                    {emp.status === "active" ? "نشط" : "مجمد"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">طلبات: {emp.requestsHandled}</span>
                                  <span className="text-xs text-muted-foreground">متوسط: {emp.avgResponseTime}</span>
                                  {emp.avgRating && (
                                    <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "#C7A86C" }}>
                                      {emp.avgRating} <Star className="w-3 h-3 fill-[#C7A86C] text-[#C7A86C]" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditEmployee(emp)} data-testid={`button-edit-employee-${emp.id}`}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toggleFreeze(emp.id)} data-testid={`button-freeze-employee-${emp.id}`}>
                                <Snowflake className={`w-3 h-3 ${emp.status === "frozen" ? "text-[#187860]" : ""}`} />
                              </Button>
                              <Button size="sm" variant="outline" className="text-[#B42318]"
                                onClick={() => deleteEmployee(emp.id)} data-testid={`button-delete-employee-${emp.id}`}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>إدارة الأقسام</CardTitle>
                  <Button style={{ background: "#C7A86C", color: "white" }}
                    onClick={() => setAddDeptOpen(true)} data-testid="button-add-department">
                    <Plus className="w-4 h-4 me-1" />إضافة قسم
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((dept, i) => (
                    <motion.div key={dept.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="border border-border rounded-xl p-4 bg-card hover-elevate"
                      data-testid={`card-department-${dept.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-foreground">{dept.name}</p>
                          <div className="flex gap-3 mt-2">
                            <span className="text-xs text-muted-foreground"><Users className="w-3 h-3 inline me-1" />{dept.employeesCount} موظف</span>
                            <span className="text-xs text-muted-foreground"><FileText className="w-3 h-3 inline me-1" />{dept.requestsCount} طلب</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditDepartment(dept)} data-testid={`button-edit-dept-${dept.id}`}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-[#B42318]"
                            onClick={() => deleteDepartment(dept.id)} data-testid={`button-delete-dept-${dept.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <ExportButtons requests={requests} auditLog={MOCK_AUDIT_LOG} onSendEmail={() => setEmailDialogOpen(true)} onSendMonthlyCsat={() => setMonthlyCsatOpen(true)} />
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader><CardTitle>نظام تصعيد التذاكر</CardTitle></CardHeader>
              <CardContent>
                {tickets.filter(t => t.status === "returned").length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#ec9a18]/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#ec9a18]/[0.06] border-b border-[#ec9a18]/20">
                      <ArrowLeftRight className="w-4 h-4 text-[#ec9a18]" />
                      <p className="font-bold text-[#ec9a18] text-sm">تذاكر مُعادة من الموظفين ({tickets.filter(t => t.status === "returned").length})</p>
                    </div>
                    <div className="p-3 space-y-2">
                      {tickets.filter(t => t.status === "returned").map(ticket => {
                        const deptLabel = REFERRAL_DEPARTMENTS.find(d => d.value === ticket.referredToDept)?.label || ticket.referredToDept;
                        return (
                          <div key={ticket.id} className="rounded-lg border border-[#ec9a18]/15 bg-[#ec9a18]/[0.03] p-3" data-testid={`returned-ticket-${ticket.id}`}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="font-semibold text-sm">{ticket.title}</p>
                              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#ec9a18]/10 text-[#ec9a18]">مُعادة</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">أُعيدت من: {deptLabel}</p>
                            {ticket.returnNote && (
                              <div className="rounded-lg bg-white border border-[#ebebeb] p-2 mb-2">
                                <p className="text-[11px] text-muted-foreground mb-0.5">سبب الإعادة:</p>
                                <p className="text-xs font-medium">{ticket.returnNote}</p>
                              </div>
                            )}
                            {ticket.respondedBy && (
                              <p className="text-[11px] text-muted-foreground">الموظف: {ticket.respondedBy} · {ticket.returnedAt ? formatDate(ticket.returnedAt) : ""}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="text-xs h-7 rounded-xl font-medium" style={{ background: "#187860", color: "white" }}
                                onClick={() => { setReferTicketId(ticket.id); setReferDept(""); setReferNote(""); }}
                                data-testid={`button-re-refer-${ticket.id}`}>
                                <Send className="w-3 h-3 me-1" />إعادة إحالة
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-7 rounded-xl font-medium"
                                onClick={() => resolveTicket(ticket.id)}
                                data-testid={`button-close-returned-${ticket.id}`}>
                                <CheckCircle className="w-3 h-3 me-1" />إغلاق
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tickets.filter(t => t.status === "referred").length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#187860]/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#187860]/[0.04] border-b border-[#187860]/20">
                      <Send className="w-4 h-4 text-[#187860]" />
                      <p className="font-bold text-[#187860] text-sm">تذاكر محالة للأقسام ({tickets.filter(t => t.status === "referred").length})</p>
                    </div>
                    <div className="p-3 space-y-2">
                      {tickets.filter(t => t.status === "referred").map(ticket => {
                        const deptLabel = REFERRAL_DEPARTMENTS.find(d => d.value === ticket.referredToDept)?.label || ticket.referredToDept;
                        return (
                          <div key={ticket.id} className="rounded-lg border border-[#187860]/10 bg-[#187860]/[0.02] p-3" data-testid={`referred-ticket-${ticket.id}`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm">{ticket.title}</p>
                              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#187860]/10 text-[#187860]">محالة</span>
                            </div>
                            <p className="text-xs text-muted-foreground">محالة إلى: {deptLabel} · {ticket.referredAt ? formatDate(ticket.referredAt) : ""}</p>
                            {ticket.referralNote && <p className="text-xs text-muted-foreground mt-1">ملاحظة: {ticket.referralNote}</p>}
                            {ticket.employeeResponse && (
                              <div className="rounded-lg bg-white border border-[#ebebeb] p-2 mt-2">
                                <p className="text-[11px] text-muted-foreground mb-0.5">رد الموظف:</p>
                                <p className="text-xs font-medium">{ticket.employeeResponse}</p>
                                {ticket.respondedBy && <p className="text-[11px] text-muted-foreground mt-1">{ticket.respondedBy} · {ticket.respondedAt ? formatDate(ticket.respondedAt) : ""}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {tickets.filter(t => t.status !== "referred" && t.status !== "returned").map((ticket, i) => {
                    const priorityConfig = PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS];
                    const isExpanded = expandedTicket === ticket.id;
                    const priorityColor = ticket.priority === "high" ? "#B42318" : ticket.priority === "medium" ? "#ec9a18" : "#187860";
                    return (
                      <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl border border-[#e8e8e8] bg-white overflow-hidden"
                        style={{ borderRight: `3px solid ${priorityColor}` }}
                        data-testid={`card-ticket-${ticket.id}`}>
                        <button
                          className="w-full text-right p-3 sm:p-4 focus:outline-none"
                          onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                          data-testid={`button-expand-ticket-${ticket.id}`}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${priorityConfig.badge}`}>
                                {priorityConfig.label}
                              </span>
                              {ticket.status === "resolved" ? (
                                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#187860]/10 text-[#187860]">محلول</span>
                              ) : ticket.slaRemaining?.includes("متأخر") ? (
                                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#B42318]/10 text-[#B42318]">{ticket.slaRemaining}</span>
                              ) : null}
                              <span className="text-[11px] text-muted-foreground ms-auto">{formatDate(ticket.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {ticket.status === "open" && (
                                <>
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-medium rounded-lg px-2 py-1 bg-[#187860] text-white cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); setReferTicketId(ticket.id); setReferDept(""); setReferNote(""); }}
                                    data-testid={`button-refer-ticket-${ticket.id}`}>
                                    <Send className="w-3 h-3" />إحالة
                                  </span>
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-medium rounded-lg px-2 py-1 border border-[#187860]/30 text-[#187860] cursor-pointer hover:bg-[#187860]/[0.04]"
                                    onClick={(e) => { e.stopPropagation(); resolveTicket(ticket.id); }}
                                    data-testid={`button-resolve-ticket-${ticket.id}`}>
                                    <CheckCircle className="w-3 h-3" />إغلاق
                                  </span>
                                </>
                              )}
                              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </div>
                          </div>
                          <p className="font-semibold text-foreground text-sm leading-snug">{ticket.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            #{ticket.requestNumber} · {ticket.requestType} · {ticket.assignedTo}
                          </p>
                        </button>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
                            className="border-t border-[#f0f0f0] bg-[#FAFAFA] px-3 sm:px-4 py-3 space-y-3">
                            <p className="text-xs text-[#1F2937]/80 leading-relaxed">{ticket.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
                              <span><span className="text-muted-foreground">المستفيد: </span><span className="font-semibold">{ticket.beneficiary}</span></span>
                              <span><span className="text-muted-foreground">هوية: </span><span className="font-medium">{ticket.idNumber}</span></span>
                              <span><span className="text-muted-foreground">القسم: </span><span className="font-semibold">{ticket.department}</span></span>
                              <span><span className="text-muted-foreground">الموظف: </span><span className="font-semibold text-[#187860]">{ticket.assignedTo}</span></span>
                            </div>
                            {ticket.status === "resolved" && ticket.resolvedDate && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#187860]">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>تم الحل بتاريخ {formatDate(ticket.resolvedDate)}</span>
                                </div>
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-medium rounded-lg px-2.5 py-1 border border-[#ec9a18]/30 text-[#ec9a18] cursor-pointer hover:bg-[#ec9a18]/[0.04] transition-colors"
                                  onClick={() => reopenTicket(ticket.id)}
                                  data-testid={`button-reopen-ticket-${ticket.id}`}>
                                  <RotateCcw className="w-3 h-3" />إعادة فتح
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <EnhancedAuditLog logs={MOCK_AUDIT_LOG} />
          </TabsContent>

          <TabsContent value="health">
            <div className="space-y-6" data-testid="system-health-section">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "وقت التشغيل", value: `${SYSTEM_HEALTH.uptime}%`, icon: Activity, color: "#187860", sub: "آخر 30 يوماً" },
                  { label: "وقت الاستجابة", value: `${SYSTEM_HEALTH.avgResponseMs}ms`, icon: Zap, color: "#C7A86C", sub: "متوسط لحظي" },
                  { label: "المستخدمون النشطون", value: SYSTEM_HEALTH.activeUsers, icon: Users, color: "#187860", sub: "الآن" },
                  { label: "معدل الخطأ", value: `${SYSTEM_HEALTH.errorRate}%`, icon: AlertTriangle, color: "#B42318", sub: "آخر 24 ساعة" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card data-testid={`health-card-${i}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                            <s.icon className="w-5 h-5" style={{ color: s.color }} />
                          </div>
                          <div>
                            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-xs text-muted-foreground/60">{s.sub}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "قاعدة البيانات", status: SYSTEM_HEALTH.dbStatus, icon: Database, ok: SYSTEM_HEALTH.dbStatus === "متصل" },
                  { label: "واجهة برمجة التطبيقات", status: SYSTEM_HEALTH.apiStatus, icon: Wifi, ok: SYSTEM_HEALTH.apiStatus === "يعمل" },
                  { label: "الخادم الرئيسي", status: "يعمل بشكل طبيعي", icon: Server, ok: true },
                ].map((s, i) => (
                  <Card key={s.label} data-testid={`service-status-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: s.ok ? "rgba(24,120,96,0.06)" : "rgba(180,35,24,0.1)" }}>
                          <s.icon className="w-5 h-5" style={{ color: s.ok ? "#187860" : "#B42318" }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{s.label}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.ok ? "#187860" : "#B42318" }} />
                            <span className="text-xs" style={{ color: s.ok ? "#187860" : "#B42318" }}>{s.status}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">الطلبات في الدقيقة آخر 10 دقائق</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={DAILY_STATS.slice(-10).map(s => ({ ...s, إجمالي: s.completed + s.processing + s.referred }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} reversed />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} orientation="right" />
                      <Tooltip />
                      <Bar dataKey="إجمالي" name="الطلبات" fill="#187860" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
                <CheckCircle className="w-6 h-6 text-[#187860] flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-[#187860] dark:text-[#187860]">جميع الأنظمة تعمل بشكل طبيعي</p>
                  <p className="text-xs text-muted-foreground mt-0.5">آخر حادثة: {SYSTEM_HEALTH.lastIncident}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bottleneck">
            <div className="space-y-6" data-testid="bottleneck-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-[#ec9a18]" />
                    تحليل الاختناقات الذكي
                  </CardTitle>
                  <p className="text-muted-foreground text-xs mt-1">يرصد النظام تلقائياً الأقسام التي تتراكم فيها الطلبات ويقترح الحلول</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {BOTTLENECK_DATA.sort((a, b) => b.متوسط_الانتظار - a.متوسط_الانتظار).map((item, i) => {
                      const isHigh = item.متوسط_الانتظار > 20;
                      const isMed = item.متوسط_الانتظار > 8;
                      const color = isHigh ? "#B42318" : isMed ? "#ec9a18" : "#187860";
                      const pct = Math.min(100, (item.متوسط_الانتظار / 30) * 100);
                      return (
                        <motion.div key={item.section} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl border border-border p-4 bg-card"
                          data-testid={`bottleneck-row-${i}`}>
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                            <div>
                              <p className="font-bold text-sm">{item.section}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground">متوسط الانتظار:</span>
                                <span className="font-black text-sm" style={{ color }}>{item.متوسط_الانتظار} ساعة</span>
                                <span className="text-xs text-muted-foreground">• طلبات معلّقة:</span>
                                <span className="font-bold text-sm">{item.pendingCount}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.trend === "up" && <span className="text-[11px] px-2 py-1 rounded-md bg-[#B42318]/[0.06] text-[#B42318] font-medium">↑ متصاعد</span>}
                              {item.trend === "down" && <span className="text-[11px] px-2 py-1 rounded-md bg-[#187860]/[0.06] text-[#187860] font-medium">↓ يتحسّن</span>}
                              {item.trend === "stable" && <span className="text-[11px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground font-medium">→ مستقر</span>}
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-3">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-2 rounded-full" style={{ background: color }} />
                          </div>
                          {isHigh && (
                            <div className="rounded-xl p-3 text-xs bg-[#B42318]/[0.03]">
                              <p className="font-medium text-[13px] text-foreground mb-1">توصية النظام:</p>
                              <p className="text-muted-foreground">"{item.section} يحتاج إلى موظف إضافي هذا الأسبوع لاستيعاب التراكم. متوسط الانتظار يتجاوز المعيار المحدد (20 ساعة)."</p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">مقارنة الأقسام وقت الانتظار</CardTitle></CardHeader>
                <CardContent dir="ltr">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={BOTTLENECK_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} unit=" ساعة" reversed />
                      <YAxis dataKey="section" type="category" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} width={130} orientation="right" />
                      <Tooltip formatter={(v: any) => [`${v} ساعة`]} />
                      <Bar dataKey="متوسط_الانتظار" name="متوسط الانتظار" radius={[4, 0, 0, 4]}>
                        {BOTTLENECK_DATA.map((item, i) => (
                          <Cell key={i} fill={item.متوسط_الانتظار > 20 ? "#B42318" : item.متوسط_الانتظار > 8 ? "#ec9a18" : "#187860"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#B42318]" />
                    الطلبات المتأخرة
                  </CardTitle>
                  <Badge variant="outline" className="text-[#B42318] border-[#B42318]/25">
                    {overdueRequests.length} طلب متأخر
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">طلبات تجاوزت الموعد النهائي المحدد وتتطلب تدخلاً فورياً</p>
              </CardHeader>
              <CardContent>
                {overdueRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-[#187860] opacity-50" />
                    <p className="font-bold">لا توجد طلبات متأخرة</p>
                    <p className="text-xs mt-1">جميع الطلبات ضمن الإطار الزمني المحدد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from(new Set(overdueRequests.map(r => r.assignedTo).filter(Boolean))).map((emp, i) => {
                        const count = overdueRequests.filter(r => r.assignedTo === emp).length;
                        return (
                          <span key={i} className="text-[11px] bg-[#B42318]/[0.07] text-[#B42318] px-2.5 py-0.5 rounded-md font-medium">
                            <Users className="w-3 h-3 inline me-1" />{emp} ({count})
                          </span>
                        );
                      })}
                    </div>
                    <div className="space-y-3" data-testid="table-overdue-requests">
                      {overdueRequests.map((req, i) => {
                        const deadlineDate = new Date(req.slaDeadline);
                        const now = new Date();
                        const daysLate = Math.ceil((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border border-[#B42318]/15 rounded-xl p-3 sm:p-4 bg-[#B42318]/[0.02]"
                            data-testid={`row-overdue-${req.id}`}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                                <span className="font-mono font-bold text-sm">{req.trackingNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#B42318]/10 text-[#B42318] font-black">متأخر {daysLate} يوم</span>
                                <Button size="sm" variant="outline" onClick={() => setSelectedRequest(req)} className="text-xs h-7 px-2" data-testid={`button-overdue-view-${req.id}`}>عرض</Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <RequestStatusBadge status={req.status} size="sm" />
                              <span className="text-xs font-semibold text-foreground">{req.applicantName}</span>
                              <span className="text-xs text-muted-foreground">{getRequestTypeLabel(req.requestType, true)}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                              <div>
                                <span className="text-muted-foreground">الموظف: </span>
                                <span className="font-semibold text-[#187860]">{req.assignedTo || "-"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الدائرة: </span>
                                <span className="font-medium">{req.circuit}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">التقديم: </span>
                                <span>{formatDate(req.createdAt)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">الموعد: </span>
                                <span className="text-[#B42318] font-bold">{formatDate(req.slaDeadline)}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escalated">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#ec9a18]" />
                    الطلبات المصعّدة
                  </CardTitle>
                  <Badge variant="outline" className="text-[#ec9a18] border-[#ec9a18]/25">
                    {requests.filter(r => r.isFastTrack).length} طلب مصعّد
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">طلبات تم تصعيدها وتحتاج متابعة عاجلة</p>
              </CardHeader>
              <CardContent>
                {requests.filter(r => r.isFastTrack).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-[#187860] opacity-50" />
                    <p className="font-bold">لا توجد طلبات مصعّدة حالياً</p>
                    <p className="text-xs mt-1">ستظهر هنا الطلبات التي يتم تصعيدها</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="table-escalated-requests">
                    {requests.filter(r => r.isFastTrack).map((req, i) => {
                      const sla = getSlaStatus(req.slaDeadline, req.status);
                      return (
                        <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border border-[#ec9a18]/15 rounded-xl p-3 sm:p-4 bg-[#ec9a18]/[0.02]"
                          data-testid={`row-escalated-${req.id}`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono font-bold text-sm flex items-center gap-1">
                              <span className="text-[11px] text-muted-foreground font-normal">رقم الطلب</span>
                              {req.trackingNumber}
                              <Zap className="w-3 h-3 text-[#ec9a18]" />
                            </span>
                            <Button size="sm" variant="outline" onClick={() => setSelectedRequest(req)} className="text-xs h-7 px-2" data-testid={`button-escalated-view-${req.id}`}>عرض</Button>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <RequestStatusBadge status={req.status} size="sm" />
                            <span className="text-xs font-semibold text-foreground">{req.applicantName}</span>
                            <span className="text-xs text-muted-foreground">{getRequestTypeLabel(req.requestType, true)}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <span className="text-muted-foreground">الجهة: </span>
                              <span className="font-medium">{req.court || "-"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">التقديم: </span>
                              <span>{formatDate(req.createdAt)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الموعد: </span>
                              <span className={`font-semibold ${sla.color}`}>{formatDate(req.slaDeadline)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objections">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#ec9a18]" />
                    الطلبات المعترض عليها
                  </CardTitle>
                  <Badge variant="outline" className="text-[#ec9a18] border-[#ec9a18]/25">
                    {requests.filter(r => r.status === "objected").length} اعتراض
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">طلبات مرفوضة قدّم المستفيدون اعتراضات عليها وتنتظر مراجعتكم</p>
              </CardHeader>
              <CardContent>
                {requests.filter(r => r.status === "objected").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">لا توجد اعتراضات حالياً</p>
                    <p className="text-xs mt-1">ستظهر هنا الطلبات التي يعترض عليها المستفيدون بعد الرفض</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.filter(r => r.status === "objected").map((req, i) => (
                      <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-[#ebebeb] bg-card p-4 space-y-3"
                        data-testid={`row-objection-${req.id}`}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ec9a18]/10 dark:bg-[#ec9a18]/[0.04]">
                              <AlertTriangle className="w-5 h-5 text-[#ec9a18]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                                <p className="font-bold text-sm font-mono">{req.trackingNumber}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{req.applicantName}</p>
                            </div>
                          </div>
                          <RequestStatusBadge status={req.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">نوع الطلب</p>
                            <p className="font-bold">{getRequestTypeLabel(req.requestType, true)}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                            <p className="font-bold">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : (req.caseNumber || "-")}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">تاريخ التقديم</p>
                            <p className="font-bold">{formatDate(req.createdAt)}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-muted-foreground mb-0.5">تاريخ الاعتراض</p>
                            <p className="font-bold">{req.objectionDate || "-"}</p>
                          </div>
                        </div>
                        {req.rejectionReason && (
                          <div className="rounded-xl p-3 bg-[#B42318]/[0.03]">
                            <p className="text-[11px] font-medium text-foreground/70 mb-1">سبب الرفض الأصلي:</p>
                            <p className="text-[11px] text-muted-foreground">{req.rejectionReason}</p>
                          </div>
                        )}
                        {req.objectionReason && (
                          <div className="rounded-xl p-3 bg-[#ec9a18]/[0.04]">
                            <p className="text-[11px] font-medium text-foreground/70 mb-1">سبب اعتراض المستفيد:</p>
                            <p className="text-[11px] text-muted-foreground">{req.objectionReason}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                          <p className="text-xs text-muted-foreground font-bold me-2">إحالة إلى:</p>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => {
                              handleUpdateRequestStatus(req.id, "processing" as RequestStatus);
                              setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "processing" as RequestStatus, referredTo: "خدمات المستفيدين", referralSection: undefined } : r));
                              const updatedReq = { ...req, status: "processing" as RequestStatus, referredTo: "خدمات المستفيدين" };
                              persistRequestUpdate(updatedReq);
                              toast({ title: "تم إحالة الطلب لقسم خدمات المستفيدين" });
                            }}
                            data-testid={`button-refer-beneficiary-${req.id}`}>
                            خدمات المستفيدين
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => {
                              handleUpdateRequestStatus(req.id, "referred" as RequestStatus);
                              setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "referred" as RequestStatus, referredTo: "الدائرة القضائية", referralSection: "judicial" as any } : r));
                              const updatedReq = { ...req, status: "referred" as RequestStatus, referredTo: "الدائرة القضائية", referralSection: "judicial" as any };
                              persistRequestUpdate(updatedReq);
                              toast({ title: "تم إحالة الطلب للدائرة القضائية" });
                            }}
                            data-testid={`button-refer-judicial-${req.id}`}>
                            الدائرة القضائية
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => {
                              handleUpdateRequestStatus(req.id, "referred" as RequestStatus);
                              setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "referred" as RequestStatus, referredTo: "قسم الوثائق والمحفوظات", referralSection: "documents" as any } : r));
                              const updatedReq = { ...req, status: "referred" as RequestStatus, referredTo: "قسم الوثائق والمحفوظات", referralSection: "documents" as any };
                              persistRequestUpdate(updatedReq);
                              toast({ title: "تم إحالة الطلب لقسم الوثائق والمحفوظات" });
                            }}
                            data-testid={`button-refer-documents-${req.id}`}>
                            الوثائق والمحفوظات
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={() => setSelectedRequest(req)}
                            data-testid={`button-view-objection-${req.id}`}>
                            عرض التفاصيل
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs"
                            onClick={() => { setObjectionRejectForm(objectionRejectForm === req.id ? null : req.id); setObjectionRejectReason(""); }}
                            data-testid={`button-reject-objection-${req.id}`}>
                            <XCircle className="w-3 h-3 me-1" />رفض الاعتراض
                          </Button>
                        </div>

                        {objectionRejectForm === req.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="rounded-xl p-4 bg-[#B42318]/[0.03] space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#B42318]/[0.08] flex items-center justify-center">
                                <XCircle className="w-3.5 h-3.5 text-[#B42318]" />
                              </div>
                              <p className="font-medium text-[13px] text-foreground">تأكيد رفض الاعتراض</p>
                            </div>
                            <div>
                              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">سبب رفض الاعتراض (إلزامي) *</Label>
                              <Textarea
                                data-testid={`input-reject-reason-${req.id}`}
                                placeholder="اذكر سبب رفض الاعتراض بالتفصيل..."
                                value={objectionRejectReason}
                                onChange={(e) => setObjectionRejectReason(e.target.value)}
                                rows={3}
                                className="text-sm"
                              />
                              {objectionRejectReason.trim().length === 0 && (
                                <p className="text-[11px] text-[#B42318] mt-1">* يجب كتابة سبب الرفض قبل التأكيد</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs"
                                onClick={() => { setObjectionRejectForm(null); setObjectionRejectReason(""); }}>
                                إلغاء
                              </Button>
                              <Button size="sm" variant="destructive" className="text-xs"
                                disabled={!objectionRejectReason.trim()}
                                onClick={() => {
                                  if (!objectionRejectReason.trim()) {
                                    toast({ title: "يجب كتابة سبب رفض الاعتراض", variant: "destructive" });
                                    return;
                                  }
                                  handleUpdateRequestStatus(req.id, "rejected" as RequestStatus);
                                  setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "rejected" as RequestStatus, finalRejection: true, finalRejectionReason: objectionRejectReason.trim() } : r));
                                  const updatedReq = { ...req, status: "rejected" as RequestStatus, finalRejection: true, finalRejectionReason: objectionRejectReason.trim() };
                                  persistRequestUpdate(updatedReq);
                                  toast({ title: "تم رفض الاعتراض", description: "تم تأكيد رفض الطلب نهائياً مع ذكر السبب" });
                                  setObjectionRejectForm(null);
                                  setObjectionRejectReason("");
                                }}
                                data-testid={`button-confirm-reject-${req.id}`}>
                                <XCircle className="w-3 h-3 me-1" />تأكيد الرفض النهائي
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duplicates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#187860]" />
                      كشف القضايا المكررة
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">طلبات مقدمة من أشخاص مختلفين على نفس رقم القضية</p>
                  </div>
                  {duplicateCases.length > 0 && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#187860]/10 text-[#187860]">
                      {duplicateCases.length} {duplicateCases.length === 1 ? "قضية مكررة" : "قضايا مكررة"}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {duplicateCases.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[#187860]/20" />
                    <p className="font-bold text-[#1F2937]">لا توجد قضايا مكررة</p>
                    <p className="text-xs text-muted-foreground mt-1">جميع الطلبات الحالية مقدمة على قضايا مختلفة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {duplicateCases.map(([caseNum, reqs]) => (
                      <div key={caseNum} className="rounded-xl border border-[#ebebeb] overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-[#ebebeb] border-b border-[#ebebeb]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#187860]/[0.08] flex items-center justify-center">
                              <FileText className="w-4 h-4 text-[#187860]" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1F2937]">قضية رقم {caseNum}</p>
                              <p className="text-[11px] text-[#1F2937]/50">{reqs.length} طلبات مقدمة على نفس القضية</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#B42318]/[0.07] text-[#B42318]">تكرار</span>
                        </div>
                        <div className="divide-y divide-[#ebebeb]">
                          {reqs.map((r, idx) => (
                            <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#ebebeb]/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#187860]/[0.06] flex items-center justify-center text-[11px] font-bold text-[#187860]">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-[#1F2937]">{r.trackingNumber}</span>
                                    <RequestStatusBadge status={r.status} />
                                  </div>
                                  <p className="text-[11px] text-[#1F2937]/60 mt-0.5">{r.applicantName} {r.applicantId}</p>
                                </div>
                              </div>
                              <div className="text-start">
                                <p className="text-[11px] text-[#1F2937]/40">{r.createdAt}</p>
                                <p className="text-[11px] text-[#1F2937]/40">{r.assignedTo || "غير مسند"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-review">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#ec9a18]" />
                      الطلبات قيد النظر
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{pendingReviewRequests.length} طلب قيد النظر والمعالجة</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#ec9a18]/10 text-[#ec9a18] font-bold">{requests.filter(r => r.status === "processing").length} قيد المعالجة</span>
                      <span className="px-2 py-1 rounded-full bg-[#187860]/5 text-[#187860] font-bold">{requests.filter(r => r.status === "referred").length} محال</span>
                      <span className="px-2 py-1 rounded-full bg-[#ebebeb]/30 text-[#1F2937] font-bold">{requests.filter(r => r.status === "pending").length} بانتظار المراجعة</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "نسخة مصدقة", count: pendingReviewRequests.filter(r => r.requestType === "certified_copy").length, color: "#187860" },
                    { label: "الاطلاع", count: pendingReviewRequests.filter(r => r.requestType === "case_review").length, color: "#ec9a18" },
                    { label: "نسخة بديلة", count: pendingReviewRequests.filter(r => r.requestType === "replacement_doc").length, color: "#1F2937" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl border p-3 text-center">
                      <p className="text-2xl font-black" style={{ color: item.color }}>{item.count}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {pendingReviewRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[#187860]/30" />
                    <p className="font-bold text-muted-foreground">لا توجد طلبات قيد النظر حالياً</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-pending-review">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="py-3 px-2 text-right font-bold">رقم الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">مقدم الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">نوع الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">الموظف المسؤول</th>
                          <th className="py-3 px-2 text-right font-bold">الدائرة</th>
                          <th className="py-3 px-2 text-right font-bold">تاريخ التقديم</th>
                          <th className="py-3 px-2 text-right font-bold">الموعد النهائي</th>
                          <th className="py-3 px-2 text-right font-bold">الأيام المتبقية</th>
                          <th className="py-3 px-2 text-right font-bold">الحالة</th>
                          <th className="py-3 px-2 text-right font-bold">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingReviewRequests.map((req) => {
                          const sla = getSlaStatus(req.slaDeadline, req.status);
                          const daysLeft = Math.ceil((new Date(req.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const overdue = isOverSla(req.slaDeadline, req.status);
                          return (
                            <tr key={req.id} className={`border-b hover:bg-muted/30 transition-colors ${overdue ? "bg-[#B42318]/[0.03]" : ""}`}
                              data-testid={`row-pending-${req.id}`}>
                              <td className="py-3 px-2 font-mono font-bold text-xs">{req.trackingNumber}</td>
                              <td className="py-3 px-2">
                                <p className="font-semibold text-xs">{req.applicantName}</p>
                                <p className="text-[11px] text-muted-foreground font-mono">{req.applicantId}</p>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                  req.requestType === "certified_copy" ? "bg-[#187860]/5 text-[#187860]" :
                                  req.requestType === "case_review" ? "bg-[#ec9a18]/10 text-[#ec9a18]" :
                                  "bg-[#1F2937]/10 text-[#1F2937]"
                                }`}>
                                  {getRequestTypeLabel(req.requestType)}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-xs">
                                {req.assignedTo ? (
                                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#187860]" />{req.assignedTo}</span>
                                ) : (
                                  <span className="text-muted-foreground">غير محدد</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-xs">{getCircuitLabel(req.circuit)}</td>
                              <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(req.createdAt)}</td>
                              <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(req.slaDeadline)}</td>
                              <td className="py-3 px-2">
                                <span className={`text-xs font-bold ${overdue ? "text-[#B42318]" : daysLeft <= 3 ? "text-[#ec9a18]" : "text-[#187860]"}`}>
                                  {overdue ? `متأخر ${Math.abs(daysLeft)} يوم` : `${daysLeft} يوم`}
                                </span>
                              </td>
                              <td className="py-3 px-2"><RequestStatusBadge status={req.status} size="sm" /></td>
                              <td className="py-3 px-2">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2"
                                    onClick={() => setSelectedRequest(req)} data-testid={`button-pending-view-${req.id}`}>
                                    عرض
                                  </Button>
                                  <Select onValueChange={(v) => handleUpdateRequestStatus(req.id, v as RequestStatus)}>
                                    <SelectTrigger className="w-24 h-7 text-[11px]" data-testid={`select-pending-status-${req.id}`}>
                                      <SelectValue placeholder="تغيير" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="processing">قيد المعالجة</SelectItem>
                                      <SelectItem value="referred">محال</SelectItem>
                                      <SelectItem value="completed">مكتمل</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processed">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#187860]" />
                      الطلبات المعالجة
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{processedRequests.length} طلب تمت معالجته</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#075e4a]/10 text-[#075e4a] font-bold">{requests.filter(r => r.status === "completed").length} مكتمل</span>
                      <span className="px-2 py-1 rounded-full bg-[#B42318]/10 text-[#B42318] font-bold">{requests.filter(r => r.status === "rejected").length} مرفوض</span>
                      <span className="px-2 py-1 rounded-full bg-[#ec9a18]/10 text-[#ec9a18] font-bold">{requests.filter(r => r.status === "objected").length} معترض عليه</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "نسخة مصدقة", count: processedRequests.filter(r => r.requestType === "certified_copy").length, paid: processedRequests.filter(r => r.requestType === "certified_copy" && r.isPaid).length, color: "#187860" },
                    { label: "الاطلاع", count: processedRequests.filter(r => r.requestType === "case_review").length, paid: processedRequests.filter(r => r.requestType === "case_review" && r.isPaid).length, color: "#ec9a18" },
                    { label: "نسخة بديلة", count: processedRequests.filter(r => r.requestType === "replacement_doc").length, paid: processedRequests.filter(r => r.requestType === "replacement_doc" && r.isPaid).length, color: "#1F2937" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl border p-3 text-center">
                      <p className="text-2xl font-black" style={{ color: item.color }}>{item.count}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                      <p className="text-[11px] text-[#187860] mt-0.5 font-bold">{item.paid} مسدد</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl border p-3 text-center bg-[#187860]/[0.04]">
                    <p className="text-lg font-black text-[#187860]">{processedRequests.filter(r => r.isPaid).length}</p>
                    <p className="text-[11px] text-muted-foreground">تم السداد</p>
                  </div>
                  <div className="rounded-xl border p-3 text-center bg-[#ec9a18]/[0.04]">
                    <p className="text-lg font-black text-[#ec9a18]">{processedRequests.filter(r => r.status === "completed" && !r.isPaid).length}</p>
                    <p className="text-[11px] text-muted-foreground">بانتظار السداد</p>
                  </div>
                  <div className="rounded-xl border p-3 text-center bg-[#187860]/[0.04]">
                    <p className="text-lg font-black text-[#187860]">{processedRequests.filter(r => r.rating).length}</p>
                    <p className="text-[11px] text-muted-foreground">تم التقييم</p>
                  </div>
                  <div className="rounded-xl border p-3 text-center bg-[#187860]/[0.04]">
                    <p className="text-lg font-black text-[#187860]">
                      {processedRequests.filter(r => r.rating).length > 0
                        ? (processedRequests.filter(r => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / processedRequests.filter(r => r.rating).length).toFixed(1)
                        : "-"
                      }
                    </p>
                    <p className="text-[11px] text-muted-foreground">متوسط التقييم</p>
                  </div>
                </div>

                {processedRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-bold text-muted-foreground">لا توجد طلبات معالجة حالياً</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-processed">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="py-3 px-2 text-right font-bold">رقم الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">مقدم الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">نوع الطلب</th>
                          <th className="py-3 px-2 text-right font-bold">الموظف المسؤول</th>
                          <th className="py-3 px-2 text-right font-bold">الدائرة</th>
                          <th className="py-3 px-2 text-right font-bold">تاريخ التقديم</th>
                          <th className="py-3 px-2 text-right font-bold">تاريخ المعالجة</th>
                          <th className="py-3 px-2 text-right font-bold">الحالة</th>
                          <th className="py-3 px-2 text-right font-bold">السداد</th>
                          <th className="py-3 px-2 text-right font-bold">التقييم</th>
                          <th className="py-3 px-2 text-right font-bold">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedRequests.map((req) => (
                          <tr key={req.id} className={`border-b hover:bg-muted/30 transition-colors ${
                            req.status === "rejected" ? "bg-[#B42318]/[0.02]" : req.status === "objected" ? "bg-[#ec9a18]/[0.02]" : ""
                          }`} data-testid={`row-processed-${req.id}`}>
                            <td className="py-3 px-2 font-mono font-bold text-xs">{req.trackingNumber}</td>
                            <td className="py-3 px-2">
                              <p className="font-semibold text-xs">{req.applicantName}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{req.applicantId}</p>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                req.requestType === "certified_copy" ? "bg-[#187860]/5 text-[#187860]" :
                                req.requestType === "case_review" ? "bg-[#ec9a18]/10 text-[#ec9a18]" :
                                "bg-[#1F2937]/10 text-[#1F2937]"
                              }`}>
                                {getRequestTypeLabel(req.requestType)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-xs">
                              {req.assignedTo ? (
                                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#187860]" />{req.assignedTo}</span>
                              ) : (
                                <span className="text-muted-foreground">غير محدد</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-xs">{getCircuitLabel(req.circuit)}</td>
                            <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(req.createdAt)}</td>
                            <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(req.updatedAt)}</td>
                            <td className="py-3 px-2"><RequestStatusBadge status={req.status} size="sm" /></td>
                            <td className="py-3 px-2">
                              {req.status === "completed" ? (
                                req.isPaid ? (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#187860]/10 text-[#187860] font-bold">تم السداد</span>
                                ) : (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ec9a18]/10 text-[#ec9a18] font-bold">بانتظار السداد</span>
                                )
                              ) : (
                                <span className="text-[11px] text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {req.rating ? (
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3 h-3 ${s <= req.rating! ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/20"}`} />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">لم يُقيّم</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2"
                                onClick={() => setSelectedRequest(req)} data-testid={`button-processed-view-${req.id}`}>
                                عرض
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideClose>
          <DialogHeader><DialogTitle>تفاصيل الطلب</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">رقم الطلب</span>
                    <p className="font-bold text-lg font-mono">{selectedRequest.trackingNumber}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedRequest.trackingNumber)}
                      className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
                      data-testid="mgr-copy-tracking"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <RequestStatusBadge status={selectedRequest.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "مقدم الطلب", value: selectedRequest.applicantName, copyable: false },
                  ...(selectedRequest.requestType === "replacement_doc"
                    ? [
                        { label: "رقم الصك", value: selectedRequest.judgmentNumber || "-", copyable: true },
                        ...(selectedRequest.caseNumber ? [{ label: "رقم القضية", value: selectedRequest.caseNumber, copyable: true }] : []),
                      ]
                    : [
                        { label: "رقم القضية", value: selectedRequest.caseNumber, copyable: true },
                        ...(selectedRequest.judgmentNumber ? [{ label: "رقم الصك", value: selectedRequest.judgmentNumber, copyable: true }] : []),
                      ]
                  ),
                  { label: "نوع الطلب", value: getRequestTypeLabel(selectedRequest.requestType, true), copyable: false },
                  { label: "الدائرة", value: getCircuitLabel(selectedRequest.circuit), copyable: false },
                ].map(({ label, value, copyable }) => (
                  <div key={label} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">{value}</p>
                      {copyable && value && (
                        <button
                          onClick={() => navigator.clipboard.writeText(value)}
                          className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
                          data-testid={`mgr-copy-${label}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold mb-4">مسار الطلب</p>
                <RequestTimeline events={selectedRequest.timeline} />
              </div>

              {((selectedRequest.fileAttachments && selectedRequest.fileAttachments.length > 0) || (selectedRequest.employeeAttachments && selectedRequest.employeeAttachments.length > 0)) && (
                <div className="space-y-3">
                  <p className="font-bold flex items-center gap-2"><Paperclip className="w-4 h-4" />المرفقات</p>
                  {selectedRequest.fileAttachments && selectedRequest.fileAttachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-bold">مرفقات المستفيد:</p>
                      {selectedRequest.fileAttachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg bg-[#ebebeb]/10 dark:bg-[#187860]/[0.04] border border-[#ebebeb]/25 px-3 py-2">
                          <FileText className="w-4 h-4 text-[#187860] flex-shrink-0" />
                          <span className="text-sm flex-1 truncate">{att.name}</span>
                          <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`mgr-dl-ben-att-${idx}`}>
                            <Download className="w-3 h-3 me-1" />تحميل
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRequest.employeeAttachments && selectedRequest.employeeAttachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-bold">مرفقات الموظف:</p>
                      {selectedRequest.employeeAttachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04] border border-[#187860]/20 px-3 py-2">
                          <FileText className="w-4 h-4 text-[#187860] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{att.name}</span>
                            <span className="text-[11px] text-muted-foreground">بواسطة: {att.uploadedBy} {att.uploadedAt}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`mgr-dl-emp-att-${idx}`}>
                            <Download className="w-3 h-3 me-1" />تحميل
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button variant="outline" className="w-full font-medium" onClick={() => setSelectedRequest(null)} data-testid="mgr-close-detail-bottom">إغلاق</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
        <DialogContent className="max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: "#187860" }} />
              إضافة موظف جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-bold mb-2 block">الاسم الكامل *</Label>
              <Input data-testid="input-new-employee-name" placeholder="أدخل الاسم الكامل"
                value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} />
            </div>
            <div>
              <Label className="font-bold mb-2 block">اسم المستخدم</Label>
              <Input data-testid="input-new-employee-username" placeholder="مثال: ahmed.harbi"
                value={newEmployee.username} onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })} />
            </div>
            <div>
              <Label className="font-bold mb-2 block">القسم / الصلاحيات *</Label>
              <Select value={newEmployee.department} onValueChange={(v) => setNewEmployee({ ...newEmployee, department: v })}>
                <SelectTrigger data-testid="select-new-employee-dept">
                  <SelectValue placeholder="اختر القسم والصلاحية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="خدمات المستفيدين">قسم خدمات المستفيدين</SelectItem>
                  <SelectItem value="الدوائر القضائية">الدوائر القضائية</SelectItem>
                  <SelectItem value="قسم الوثائق والمحفوظات">قسم الوثائق والمحفوظات</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">سيتم تحديد صلاحيات الموظف تلقائياً بناءً على القسم المختار</p>
            </div>
            <div>
              <Label className="font-bold mb-2 block">الحالة</Label>
              <Select value={newEmployee.status || "active"} onValueChange={(v) => setNewEmployee({ ...newEmployee, status: v as any })}>
                <SelectTrigger data-testid="select-new-employee-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="frozen">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddEmployeeOpen(false)} className="flex-1">إلغاء</Button>
              <Button className="flex-1 font-medium" style={{ background: "#C7A86C", color: "white" }}
                onClick={addEmployee} data-testid="button-confirm-add-employee">
                <Plus className="w-4 h-4 me-1" />إضافة الموظف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editEmployee} onOpenChange={(open) => { if (!open) setEditEmployee(null); }}>
        <DialogContent className="max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" style={{ color: "#C7A86C" }} />
              تعديل بيانات الموظف
            </DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">الاسم الكامل</Label>
                <Input value={editEmployee.name} onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })} data-testid="input-edit-employee-name" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">القسم / الصلاحيات</Label>
                <Select value={editEmployee.department} onValueChange={(v) => setEditEmployee({ ...editEmployee, department: v })}>
                  <SelectTrigger data-testid="select-edit-employee-dept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="خدمات المستفيدين">قسم خدمات المستفيدين</SelectItem>
                    <SelectItem value="الدوائر القضائية">الدوائر القضائية</SelectItem>
                    <SelectItem value="قسم الوثائق والمحفوظات">قسم الوثائق والمحفوظات</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">صلاحية الوصول ستُحدَّث فور الحفظ</p>
              </div>
              <div>
                <Label className="font-bold mb-2 block">الحالة</Label>
                <Select value={editEmployee.status} onValueChange={(v) => setEditEmployee({ ...editEmployee, status: v as any })}>
                  <SelectTrigger data-testid="select-edit-employee-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="frozen">موقوف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditEmployee(null)} className="flex-1">إلغاء</Button>
                <Button className="flex-1 font-medium" style={{ background: "#C7A86C", color: "white" }}
                  onClick={() => {
                    setEmployees((prev) => prev.map((e) => e.id === editEmployee.id ? editEmployee : e));
                    setEditEmployee(null);
                    toast({ title: "تم تحديث بيانات الموظف وصلاحياته" });
                  }} data-testid="button-confirm-edit-employee">
                  <CheckCircle className="w-4 h-4 me-1" />حفظ التعديلات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة قسم جديد</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-bold mb-2 block">اسم القسم</Label>
              <Input data-testid="input-new-dept-name" placeholder="أدخل اسم القسم"
                value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} />
            </div>
            <div>
              <Label className="font-bold mb-2 block">نوع القسم</Label>
              <Select value={newDept.type} onValueChange={(v) => setNewDept({ ...newDept, type: v as any })}>
                <SelectTrigger data-testid="select-new-dept-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="judicial">قضائي</SelectItem>
                  <SelectItem value="service">خدمي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddDeptOpen(false)} className="flex-1">إلغاء</Button>
              <Button className="flex-1 font-medium" style={{ background: "#C7A86C", color: "white" }}
                onClick={addDepartment} data-testid="button-confirm-add-dept">
                إضافة القسم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={monthlyCsatOpen} onOpenChange={setMonthlyCsatOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden" dir="rtl" aria-describedby={undefined} hideClose>
          <div className="relative px-6 pt-6 pb-4" style={{ background: "#075e4a" }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 w-20 h-20 rounded-full border-2 border-white/30" />
              <div className="absolute bottom-2 right-12 w-12 h-12 rounded-full border border-white/20" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-white text-lg">تقرير رضا المستفيدين</DialogTitle>
                  </DialogHeader>
                  <p className="text-white/70 text-xs">{new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${(parseFloat(csatData.avg) / 5) * 100}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white leading-none">{csatData.avg}</span>
                      <span className="text-[11px] text-white/60">من 5</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-white">{csatData.total}</p>
                    <p className="text-[11px] text-white/70 leading-tight mt-0.5">تقييم</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-white">{stats.completed}</p>
                    <p className="text-[11px] text-white/70 leading-tight mt-0.5">مكتمل</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-black text-white">{csatData.total > 0 ? Math.round((csatData.total / Math.max(stats.completed, 1)) * 100) : 0}%</p>
                    <p className="text-[11px] text-white/70 leading-tight mt-0.5">نسبة المشاركة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#187860]" />
                توزيع التقييمات
              </h4>
              {[5, 4, 3, 2, 1].map(s => {
                const item = csatData.dist.find(d => d.star === s);
                const count = item?.count ?? 0;
                const pct = csatData.total > 0 ? Math.round((count / csatData.total) * 100) : 0;
                const barColor = s >= 4 ? "#187860" : s === 3 ? "#C7A86C" : "#B42318";
                return (
                  <div key={s} className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                      <span className="text-xs font-bold text-foreground">{s}</span>
                      <Star className="w-3 h-3 fill-[#C7A86C] text-[#C7A86C]" />
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-[#ebebeb] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: (5 - s) * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: barColor, minWidth: count > 0 ? "8px" : "0" }}
                      />
                    </div>
                    <div className="w-16 shrink-0 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">{count}</span>
                      <span className="text-[11px] text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {csatData.comments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#187860]" />
                  أبرز التعليقات
                </h4>
                <div className="space-y-1.5">
                  {csatData.comments.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg p-2.5 bg-[#187860]/[0.04] border border-[#187860]/10">
                      <div className="w-6 h-6 rounded-full bg-[#187860]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-3 h-3 text-[#187860]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= (r.rating || 0) ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/20"}`} />)}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">"{r.ratingComment}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-2 border-t" style={{ borderColor: "#ebebeb" }}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-[#187860]" />
                <Label className="text-sm font-bold">إرسال إلى</Label>
              </div>
              <Input value="mbmaabdi@moj.gov.sa" readOnly className="font-mono text-sm bg-[#ebebeb] border-none rounded-xl h-11" dir="ltr" data-testid="input-csat-email" />
            </div>
            <Button className="w-full font-medium h-12 rounded-xl text-sm" disabled={monthlyCsatSending}
              style={{ background: "#187860", color: "white" }}
              data-testid="button-send-csat-report"
              onClick={() => {
                setMonthlyCsatSending(true);
                setTimeout(() => {
                  setMonthlyCsatSending(false);
                  setMonthlyCsatOpen(false);
                  toast({ title: "تم إرسال تقرير رضا المستفيدين الشهري", description: "تم الإرسال إلى mbmaabdi@moj.gov.sa" });
                }, 1500);
              }}>
              {monthlyCsatSending ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />جارٍ الإرسال...</span>
              ) : (
                <span className="flex items-center gap-2"><Send className="w-4 h-4" />إرسال التقرير الشهري</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#187860]" />
              إرسال تقرير أسبوعي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-muted/40 border text-sm space-y-2 font-mono text-xs">
              <p className="font-bold text-base font-sans">التقرير الأسبوعي وزارة العدل</p>
              <p>إجمالي الطلبات: {stats.total}</p>
              <p>مكتملة: {stats.completed}</p>
              <p>قيد المعالجة: {stats.processing}</p>
              <p>متأخرة: {stats.overdue}</p>
              <p>متوسط التقييم: {csatData.avg} / 5</p>
            </div>
            <div>
              <Label>إرسال إلى</Label>
              <Input value="mbmaabdi@moj.gov.sa" readOnly className="mt-1 font-mono text-sm" dir="ltr" />
            </div>
            <Button className="w-full font-medium" disabled={emailSending}
              style={{ background: "#187860", color: "white" }}
              onClick={() => {
                setEmailSending(true);
                setTimeout(() => {
                  setEmailSending(false);
                  setEmailDialogOpen(false);
                  toast({ title: "تم إرسال التقرير بنجاح", description: "تم الإرسال إلى mbmaabdi@moj.gov.sa" });
                }, 1500);
              }}>
              {emailSending ? "جارٍ الإرسال..." : "إرسال التقرير"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!referTicketId} onOpenChange={(open) => { if (!open) { setReferTicketId(null); setReferDept(""); setReferNote(""); } }}>
        <DialogContent className="max-w-md" dir="rtl" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#187860]" />
              إحالة التذكرة إلى قسم
            </DialogTitle>
          </DialogHeader>
          {referTicketId && (() => {
            const ticket = tickets.find(t => t.id === referTicketId);
            if (!ticket) return null;
            return (
              <div className="space-y-4">
                <div className="rounded-xl p-3 bg-muted/40 border">
                  <p className="font-semibold text-sm mb-1">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground">#{ticket.requestNumber} · {ticket.beneficiary}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">القسم المُحال إليه</Label>
                  <Select value={referDept} onValueChange={setReferDept}>
                    <SelectTrigger className="h-10 rounded-xl" data-testid="select-refer-dept">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRAL_DEPARTMENTS.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ملاحظة للموظف (اختياري)</Label>
                  <Textarea
                    value={referNote}
                    onChange={(e) => setReferNote(e.target.value)}
                    placeholder="أضف ملاحظة أو تعليمات للموظف..."
                    className="min-h-[80px] rounded-xl resize-none text-sm"
                    data-testid="textarea-refer-note"
                  />
                </div>
                <Button
                  className="w-full font-medium h-11 rounded-xl"
                  style={{ background: "#187860", color: "white" }}
                  disabled={!referDept}
                  onClick={referTicketToDept}
                  data-testid="button-confirm-refer"
                >
                  <Send className="w-4 h-4 me-2" />
                  إحالة التذكرة
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!circuitReferReqId} onOpenChange={(open) => { if (!open) { setCircuitReferReqId(null); setCircuitReferValue(""); setCircuitReferEmployee(""); } }}>
        <DialogContent className="max-w-md" dir="rtl" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-[#187860]" />
              إحالة الطلب للدائرة القضائية
            </DialogTitle>
          </DialogHeader>
          {circuitReferReqId && (() => {
            const req = requests.find(r => r.id === circuitReferReqId);
            if (!req) return null;
            const judicialCircuits = CIRCUITS.filter(c => c.type !== "documents");
            const availableEmployees = circuitReferValue ? (CIRCUIT_EMPLOYEES[circuitReferValue] || []) : [];
            return (
              <div className="space-y-4">
                <div className="rounded-xl p-3 bg-muted/40 border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                    <p className="font-semibold text-sm">{req.trackingNumber}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.applicantName} · {getRequestTypeLabel(req.requestType, true)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">اختر الدائرة القضائية</Label>
                  <Select value={circuitReferValue} onValueChange={(val) => { setCircuitReferValue(val); setCircuitReferEmployee(""); }}>
                    <SelectTrigger className="rounded-xl" data-testid="select-circuit-refer">
                      <SelectValue placeholder="اختر الدائرة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {judicialCircuits.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {circuitReferValue && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">اختر موظف الدائرة</Label>
                    <Select value={circuitReferEmployee} onValueChange={setCircuitReferEmployee}>
                      <SelectTrigger className="rounded-xl" data-testid="select-circuit-employee">
                        <SelectValue placeholder="اختر الموظف..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 font-medium h-11 rounded-xl" onClick={() => { setCircuitReferReqId(null); setCircuitReferValue(""); setCircuitReferEmployee(""); }}>إغلاق</Button>
                  <Button
                    className="flex-1 font-medium h-11 rounded-xl"
                    style={{ background: "#187860", color: "white" }}
                    disabled={!circuitReferValue || !circuitReferEmployee}
                    onClick={() => {
                      const circuitLabel = getCircuitLabel(circuitReferValue);
                      const empName = (CIRCUIT_EMPLOYEES[circuitReferValue] || []).find(e => e.id === circuitReferEmployee)?.name || "";
                      setRequests(prev => {
                        const updated = prev.map(r => r.id === circuitReferReqId ? { ...r, status: "referred" as RequestStatus, referredTo: circuitLabel, referralSection: "judicial" as any, assignedEmployee: empName } : r);
                        const item = updated.find(r => r.id === circuitReferReqId);
                        if (item) persistRequestUpdate(item);
                        return updated;
                      });
                      toast({ title: `تم إحالة الطلب إلى ${circuitLabel} — ${empName}` });
                      setCircuitReferReqId(null);
                      setCircuitReferValue("");
                      setCircuitReferEmployee("");
                    }}
                    data-testid="button-confirm-circuit-refer"
                  >
                    <ArrowLeftRight className="w-4 h-4 me-2" />
                    إحالة
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!docsReferReqId} onOpenChange={(open) => { if (!open) { setDocsReferReqId(null); setDocsReferEmployee(""); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2 text-base">
              <ArrowLeftRight className="w-5 h-5 text-[#187860]" />
              إحالة الطلب لقسم الوثائق
            </DialogTitle>
          </DialogHeader>
          {docsReferReqId && (() => {
            const req = requests.find(r => r.id === docsReferReqId);
            if (!req) return null;
            return (
              <div className="space-y-4">
                <div className="rounded-xl p-3 bg-muted/40 border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                    <p className="font-semibold text-sm">{req.trackingNumber}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.applicantName} · {getRequestTypeLabel(req.requestType, true)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">اختر موظف الوثائق</Label>
                  <Select value={docsReferEmployee} onValueChange={setDocsReferEmployee}>
                    <SelectTrigger className="rounded-xl" data-testid="select-docs-employee">
                      <SelectValue placeholder="اختر الموظف..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCS_EMPLOYEES.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 font-medium h-11 rounded-xl" onClick={() => { setDocsReferReqId(null); setDocsReferEmployee(""); }}>إغلاق</Button>
                  <Button
                    className="flex-1 font-medium h-11 rounded-xl"
                    style={{ background: "#187860", color: "white" }}
                    disabled={!docsReferEmployee}
                    onClick={() => {
                      const empName = DOCS_EMPLOYEES.find(e => e.id === docsReferEmployee)?.name || "";
                      setRequests(prev => {
                        const updated = prev.map(r => r.id === docsReferReqId ? { ...r, status: "referred" as RequestStatus, referredTo: "قسم الوثائق والمحفوظات", referralSection: "documents" as any, assignedTo: empName } : r);
                        const item = updated.find(r => r.id === docsReferReqId);
                        if (item) persistRequestUpdate(item);
                        return updated;
                      });
                      toast({ title: `تم إحالة الطلب لقسم الوثائق — ${empName}` });
                      setDocsReferReqId(null);
                      setDocsReferEmployee("");
                    }}
                    data-testid="button-confirm-docs-refer"
                  >
                    <ArrowLeftRight className="w-4 h-4 me-2" />
                    إحالة
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <MojFooter />
    </div>
  );
}
