import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import MojFooter from "@/components/moj-footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, CheckCircle, Clock, User, FileText, Download,
  AlertTriangle, Timer, Zap, Paperclip, RotateCcw, Shield,
  BookOpen, Archive, ChevronLeft, X, Eye, Upload, SendHorizontal,
  ThumbsUp, ThumbsDown, Lock, LogOut, Info, ArrowLeft, Building2, BarChart2,
  Trophy, History, Filter, ClipboardList, Plus, LayoutGrid, List, MessageSquare,
  Stamp, ShieldCheck, KeyRound, QrCode, Fingerprint, Copy
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RequestStatusBadge } from "@/components/request-status-badge";
import { RequestTimeline } from "@/components/request-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNotifications } from "@/lib/notifications";
import {
  MOCK_REQUESTS, MOCK_EMPLOYEES, CIRCUITS, getCircuitLabel, getRequestTypeLabel,
  getApplicantTypeLabel, formatDate, getSlaStatus, getSlaCountdown, isOverSla,
  getDepartmentSection,
  loadTickets, saveTickets, REFERRAL_DEPARTMENTS, initializeTickets,
  getCircuitsForCourt,
  type Request, type RequestStatus, type RequestType, type Employee, type Ticket
} from "@/lib/data";

const REQUESTS_KEY = "moj_requests";
const DATA_VERSION_KEY = "moj_data_version";
const CURRENT_DATA_VERSION = "15";

function migrateStoredData() {
  const ver = localStorage.getItem(DATA_VERSION_KEY);
  if (ver !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.removeItem("moj_tickets");
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }
}

function fileToBase64(file: File): Promise<{ name: string; type: string; size: number; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadAttachment(att: { name: string; data: string }) {
  const link = document.createElement("a");
  link.href = att.data;
  link.download = att.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

type EmployeeSection = "verification_center" | "beneficiary_services" | "judicial" | "documents" | "archive" | "tickets";

const SAUDI_COURTS = [
  "المحكمة العامة بالرياض",
  "المحكمة العامة بجدة",
  "المحكمة العامة بمكة المكرمة",
  "المحكمة العامة بالمدينة المنورة",
  "المحكمة العامة بالدمام",
  "المحكمة العامة بالخبر",
  "المحكمة العامة بالأحساء",
  "المحكمة العامة بالطائف",
  "المحكمة العامة بتبوك",
  "المحكمة العامة بأبها",
  "المحكمة العامة بخميس مشيط",
  "المحكمة العامة بنجران",
  "المحكمة العامة بجازان",
  "المحكمة العامة بالباحة",
  "المحكمة العامة ببريدة",
  "المحكمة العامة بعنيزة",
  "المحكمة العامة بحائل",
  "المحكمة العامة بالجوف",
  "المحكمة العامة بعرعر",
  "المحكمة العامة بالقطيف",
  "المحكمة العامة بالجبيل",
  "المحكمة العامة بينبع",
  "المحكمة العامة بحفر الباطن",
  "المحكمة العامة بالخرج",
  "المحكمة العامة بالقصيم",
  "المحكمة العامة بالزلفي",
  "المحكمة العامة بالمجمعة",
  "المحكمة العامة بالدوادمي",
  "المحكمة العامة بوادي الدواسر",
  "المحكمة العامة بالأفلاج",
  "المحكمة الجزائية بالرياض",
  "المحكمة الجزائية بجدة",
  "المحكمة الجزائية بمكة المكرمة",
  "المحكمة الجزائية بالدمام",
  "المحكمة الجزائية بالمدينة المنورة",
  "المحكمة الجزائية المتخصصة بالرياض",
  "المحكمة التجارية بالرياض",
  "المحكمة التجارية بجدة",
  "المحكمة التجارية بالدمام",
  "المحكمة التجارية بالمدينة المنورة",
  "محكمة الأحوال الشخصية بالرياض",
  "محكمة الأحوال الشخصية بجدة",
  "محكمة الأحوال الشخصية بمكة المكرمة",
  "محكمة الأحوال الشخصية بالدمام",
  "محكمة الأحوال الشخصية بالمدينة المنورة",
  "محكمة العمال بالرياض",
  "محكمة العمال بجدة",
  "محكمة العمال بمكة المكرمة",
  "محكمة العمال بالدمام",
  "محكمة الاستئناف بالرياض",
  "محكمة الاستئناف بمكة المكرمة",
  "محكمة الاستئناف بالمدينة المنورة",
  "محكمة الاستئناف بالمنطقة الشرقية",
  "محكمة الاستئناف بعسير",
  "محكمة الاستئناف بالقصيم",
  "محكمة الاستئناف بتبوك",
  "محكمة الاستئناف بحائل",
  "محكمة الاستئناف بنجران",
  "محكمة الاستئناف بالجوف",
  "محكمة الاستئناف بالباحة",
  "محكمة الاستئناف بجازان",
  "المحكمة العليا",
];

const SECTION_CONFIG: Record<EmployeeSection, {
  label: string;
  sublabel: string;
  sectionTag: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  verification_center: {
    label: "مركز تدقيق الطلبات",
    sublabel: "تدقيق الطلبات ومراجعتها وإحالتها للمحاكم والأقسام المختصة",
    sectionTag: "الطلبات الواردة",
    icon: ShieldCheck,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06]",
    border: "border-[#187860]",
  },
  beneficiary_services: {
    label: "قسم خدمات المستفيدين",
    sublabel: "استقبال الطلبات، مراجعتها، وإحالتها",
    sectionTag: "الطلبات الواردة",
    icon: Shield,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06]",
    border: "border-[#187860]",
  },
  judicial: {
    label: "الدوائر القضائية",
    sublabel: "إرفاق المستندات القضائية وإعادتها لخدمات المستفيدين",
    sectionTag: "الطلبات المحالة",
    icon: BookOpen,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06]",
    border: "border-[#187860]",
  },
  documents: {
    label: "قسم الوثائق والمحفوظات",
    sublabel: "إرفاق الوثائق المحفوظة وإعادتها لخدمات المستفيدين",
    sectionTag: "الطلبات المحالة",
    icon: Archive,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06]",
    border: "border-[#187860]",
  },
  archive: {
    label: "أرشيف الطلبات المكتملة",
    sublabel: "جميع الطلبات التي تمّت معالجتها وأُغلقت بنجاح",
    sectionTag: "الأرشيف",
    icon: CheckCircle,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04]",
    border: "border-[#187860]",
  },
  tickets: {
    label: "التذاكر والشكاوى",
    sublabel: "التذاكر المحالة من المدير والشكاوى الواردة من المستفيدين",
    sectionTag: "التذاكر",
    icon: MessageSquare,
    color: "#187860",
    bg: "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06]",
    border: "border-[#187860]",
  },
};

const REQUEST_TYPE_LABELS: Record<string, { short: string; full: string; icon: React.ElementType; color: string; fee: string }> = {
  certified_copy: {
    short: "نسخة مصدقة",
    full: "نسخة مصدقة من أوراق الدعوى",
    icon: FileText,
    color: "#187860",
    fee: "١٠٠ ريال",
  },
  case_review: {
    short: "اطلاع على أوراق الدعوى",
    full: "الاطلاع على أوراق الدعوى",
    icon: Eye,
    color: "#187860",
    fee: "٥٠ ريال",
  },
  replacement_doc: {
    short: "نسخة بديلة للوثائق",
    full: "نسخة بديلة للوثائق القضائية",
    icon: RotateCcw,
    color: "#075e4a",
    fee: "١٠٠ ريال",
  },
};

function AnimatedCounter({ value, label, color }: { value: number; label: string; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(start);
    }, 50);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-center">
      <p className="text-3xl font-black" style={{ color }}>{displayed}</p>
      <p className="text-muted-foreground text-xs mt-1">{label}</p>
    </div>
  );
}

function SlaCountdownBadge({ slaDeadline, status }: { slaDeadline: string; status: RequestStatus }) {
  const [countdown, setCountdown] = useState(() => getSlaCountdown(slaDeadline));
  useEffect(() => {
    if (status === "completed") return;
    const timer = setInterval(() => setCountdown(getSlaCountdown(slaDeadline)), 1000);
    return () => clearInterval(timer);
  }, [slaDeadline, status]);
  if (status === "completed") return null;
  const { hours, minutes, seconds, isOverdue } = countdown;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium ${
      isOverdue ? "bg-[#B42318]/[0.07] text-[#B42318]"
      : hours < 24 ? "bg-[#ec9a18]/[0.07] text-[#ec9a18]"
      : "bg-[#187860]/[0.05] text-[#187860]"
    }`} data-testid="sla-countdown">
      <Timer className="w-3 h-3" />
      {isOverdue ? "متأخر " : ""}
      {hours > 48 ? `${Math.floor(hours / 24)} يوم` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
    </div>
  );
}

function RequestTypePill({ type }: { type: string }) {
  const cfg = REQUEST_TYPE_LABELS[type];
  if (!cfg) return <span className="text-xs text-muted-foreground">{getRequestTypeLabel(type)}</span>;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium"
      style={{ background: `${cfg.color}0c`, color: cfg.color }}>
      <Icon className="w-3 h-3 opacity-70" />
      {cfg.short}
    </span>
  );
}

function BeneficiaryServicesModal({ request, onUpdate, onClose, onLog }: {
  request: Request;
  onUpdate: (id: string, updates: Partial<Request>) => void;
  onClose: () => void;
  onLog?: (action: string, trackingNumber: string, requestId: string, note?: string) => void;
}) {
  const [action, setAction] = useState<"accept_refer" | "reject" | "return_audit" | "">("accept_refer");
  const [referTo, setReferTo] = useState("");
  const [notes, setNotes] = useState(request.notes || "");
  const [internalNote, setInternalNote] = useState("");
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleSubmit = () => {
    const now = new Date().toLocaleString("ar");
    let updates: Partial<Request> = { 
      ...(action !== "accept_refer" && notes.trim() && { notes }),
      ...(internalNote.trim() && { internalNote: internalNote.trim() }),
      updatedAt: new Date().toISOString().split("T")[0] 
    };
    if (action === "accept_refer") {
      if (!referTo) { toast({ title: "يرجى اختيار القسم", variant: "destructive" }); return; }
      const isDocuments = referTo.includes("الوثائق والمحفوظات");
      updates = { ...updates, status: "referred", referredTo: referTo, referralSection: isDocuments ? "documents" : "judicial",
        timeline: [
          ...request.timeline.map(t => t.status === "current" ? { ...t, status: "completed" as const, date: now } : t),
          { id: `t${Date.now()}`, date: now, title: "قبول وإحالة للقسم", description: `تم قبول الطلب وإحالته إلى ${referTo}${request.court ? " (" + request.court + ")" : ""}`, status: "current" as const },
          { id: `t${Date.now()+1}`, date: "", title: "إرفاق المستند وإعادة الطلب", description: "في انتظار إرفاق المستند", status: "pending" as const },
          { id: `t${Date.now()+2}`, date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" as const },
        ]
      };
    } else if (action === "reject") {
      updates = { ...updates, notes, status: "rejected" as any, rejectionReason: notes || undefined };
    } else if (action === "return_audit") {
      updates = { ...updates, notes, status: "pending" as any, assignedSection: "verification_center", referredTo: "مركز التدقيق",
        timeline: [
          ...request.timeline.map(t => t.status === "current" ? { ...t, status: "completed" as const, date: now } : t),
          { id: `t${Date.now()}`, date: now, title: "إعادة إلى مركز التدقيق", description: `تمت إعادة الطلب إلى مركز التدقيق من خدمات المستفيدين${notes ? " " + notes : ""}`, status: "current" as const },
          { id: `t${Date.now()+1}`, date: "", title: "مراجعة مركز التدقيق", description: "في انتظار مراجعة مركز التدقيق", status: "pending" as const },
        ]
      };
    }
    onUpdate(request.id, updates);
    onLog?.(action, request.trackingNumber, request.id, action !== "accept_refer" ? notes.trim() || undefined : undefined);
    toast({ title: "تم تنفيذ الإجراء بنجاح" });
    onClose();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 bg-muted/40 border border-border">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
              <p className="font-bold font-mono text-sm">{request.trackingNumber}</p>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{request.applicantName}</p>
            {request.court && (
              <p className="text-xs mt-1 flex items-center gap-1 text-[#187860]">
                <Building2 className="w-3 h-3" />
                {request.court}
              </p>
            )}
          </div>
          <RequestTypePill type={request.requestType} />
        </div>
        {REQUEST_TYPE_LABELS[request.requestType] && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-border pt-2">
            {REQUEST_TYPE_LABELS[request.requestType].full}
          </p>
        )}
      </div>

      <div>
        <Label className="font-medium mb-3 block">اختر الإجراء</Label>
        <div className="space-y-2">
          {[
            { value: "accept_refer", label: "قبول وإحالة للقسم", icon: ThumbsUp, color: "#187860", bg: "rgba(24,120,96,0.06)" },
            { value: "reject", label: "رفض الطلب", icon: ThumbsDown, color: "#B42318", bg: "rgba(180,35,24,0.1)" },
            { value: "return_audit", label: "إعادة لمركز التدقيق", icon: RotateCcw, color: "#ec9a18", bg: "rgba(199,168,108,0.1)" },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setAction(opt.value as any)}
                className={`flex items-center gap-2 w-full p-3 rounded-xl border-2 text-sm font-medium text-start transition-all ${
                  action === opt.value ? "border-current" : "border-transparent bg-muted/40"
                }`}
                style={action === opt.value ? { background: opt.bg, color: opt.color, borderColor: opt.color } : {}}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {action === "accept_refer" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Label className="font-medium mb-2 block">
            {request.court === "ديوان الوزارة" ? "اختر الإدارة أو القسم" : "اختر الدائرة القضائية"}
            {request.court && <span className="text-[11px] text-muted-foreground font-normal ms-1">({request.court})</span>}
          </Label>
          <Select value={referTo} onValueChange={setReferTo}>
            <SelectTrigger data-testid="select-refer-circuit"><SelectValue placeholder={request.court ? "اختر القسم..." : "لا توجد جهة محددة للطلب"} /></SelectTrigger>
            <SelectContent className="max-h-56">
              {getCircuitsForCourt(request.court || "").map((c) => (
                <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {(action === "reject" || action === "return_audit") && (
        <div>
          <Label className="font-medium mb-2 block">
            {action === "reject" ? "سبب الرفض" : "سبب الإعادة"} <span className="text-[#B42318]">*</span>
          </Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {NOTE_TEMPLATES.map(t => (
              <button key={t} type="button"
                onClick={() => setNotes(prev => prev ? `${prev}. ${t}` : t)}
                className="text-[11px] px-2.5 py-1 rounded-md border border-border/60 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground">
                + {t}
              </button>
            ))}
          </div>
          <Textarea placeholder={action === "reject" ? "أدخل سبب الرفض..." : "أدخل سبب الإعادة..."} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      )}

      {action === "accept_refer" && (
        <div className="rounded-xl p-3 bg-[#ec9a18]/[0.04]">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#ec9a18] mb-2">
            <Lock className="w-3 h-3" />
            ملاحظة داخلية (لا تظهر للمستفيد) (اختياري)
          </label>
          <Textarea
            className="rounded-xl bg-white border-[#ebebeb] text-sm"
            placeholder="أضف ملاحظة داخلية للموظفين فقط..."
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={2}
            data-testid="input-internal-note"
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        <Button className="flex-1 font-medium" disabled={!action || ((action === "reject" || action === "return_audit") && !notes.trim())}
          style={{ background: "#187860", color: "white" }} onClick={handleSubmit}
          data-testid="button-confirm-update">تنفيذ الإجراء</Button>
      </div>


    </div>
  );
}

function VerificationCenterModal({ request, onUpdate, onClose, onLog }: {
  request: Request;
  onUpdate: (id: string, updates: Partial<Request>) => void;
  onClose: () => void;
  onLog?: (action: string, trackingNumber: string, requestId: string, note?: string) => void;
}) {
  const [action, setAction] = useState<"accept" | "reject" | "">("accept");
  const [notes, setNotes] = useState(request.notes || "");
  const [internalNote, setInternalNote] = useState("");
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const handleSubmit = () => {
    const now = new Date().toLocaleString("ar");
    let updates: Partial<Request> = { 
      notes, 
      ...(internalNote.trim() && { internalNote: internalNote.trim() }),
      updatedAt: new Date().toISOString().split("T")[0] 
    };
    if (action === "accept") {
      updates = { ...updates, status: "processing", assignedSection: "beneficiary_services",
        referredTo: request.court || undefined,
        timeline: [
          ...request.timeline.map(t => {
            if (t.title === "مراجعة الطلب" && t.status === "pending") return { ...t, status: "completed" as const, date: now, description: "تم قبول الطلب من مركز التدقيق" };
            if (t.status === "current") return { ...t, status: "completed" as const, date: now };
            return t;
          }),
          { id: `t${Date.now()}`, date: now, title: "إحالة إلى الجهة", description: `تم إحالة الطلب إلى ${request.court || "الجهة المختارة"} قسم خدمات المستفيدين`, status: "current" as const },
          { id: `t${Date.now()+1}`, date: "", title: "معالجة الطلب من خدمات المستفيدين", description: "في انتظار المعالجة من قسم خدمات المستفيدين بالجهة", status: "pending" as const },
          { id: `t${Date.now()+2}`, date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" as const },
        ]
      };
    } else if (action === "reject") {
      updates = { ...updates, status: "rejected" as any, rejectionReason: notes || undefined };
    } else if (action === "return_beneficiary") {
      updates = { ...updates, status: "rejected" as any, rejectionReason: notes || "تمت إعادة الطلب للمستفيد من مركز التدقيق",
        timeline: [
          ...request.timeline.map(t => t.status === "current" ? { ...t, status: "completed" as const, date: now } : t),
          { id: `t${Date.now()}`, date: now, title: "إعادة الطلب للمستفيد", description: `تمت إعادة الطلب للمستفيد من مركز التدقيق${notes ? " " + notes : ""}`, status: "current" as const },
        ]
      };
    }
    onUpdate(request.id, updates);
    onLog?.(action, request.trackingNumber, request.id, notes.trim() || undefined);
    toast({ title: "تم تنفيذ الإجراء بنجاح" });
    onClose();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04] border border-[#187860]/20 dark:border-[#187860]/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#187860]/5 dark:bg-[#187860]/8">
            <ShieldCheck className="w-4 h-4 text-[#187860]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
              <p className="font-bold font-mono text-sm">{request.trackingNumber}</p>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{request.applicantName}</p>
            {request.court && (
              <p className="text-xs mt-1 flex items-center gap-1 text-[#187860]">
                <Building2 className="w-3 h-3" />
                {request.court}
              </p>
            )}
          </div>
          <RequestTypePill type={request.requestType} />
        </div>
        {REQUEST_TYPE_LABELS[request.requestType] && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-[#187860]/20 dark:border-[#187860]/20 pt-2">
            {REQUEST_TYPE_LABELS[request.requestType].full}
          </p>
        )}
      </div>

      <div>
        <Label className="font-medium mb-3 block">اختر الإجراء</Label>
        <div className="space-y-2">
          {[
            { value: "accept", label: "قبول وإحالة", icon: ThumbsUp, color: "#187860", bg: "rgba(24,120,96,0.06)" },
            { value: "return_beneficiary", label: "إعادة للمستفيد", icon: RotateCcw, color: "#ec9a18", bg: "rgba(199,168,108,0.1)" },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setAction(opt.value as any)}
                data-testid={`vc-action-${opt.value}`}
                className={`flex items-center gap-2 w-full p-3 rounded-xl border-2 text-sm font-medium text-start transition-all ${
                  action === opt.value ? "border-current" : "border-transparent bg-muted/40"
                }`}
                style={action === opt.value ? { background: opt.bg, color: opt.color, borderColor: opt.color } : {}}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {action === "return_beneficiary" && (
      <div>
        <Label className="font-medium mb-2 block">سبب الإعادة <span className="text-[#B42318]">*</span></Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {NOTE_TEMPLATES.map(t => (
            <button key={t} type="button"
              onClick={() => setNotes(prev => prev ? `${prev}. ${t}` : t)}
              className="text-[11px] px-2.5 py-1 rounded-md border border-border/60 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground">
              + {t}
            </button>
          ))}
        </div>
        <Textarea placeholder="أدخل سبب الإعادة..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} data-testid="vc-input-notes" />
      </div>
      )}

      {action === "accept" && (
      <div className="rounded-xl p-3 bg-[#ec9a18]/[0.04]">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#ec9a18] mb-2">
          <Lock className="w-3 h-3" />
          ملاحظة داخلية (لا تظهر للمستفيد) (اختياري)
        </label>
        <Textarea
          className="rounded-xl bg-white border-[#ebebeb] text-sm"
          placeholder="أضف ملاحظة داخلية للموظفين فقط..."
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          rows={2}
          data-testid="vc-input-internal-note"
        />
      </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        <Button className="flex-1 font-medium" disabled={!action || (action === "return_beneficiary" && !notes.trim())}
          style={{ background: "#187860", color: "white" }} onClick={handleSubmit}
          data-testid="vc-button-confirm">تنفيذ الإجراء</Button>
      </div>


    </div>
  );
}

function AttachAndReturnModal({ request, sectionLabel, section, onUpdate, onClose, employeeName }: {
  request: Request;
  sectionLabel: string;
  section: string;
  onUpdate: (id: string, updates: Partial<Request>) => void;
  onClose: () => void;
  employeeName: string;
}) {
  const [modalAction, setModalAction] = useState<"attach_deliver" | "return_services" | "">("attach_deliver");
  const [returnReason, setReturnReason] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [stampApplied, setStampApplied] = useState(false);
  const [signatureApplied, setSignatureApplied] = useState(false);
  const [stampProgress, setStampProgress] = useState(0);
  const [signatureProgress, setSignatureProgress] = useState(0);
  const [storedVerificationCode, setStoredVerificationCode] = useState("");
  const [storedSignatureHash, setStoredSignatureHash] = useState("");
  const { toast } = useToast();

  const requiresStamp = section === "judicial" || section === "documents";

  const generateVerificationCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "47-V-";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const generateSignatureHash = () => {
    const hex = "0123456789abcdef";
    let hash = "SHA256:";
    for (let i = 0; i < 64; i++) hash += hex[Math.floor(Math.random() * hex.length)];
    return hash;
  };

  const handleApplyStamp = () => {
    setStampProgress(0);
    const code = generateVerificationCode();
    const interval = setInterval(() => {
      setStampProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStampApplied(true);
          setStoredVerificationCode(code);
          toast({ title: "تم تطبيق الختم الإلكتروني بنجاح", description: `رمز التحقق: ${code}` });
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleApplySignature = () => {
    if (!stampApplied) {
      toast({ title: "يجب تطبيق الختم الإلكتروني أولاً", variant: "destructive" });
      return;
    }
    setSignatureProgress(0);
    const hash = generateSignatureHash();
    const interval = setInterval(() => {
      setSignatureProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSignatureApplied(true);
          setStoredSignatureHash(hash);
          toast({ title: "تم التوقيع الرقمي المشفّر بنجاح", description: `بصمة: ${hash.substring(0, 24)}...` });
          return 100;
        }
        return prev + 15;
      });
    }, 180);
  };

  const handleAttach = async () => {
    if (!docDescription.trim()) {
      toast({ title: "يرجى وصف المستند المرفق", variant: "destructive" });
      return;
    }
    if (requiresStamp && !stampApplied) {
      toast({ title: "يجب تطبيق الختم الإلكتروني على الوثيقة", variant: "destructive" });
      return;
    }
    if (requiresStamp && !signatureApplied) {
      toast({ title: "يجب التوقيع الرقمي المشفّر على الوثيقة", variant: "destructive" });
      return;
    }
    const now = new Date().toLocaleString("ar");
    const stampInfo = requiresStamp ? {
      digitalStamp: {
        applied: true,
        verificationCode: storedVerificationCode,
        stampDate: now,
        circuitName: getCircuitLabel(request.circuit),
      },
      digitalSignature: {
        applied: true,
        hash: storedSignatureHash,
        signDate: now,
      },
    } : {};

    let newEmployeeAttachments = request.employeeAttachments || [];
    if (attachedFile) {
      const fileData = await fileToBase64(attachedFile);
      newEmployeeAttachments = [...newEmployeeAttachments, { ...fileData, uploadedBy: employeeName, uploadedAt: now }];
    }

    onUpdate(request.id, {
      status: "completed",
      attachedDocument: docDescription,
      attachedAt: now,
      notes: notes || undefined,
      referralSection: undefined,
      referredTo: undefined,
      updatedAt: new Date().toISOString().split("T")[0],
      employeeAttachments: newEmployeeAttachments.length > 0 ? newEmployeeAttachments : undefined,
      ...stampInfo,
      timeline: [
        ...request.timeline.map(t => {
          if (t.status === "current") return { ...t, status: "completed" as const, date: now };
          if (t.status === "pending" && t.title.includes("إرفاق")) return { ...t, status: "completed" as const, date: now, description: requiresStamp ? `تم إرفاق الوثيقة مع الختم الإلكتروني والتوقيع الرقمي` : `تم إرفاق: ${docDescription}` };
          return t;
        }),
        { id: `t${Date.now()}`, date: now, title: "تسليم الطلب للمستفيد", description: "تم تسليم الطلب للمستفيد لسداد الرسوم واستلام الوثيقة", status: "completed" as const },
      ],
    });
    toast({
      title: "تم إرفاق المستند وتسليم الطلب للمستفيد لسداد الرسوم",
      description: requiresStamp ? `الوثيقة معتمدة رقمياً ${docDescription}` : `المستند: ${docDescription}`,
    });
    onClose();
  };

  const handleReturnToServices = () => {
    if (!returnReason.trim()) {
      toast({ title: "يرجى ذكر سبب الإعادة", variant: "destructive" });
      return;
    }
    const now = new Date().toLocaleString("ar");
    onUpdate(request.id, {
      status: "processing",
      assignedSection: "beneficiary_services",
      referralSection: undefined,
      referredTo: "قسم خدمات المستفيدين",
      notes: returnReason,
      updatedAt: new Date().toISOString().split("T")[0],
      timeline: [
        ...request.timeline.map(t => t.status === "current" ? { ...t, status: "completed" as const, date: now } : t),
        { id: `t${Date.now()}`, date: now, title: "إعادة لقسم خدمات المستفيدين", description: `تمت الإعادة من ${sectionLabel} السبب: ${returnReason}`, status: "current" as const },
        { id: `t${Date.now()+1}`, date: "", title: "مراجعة خدمات المستفيدين", description: "في انتظار مراجعة قسم خدمات المستفيدين", status: "pending" as const },
      ],
    });
    toast({ title: "تم إعادة الطلب لقسم خدمات المستفيدين" });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 border border-border bg-muted/30">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
          <p className="font-bold font-mono text-sm">{request.trackingNumber}</p>
        </div>
        <p className="text-muted-foreground text-xs mt-0.5">{request.applicantName}</p>
        {request.court && (
          <p className="text-xs mt-1 flex items-center gap-1 text-[#187860]">
            <Building2 className="w-3 h-3" />
            {request.court}
          </p>
        )}
        {REQUEST_TYPE_LABELS[request.requestType] && (
          <div className="mt-3 p-3 rounded-lg" style={{ background: `${REQUEST_TYPE_LABELS[request.requestType].color}10`, border: `1px solid ${REQUEST_TYPE_LABELS[request.requestType].color}25` }}>
            <p className="text-xs font-bold mb-1" style={{ color: REQUEST_TYPE_LABELS[request.requestType].color }}>المطلوب تنفيذه:</p>
            <p className="text-xs leading-relaxed text-foreground">{REQUEST_TYPE_LABELS[request.requestType].full}</p>
          </div>
        )}
      </div>

      <div>
        <Label className="font-medium mb-3 block">اختر الإجراء</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "attach_deliver", label: "إرفاق وتسليم الطلب", icon: SendHorizontal, color: "#187860", bg: "rgba(24,120,96,0.06)" },
            { value: "return_services", label: "إعادة لخدمات المستفيدين", icon: RotateCcw, color: "#ec9a18", bg: "rgba(199,168,108,0.1)" },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setModalAction(opt.value as any)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium text-start transition-all ${
                  modalAction === opt.value ? "border-current" : "border-transparent bg-muted/40"
                }`}
                style={modalAction === opt.value ? { background: opt.bg, color: opt.color, borderColor: opt.color } : {}}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {modalAction === "return_services" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
          <div>
            <Label className="font-medium mb-2 block">سبب الإعادة <span className="text-[#B42318]">*</span></Label>
            <Textarea
              placeholder="اذكر سبب إعادة الطلب لقسم خدمات المستفيدين..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
            <Button className="flex-1 font-medium" onClick={handleReturnToServices}
              disabled={!returnReason.trim()}
              style={{ background: "#ec9a18", color: "white" }}>
              <RotateCcw className="w-4 h-4 me-2" />
              إعادة الطلب
            </Button>
          </div>
        </motion.div>
      )}

      {modalAction === "attach_deliver" && (<>

      <label htmlFor="attach-file-upload" className="cursor-pointer block">
        <div className={`rounded-xl p-4 border-2 border-dashed transition-all text-center ${attachedFile ? "border-[#187860]/30 bg-[#187860]/[0.05] dark:bg-[#187860]/[0.04]" : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"}`}>
          {attachedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-[#187860]" />
              <div className="text-start">
                <p className="text-sm font-semibold text-[#187860] dark:text-[#187860]">{attachedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(attachedFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={(e) => { e.preventDefault(); setAttachedFile(null); }}
                className="text-muted-foreground hover:text-destructive transition-colors ms-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-semibold text-muted-foreground mb-1">إرفاق المستند</p>
              <p className="text-xs text-muted-foreground">صيغ مقبولة: PDF، JPG، PNG اضغط للاختيار</p>
            </>
          )}
        </div>
        <input id="attach-file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 10 * 1024 * 1024) { toast({ title: "حجم الملف يتجاوز 10 ميجابايت", variant: "destructive" }); return; }
              setAttachedFile(f);
              if (!docDescription) setDocDescription(f.name.replace(/\.[^/.]+$/, ""));
            }
            e.target.value = "";
          }} />
      </label>

      <div>
        <Label className="font-medium mb-2 block">وصف المستند المرفق <span className="text-[#B42318]">*</span></Label>
        <Textarea
          placeholder={`مثال: تم إرفاق ${REQUEST_TYPE_LABELS[request.requestType]?.short || "المستند المطلوب"} ${request.requestType === "replacement_doc" ? `للصك رقم ${request.judgmentNumber || ""}` : `للقضية رقم ${request.caseNumber}`}`}
          value={docDescription}
          onChange={(e) => setDocDescription(e.target.value)}
          rows={2}
          data-testid="textarea-doc-description"
        />
      </div>

      {requiresStamp && (
        <div className="rounded-xl border border-[#187860]/20 bg-[#187860]/[0.03] p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#187860]" />
            <h4 className="font-bold text-sm text-[#187860]">الاعتماد الرقمي للوثيقة</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            يجب تطبيق الختم الإلكتروني والتوقيع الرقمي المشفّر قبل إعادة الطلب لقسم خدمات المستفيدين
          </p>

          <div className={`rounded-xl p-3 border transition-all ${stampApplied ? "border-[#187860]/25 bg-[#187860]/[0.06]" : "border-border bg-white"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stampApplied ? "bg-[#187860]/5" : "bg-[#ec9a18]/10"}`}>
                  <Stamp className={`w-4 h-4 ${stampApplied ? "text-[#187860]" : "text-[#ec9a18]"}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">الختم الإلكتروني</p>
                  <p className="text-[11px] text-muted-foreground">{section === "judicial" ? "ختم الدائرة القضائية الرسمي" : "ختم قسم الوثائق والمحفوظات"}</p>
                </div>
              </div>
              {stampApplied ? (
                <span className="text-[11px] font-medium text-[#187860] bg-[#187860]/[0.06] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> تم التطبيق
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={handleApplyStamp}
                  className="text-[#ec9a18] border-[#ec9a18]/30 hover:bg-[#ec9a18]/10 text-xs h-7"
                  disabled={stampProgress > 0 && stampProgress < 100}
                  data-testid="button-apply-stamp">
                  <Stamp className="w-3 h-3 me-1" /> تطبيق الختم
                </Button>
              )}
            </div>
            {stampProgress > 0 && !stampApplied && (
              <Progress value={stampProgress} className="h-1.5" />
            )}
            {stampApplied && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white rounded-lg p-2 border border-[#187860]/20">
                  <p className="text-muted-foreground">الدائرة</p>
                  <p className="font-bold text-[#187860]">{getCircuitLabel(request.circuit)}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#187860]/20">
                  <p className="text-muted-foreground">رمز التحقق</p>
                  <p className="font-bold text-[#187860] font-mono" dir="ltr">{storedVerificationCode}</p>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-xl p-3 border transition-all ${signatureApplied ? "border-[#187860]/25 bg-[#187860]/[0.06]" : stampApplied ? "border-border bg-white" : "border-border bg-muted/30 opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${signatureApplied ? "bg-[#187860]/5" : "bg-[#187860]/5"}`}>
                  <Fingerprint className={`w-4 h-4 ${signatureApplied ? "text-[#187860]" : "text-[#187860]"}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">التوقيع الرقمي المشفّر</p>
                  <p className="text-[11px] text-muted-foreground">توقيع رقمي مشفّر بمفتاح الموظف</p>
                </div>
              </div>
              {signatureApplied ? (
                <span className="text-[11px] font-medium text-[#187860] bg-[#187860]/[0.06] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> تم التوقيع
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={handleApplySignature}
                  className="text-[#187860] border-[#187860]/30 hover:bg-[#187860]/5 text-xs h-7"
                  disabled={!stampApplied || (signatureProgress > 0 && signatureProgress < 100)}
                  data-testid="button-apply-signature">
                  <Fingerprint className="w-3 h-3 me-1" /> توقيع رقمي
                </Button>
              )}
            </div>
            {signatureProgress > 0 && !signatureApplied && (
              <Progress value={signatureProgress} className="h-1.5" />
            )}
            {signatureApplied && (
              <div className="mt-2 bg-white rounded-lg p-2 border border-[#187860]/20 text-[11px]">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <KeyRound className="w-3 h-3" /> بصمة التوقيع الرقمي
                </div>
                <p className="font-mono text-[9px] text-[#187860] break-all" dir="ltr">{storedSignatureHash}</p>
              </div>
            )}
          </div>

          {stampApplied && signatureApplied && (
            <div className="flex items-center gap-2 rounded-lg bg-[#187860]/[0.06] border border-[#187860]/20 p-2.5 text-xs text-[#187860]">
              <QrCode className="w-5 h-5 shrink-0" />
              <span className="font-semibold">الوثيقة جاهزة تم تطبيق الختم الإلكتروني والتوقيع الرقمي المشفّر ورمز التحقق الإلكتروني</span>
            </div>
          )}
        </div>
      )}

      <div>
        <Label className="font-medium mb-2 block">ملاحظات إضافية (اختياري)</Label>
        <Textarea placeholder="أي ملاحظات إضافية..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        <Button className="flex-1 font-medium" onClick={handleAttach}
          disabled={requiresStamp && (!stampApplied || !signatureApplied)}
          style={{ background: "#187860", color: "white" }}
          data-testid="button-confirm-attach">
          <SendHorizontal className="w-4 h-4 me-2" />
          إرفاق وتسليم الطلب للمستفيد
        </Button>
      </div>
      </>)}
    </div>
  );
}

function RequestCard({ req, onView, onAction, actionLabel, actionColor, showLive }: {
  req: Request;
  onView: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionColor?: string;
  showLive: boolean;
}) {
  const overdue = isOverSla(req.slaDeadline, req.status);
  const sla = getSlaStatus(req.slaDeadline, req.status);
  const rtCfg = REQUEST_TYPE_LABELS[req.requestType];


  // حساب المؤقت الزمني
  const createdAtDate = new Date(req.createdAt).getTime();
  const deadlineDate = new Date(req.slaDeadline).getTime();
  const now = Date.now();
  const totalSlaTime = deadlineDate - createdAtDate;
  const elapsedSlaTime = now - createdAtDate;
  const slaPercentage = Math.min(100, Math.max(0, (elapsedSlaTime / totalSlaTime) * 100));

  const slaProgressColor = 
    slaPercentage < 60 ? "bg-[#187860]/30" :
    slaPercentage < 85 ? "bg-[#ec9a18]/70" :
    "bg-[#B42318]/80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className={`border rounded-xl p-3 sm:p-5 bg-card hover-elevate transition-all ${
        overdue ? "border-[#ec9a18]/20 dark:border-[#ec9a18]/20" : "border-border"}`}
      data-testid={`row-request-${req.id}`}
    >
      {overdue && (
        <div className="flex items-center gap-2 mb-3 text-[11px] text-[#B42318] font-medium bg-[#B42318]/[0.04] rounded-lg px-3 py-1.5">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          تجاوز الموعد النهائي يرجى المعالجة فوراً
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
            <span className="font-bold text-sm sm:text-base font-mono text-foreground">{req.trackingNumber}</span>
            <RequestStatusBadge status={req.status} size="sm" />
            <RequestTypePill type={req.requestType} />
          </div>


          {req.referredTo && (
            <div className="rounded-lg px-3 py-2 mb-2 flex items-start gap-2"
              style={{ background: "rgba(24,120,96,0.07)", border: "1px solid rgba(24,120,96,0.2)" }}>
              <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#187860" }} />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#187860" }}>محال إلى</span>
                <p className="text-xs font-bold" style={{ color: "#187860" }}>{req.referredTo}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {req.requestType === "certified_copy" && "المطلوب: استخراج نسخة مصدقة وإرفاقها"}
                  {req.requestType === "case_review" && "المطلوب: إتاحة الاطلاع على أوراق الدعوى إلكترونياً"}
                  {req.requestType === "replacement_doc" && "المطلوب: إصدار نسخة بديلة من الأرشيف"}
                </p>
              </div>
            </div>
          )}

          {req.attachedDocument && (
            <div className="flex items-center gap-1.5 text-xs mb-2 bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06] px-2.5 py-1 rounded-lg">
              <Paperclip className="w-3 h-3 text-[#187860] flex-shrink-0" />
              <span className="text-[#187860] dark:text-[#187860] font-semibold">{req.attachedDocument}</span>
            </div>
          )}

          {req.fileAttachments && req.fileAttachments.length > 0 && (
            <div className="space-y-1 mb-2">
              <p className="text-[11px] text-muted-foreground font-bold">مرفقات المستفيد:</p>
              {req.fileAttachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-[#ebebeb]/10 dark:bg-[#187860]/[0.04] border border-[#ebebeb]/25 rounded-lg px-2 py-1.5">
                  <FileText className="w-3 h-3 text-[#187860] flex-shrink-0" />
                  <span className="flex-1 truncate text-[#187860] dark:text-[#ebebeb]">{att.name}</span>
                  <span className="text-[11px] text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                  <button onClick={(e) => { e.stopPropagation(); downloadAttachment(att); }} className="text-[#187860] hover:text-[#187860] transition-colors" data-testid={`btn-dl-beneficiary-att-${req.id}-${idx}`}>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {req.employeeAttachments && req.employeeAttachments.length > 0 && (
            <div className="space-y-1 mb-2">
              <p className="text-[11px] text-muted-foreground font-bold">مرفقات الموظف:</p>
              {req.employeeAttachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04] border border-[#187860]/20 rounded-lg px-2 py-1.5">
                  <FileText className="w-3 h-3 text-[#187860] flex-shrink-0" />
                  <span className="flex-1 truncate text-[#187860] dark:text-[#187860]">{att.name}</span>
                  <span className="text-[11px] text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                  <button onClick={(e) => { e.stopPropagation(); downloadAttachment(att); }} className="text-[#187860] hover:text-[#187860] transition-colors" data-testid={`btn-dl-emp-att-${req.id}-${idx}`}>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap mt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><User className="w-3 h-3" />{req.applicantName}</span>
            <span className="text-[#ebebeb] hidden sm:inline">|</span>
            <span className="whitespace-nowrap">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</span>
            <span className="text-[#ebebeb] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap"><Building2 className="w-3 h-3" /><span className="truncate max-w-[120px] sm:max-w-none">{req.court || getCircuitLabel(req.circuit)}</span></span>
            <span className="text-[#ebebeb] hidden sm:inline">|</span>
            <span className="whitespace-nowrap">{formatDate(req.createdAt)}</span>
            <span className="text-[#ebebeb] hidden sm:inline">|</span>
            {showLive && req.status !== "completed" ? (
              <SlaCountdownBadge slaDeadline={req.slaDeadline} status={req.status} />
            ) : (
              <span className={`font-semibold ${sla.color} inline-flex items-center gap-1 whitespace-nowrap`}>
                <Clock className="w-3 h-3" />{sla.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="outline" onClick={onView} data-testid={`button-view-${req.id}`}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap">
            <Eye className="w-3.5 h-3.5 me-1" />عرض
          </Button>
          {actionLabel && actionColor && onAction && (
            <Button onClick={onAction} style={{ background: actionColor, color: "white" }}
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap"
              data-testid={`button-action-${req.id}`}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      {req.status !== "completed" && (
        <div className="mt-3 relative h-1 w-full bg-muted/50 rounded-full overflow-hidden" title={`${Math.round(slaPercentage)}% من وقت المعالجة`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${slaPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${slaProgressColor}`}
          />
        </div>
      )}
    </motion.div>
  );
}

type DailyAction = { action: string; trackingNumber: string; time: string };
type ActionHistoryEntry = { action: string; label: string; time: string; employeeName: string; note?: string };

const ACTION_LABELS: Record<string, string> = {
  accept: "قبول الطلب",
  accept_refer: "قبول وإحالة",
  reject: "رفض الطلب",
  refer_judicial: "إحالة قضائية",
  refer_documents: "إحالة وثائق",
  refer_court: "إحالة للمحكمة",
  complete: "إغلاق وتسليم",
};

const NOTE_TEMPLATES = [
  "يحتاج وثيقة إضافية",
  "تم التحقق من بيانات المستفيد",
  "الطلب قيد المراجعة التفصيلية",
  "طلب مكتمل ومعالج بنجاح",
  "تعذّر التواصل مع مقدم الطلب",
];

export default function EmployeePage() {
  const [, navigate] = useLocation();
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [allowedSection, setAllowedSection] = useState<EmployeeSection>("beneficiary_services");
  const [section, setSection] = useState<EmployeeSection>("beneficiary_services");
  const [requests, setRequests] = useState<Request[]>(() => loadAllRequests());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "certified_copy" | "case_review" | "replacement_doc">("all");
  const [sortOrder, setSortOrder] = useState<"sla" | "newest" | "oldest">("newest");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionRequest, setActionRequest] = useState<Request | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLiveMode, setShowLiveMode] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterType, section, sortOrder, urgentOnly]);

  // Todo List State
  type TodoItem = { id: string; text: string; done: boolean; requestId?: string; createdAt: string; priority?: "high" | "normal" };
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "d1", text: "معالجة الطلبات العاجلة المتأخرة", done: false, createdAt: "2026-04-08T07:00:00", priority: "high" },
    { id: "d2", text: "مراجعة الطلبات الجديدة الواردة اليوم", done: false, createdAt: "2026-04-08T07:05:00" },
    { id: "d3", text: "متابعة الطلبات المحالة للدوائر القضائية", done: false, createdAt: "2026-04-08T07:10:00" },
    { id: "d4", text: "التحقق من المرفقات الناقصة في الطلبات المعلقة", done: false, createdAt: "2026-04-08T07:15:00" },
    { id: "d5", text: "تحديث حالة الطلبات المكتملة وإغلاقها", done: false, createdAt: "2026-04-08T07:20:00" },
  ]);
  const [todoInput, setTodoInput] = useState("");
  const [showTodos, setShowTodos] = useState(false);

  const [dailyActions, setDailyActions] = useState<DailyAction[]>([]);
  const [actionHistory, setActionHistory] = useState<Record<string, ActionHistoryEntry[]>>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketActionId, setTicketActionId] = useState<string | null>(null);
  const [ticketActionType, setTicketActionType] = useState<"resolve" | "respond" | "return" | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem("currentEmployee");
    if (stored) {
      try {
        const emp: Employee = JSON.parse(stored);
        setCurrentEmployee(emp);
        const sec = getDepartmentSection(emp.department);
        setAllowedSection(sec);
        setSection(sec);
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const sync = () => {
      setRequests(() => loadAllRequests());
      setTickets(loadTickets());
    };
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 4000);
    return () => { window.removeEventListener("storage", sync); clearInterval(interval); };
  }, []);

  useEffect(() => {
    setTickets(initializeTickets());
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("currentEmployee");
    navigate("/");
  };

  const empDeptKey = allowedSection === "verification_center" ? "verification_center"
    : allowedSection === "beneficiary_services" ? "beneficiary_services"
    : allowedSection === "judicial" ? "judicial"
    : allowedSection === "documents" ? "documents"
    : null;

  const myTickets = tickets.filter(t => t.status === "referred" && t.referredToDept === empDeptKey);

  const handleTicketAction = () => {
    if (!ticketActionId || !ticketActionType) return;
    const allTickets = loadTickets();
    const now = new Date().toISOString();
    const empName = currentEmployee?.name || "موظف";

    const updated = allTickets.map(t => {
      if (t.id !== ticketActionId) return t;
      if (ticketActionType === "resolve") {
        return { ...t, status: "resolved" as const, resolvedDate: now.split("T")[0], employeeResponse: ticketResponse || undefined, respondedBy: empName, respondedAt: now };
      }
      if (ticketActionType === "respond") {
        return { ...t, employeeResponse: ticketResponse, respondedBy: empName, respondedAt: now };
      }
      if (ticketActionType === "return") {
        return { ...t, status: "returned" as const, returnNote: ticketResponse, respondedBy: empName, returnedAt: now };
      }
      return t;
    });

    saveTickets(updated);
    setTickets(updated);
    setTicketActionId(null);
    setTicketActionType(null);
    setTicketResponse("");

    const msg = ticketActionType === "resolve" ? "تم حل التذكرة بنجاح"
      : ticketActionType === "respond" ? "تم إرسال الرد على التذكرة"
      : "تم إعادة التذكرة للمدير";
    toast({ title: msg });
  };

  const cfg = SECTION_CONFIG[section];

  const handleUpdate = (id: string, updates: Partial<Request>) => {
    setRequests((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, ...updates } : r);
      const updatedItem = updated.find(r => r.id === id);
      if (updatedItem) persistRequestUpdate(updatedItem);
      return updated;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRequests(loadAllRequests());
      setIsRefreshing(false);
      toast({ title: "تم تحديث القائمة" });
    }, 800);
  };

  const getFilteredRequests = () => {
    return requests.filter((r) => {
      const matchSearch = !searchQuery ||
        r.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.caseNumber.includes(searchQuery) ||
        (r.judgmentNumber || "").includes(searchQuery) ||
        r.applicantName.includes(searchQuery);

      const matchType = filterType === "all" || r.requestType === filterType;

      if (!matchSearch || !matchType) return false;

      if (section === "archive") return r.status === "completed";
      if (section === "judicial") return r.status === "referred" && r.referralSection === "judicial";
      if (section === "documents") return r.status === "referred" && r.referralSection === "documents";
      if (section === "verification_center") return r.status !== "completed" && r.status !== "referred" && r.assignedSection !== "beneficiary_services";
      if (section === "beneficiary_services") return r.status !== "completed" && r.status !== "referred" && r.assignedSection === "beneficiary_services";
      return r.status !== "completed" && r.status !== "referred" && r.assignedSection === "beneficiary_services";
    });
  };

  const filtered = getFilteredRequests();
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    const aOver = isOverSla(a.slaDeadline, a.status);
    const bOver = isOverSla(b.slaDeadline, b.status);
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
  });

  const sectionRequests = requests.filter((r) => {
    if (section === "archive") return r.status === "completed";
    if (section === "judicial") return r.status === "referred" && r.referralSection === "judicial";
    if (section === "documents") return r.status === "referred" && r.referralSection === "documents";
    if (section === "verification_center") return r.status !== "completed" && r.status !== "referred" && r.assignedSection !== "beneficiary_services";
    if (section === "beneficiary_services") return r.status !== "completed" && r.status !== "referred" && r.assignedSection === "beneficiary_services";
    return r.status !== "completed" && r.status !== "referred" && r.assignedSection === "beneficiary_services";
  });

  const stats = {
    total: sectionRequests.length,
    processing: sectionRequests.filter((r) => r.status === "processing").length,
    referred: sectionRequests.filter((r) => r.status === "referred").length,
    completed: sectionRequests.filter((r) => r.status === "completed").length,
    overdue: sectionRequests.filter((r) => isOverSla(r.slaDeadline, r.status)).length,
  };

  const overdueInSection = sorted.filter(r => isOverSla(r.slaDeadline, r.status)).length;

  const getActionConfig = () => {
    if (section === "archive") return null;
    if (section === "verification_center") return { label: "تدقيق ومعالجة", color: "#187860" };
    if (section === "beneficiary_services") return { label: "تنفيذ إجراء", color: "#187860" };
    return { label: "إرفاق وإعادة", color: "#187860" };
  };

  const actionCfg = getActionConfig();

  if (!currentEmployee) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <PageHeader
        title={section === "archive" ? "أرشيف الطلبات المكتملة" : SECTION_CONFIG[allowedSection].label}
        subtitle="منصة إدارة الطلبات القضائية"
        role="employee"
        userName={currentEmployee.name}
        department={currentEmployee.department}
        onBack={section === "archive" || section !== allowedSection ? () => setSection(allowedSection) : () => { sessionStorage.removeItem("currentEmployee"); window.location.href = "/"; }}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8" dir="rtl">
        {section !== "archive" && (() => {
          const isReferralSection = section === "judicial" || section === "documents";
          const certCount = sectionRequests.filter(r => r.requestType === "certified_copy").length;
          const reviewCount = sectionRequests.filter(r => r.requestType === "case_review").length;
          const replCount = sectionRequests.filter(r => r.requestType === "replacement_doc").length;
          const actionedCount = dailyActions.length;
          const completionPct = isReferralSection
            ? (stats.total > 0 ? Math.round((actionedCount / stats.total) * 100) : 0)
            : (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0);
          const compClamped = Math.min(completionPct, 100);

          return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <div className="rounded-2xl border bg-card p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#187860]" />
                {isReferralSection ? "نسبة الإنجاز اليومي" : "نسبة الإنجاز"}
              </p>
              <div className="flex items-end gap-1.5 sm:gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-black" style={{ color: "#187860" }}>
                  {compClamped}%
                </span>
                <span className="text-[11px] sm:text-xs text-muted-foreground mb-1">
                  {isReferralSection ? "من الطلبات المحالة" : "من إجمالي الطلبات"}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${compClamped}%`, background: "#187860" }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>{isReferralSection ? `${actionedCount} مُعالج اليوم` : `${stats.completed} مكتمل`}</span>
                <span>{stats.total} إجمالي</span>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#187860]" />
                {isReferralSection ? "توزيع الأنواع" : "توزيع الحالات"}
              </p>
              {isReferralSection ? (
                [{label: "نسخة مصدقة", count: certCount, color: "#187860"},
                 {label: "اطلاع على حكم", count: reviewCount, color: "#075e4a"},
                 {label: "نسخة بديلة", count: replCount, color: "#1F2937"}
                ].map(({ label, count, color }) => (
                  <div key={label} className="mb-2 last:mb-0">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium" style={{ color }}>{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, background: color }} />
                    </div>
                  </div>
                ))
              ) : (
                [{ label: "قيد المعالجة", count: stats.processing, color: "#ec9a18", total: stats.total },
                 { label: "محالة", count: stats.referred, color: "#187860", total: stats.total },
                 { label: "مكتملة", count: stats.completed, color: "#075e4a", total: stats.total },
                ].map(({ label, count, color, total }) => (
                  <div key={label} className="mb-2 last:mb-0">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium" style={{ color }}>{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="h-full rounded-full" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border bg-card p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#B42318]" />
                المؤشر الزمني
              </p>
              {stats.overdue > 0 ? (
                <div className="rounded-xl p-3 mb-2" style={{ background: "rgba(180,35,24,0.08)", border: "1px solid rgba(180,35,24,0.25)" }}>
                  <p className="text-2xl font-black" style={{ color: "#B42318" }}>{stats.overdue}</p>
                  <p className="text-xs font-medium" style={{ color: "#B42318" }}>طلب تجاوز الموعد النهائي</p>
                  <p className="text-[11px] text-muted-foreground mt-1">يتطلب تدخلاً فورياً</p>
                </div>
              ) : (
                <div className="rounded-xl p-3 mb-2" style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
                  <p className="text-2xl font-black text-[#187860]">جيد</p>
                  <p className="text-xs text-[#187860] font-medium">جميع الطلبات ضمن الموعد</p>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>الامتثال للمواعيد</span>
                <span className="font-medium" style={{ color: stats.overdue === 0 ? "#187860" : "#B42318" }}>
                  {stats.total > 0 ? Math.round(((stats.total - stats.overdue) / stats.total) * 100) : 100}%
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#C7A86C]" />
                إنتاجيتي اليوم
              </p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: "#187860" }}>{dailyActions.length}</p>
              <p className="text-xs text-muted-foreground mb-2">إجراء مكتمل</p>
              {dailyActions.length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(ACTION_LABELS).map(([key, label]) => {
                    const count = dailyActions.filter(a => a.action === key).length;
                    if (!count) return null;
                    return (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">لم تُنجز أي إجراء بعد</p>
              )}
            </div>
          </div>
          );
        })()}

        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          {(Object.entries(SECTION_CONFIG) as [EmployeeSection, typeof SECTION_CONFIG[EmployeeSection]][])
            .filter(([key]) => key === "archive" || key === "tickets" || key === allowedSection)
            .sort(([a]) => a === allowedSection ? -1 : a === "tickets" ? 0 : 1)
            .map(([key, s], idx) => {
            const Icon = s.icon;
            const isActive = section === key;
            const pendingCount = key === "tickets"
              ? myTickets.length
              : key === "archive"
              ? requests.filter(r => r.status === "completed").length
              : key === "verification_center"
              ? requests.filter(r => r.status !== "completed" && r.status !== "referred" && r.assignedSection !== "beneficiary_services").length
              : key === "judicial"
              ? requests.filter(r => r.status === "referred" && r.referralSection === "judicial").length
              : key === "documents"
              ? requests.filter(r => r.status === "referred" && r.referralSection === "documents").length
              : key === "beneficiary_services"
              ? requests.filter(r => r.status !== "completed" && r.status !== "referred" && r.assignedSection === "beneficiary_services").length
              : requests.filter(r => r.status !== "completed" && r.status !== "referred").length;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSection(key)}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-[#187860] bg-[#187860]/[0.06]"
                    : "border-[#ebebeb] bg-white hover:border-[#187860]/30"
                }`}
                data-testid={`tab-section-${key}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`} style={{
                  background: isActive ? "#187860" : "rgba(24,120,96,0.08)",
                  color: isActive ? "white" : "#187860"
                }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold ${isActive ? "text-[#187860]" : "text-[#1F2937]"}`}>
                  {s.sectionTag}
                </span>
                {pendingCount > 0 && (
                  <span className="text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: "#187860" }}>
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {section === "tickets" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#187860]" />
                    <p className="font-bold text-[15px]">التذاكر والشكاوى</p>
                    {myTickets.length > 0 && (
                      <span className="text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "#187860" }}>
                        {myTickets.length}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setTickets(loadTickets()); toast({ title: "تم تحديث التذاكر" }); }} data-testid="button-refresh-tickets">
                    <RefreshCw className="w-4 h-4 me-1" />تحديث
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm mt-1">التذاكر المحالة إليك من المدير وشكاوى المستفيدين</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {myTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#187860]/[0.06] flex items-center justify-center mb-3">
                      <MessageSquare className="w-7 h-7 text-[#187860]/40" />
                    </div>
                    <p className="font-bold text-sm text-muted-foreground">لا توجد تذاكر حالياً</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا التذاكر المحالة إليك من المدير</p>
                  </div>
                ) : (
                  myTickets.map(ticket => {
                    const priorityColor = ticket.priority === "high" ? "#B42318" : ticket.priority === "medium" ? "#ec9a18" : "#187860";
                    const isComplaint = ticket.title?.includes("شكوى");
                    return (
                      <motion.div key={ticket.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border bg-white p-4 space-y-3" style={{ borderRight: `4px solid ${priorityColor}` }}
                        data-testid={`emp-ticket-${ticket.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${priorityColor}12` }}>
                              {isComplaint ? <AlertTriangle className="w-4 h-4" style={{ color: priorityColor }} /> : <MessageSquare className="w-4 h-4" style={{ color: priorityColor }} />}
                            </div>
                            <p className="font-semibold text-sm truncate">{ticket.title}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isComplaint && (
                              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#B42318]/10 text-[#B42318]">شكوى</span>
                            )}
                            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${priorityColor}15`, color: priorityColor }}>
                              {ticket.priority === "high" ? "عالية" : ticket.priority === "medium" ? "متوسطة" : "منخفضة"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-lg p-2.5">
                          <div><span className="text-muted-foreground">رقم الطلب: </span><span className="font-bold font-mono">{ticket.requestNumber}</span></div>
                          <div><span className="text-muted-foreground">نوع الطلب: </span><span className="font-bold">{ticket.requestType}</span></div>
                          <div><span className="text-muted-foreground">المستفيد: </span><span className="font-bold">{ticket.beneficiary}</span></div>
                          <div><span className="text-muted-foreground">التاريخ: </span><span className="font-bold">{ticket.date}</span></div>
                          {ticket.slaRemaining && (
                            <div className="col-span-2"><span className="text-muted-foreground">حالة الالتزام بالموعد: </span><span className="font-bold text-[#B42318]">{ticket.slaRemaining}</span></div>
                          )}
                        </div>
                        <p className="text-xs text-[#1F2937]/70 leading-relaxed">{ticket.description}</p>
                        {ticket.referralNote && (
                          <div className="rounded-lg bg-[#187860]/[0.04] border border-[#187860]/10 p-2.5">
                            <p className="text-[11px] text-[#187860] font-medium mb-0.5">ملاحظة المدير:</p>
                            <p className="text-xs leading-relaxed">{ticket.referralNote}</p>
                          </div>
                        )}
                        {ticket.employeeResponse && (
                          <div className="rounded-lg bg-muted/50 border p-2.5">
                            <p className="text-[11px] text-muted-foreground mb-0.5">ردك السابق:</p>
                            <p className="text-xs leading-relaxed">{ticket.employeeResponse}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="text-xs h-8 rounded-xl font-medium" style={{ background: "#187860", color: "white" }}
                            onClick={() => { setTicketActionId(ticket.id); setTicketActionType("resolve"); setTicketResponse(""); }}
                            data-testid={`button-resolve-emp-ticket-${ticket.id}`}>
                            <CheckCircle className="w-3 h-3 me-1" />حل التذكرة
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl font-medium border-[#187860]/30 text-[#187860]"
                            onClick={() => { setTicketActionId(ticket.id); setTicketActionType("respond"); setTicketResponse(""); }}
                            data-testid={`button-respond-emp-ticket-${ticket.id}`}>
                            <SendHorizontal className="w-3 h-3 me-1" />رد
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl font-medium border-[#ec9a18]/30 text-[#ec9a18]"
                            onClick={() => { setTicketActionId(ticket.id); setTicketActionType("return"); setTicketResponse(""); }}
                            data-testid={`button-return-emp-ticket-${ticket.id}`}>
                            <RotateCcw className="w-3 h-3 me-1" />إعادة للمدير
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (<>

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-muted-foreground text-sm">{cfg.sublabel}</p>
                  <div className="flex items-center gap-2">
                    {(section === "beneficiary_services" || section === "verification_center") && (
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all ${
                          showLiveMode
                            ? "bg-[#187860]/[0.06] text-[#187860]"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                        onClick={() => setShowLiveMode(!showLiveMode)}
                        data-testid="button-toggle-live"
                      >
                        <Zap className="w-3 h-3" />
                        {showLiveMode ? "مباشر" : "إيقاف"}
                      </div>
                    )}
                    <div className="flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5">
                      <button
                        className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setViewMode("list")} title="عرض قائمة" data-testid="button-view-list">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setViewMode("grid")} title="عرض شبكة" data-testid="button-view-grid">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleRefresh} data-testid="button-refresh">
                      <RefreshCw className={`w-4 h-4 me-1 ${isRefreshing ? "animate-spin" : ""}`} />
                      تحديث
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {overdueInSection > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-3 rounded-xl p-3 bg-[#B42318]/[0.04]"
                    data-testid="sla-alert-banner"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#B42318]/[0.08] flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-[#B42318]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#B42318] text-[13px]">
                        {overdueInSection} {overdueInSection === 1 ? "طلب تجاوز" : "طلبات تجاوزت"} الموعد النهائي
                      </p>
                      <p className="text-[#B42318]/80 text-xs">يُرجى معالجة هذه الطلبات فوراً</p>
                    </div>
                  </motion.div>
                )}

                {section !== "beneficiary_services" && section !== "verification_center" && sorted.length === 0 && !isRefreshing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-14">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${cfg.color}10` }}>
                      <cfg.icon className="w-8 h-8" style={{ color: cfg.color, opacity: 0.4 }} />
                    </div>
                    {section === "archive" ? (
                      <>
                        <p className="text-muted-foreground font-semibold">لا توجد طلبات مكتملة بعد</p>
                        <p className="text-muted-foreground/60 text-sm mt-1">ستظهر الطلبات المُغلقة هنا تلقائياً</p>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground font-semibold">لا توجد طلبات محالة إلى هذا القسم</p>
                        <p className="text-muted-foreground/60 text-sm mt-1">ستظهر الطلبات هنا عند إحالتها من قسم خدمات المستفيدين</p>
                      </>
                    )}
                  </motion.div>
                )}


                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => { setShowSearchBar(p => !p); if (showSearchBar) setSearchQuery(""); }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                              showSearchBar || searchQuery ? "bg-[#187860] text-white border-[#187860]" : "bg-white text-[#1F2937]/60 border-[#ebebeb] hover:border-[#187860]/30"
                            }`}
                            data-testid="button-toggle-search"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p className="text-xs">بحث</p></TooltipContent>
                      </Tooltip>

                      {section !== "archive" && ([
                        { value: "all", label: "الكل", icon: ClipboardList, color: "#187860" },
                        { value: "certified_copy", label: "نسخة مصدقة", icon: FileText, color: "#187860" },
                        { value: "case_review", label: "اطلاع", icon: Eye, color: "#187860" },
                        { value: "replacement_doc", label: "نسخة بديلة", icon: RotateCcw, color: "#075e4a" },
                      ] as const).map(opt => {
                        const Icon = opt.icon;
                        const isActive = filterType === opt.value;
                        return (
                          <Tooltip key={opt.value}>
                            <TooltipTrigger asChild>
                              <button onClick={() => setFilterType(opt.value)}
                                data-testid={`filter-type-${opt.value}`}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                  isActive
                                    ? "text-white border-transparent"
                                    : "bg-white text-[#1F2937]/60 border-[#ebebeb] hover:border-[#187860]/30"
                                }`}
                                style={isActive ? { background: opt.color } : {}}>
                                <Icon className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"><p className="text-xs">{opt.label}</p></TooltipContent>
                          </Tooltip>
                        );
                      })}

                      <div className="flex-1" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "sla" | "newest" | "oldest")}>
                              <SelectTrigger className="w-8 h-8 p-0 justify-center bg-white border-[#ebebeb] [&>svg:last-child]:hidden" data-testid="select-sort-order">
                                <Filter className="w-4 h-4 text-[#1F2937]/60" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sla">الأكثر إلحاحاً</SelectItem>
                                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p className="text-xs">ترتيب</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <span className="text-[11px] text-muted-foreground ms-1">
                      {sorted.length} طلب
                    </span>
                  </div>

                  <AnimatePresence>
                    {showSearchBar && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="relative">
                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input autoFocus placeholder="ابحث بالاسم أو رقم القضية أو رقم الطلب..."
                            className="ps-9 h-8 text-xs bg-white border-[#ebebeb]" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="input-employee-search" />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery("")}
                              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isRefreshing ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
                ) : (() => {
                  const urgentCount = sorted.filter(r => isOverSla(r.slaDeadline, r.status)).length;
                  const baseList = (urgentOnly && section !== "archive")
                    ? sorted.filter(r => isOverSla(r.slaDeadline, r.status))
                    : sorted;
                  const fullDisplayList = baseList;
                  const totalPages = Math.max(1, Math.ceil(fullDisplayList.length / PAGE_SIZE));
                  const safePage = Math.min(currentPage, totalPages);
                  const displayList = fullDisplayList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
                  return (
                    <div className="space-y-4">
                      {urgentCount > 0 && section !== "archive" && (
                        <button
                          onClick={() => setUrgentOnly(v => !v)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                            urgentOnly
                              ? "bg-[#ec9a18]/[0.10] border-[#ec9a18]/40 text-[#ec9a18]"
                              : "bg-[#ec9a18]/[0.04] border-[#ec9a18]/20 text-[#ec9a18] hover:bg-[#ec9a18]/[0.08]"
                          }`}
                          data-testid="button-toggle-urgent-only"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{urgentOnly ? `عرض جميع الطلبات` : `${urgentCount} طلب عاجل يتطلب معالجة فورية`}</span>
                          <span className="ms-auto text-[11px] underline">{urgentOnly ? "إلغاء" : "عرض العاجلة فقط"}</span>
                        </button>
                      )}

                      {fullDisplayList.length === 0 && (
                        <div className="text-center py-14 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>لا توجد طلبات مطابقة</p>
                          {(searchQuery || filterType !== "all" || urgentOnly) && (
                            <button onClick={() => { setSearchQuery(""); setFilterType("all"); setUrgentOnly(false); }}
                              className="text-xs mt-2 underline hover:text-foreground transition-colors">
                              إزالة الفلاتر
                            </button>
                          )}
                        </div>
                      )}

                      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                        <AnimatePresence>
                          {displayList.map(req => (
                            <RequestCard key={req.id} req={req}
                              onView={() => setSelectedRequest(req)}
                              onAction={actionCfg ? () => setActionRequest(req) : undefined}
                              actionLabel={actionCfg?.label} actionColor={actionCfg?.color}
                              showLive={showLiveMode}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                      <Pagination total={fullDisplayList.length} page={safePage} pageSize={PAGE_SIZE} onChange={setCurrentPage} testIdPrefix="employee-pagination" />
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        </>)}
      </main>

      <div className="fixed bottom-6 end-4 z-30 print:hidden">
        <div className="relative">
          <Button size="icon" className="w-12 h-12 rounded-full shadow-md"
            style={{ background: "#187860", color: "white" }}
            onClick={() => setShowTodos(v => !v)}
            data-testid="button-toggle-todos">
            <ClipboardList className="w-5 h-5" />
          </Button>
          {todos.filter(t => !t.done).length > 0 && (
            <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white" style={{ background: "#B42318" }}>
              {todos.filter(t => !t.done).length}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTodos && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 end-4 z-30 w-72 rounded-2xl border bg-card shadow-2xl overflow-hidden print:hidden"
            style={{ border: "1.5px solid rgba(24,120,96,0.3)" }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#187860" }}>
              <ClipboardList className="w-4 h-4 text-white" />
              <p className="font-bold text-white text-sm flex-1">مهامي ({todos.filter(t => !t.done).length} مفتوحة)</p>
              <button onClick={() => setShowTodos(false)}><X className="w-4 h-4 text-white/70" /></button>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {todos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد مهام بعد</p>}
              {todos.map(todo => (
                <div key={todo.id} className={`flex items-center gap-2 rounded-lg p-2 text-xs ${todo.done ? "opacity-50" : ""}`}
                  style={{ background: todo.priority === "high" && !todo.done ? "rgba(180,35,24,0.06)" : "rgba(24,120,96,0.05)", border: `1px solid ${todo.priority === "high" && !todo.done ? "rgba(180,35,24,0.15)" : "rgba(24,120,96,0.06)"}` }}>
                  <input type="checkbox" checked={todo.done}
                    onChange={() => setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: !t.done } : t))}
                    className="rounded" />
                  {todo.priority === "high" && !todo.done && <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: "#B42318" }} />}
                  <span className={`flex-1 ${todo.done ? "line-through" : ""}`}>{todo.text}</span>
                  <button onClick={() => setTodos(prev => prev.filter(t => t.id !== todo.id))}
                    className="text-muted-foreground hover:text-[#B42318]"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input placeholder="أضف مهمة..." value={todoInput} onChange={e => setTodoInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && todoInput.trim()) {
                    setTodos(prev => [{ id: Date.now().toString(), text: todoInput.trim(), done: false, createdAt: new Date().toISOString() }, ...prev]);
                    setTodoInput("");
                  }
                }}
                className="text-xs h-8 flex-1" data-testid="input-todo" />
              <Button size="sm" className="h-8 px-2" style={{ background: "#187860", color: "white" }}
                onClick={() => {
                  if (todoInput.trim()) {
                    setTodos(prev => [{ id: Date.now().toString(), text: todoInput.trim(), done: false, createdAt: new Date().toISOString() }, ...prev]);
                    setTodoInput("");
                  }
                }}
                data-testid="button-add-todo">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideClose>
          <DialogHeader><DialogTitle>تفاصيل الطلب</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">رقم الطلب</span>
                    <p className="font-bold text-lg font-mono">{selectedRequest.trackingNumber}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedRequest.trackingNumber)}
                      className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
                      data-testid="emp-copy-tracking"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RequestStatusBadge status={selectedRequest.status} />
                  <RequestTypePill type={selectedRequest.requestType} />
                </div>
              </div>

              {REQUEST_TYPE_LABELS[selectedRequest.requestType] && (
                <div className="rounded-xl p-3 text-sm leading-relaxed"
                  style={{
                    background: `${REQUEST_TYPE_LABELS[selectedRequest.requestType].color}10`,
                    border: `1px solid ${REQUEST_TYPE_LABELS[selectedRequest.requestType].color}25`,
                    color: REQUEST_TYPE_LABELS[selectedRequest.requestType].color,
                  }}>
                  <p className="font-bold mb-1 text-xs uppercase opacity-70">طبيعة الطلب</p>
                  <p>{REQUEST_TYPE_LABELS[selectedRequest.requestType].full}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "مقدم الطلب", value: selectedRequest.applicantName, copyable: false },
                  { label: "رقم الهوية", value: selectedRequest.applicantId, copyable: false },
                  { label: "الصفة", value: getApplicantTypeLabel(selectedRequest.applicantType), copyable: false },
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
                  { label: "الدائرة", value: getCircuitLabel(selectedRequest.circuit), copyable: false },
                  { label: "الجهة", value: selectedRequest.court || "-", copyable: false },
                ].map(({ label, value, copyable }) => (
                  <div key={label} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">{value}</p>
                      {copyable && value && value !== "-" && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(value); }}
                          className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
                          data-testid={`copy-${label}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedRequest.referredTo && (
                <div className="rounded-xl p-4 space-y-3 border border-[#187860]/25 dark:border-[#187860]"
                  style={{ background: "rgba(24,120,96,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#187860]/5 dark:bg-[#187860]/8">
                      <ArrowLeft className="w-4 h-4 text-[#187860] dark:text-[#ebebeb]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#187860] font-bold uppercase tracking-wide">إحالة للقسم المختص</p>
                      <p className="font-bold text-[#187860] dark:text-[#ebebeb] text-base">{selectedRequest.referredTo}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.attachedDocument && (
                <div className="rounded-xl p-3 bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06] border border-[#187860]/20 dark:border-[#187860]/30">
                  <p className="text-xs text-[#187860] mb-1 font-bold flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />المستند المرفق
                  </p>
                  <p className="font-semibold text-[#187860] dark:text-[#187860]">{selectedRequest.attachedDocument}</p>
                  {selectedRequest.attachedAt && <p className="text-xs text-[#187860]/70 mt-1">{selectedRequest.attachedAt}</p>}
                </div>
              )}

              {selectedRequest.fileAttachments && selectedRequest.fileAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold flex items-center gap-1"><Paperclip className="w-3 h-3" />مرفقات المستفيد:</p>
                  {selectedRequest.fileAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-[#ebebeb]/10 dark:bg-[#187860]/[0.04] border border-[#ebebeb]/25 px-3 py-2">
                      <FileText className="w-4 h-4 text-[#187860] flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{att.name}</span>
                      <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`emp-dl-ben-att-${idx}`}>
                        <Download className="w-3 h-3 me-1" />تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedRequest.employeeAttachments && selectedRequest.employeeAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold flex items-center gap-1"><Paperclip className="w-3 h-3" />مرفقات الموظف:</p>
                  {selectedRequest.employeeAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04] border border-[#187860]/20 px-3 py-2">
                      <FileText className="w-4 h-4 text-[#187860] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{att.name}</span>
                        <span className="text-[11px] text-muted-foreground">بواسطة: {att.uploadedBy} {att.uploadedAt}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`emp-dl-emp-att-${idx}`}>
                        <Download className="w-3 h-3 me-1" />تحميل
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedRequest.digitalStamp?.applied && (
                <div className="rounded-xl p-4 border border-[#187860]/20 bg-[#187860]/[0.03] space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#187860]" />
                    <h4 className="font-bold text-sm text-[#187860]">الاعتماد الرقمي</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#187860]/[0.06] rounded-lg p-2.5 border border-[#187860]/20">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Stamp className="w-3 h-3" /> الختم الإلكتروني
                      </div>
                      <p className="font-bold text-[#187860]">{selectedRequest.digitalStamp.circuitName}</p>
                      <p className="font-mono text-[11px] text-[#187860] mt-1" dir="ltr">{selectedRequest.digitalStamp.verificationCode}</p>
                    </div>
                    {selectedRequest.digitalSignature?.applied && (
                      <div className="bg-[#187860]/[0.06] rounded-lg p-2.5 border border-[#187860]/20">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Fingerprint className="w-3 h-3" /> التوقيع الرقمي
                        </div>
                        <p className="font-mono text-[9px] text-[#187860] break-all mt-1" dir="ltr">{selectedRequest.digitalSignature.hash}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div className="rounded-lg p-3 bg-muted/30">
                  <p className="text-muted-foreground text-xs mb-1">الملاحظات</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <p className="font-bold mb-4">مسار الطلب</p>
                <RequestTimeline events={selectedRequest.timeline} />
              </div>

              {actionHistory[selectedRequest.id]?.length > 0 && (
                <div className="border-t pt-4 mt-2">
                  <p className="font-bold text-sm mb-3 flex items-center gap-2 text-foreground">
                    <History className="w-4 h-4 text-muted-foreground" />
                    سجل الإجراءات ({actionHistory[selectedRequest.id].length})
                  </p>
                  <div className="space-y-2">
                    {actionHistory[selectedRequest.id].map((entry, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs rounded-xl p-3"
                        style={{ background: "rgba(24,120,96,0.05)", border: "1px solid rgba(24,120,96,0.06)" }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                          style={{ background: "#187860" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">{entry.label}</p>
                          <p className="text-muted-foreground mt-0.5">{entry.employeeName} {entry.time}</p>
                          {entry.note && (
                            <p className="mt-1 italic text-muted-foreground text-[11px] border-s-2 border-muted ps-2">"{entry.note}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 font-medium" onClick={() => setSelectedRequest(null)} data-testid="button-close-detail-bottom">إغلاق</Button>
                {actionCfg && (
                  <Button className="flex-1 font-medium" style={{ background: actionCfg.color, color: "white" }}
                    onClick={() => { setSelectedRequest(null); setActionRequest(selectedRequest); }}
                    data-testid="button-action-from-detail">
                    {actionCfg.label}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!actionRequest} onOpenChange={() => setActionRequest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
              {section === "verification_center" ? "تدقيق ومعالجة الطلب" : section === "beneficiary_services" ? "تنفيذ إجراء على الطلب" : "اعتماد الوثيقة وإعادة الطلب"}
            </DialogTitle>
          </DialogHeader>
          {actionRequest && section === "verification_center" && (
            <VerificationCenterModal
              request={actionRequest}
              onUpdate={handleUpdate}
              onClose={() => setActionRequest(null)}
              onLog={(action, trackingNumber, requestId, note) => {
                const time = new Date().toLocaleString("ar");
                setDailyActions(prev => [{ action, trackingNumber, time }, ...prev]);
                setActionHistory(prev => ({
                  ...prev,
                  [requestId]: [
                    { action, label: ACTION_LABELS[action] || action, time, employeeName: currentEmployee?.name || "موظف", note },
                    ...(prev[requestId] || []),
                  ],
                }));
              }}
            />
          )}
          {actionRequest && section === "beneficiary_services" && (
            <BeneficiaryServicesModal
              request={actionRequest}
              onUpdate={handleUpdate}
              onClose={() => setActionRequest(null)}
              onLog={(action, trackingNumber, requestId, note) => {
                const time = new Date().toLocaleString("ar");
                setDailyActions(prev => [{ action, trackingNumber, time }, ...prev]);
                setActionHistory(prev => ({
                  ...prev,
                  [requestId]: [
                    { action, label: ACTION_LABELS[action] || action, time, employeeName: currentEmployee?.name || "موظف", note },
                    ...(prev[requestId] || []),
                  ],
                }));
              }}
            />
          )}
          {actionRequest && section !== "beneficiary_services" && section !== "verification_center" && (
            <AttachAndReturnModal
              request={actionRequest}
              sectionLabel={cfg.label}
              section={section}
              onUpdate={handleUpdate}
              onClose={() => setActionRequest(null)}
              employeeName={currentEmployee?.name || "موظف"}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!ticketActionId && !!ticketActionType} onOpenChange={(open) => { if (!open) { setTicketActionId(null); setTicketActionType(null); setTicketResponse(""); } }}>
        <DialogContent className="max-w-md" dir="rtl" hideClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {ticketActionType === "resolve" && <><CheckCircle className="w-5 h-5 text-[#187860]" />حل التذكرة</>}
              {ticketActionType === "respond" && <><SendHorizontal className="w-5 h-5 text-[#187860]" />الرد على التذكرة</>}
              {ticketActionType === "return" && <><RotateCcw className="w-5 h-5 text-[#ec9a18]" />إعادة التذكرة للمدير</>}
            </DialogTitle>
          </DialogHeader>
          {ticketActionId && (() => {
            const ticket = tickets.find(t => t.id === ticketActionId);
            if (!ticket) return null;
            return (
              <div className="space-y-4">
                <div className="rounded-xl p-3 bg-muted/40 border">
                  <p className="font-semibold text-sm mb-1">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground">#{ticket.requestNumber} · {ticket.beneficiary}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {ticketActionType === "resolve" ? "ملاحظة الحل" : ticketActionType === "respond" ? "نص الرد" : "سبب الإعادة"}
                  </Label>
                  <Textarea
                    value={ticketResponse}
                    onChange={(e) => setTicketResponse(e.target.value)}
                    placeholder={
                      ticketActionType === "resolve" ? "أضف ملاحظة حول الحل..."
                      : ticketActionType === "respond" ? "اكتب ردك على التذكرة..."
                      : "اذكر سبب إعادة التذكرة للمدير..."
                    }
                    className="min-h-[100px] rounded-xl resize-none text-sm"
                    data-testid="textarea-ticket-response"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 font-medium h-11 rounded-xl" onClick={() => { setTicketActionId(null); setTicketActionType(null); setTicketResponse(""); }} data-testid="button-close-ticket-action">إغلاق</Button>
                  <Button
                    className="flex-1 font-medium h-11 rounded-xl"
                    style={{ background: ticketActionType === "return" ? "#ec9a18" : "#187860", color: "white" }}
                    disabled={!ticketResponse.trim()}
                    onClick={handleTicketAction}
                    data-testid="button-confirm-ticket-action"
                  >
                    {ticketActionType === "resolve" && <><CheckCircle className="w-4 h-4 me-2" />تأكيد الحل</>}
                    {ticketActionType === "respond" && <><SendHorizontal className="w-4 h-4 me-2" />إرسال الرد</>}
                    {ticketActionType === "return" && <><RotateCcw className="w-4 h-4 me-2" />إعادة للمدير</>}
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
