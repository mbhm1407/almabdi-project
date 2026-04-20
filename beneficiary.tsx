import { useState, useEffect, useRef, useMemo, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiApplepay } from "react-icons/si";
import { useLocation } from "wouter";
import MojFooter from "@/components/moj-footer";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus, Search, FileText, Download, Star, X, CheckCircle, CheckCircle2, AlertCircle, Clock,
  Paperclip, XCircle, Bell, BellOff, History, Share2, Printer,
  Copy, RefreshCw, Save, MessageCircle, CreditCard, Zap, Eye, ChevronRight,
  AlertTriangle, Timer, Users, ShieldCheck, Phone, Mail, LayoutGrid, List, Lock, SlidersHorizontal,
  ArrowDown, Landmark, CalendarDays, ChevronLeft, User, IdCard, UserCheck, MapPin, Globe
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RequestStatusBadge } from "@/components/request-status-badge";
import { RequestTimeline } from "@/components/request-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_REQUESTS, REQUEST_TYPES, APPLICANT_TYPES, MOCK_EMPLOYEES,
  getCircuitLabel, getRequestTypeLabel, getApplicantTypeLabel, formatDate, getSlaStatus, isOverSla,
  detectDuplicate, getSlaWithHolidays, getDepartmentSection,
  loadTickets, saveTickets,
  type Request, type RequestStatus, type RequestType, type Ticket
} from "@/lib/data";

function CertifiedCopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="2" />
      <rect x="8" y="6" width="12" height="16" rx="2" fill="white" />
      <path d="M12 14l2 2 4-4" strokeWidth="2" />
    </svg>
  );
}

function CaseReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6s2-2 5-2 5 2 5 2v14s-2-1-5-1-5 1-5 1V6z" />
      <path d="M12 6s2-2 5-2 5 2 5 2v14s-2-1-5-1-5 1-5 1V6z" />
    </svg>
  );
}

function ReplacementDocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="11" height="14" rx="2" />
      <rect x="9" y="8" width="11" height="14" rx="2" fill="white" />
      <path d="M15 4l3 3-3 3" strokeWidth="2" />
      <path d="M9 20l-3-3 3-3" strokeWidth="2" />
    </svg>
  );
}

const REQ_TYPE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  certified_copy: { icon: CertifiedCopyIcon, color: "#187860" },
  case_review: { icon: CaseReviewIcon, color: "#187860" },
  replacement_doc: { icon: ReplacementDocIcon, color: "#C7A86C" },
};

function RequestTypePill({ type }: { type: string }) {
  const cfg = REQ_TYPE_ICONS[type];
  const label = getRequestTypeLabel(type);
  if (!cfg) return <span className="text-xs text-muted-foreground">{label}</span>;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium"
      style={{ background: `${cfg.color}0c`, color: cfg.color }}>
      <Icon className="w-3 h-3 opacity-70" />
      {label}
    </span>
  );
}

const DRAFT_KEY = "moj_form_draft";
const REQUESTS_KEY = "moj_requests";
const DATA_VERSION_KEY = "moj_data_version";
const CURRENT_DATA_VERSION = "15";

function migrateStoredData() {
  const ver = localStorage.getItem(DATA_VERSION_KEY);
  if (ver !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }
}

const SAUDI_CITIES = [
  "الرياض","جدة","مكة المكرمة","المدينة المنورة","الدمام","الخبر","الظهران","الطائف",
  "أبها","خميس مشيط","تبوك","بريدة","عنيزة","حائل","الجبيل","الأحساء","القطيف",
  "نجران","جازان","ينبع","عرعر","سكاكا","الباحة","الخرج","الدوادمي","شقراء","زلفي",
  "الرس","المجمعة","حريملاء","ثادق","الغاط","الأفلاج","وادي الدواسر","بيشة",
  "القنفذة","رابغ","الليث","العلا","الوجه","ضبا","أملج","تيماء","عيون الجواء",
  "البدائع","البكيرية","الرياض الخبراء","المذنب","المندق","بلجرشي","القرى",
];

const SAUDI_COURTS: Record<string,string[]> = {
  "الرياض": ["المحكمة العامة بالرياض","محكمة الاستئناف بالرياض","المحكمة التجارية بالرياض","محكمة الأحوال الشخصية بالرياض","المحكمة الجزائية بالرياض","المحكمة العمالية بالرياض","محكمة التنفيذ بالرياض","كتابة العدل بالرياض","المحكمة العليا","ديوان الوزارة"],
  "جدة": ["المحكمة العامة بجدة","محكمة الاستئناف بجدة","المحكمة التجارية بجدة","محكمة الأحوال الشخصية بجدة","المحكمة الجزائية بجدة","محكمة التنفيذ بجدة","كتابة العدل بجدة"],
  "مكة المكرمة": ["المحكمة العامة بمكة المكرمة","محكمة الاستئناف بمكة المكرمة","محكمة الأحوال الشخصية بمكة المكرمة","محكمة التنفيذ بمكة المكرمة","كتابة العدل بمكة المكرمة"],
  "المدينة المنورة": ["المحكمة العامة بالمدينة المنورة","محكمة الأحوال الشخصية بالمدينة المنورة","المحكمة الجزائية بالمدينة المنورة","محكمة التنفيذ بالمدينة المنورة","كتابة العدل بالمدينة المنورة"],
  "الدمام": ["المحكمة العامة بالدمام","المحكمة التجارية بالدمام","محكمة الاستئناف بالدمام","المحكمة الجزائية بالدمام","محكمة التنفيذ بالدمام","كتابة العدل بالدمام"],
  "الخبر": ["المحكمة العامة بالخبر","محكمة الأحوال الشخصية بالخبر","كتابة العدل بالخبر"],
  "الطائف": ["المحكمة العامة بالطائف","محكمة الاستئناف بالطائف","المحكمة الجزائية بالطائف","محكمة التنفيذ بالطائف","كتابة العدل بالطائف"],
  "أبها": ["المحكمة العامة بأبها","محكمة الاستئناف بأبها","المحكمة الجزائية بأبها","محكمة التنفيذ بأبها","كتابة العدل بأبها"],
  "خميس مشيط": ["المحكمة العامة بخميس مشيط","محكمة الأحوال الشخصية بخميس مشيط","كتابة العدل بخميس مشيط"],
  "تبوك": ["المحكمة العامة بتبوك","محكمة الاستئناف بتبوك","المحكمة الجزائية بتبوك","محكمة التنفيذ بتبوك","كتابة العدل بتبوك"],
  "بريدة": ["المحكمة العامة ببريدة","محكمة الاستئناف ببريدة","المحكمة الجزائية ببريدة","محكمة التنفيذ ببريدة","كتابة العدل ببريدة"],
  "عنيزة": ["المحكمة العامة بعنيزة","كتابة العدل بعنيزة"],
  "حائل": ["المحكمة العامة بحائل","محكمة الاستئناف بحائل","المحكمة الجزائية بحائل","محكمة التنفيذ بحائل","كتابة العدل بحائل"],
  "الجبيل": ["المحكمة العامة بالجبيل","كتابة العدل بالجبيل"],
  "الأحساء": ["المحكمة العامة بالأحساء","محكمة الأحوال الشخصية بالأحساء","المحكمة الجزائية بالأحساء","محكمة التنفيذ بالأحساء","كتابة العدل بالأحساء"],
  "القطيف": ["المحكمة العامة بالقطيف","كتابة العدل بالقطيف"],
  "نجران": ["المحكمة العامة بنجران","محكمة الاستئناف بنجران","محكمة التنفيذ بنجران","كتابة العدل بنجران"],
  "جازان": ["المحكمة العامة بجازان","محكمة الاستئناف بجازان","المحكمة الجزائية بجازان","محكمة التنفيذ بجازان","كتابة العدل بجازان"],
  "ينبع": ["المحكمة العامة بينبع","محكمة الأحوال الشخصية بينبع","كتابة العدل بينبع"],
  "عرعر": ["المحكمة العامة بعرعر","محكمة الاستئناف بعرعر","كتابة العدل بعرعر"],
  "سكاكا": ["المحكمة العامة بسكاكا","محكمة الاستئناف بسكاكا","كتابة العدل بسكاكا"],
  "الباحة": ["المحكمة العامة بالباحة","محكمة الاستئناف بالباحة","كتابة العدل بالباحة"],
};
const DEFAULT_COURTS = ["المحكمة العامة","محكمة الأحوال الشخصية","المحكمة الجزائية","المحكمة العمالية","محكمة التنفيذ","كتابة العدل"];

function getCircuitsForCourt(court: string): { value: string; label: string }[] {
  const base = [{ value: "documents", label: "قسم الوثائق والمحفوظات" }];
  if (court.includes("التجارية")) {
    return [...base, ...Array.from({ length: 12 }, (_, i) => ({ value: `commercial_${i + 1}`, label: `الدائرة التجارية ${i + 1}` }))];
  }
  if (court.includes("الأحوال الشخصية")) {
    return [...base, ...Array.from({ length: 8 }, (_, i) => ({ value: `family_${i + 1}`, label: `دائرة الأحوال الشخصية ${i + 1}` }))];
  }
  if (court.includes("الجزائية")) {
    return [...base,
      ...Array.from({ length: 10 }, (_, i) => ({ value: `criminal_${i + 1}`, label: `الدائرة الجزائية ${i + 1}` })),
    ];
  }
  if (court.includes("العمالية")) {
    return [...base, ...Array.from({ length: 8 }, (_, i) => ({ value: `labor_${i + 1}`, label: `الدائرة العمالية ${i + 1}` }))];
  }
  if (court.includes("الاستئناف")) {
    return [...base,
      ...Array.from({ length: 6 }, (_, i) => ({ value: `appeal_general_${i + 1}`, label: `دائرة الاستئناف العامة ${i + 1}` })),
      ...Array.from({ length: 4 }, (_, i) => ({ value: `appeal_criminal_${i + 1}`, label: `دائرة الاستئناف الجزائية ${i + 1}` })),
      ...Array.from({ length: 3 }, (_, i) => ({ value: `appeal_family_${i + 1}`, label: `دائرة استئناف الأحوال الشخصية ${i + 1}` })),
      ...Array.from({ length: 3 }, (_, i) => ({ value: `appeal_commercial_${i + 1}`, label: `دائرة الاستئناف التجارية ${i + 1}` })),
    ];
  }
  if (court.includes("التنفيذ")) {
    return [...base,
      ...Array.from({ length: 10 }, (_, i) => ({ value: `execution_${i + 1}`, label: `دائرة التنفيذ ${i + 1}` })),
    ];
  }
  if (court.includes("كتابة العدل")) {
    return [...base,
      ...Array.from({ length: 6 }, (_, i) => ({ value: `notary_${i + 1}`, label: `الدائرة التوثيقية ${i + 1}` })),
      { value: "notary_endorsement", label: "دائرة التصديقات" },
      { value: "notary_agencies", label: "دائرة الوكالات والإقرارات" },
      { value: "notary_realestate", label: "دائرة الإفراغات العقارية" },
    ];
  }
  if (court === "المحكمة العليا") {
    return [
      { value: "supreme_general", label: "الدائرة العامة" },
      ...Array.from({ length: 5 }, (_, i) => ({ value: `supreme_criminal_${i + 1}`, label: `الدائرة الجزائية ${i + 1}` })),
      ...Array.from({ length: 4 }, (_, i) => ({ value: `supreme_family_${i + 1}`, label: `دائرة الأحوال الشخصية ${i + 1}` })),
      ...Array.from({ length: 3 }, (_, i) => ({ value: `supreme_commercial_${i + 1}`, label: `الدائرة التجارية ${i + 1}` })),
      ...Array.from({ length: 3 }, (_, i) => ({ value: `supreme_labor_${i + 1}`, label: `الدائرة العمالية ${i + 1}` })),
    ];
  }
  if (court === "ديوان الوزارة") {
    return [{ value: "documents", label: "قسم الوثائق والمحفوظات" }];
  }
  return [...base,
    ...Array.from({ length: 33 }, (_, i) => ({ value: `general_${i + 1}`, label: `الدائرة القضائية العامة ${i + 1}` })),
    ...Array.from({ length: 4 }, (_, i) => ({ value: `partial_${i + 1}`, label: `الدائرة الجزئية ${i + 1}` })),
    ...Array.from({ length: 4 }, (_, i) => ({ value: `traffic_${i + 1}`, label: `الدائرة المرورية ${i + 1}` })),
  ];
}

const HIJRI_MONTHS_AR = ["المحرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const WEEKDAYS_AR = ["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
const GREG_MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function getHijriParts(date: Date) {
  const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const p = f.formatToParts(date);
  return {
    day: parseInt(p.find(x => x.type === 'day')!.value),
    month: parseInt(p.find(x => x.type === 'month')!.value),
    year: parseInt(p.find(x => x.type === 'year')!.value),
  };
}

function HijriDatePicker({ value, onChange, testId, hasError }: { value: string; onChange: (v: string) => void; testId?: string; hasError?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isHijri, setIsHijri] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = firstOfMonth.getDay();

  const hijriHeader = getHijriParts(firstOfMonth);
  const hijriEnd = getHijriParts(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0));

  const headerText = isHijri
    ? hijriHeader.month === hijriEnd.month
      ? `${HIJRI_MONTHS_AR[hijriHeader.month - 1]} ${hijriHeader.year} هـ`
      : `${HIJRI_MONTHS_AR[hijriHeader.month - 1]} / ${HIJRI_MONTHS_AR[hijriEnd.month - 1]} ${hijriHeader.year} هـ`
    : `${GREG_MONTHS_AR[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDate = (dayNum: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    const h = getHijriParts(selected);
    const hijriStr = `${h.year}/${String(h.month).padStart(2, "0")}/${String(h.day).padStart(2, "0")}`;
    onChange(hijriStr);
    setOpen(false);
  };

  const displayValue = (() => {
    if (!value) return "";
    const parts = value.split("/");
    if (parts.length !== 3) return value;
    const mIdx = parseInt(parts[1]) - 1;
    return `${parseInt(parts[2])} ${HIJRI_MONTHS_AR[mIdx] || ""} ${parts[0]} هـ`;
  })();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-testid={testId}
        className={`w-full flex items-center justify-between gap-2 py-3 px-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#187860]/20 ${hasError ? "border-[#B42318] ring-2 ring-[#B42318]/20" : "border-[#ebebeb] hover:border-[#187860]/30"}`}
      >
        <span className={displayValue ? "text-[#1F2937]" : "text-[#1F2937]/40"}>
          {displayValue || "اختر التاريخ"}
        </span>
        <CalendarDays className="w-4 h-4 text-[#1F2937]/30" />
      </button>

      {open && (
        <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:top-full sm:translate-y-0 sm:mt-2 sm:w-full bg-white rounded-2xl shadow-2xl border border-[#ebebeb] p-4 max-w-sm mx-auto sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors">
              <ChevronRight className="w-4 h-4 text-[#1F2937]/50" />
            </button>
            <p className="text-sm font-bold text-[#1F2937]">{headerText}</p>
            <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#1F2937]/50" />
            </button>
          </div>

          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-lg bg-[#FAFAFA] p-0.5">
              <button type="button" onClick={() => setIsHijri(true)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${isHijri ? "bg-[#187860] text-white shadow-sm" : "text-[#1F2937]/50 hover:text-[#1F2937]"}`}>
                هجري
              </button>
              <button type="button" onClick={() => setIsHijri(false)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${!isHijri ? "bg-[#187860] text-white shadow-sm" : "text-[#1F2937]/50 hover:text-[#1F2937]"}`}>
                ميلادي
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS_AR.map(d => (
              <div key={d} className="text-center text-[11px] text-[#1F2937]/30 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
              const h = getHijriParts(date);
              const hijriStr = `${h.year}/${String(h.month).padStart(2, "0")}/${String(h.day).padStart(2, "0")}`;
              const isSelected = value === hijriStr;
              const isToday = new Date().toDateString() === date.toDateString();
              const primary = isHijri ? h.day : dayNum;
              const secondary = isHijri ? dayNum : h.day;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => selectDate(dayNum)}
                  className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl text-xs transition-all
                    ${isSelected ? "bg-[#187860] text-white shadow-sm" : isToday ? "bg-[#187860]/[0.07] text-[#187860] font-bold" : "text-[#1F2937] hover:bg-[#FAFAFA]"}`}
                >
                  <span className="font-medium leading-none">{primary}</span>
                  <span className={`text-[8px] leading-none mt-0.5 ${isSelected ? "text-white/60" : "text-[#1F2937]/25"}`}>{secondary}</span>
                </button>
              );
            })}
          </div>

          {value && (
            <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
              <p className="text-[11px] text-[#1F2937]/40">{displayValue}</p>
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-[11px] text-[#B42318]/60 hover:text-[#B42318]">مسح</button>
            </div>
          )}
        </motion.div>
        </>
      )}
    </div>
  );
}

const _empIdToName = new Map(MOCK_EMPLOYEES.map(e => [e.id, e.name]));
function resolveEmployeeName(req: Request): Request {
  if (req.assignedTo && _empIdToName.has(req.assignedTo)) {
    return { ...req, assignedTo: _empIdToName.get(req.assignedTo)! };
  }
  return req;
}

function loadRequests(): Request[] {
  try {
    migrateStoredData();
    const stored = localStorage.getItem(REQUESTS_KEY);
    return stored ? JSON.parse(stored).map(resolveEmployeeName) : [];
  } catch { return []; }
}

function saveRequests(reqs: Request[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
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

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function generateCertifiedDocument(request: Request) {
  const trackingUrl = `${window.location.origin}/track/${request.trackingNumber}`;
  const qrSvgInline = renderToStaticMarkup(createElement(QRCodeSVG, { value: trackingUrl, size: 150, fgColor: "#187860", level: "M" }));
  const stamp = request.digitalStamp;
  const sig = request.digitalSignature;
  const typeLabel = getRequestTypeLabel(request.requestType);
  const circuitLabel = getCircuitLabel(request.circuit);
  const now = new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>وثيقة رسمية ${request.trackingNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Droid+Arabic+Kufi:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Droid Arabic Kufi', sans-serif; background: white; color: #1F2937; padding: 40px; }
  .page { max-width: 700px; margin: 0 auto; border: 3px solid #187860; padding: 40px; position: relative; }
  .page::before { content: ''; position: absolute; top: 5px; left: 5px; right: 5px; bottom: 5px; border: 1px solid #075e4a; pointer-events: none; }
  .header { text-align: center; border-bottom: 2px solid #187860; padding-bottom: 20px; margin-bottom: 25px; }
  .header h1 { font-size: 22px; font-weight: 900; color: #187860; margin-bottom: 4px; }
  .header h2 { font-size: 14px; font-weight: 600; color: #666; }
  .header .logo-row { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px; }
  .header .emblem { width: 60px; height: 60px; border-radius: 50%; background: #187860; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; }
  .doc-title { text-align: center; background: #ebebeb; border: 1px solid #075e4a; border-radius: 8px; padding: 12px; margin-bottom: 25px; }
  .doc-title h3 { font-size: 16px; font-weight: 800; color: #187860; }
  .doc-title p { font-size: 11px; color: #888; margin-top: 3px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
  .info-item { background: #ebebeb; border: 1px solid #ebebeb; border-radius: 6px; padding: 10px; }
  .info-item .label { font-size: 10px; color: #888; margin-bottom: 3px; }
  .info-item .value { font-size: 13px; font-weight: 700; }
  .info-full { grid-column: span 2; }
  .stamp-section { margin-top: 30px; border-top: 2px dashed #075e4a; padding-top: 25px; }
  .stamp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .stamp-box { border: 2px solid #187860; border-radius: 12px; padding: 15px; text-align: center; position: relative; }
  .stamp-box::after { content: 'مُعتمد'; position: absolute; top: -10px; right: 15px; background: #187860; color: white; font-size: 9px; font-weight: 800; padding: 2px 10px; border-radius: 10px; }
  .stamp-box h4 { font-size: 12px; font-weight: 800; color: #187860; margin-bottom: 8px; }
  .stamp-box .code { font-family: monospace; font-size: 14px; font-weight: 700; color: #187860; background: #ebebeb; border: 1px solid #187860; border-radius: 6px; padding: 6px 12px; display: inline-block; letter-spacing: 2px; }
  .stamp-box .date { font-size: 10px; color: #666; margin-top: 6px; }
  .sig-box { border: 2px solid #187860; border-radius: 12px; padding: 15px; text-align: center; position: relative; }
  .sig-box::after { content: 'مُوقّع'; position: absolute; top: -10px; right: 15px; background: #187860; color: white; font-size: 9px; font-weight: 800; padding: 2px 10px; border-radius: 10px; }
  .sig-box h4 { font-size: 12px; font-weight: 800; color: #187860; margin-bottom: 8px; }
  .sig-box .hash { font-family: monospace; font-size: 10px; color: #187860; background: #ebebeb; border: 1px solid #187860; border-radius: 6px; padding: 6px 8px; word-break: break-all; direction: ltr; }
  .sig-box .date { font-size: 10px; color: #666; margin-top: 6px; }
  .qr-section { text-align: center; margin-top: 25px; padding: 15px; background: #ebebeb; border-radius: 8px; border: 1px solid #ebebeb; }
  .qr-section svg { width: 150px; height: 150px; max-width: 150px; display: inline-block; }
  .qr-section p { font-size: 10px; color: #888; margin-top: 5px; }
  .qr-section .tracking { font-family: monospace; font-size: 14px; font-weight: 800; color: #187860; }
  .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ebebeb; }
  .footer p { font-size: 9px; color: #aaa; }
  .watermark-grid { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .watermark-grid span { display: block; white-space: nowrap; font-size: 28px; font-weight: 900; color: rgba(24,120,96,0.045); transform: rotate(-35deg); line-height: 80px; letter-spacing: 8px; }
  .page > *:not(.watermark-grid) { position: relative; z-index: 1; }
  @media print { body { padding: 0; } .page { border-width: 2px; } .watermark-grid span { color: rgba(24,120,96,0.04); } @page { margin: 15mm; } }
  @media (max-width: 500px) { body { padding: 15px; } .page { padding: 20px; } .header h1 { font-size: 16px; } .info-grid { grid-template-columns: 1fr; } .stamp-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="page">
  <div class="watermark-grid">
    ${Array(12).fill(0).map(() => `<span>${escapeHtml(request.applicantName)} &nbsp;&nbsp;&nbsp; ${escapeHtml(request.applicantName)} &nbsp;&nbsp;&nbsp; ${escapeHtml(request.applicantName)} &nbsp;&nbsp;&nbsp; ${escapeHtml(request.applicantName)}</span>`).join("\n    ")}
  </div>
  <div class="header">
    <div class="logo-row">
      <div class="emblem"></div>
    </div>
    <h1>وزارة العدل المملكة العربية السعودية</h1>
    <h2>${escapeHtml(request.court || "المحكمة العامة")}</h2>
  </div>

  <div class="doc-title">
    <h3>${escapeHtml(typeLabel)}</h3>
    <p>وثيقة رسمية صادرة إلكترونياً ${escapeHtml(now)}</p>
  </div>

  <div class="info-grid">
    <div class="info-item"><div class="label">رقم الطلب</div><div class="value" style="font-family:monospace">${escapeHtml(request.trackingNumber)}</div></div>
    <div class="info-item"><div class="label">تاريخ التقديم</div><div class="value">${escapeHtml(formatDate(request.createdAt))}</div></div>
    <div class="info-item"><div class="label">مقدم الطلب</div><div class="value">${escapeHtml(request.applicantName)}</div></div>
    <div class="info-item"><div class="label">رقم الهوية</div><div class="value" style="font-family:monospace">${escapeHtml(request.applicantId)}</div></div>
    ${request.requestType === "replacement_doc"
      ? `<div class="info-item"><div class="label">رقم الصك</div><div class="value">${escapeHtml(request.judgmentNumber || "-")}</div></div>`
      : `<div class="info-item"><div class="label">رقم القضية</div><div class="value">${escapeHtml(request.caseNumber)}</div></div>`
    }
    <div class="info-item"><div class="label">القسم</div><div class="value">${escapeHtml(circuitLabel)}</div></div>
    ${request.requestType !== "replacement_doc" && request.judgmentNumber ? `<div class="info-item"><div class="label">رقم الصك</div><div class="value">${escapeHtml(request.judgmentNumber)}</div></div>` : ''}
    ${request.requestType === "replacement_doc" && request.caseNumber ? `<div class="info-item"><div class="label">رقم القضية</div><div class="value">${escapeHtml(request.caseNumber)}</div></div>` : ''}
    ${request.judgmentDate ? `<div class="info-item"><div class="label">تاريخ الحكم</div><div class="value">${escapeHtml(request.judgmentDate)} هـ</div></div>` : ''}
    ${request.attachedDocument ? `<div class="info-item info-full"><div class="label">المستند المرفق</div><div class="value">${escapeHtml(request.attachedDocument)}</div></div>` : ''}
  </div>

  ${stamp || sig ? `<div class="stamp-section">
    <div class="stamp-grid">
      ${stamp?.applied ? `<div class="stamp-box">
        <h4>الختم الإلكتروني الرسمي</h4>
        <p style="font-size:11px; color:#666; margin-bottom:6px">${escapeHtml(stamp.circuitName || circuitLabel)}</p>
        <div class="code">${escapeHtml(stamp.verificationCode)}</div>
        <p class="date">تاريخ الختم: ${escapeHtml(stamp.stampDate)}</p>
      </div>` : ''}
      ${sig?.applied ? `<div class="sig-box">
        <h4>التوقيع الرقمي المشفّر</h4>
        <p style="font-size:11px; color:#666; margin-bottom:6px">مشفّر رقمياً</p>
        <div class="hash">${escapeHtml(sig.hash)}</div>
        <p class="date">تاريخ التوقيع: ${escapeHtml(sig.signDate)}</p>
      </div>` : ''}
    </div>
  </div>` : ''}

  <div class="qr-section">
    <p style="margin-bottom:8px; font-weight:700; color:#333;">رمز التحقق الإلكتروني</p>
    ${qrSvgInline}
    <p class="tracking">${request.trackingNumber}</p>
    <p>يمكن التحقق من صحة هذه الوثيقة عبر مسح رمز التحقق أو زيارة:</p>
    <p style="font-family:monospace; color:#187860; font-weight:700; direction:ltr;">${trackingUrl}</p>
  </div>

  <div class="footer">
    <p>هذه الوثيقة صادرة إلكترونياً من نظام وزارة العدل ولا تحتاج إلى توقيع يدوي</p>
    <p>جميع الحقوق محفوظة © ${new Date().getFullYear()} وزارة العدل، المملكة العربية السعودية</p>
  </div>
</div>

<script>
  window.onload = function() { setTimeout(function() { window.print(); }, 300); };
<\/script>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

function openCaseReviewViewer(request: Request, onViewed: () => void) {
  const typeLabel = getRequestTypeLabel(request.requestType);
  const circuitLabel = getCircuitLabel(request.circuit);
  const now = new Date().toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>اطلاع ${request.trackingNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Droid+Arabic+Kufi:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Droid Arabic Kufi', sans-serif; background: #ebebeb; color: #1F2937; padding: 30px;
    -webkit-user-select: none; -moz-user-select: none; user-select: none;
    -webkit-touch-callout: none; }
  .page { max-width: 700px; margin: 0 auto; border: 2px solid #ebebeb; padding: 40px; position: relative; background: white; overflow: hidden; }
  .header { text-align: center; border-bottom: 2px solid #ebebeb; padding-bottom: 20px; margin-bottom: 25px; }
  .header h1 { font-size: 20px; font-weight: 900; color: #187860; margin-bottom: 4px; }
  .header h2 { font-size: 13px; font-weight: 600; color: #999; }
  .header .emblem { width: 50px; height: 50px; border-radius: 50%; background: #187860; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; margin: 0 auto 10px; }
  .badge-view { text-align: center; background: #B42318; color: white; border-radius: 8px; padding: 10px; margin-bottom: 25px; font-weight: 800; font-size: 13px; }
  .doc-title { text-align: center; background: #ebebeb; border: 1px solid #ebebeb; border-radius: 8px; padding: 12px; margin-bottom: 25px; }
  .doc-title h3 { font-size: 15px; font-weight: 800; color: #187860; }
  .doc-title p { font-size: 11px; color: #888; margin-top: 3px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
  .info-item { background: #ebebeb; border: 1px solid #ebebeb; border-radius: 6px; padding: 10px; }
  .info-item .label { font-size: 10px; color: #888; margin-bottom: 3px; }
  .info-item .value { font-size: 13px; font-weight: 700; }
  .doc-section { margin: 25px 0; }
  .sec-title { font-size: 13px; font-weight: 800; color: #187860; border-bottom: 1px solid #ebebeb; padding-bottom: 8px; margin-bottom: 12px; }
  .att-card { background: #fafafa; border: 1px solid #ebebeb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
  .att-card .att-name { font-size: 12px; font-weight: 700; color: #1F2937; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
  .att-card .att-meta { font-size: 10px; color: #888; }
  .att-card img { width: 100%; height: auto; max-height: 600px; object-fit: contain; border-radius: 4px; background: white; pointer-events: none; display: block; }
  .att-card iframe { width: 100%; height: 600px; border: none; border-radius: 4px; background: white; }
  .att-card .att-fallback { padding: 20px; text-align: center; color: #888; font-size: 12px; background: white; border-radius: 4px; }
  .watermark-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; z-index: 10; }
  .watermark-overlay span { display: block; white-space: nowrap; font-size: 22px; font-weight: 900; color: rgba(180,35,24,0.09); transform: rotate(-35deg); line-height: 65px; letter-spacing: 5px; }
  .page > *:not(.watermark-overlay) { position: relative; z-index: 1; }
  .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ebebeb; }
  .footer p { font-size: 9px; color: #aaa; }
  .no-print { }
  @media print {
    * { display: none !important; visibility: hidden !important; }
    html, body { background: white !important; }
    html::after { content: "الطباعة غير مسموح بها لوثائق الاطلاع"; display: block !important; visibility: visible !important; text-align: center; font-size: 24px; font-weight: 900; color: #B42318; padding-top: 200px; font-family: 'Droid Arabic Kufi', sans-serif; }
  }
  .screenshot-guard { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999; background: white; display: none; align-items: center; justify-content: center; }
  .screenshot-guard.active { display: flex !important; }
  .screenshot-guard p { font-size: 20px; font-weight: 900; color: #B42318; font-family: 'Droid Arabic Kufi', sans-serif; }
  @media (max-width: 500px) { body { padding: 12px; } .page { padding: 20px; } .header h1 { font-size: 16px; } .info-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body oncontextmenu="return false">
<div class="page">
  <div class="watermark-overlay">
    ${Array(14).fill(0).map(() => `<span>هذه الوثيقة غير معتمدة &nbsp;&nbsp; هذه الوثيقة غير معتمدة &nbsp;&nbsp; هذه الوثيقة غير معتمدة</span>`).join("\n    ")}
  </div>
  <div class="header">
    <div class="emblem"></div>
    <h1>وزارة العدل المملكة العربية السعودية</h1>
    <h2>${escapeHtml(request.court || "المحكمة العامة")}</h2>
  </div>

  <div class="badge-view">للاطلاع فقط - هذه الوثيقة غير معتمدة ولا تُعدّ نسخة رسمية</div>

  <div class="doc-title">
    <h3>${escapeHtml(typeLabel)}</h3>
    <p>عرض للاطلاع فقط ${escapeHtml(now)}</p>
  </div>

  <div class="info-grid">
    <div class="info-item"><div class="label">رقم الطلب</div><div class="value" style="font-family:monospace">${escapeHtml(request.trackingNumber)}</div></div>
    <div class="info-item"><div class="label">تاريخ التقديم</div><div class="value">${escapeHtml(formatDate(request.createdAt))}</div></div>
    <div class="info-item"><div class="label">مقدم الطلب</div><div class="value">${escapeHtml(request.applicantName)}</div></div>
    <div class="info-item"><div class="label">رقم الهوية</div><div class="value" style="font-family:monospace">${escapeHtml(request.applicantId)}</div></div>
    ${request.requestType === "replacement_doc"
      ? `<div class="info-item"><div class="label">رقم الصك</div><div class="value">${escapeHtml(request.judgmentNumber || "-")}</div></div>`
      : `<div class="info-item"><div class="label">رقم القضية</div><div class="value">${escapeHtml(request.caseNumber)}</div></div>`
    }
    <div class="info-item"><div class="label">القسم</div><div class="value">${escapeHtml(circuitLabel)}</div></div>
    ${request.requestType !== "replacement_doc" && request.judgmentNumber ? `<div class="info-item"><div class="label">رقم الصك</div><div class="value">${escapeHtml(request.judgmentNumber)}</div></div>` : ''}
    ${request.requestType === "replacement_doc" && request.caseNumber ? `<div class="info-item"><div class="label">رقم القضية</div><div class="value">${escapeHtml(request.caseNumber)}</div></div>` : ''}
    ${request.judgmentDate ? `<div class="info-item"><div class="label">تاريخ الحكم</div><div class="value">${escapeHtml(request.judgmentDate)} هـ</div></div>` : ''}
  </div>

  ${(request.employeeAttachments && request.employeeAttachments.length > 0) ? `
  <div class="doc-section">
    <div class="sec-title">محتوى الوثيقة (${request.employeeAttachments.length} مرفق)</div>
    ${request.employeeAttachments.map((att) => {
      const isImg = (att.type || "").startsWith("image/");
      const isPdf = (att.type || "").includes("pdf");
      let inner = "";
      if (isImg && att.data) {
        inner = `<img src="${att.data}" alt="${escapeHtml(att.name)}" oncontextmenu="return false" draggable="false">`;
      } else if (isPdf && att.data) {
        inner = `<iframe src="${att.data}#toolbar=0&navpanes=0" sandbox="allow-same-origin"></iframe>`;
      } else {
        inner = `<div class="att-fallback">لا يمكن عرض هذا النوع من الملفات (${escapeHtml(att.type || "غير معروف")})</div>`;
      }
      return `
      <div class="att-card">
        <div class="att-name"><span>${escapeHtml(att.name)}</span><span class="att-meta">${(att.size/1024).toFixed(0)} KB</span></div>
        <div class="att-meta" style="margin-bottom:8px">بواسطة: ${escapeHtml(att.uploadedBy)} ${escapeHtml(att.uploadedAt)}</div>
        ${inner}
      </div>`;
    }).join("\n    ")}
  </div>
  ` : ''}

  <div class="footer">
    <p>هذه النسخة للاطلاع فقط ولا تُعتمد كوثيقة رسمية لا يجوز استخدامها لأي غرض قانوني</p>
    <p>جميع الحقوق محفوظة © ${new Date().getFullYear()} وزارة العدل، المملكة العربية السعودية</p>
  </div>
</div>

<div class="no-print" style="text-align:center; padding: 15px; font-family:'Droid Arabic Kufi',sans-serif;">
  <div style="background:rgba(236,154,24,0.06); border:1px solid rgba(236,154,24,0.2); border-radius:12px; padding:15px; max-width:500px; margin:0 auto;">
    <p style="font-size:13px; font-weight:800; color:#B42318; margin-bottom:5px;">وثيقة محمية للاطلاع فقط</p>
    <p style="font-size:11px; color:#1F2937;">الطباعة وتصوير الشاشة <strong>غير مسموح بهما</strong> لهذه الوثيقة</p>
  </div>
</div>

<div class="screenshot-guard" id="ssGuard">
  <p>تصوير الشاشة غير مسموح به</p>
</div>

<script>
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); e.stopImmediatePropagation(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); return false; }
    if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
      e.preventDefault();
      document.getElementById('ssGuard').classList.add('active');
      setTimeout(function() { document.getElementById('ssGuard').classList.remove('active'); }, 3000);
      return false;
    }
  }, true);
  document.addEventListener('copy', function(e) { e.preventDefault(); });
  document.addEventListener('beforeprint', function(e) { e.preventDefault && e.preventDefault(); });

  var guard = document.getElementById('ssGuard');
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      guard.classList.add('active');
    } else {
      setTimeout(function() { guard.classList.remove('active'); }, 800);
    }
  });

  window.addEventListener('blur', function() {
    guard.classList.add('active');
  });
  window.addEventListener('focus', function() {
    setTimeout(function() { guard.classList.remove('active'); }, 500);
  });
<\/script>
</body>
</html>`;

  const viewWindow = window.open("", "_blank");
  if (viewWindow) {
    viewWindow.document.write(html);
    viewWindow.document.close();
    onViewed();
  }
}

function requestBrowserNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.png" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body, icon: "/favicon.png" });
    });
  }
}

function PaymentModal({ price, onPay, onClose }: { price: string; onPay: () => void; onClose: () => void }) {
  const [method, setMethod] = useState<"mada" | "sadad" | "applepay" | "">("");
  const [processing, setProcessing] = useState(false);
  const handlePay = () => {
    if (!method) return;
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onPay(); }, 2200);
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-center bg-[#187860]/[0.04] border border-[#187860]/10">
        <p className="text-[#1F2937]/50 text-[11px] mb-1">المبلغ المستحق</p>
        <p className="text-2xl font-bold text-[#187860] tracking-tight">{price}</p>
        <p className="text-[#1F2937]/40 text-[11px] mt-1">رسوم خدمة وزارة العدل</p>
      </div>
      <div>
        <p className="font-medium text-[12px] mb-2.5 text-foreground/70">اختر طريقة الدفع</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "mada", label: "مدى", desc: "بطاقة البنك السعودي", icon: CreditCard as any },
            { id: "sadad", label: "سداد", desc: "خدمة الدفع الإلكتروني", icon: Landmark as any },
            { id: "applepay", label: "آبل باي", desc: "الدفع السريع", icon: null },
          ].map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id as any)}
              className={`rounded-xl p-3 text-center transition-all duration-200 ${method === m.id ? "bg-[#187860]/[0.04] border border-[#187860]/30 shadow-sm" : "bg-white border border-[#e8e8e8] hover:border-[#187860]/20"}`}
              data-testid={`button-payment-${m.id}`}>
              {m.icon ? (
                <div className="flex justify-center mb-1">
                  {createElement(m.icon, { className: "w-5 h-5 text-[#187860]" })}
                </div>
              ) : (
                <div className="flex justify-center mb-1">
                  <SiApplepay className="w-6 h-6 text-black dark:text-white" />
                </div>
              )}
              <p className="font-medium text-[11px] text-foreground">{m.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5 pt-1">
        <Button variant="outline" className="flex-[0.8] h-10 rounded-xl border-[#e8e8e8] font-medium text-[13px]" onClick={onClose}>إلغاء</Button>
        <Button className="flex-[1.2] h-10 font-medium text-[13px] rounded-xl" style={{ background: "#187860", color: "white" }}
          disabled={!method || processing} onClick={handlePay} data-testid="button-confirm-payment">
          {processing ? (
            <span className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" />جاري المعالجة...</span>
          ) : (
            <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" />دفع آمن</span>
          )}
        </Button>
      </div>
      <p className="text-center text-[11px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />جميع المعاملات مشفّرة ومؤمّنة
      </p>
    </div>
  );
}

function NewRequestForm({ onSubmit, onCancel, existingRequests, onStepChange, goBackTrigger }: { onSubmit: (req: Request) => void; onCancel: () => void; existingRequests: Request[]; onStepChange?: (s: number) => void; goBackTrigger?: number }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  useEffect(() => { onStepChange?.(step); }, [step]);
  useEffect(() => {
    if (goBackTrigger && goBackTrigger > 0) {
      if (step > 1) setStep(s => s - 1);
    }
  }, [goBackTrigger]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Request | null>(null);
  const [absherFetched, setAbsherFetched] = useState(false);
  const [absherLoading, setAbsherLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const ABSHER_NAMES = [
    "عبدالله الغامدي", "محمد العتيبي", "فهد الشمري", "سعد القحطاني", "خالد الدوسري",
    "أحمد الحربي", "عمر المالكي", "ناصر الزهراني", "يوسف السبيعي", "إبراهيم المطيري",
    "سلطان العنزي", "بندر الرشيدي", "تركي الشهري", "ماجد البلوي", "راشد الجهني",
  ];
  const handleAbsherFetch = () => {
    setAbsherLoading(true);
    setTimeout(() => {
      const name = ABSHER_NAMES[Math.floor(Math.random() * ABSHER_NAMES.length)];
      const id = "1" + String(Math.floor(Math.random() * 900000000) + 100000000);
      const city = SAUDI_CITIES[Math.floor(Math.random() * Math.min(15, SAUDI_CITIES.length))];
      const phone = "05" + String(Math.floor(Math.random() * 90000000) + 10000000);
      updateForm({ applicantName: name, applicantId: id, applicantCity: city, applicantPhone: phone, identityType: "الهوية الوطنية", country: "المملكة العربية السعودية" });
      setAbsherFetched(true);
      setAbsherLoading(false);
      toast({ title: "تم جلب البيانات من أبشر بنجاح" });
    }, 1200);
  };
  const handleAbsherClear = () => {
    updateForm({ applicantName: "", applicantId: "", applicantCity: "", applicantPhone: "", identityType: "", country: "" });
    setAbsherFetched(false);
  };

  const defaultForm = {
    applicantType: "",
    applicantName: "",
    applicantId: "",
    identityType: "",
    birthDate: "",
    country: "",
    applicantCity: "",
    applicantPhone: "",
    documentNumber: "",
    requestType: "",
    caseOwnerNationalId: "",
    caseNumber: "",
    judgmentNumber: "",
    judgmentDate: "",
    circuit: "",
    city: "",
    court: "",
    agreed: false,
    interestStatement: "",
  };

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return { ...defaultForm, ...JSON.parse(saved) };
    } catch {}
    return defaultForm;
  });

  const autoAssignEmployee = (currentRequests: Request[]) => {
    const beneficiaryEmployees = MOCK_EMPLOYEES.filter(
      e => getDepartmentSection(e.department) === "beneficiary_services" && e.status === "active"
    );
    // احسب عدد الطلبات النشطة لكل موظف
    const withLoad = beneficiaryEmployees.map(emp => ({
      ...emp,
      load: currentRequests.filter(r => (r.assignedTo === emp.id || r.assignedTo === emp.name) && r.status !== "completed").length
    }));
    // اختر الأقل حملاً
    return withLoad.sort((a, b) => a.load - b.load)[0];
  };

  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const errCls = (key: string, base = "border-[#ebebeb]") =>
    fieldErrors.has(key) ? "border-[#B42318] ring-2 ring-[#B42318]/20" : base;

  const updateForm = (updates: Partial<typeof form>) => {
    const next = { ...form, ...updates };
    setForm(next);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1500);
    if (fieldErrors.size > 0) {
      const cleared = new Set(fieldErrors);
      Object.keys(updates).forEach((k) => cleared.delete(k));
      if (cleared.size !== fieldErrors.size) setFieldErrors(cleared);
    }
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, "");
  const needsDocument = form.applicantType === "heir" || form.applicantType === "agent" || form.applicantType === "liquidator" || form.applicantType === "judicial_guardian";
  const docLabel = form.applicantType === "heir" ? "رقم صك الورثة" : form.applicantType === "liquidator" || form.applicantType === "judicial_guardian" ? "رقم الحكم أو رقم القرار" : "رقم الوكالة";

  const doSubmit = async () => {
    if (!form.agreed) {
      toast({ title: "يجب الموافقة على إقرار تقديم الطلب", variant: "destructive" });
      return;
    }
    const id = Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const slaInfo = getSlaWithHolidays(form.requestType as RequestType);

    const assignedEmployee = autoAssignEmployee(existingRequests);

    let fileAttachments: { name: string; type: string; size: number; data: string }[] = [];
    if (attachments.length > 0) {
      fileAttachments = await Promise.all(attachments.map(fileToBase64));
    }

    const newReq: Request = {
      id,
      trackingNumber: `47${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      applicantName: form.applicantName,
      applicantId: form.applicantId,
      applicantType: form.applicantType as any,
      requestType: form.requestType as any,
      caseNumber: form.caseNumber,
      judgmentNumber: form.judgmentNumber,
      judgmentDate: form.judgmentDate,
      circuit: form.circuit,
      city: form.city || undefined,
      court: form.court || undefined,
      interestStatement: form.applicantType === "stakeholder" ? form.interestStatement : undefined,
      assignedSection: "verification_center",
      status: "processing",
      createdAt: now.toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
      slaDeadline: slaInfo.deadline.toISOString().split("T")[0],
      assignedTo: assignedEmployee?.name,
      fileAttachments: fileAttachments.length > 0 ? fileAttachments : undefined,
      timeline: [
        { id: "t1", date: now.toLocaleString("ar"), title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
        { id: "t2", date: "", title: "مراجعة الطلب", description: "في انتظار المراجعة", status: "pending" },
        { id: "t3", date: "", title: "المعالجة", description: "في انتظار المعالجة", status: "pending" },
        { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
      ],
    };
    localStorage.removeItem(DRAFT_KEY);
    onSubmit(newReq);
    requestBrowserNotification("تم تقديم طلبك", `رقم الطلب: ${newReq.trackingNumber}`);
    toast({
      title: "تم تقديم الطلب بنجاح",
      description: `رقم الطلب: ${newReq.trackingNumber}. تم توزيع الطلب على الموظف: ${assignedEmployee?.name || "النظام"}`
    });
  };

  const handleSubmit = () => {
    doSubmit();
  };

  const steps = ["بيانات مقدم الطلب", "تفاصيل الطلب", "الإقرار والتأكيد"];

  return (
    <div className="space-y-6">
      <Dialog open={!!duplicateWarning} onOpenChange={() => setDuplicateWarning(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-start text-[#ec9a18]/80">
              <AlertTriangle className="w-5 h-5" />
              تنبيه: طلب مكرر محتمل
            </DialogTitle>
          </DialogHeader>
          {duplicateWarning && (() => {
            const dupStatusMap: Record<string, string> = { new: "طلب جديد", processing: "قيد المعالجة", referred: "محال للجهة", completed: "مكتمل", rejected: "مرفوض", pending_payment: "بانتظار السداد", objected: "معترض عليه" };
            const dupStatusLabel = dupStatusMap[duplicateWarning.status] || duplicateWarning.status;
            const isNotCompleted = duplicateWarning.status !== "completed" && duplicateWarning.status !== "rejected";
            return (
            <div className="space-y-4">
              <div className="rounded-xl p-4 bg-[#ec9a18]/[0.03] text-sm space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ec9a18]/[0.06] flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ec9a18]/80" />
                  </div>
                  <p className="font-medium text-[13px] text-foreground">تم رصد طلب مشابه تقدّمت به سابقاً:</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs ps-9">
                  <span className="text-muted-foreground">رقم الطلب:</span>
                  <span className="font-mono font-medium">{duplicateWarning.trackingNumber}</span>
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className="font-medium">{dupStatusLabel}</span>
                  <span className="text-muted-foreground">تاريخ التقديم:</span>
                  <span className="font-medium">{formatDate(duplicateWarning.createdAt)}</span>
                </div>
              </div>
              {isNotCompleted ? (
                <>
                  <p className="text-sm text-[#B42318] font-medium">لا يمكن تقديم طلب جديد بنفس البيانات لأن الطلب السابق لم يُكتمل بعد. يرجى متابعة الطلب الحالي.</p>
                  <Button variant="outline" className="w-full" onClick={() => setDuplicateWarning(null)}>حسناً</Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">هل تريد المتابعة وتقديم طلب جديد رغم ذلك؟</p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setDuplicateWarning(null)}>إلغاء</Button>
                    <Button className="flex-1 font-medium bg-[#ec9a18]/80 text-white hover:bg-[#ec9a18]/70"
                      onClick={() => { setDuplicateWarning(null); setStep(3); }}>متابعة رغم التكرار</Button>
                  </div>
                </>
              )}
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {draftSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-xs text-[#187860] bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06] rounded-lg px-3 py-2"
        >
          <Save className="w-3 h-3" />
          <span>تم حفظ المسودة تلقائياً</span>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all shadow-sm ${
                  i + 1 < step ? "text-white shadow-[#187860]/20" : i + 1 === step ? "text-white shadow-[#187860]/30 ring-[3px] ring-[#187860]/15" : "bg-[#f5f5f5] text-muted-foreground border border-[#ebebeb]"
                }`}
                style={i + 1 <= step ? { background: "#187860" } : {}}
              >
                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[11px] hidden sm:block whitespace-nowrap ${i + 1 === step ? "font-medium text-[#187860]" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < 2 && <div className={`w-12 sm:w-16 h-[2px] rounded-full mx-2 mt-[-14px] sm:mt-[-14px] transition-colors ${i + 1 < step ? "bg-[#187860]" : "bg-[#ebebeb]"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <UserCheck className="w-3.5 h-3.5 text-[#187860]" />
              صفة مقدم الطلب <span className="text-[#B42318]">*</span>
            </Label>
            <Select dir="rtl" value={form.applicantType} onValueChange={(v) => {
              const updates: any = { applicantType: v };
              if (v === "stakeholder" && form.requestType === "replacement_doc") updates.requestType = "";
              updateForm(updates);
            }}>
              <SelectTrigger className={`rounded-xl h-11 bg-white ${errCls("applicantType")} focus:ring-[#187860]/20`} data-testid="select-applicant-type"><SelectValue placeholder="اختر الصفة" /></SelectTrigger>
              <SelectContent>{APPLICANT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={absherFetched ? handleAbsherClear : handleAbsherFetch}
              disabled={absherLoading}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                absherFetched
                  ? "text-[#B42318] bg-[#B42318]/[0.06] hover:bg-[#B42318]/[0.1]"
                  : "text-[#187860] bg-[#187860]/[0.06] hover:bg-[#187860]/[0.1]"
              }`}
              data-testid="button-absher-fetch"
            >
              {absherLoading ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" />جاري الجلب...</>
              ) : absherFetched ? (
                <><X className="w-3.5 h-3.5" />إلغاء بيانات أبشر</>
              ) : (
                <><UserCheck className="w-3.5 h-3.5" />جلب البيانات من أبشر</>
              )}
            </button>
          </div>

          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <User className="w-3.5 h-3.5 text-[#187860]" />
              الاسم الكامل <span className="text-[#B42318]">*</span>
            </Label>
            <div className="relative">
              <Input
                className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("applicantName")}`}`}
                data-testid="input-applicant-name"
                placeholder="أدخل الاسم الكامل"
                value={form.applicantName}
                readOnly={absherFetched}
                onChange={(e) => !absherFetched && updateForm({ applicantName: e.target.value })}
              />
              {absherFetched && <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[9px] text-[#187860] bg-[#187860]/[0.08] px-1.5 py-0.5 rounded font-medium">أبشر</span>}
            </div>
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <IdCard className="w-3.5 h-3.5 text-[#187860]" />
              نوع الهوية <span className="text-[#B42318]">*</span>
            </Label>
            <Select dir="rtl" value={form.identityType} onValueChange={(v) => updateForm({ identityType: v, applicantId: "" })} disabled={absherFetched}>
              <SelectTrigger className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("identityType")}`}`} data-testid="select-identity-type">
                <SelectValue placeholder="اختر نوع الهوية" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {["الهوية الوطنية", "إقامة نظامية", "إقامة مؤقتة", "جواز سفر", "هوية وطنية خليجية", "بطاقة تنقل وعمل"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <IdCard className="w-3.5 h-3.5 text-[#187860]" />
              {form.identityType === "إقامة نظامية" || form.identityType === "إقامة مؤقتة" ? "رقم الإقامة" : form.identityType === "جواز سفر" ? "رقم الجواز" : "رقم الهوية"} <span className="text-[#B42318]">*</span>
            </Label>
            {(() => {
              const isPassport = form.identityType === "جواز سفر";
              const isIqama = form.identityType === "إقامة نظامية" || form.identityType === "إقامة مؤقتة";
              const maxLen = isPassport ? 10 : 10;
              const expectedLen = isPassport ? 7 : 10;
              const placeholder = isPassport ? "أدخل رقم جواز السفر" : isIqama ? "أدخل رقم الإقامة" : form.identityType === "هوية وطنية خليجية" ? "أدخل رقم الهوية الخليجية" : form.identityType === "بطاقة تنقل وعمل" ? "أدخل رقم بطاقة التنقل والعمل" : "أدخل رقم الهوية الوطنية";
              return (
                <>
                  <div className="relative">
                    <Input
                      className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("applicantId")}`}`}
                      data-testid="input-applicant-id"
                      placeholder={placeholder}
                      value={form.applicantId}
                      inputMode={isPassport ? "text" : "numeric"}
                      readOnly={absherFetched}
                      onChange={(e) => {
                        if (absherFetched) return;
                        if (isPassport) {
                          const val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                          updateForm({ applicantId: val.slice(0, 10) });
                        } else {
                          updateForm({ applicantId: onlyDigits(e.target.value) });
                        }
                      }}
                      maxLength={maxLen}
                    />
                    {absherFetched && <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[9px] text-[#187860] bg-[#187860]/[0.08] px-1.5 py-0.5 rounded font-medium">أبشر</span>}
                  </div>
                  {!absherFetched && form.applicantId && (() => {
                    if (isPassport) {
                      if (!/^[A-Z]/.test(form.applicantId)) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />يجب أن يبدأ بحرف إنجليزي كبير</p>;
                      if (form.applicantId.length < 7) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />يجب أن يتكون من 7 خانات على الأقل ({form.applicantId.length}/7)</p>;
                    } else if (isIqama) {
                      if (!form.applicantId.startsWith("2")) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />رقم الإقامة يجب أن يبدأ بـ 2</p>;
                      if (form.applicantId.length < 10) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />يجب أن يتكون من 10 أرقام ({form.applicantId.length}/10)</p>;
                    } else {
                      if (!form.applicantId.startsWith("1")) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />رقم الهوية يجب أن يبدأ بـ 1</p>;
                      if (form.applicantId.length < 10) return <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />يجب أن يتكون من 10 أرقام ({form.applicantId.length}/10)</p>;
                    }
                    return null;
                  })()}
                </>
              );
            })()}
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <CalendarDays className="w-3.5 h-3.5 text-[#187860]" />
              تاريخ الميلاد <span className="text-[#B42318]">*</span>
            </Label>
            <HijriDatePicker value={form.birthDate} onChange={(v) => updateForm({ birthDate: v })} testId="hijri-birth-date" hasError={fieldErrors.has("birthDate")} />
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <Globe className="w-3.5 h-3.5 text-[#187860]" />
              الدولة <span className="text-[#B42318]">*</span>
            </Label>
            <Select dir="rtl" value={form.country} onValueChange={(v) => updateForm({ country: v, applicantCity: "" })} disabled={absherFetched}>
              <SelectTrigger className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("country")}`}`} data-testid="select-country">
                <SelectValue placeholder="اختر الدولة" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {["المملكة العربية السعودية", "الإمارات العربية المتحدة", "الكويت", "البحرين", "قطر", "سلطنة عُمان", "مصر", "الأردن", "لبنان", "سوريا", "العراق", "اليمن", "السودان", "ليبيا", "تونس", "الجزائر", "المغرب", "فلسطين", "تركيا", "الهند", "باكستان", "بنغلاديش", "الفلبين", "إندونيسيا", "أخرى"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <MapPin className="w-3.5 h-3.5 text-[#187860]" />
              المدينة <span className="text-[#B42318]">*</span>
            </Label>
            {form.country === "المملكة العربية السعودية" || !form.country ? (
              <Select dir="rtl" value={form.applicantCity} onValueChange={(v) => updateForm({ applicantCity: v })} disabled={absherFetched}>
                <SelectTrigger className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("applicantCity")}`}`} data-testid="select-applicant-city">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {SAUDI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input
                className={`rounded-xl h-11 bg-white ${errCls("applicantCity")} focus:ring-[#187860]/20`}
                data-testid="input-applicant-city"
                placeholder="أدخل اسم المدينة"
                value={form.applicantCity}
                onChange={(e) => updateForm({ applicantCity: e.target.value })}
              />
            )}
          </div>
          <div>
            <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
              <Phone className="w-3.5 h-3.5 text-[#187860]" />
              رقم الجوال <span className="text-[#B42318]">*</span>
            </Label>
            <div className="relative">
              <Input className={`rounded-xl h-11 focus:ring-[#187860]/20 ${absherFetched ? "bg-[#f8faf9] border-[#187860]/15 cursor-default" : `bg-white ${errCls("applicantPhone")}`}`} data-testid="input-applicant-phone" placeholder="05XXXXXXXX"
                value={form.applicantPhone} inputMode="tel" maxLength={10}
                readOnly={absherFetched}
                onChange={(e) => !absherFetched && updateForm({ applicantPhone: e.target.value.replace(/[^0-9]/g, "") })} />
              {absherFetched && <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[9px] text-[#187860] bg-[#187860]/[0.08] px-1.5 py-0.5 rounded font-medium">أبشر</span>}
            </div>
            {form.applicantPhone && form.applicantPhone.length > 0 && !form.applicantPhone.startsWith("05") && (
              <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />يجب أن يبدأ بـ 05
              </p>
            )}
            {form.applicantPhone && form.applicantPhone.startsWith("05") && form.applicantPhone.length < 10 && (
              <p className="text-xs text-[#ec9a18] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{form.applicantPhone.length}/10
              </p>
            )}
          </div>
          {needsDocument && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3 border-t border-[#ebebeb]">
              <p className="text-[11px] text-muted-foreground mb-3">وثيقة إثبات الصفة</p>
              <Label className="font-medium text-[13px] mb-2 flex items-center gap-1.5 text-foreground/80">
                <FileText className="w-3.5 h-3.5 text-[#187860]" />
                {docLabel} <span className="text-[#B42318]">*</span>
              </Label>
              <Input className={`rounded-xl h-11 bg-white ${errCls("documentNumber")} focus:ring-[#187860]/20`} data-testid="input-document-number" placeholder={`أدخل ${docLabel} (أرقام فقط)`}
                value={form.documentNumber} inputMode="numeric"
                onChange={(e) => updateForm({ documentNumber: onlyDigits(e.target.value) })} />
            </motion.div>
          )}
          <Button className="w-full font-medium rounded-xl h-11" style={{ background: "#187860", color: "white" }}
            onClick={() => {
              const missing = new Set<string>();
              if (!form.applicantType) missing.add("applicantType");
              if (!form.applicantName) missing.add("applicantName");
              if (!form.identityType) missing.add("identityType");
              if (!form.applicantId) missing.add("applicantId");
              if (!form.birthDate) missing.add("birthDate");
              if (!form.country) missing.add("country");
              if (!form.applicantCity) missing.add("applicantCity");
              if (!form.applicantPhone || form.applicantPhone.length < 10 || !form.applicantPhone.startsWith("05")) missing.add("applicantPhone");
              if (needsDocument && !form.documentNumber) missing.add("documentNumber");
              if (missing.size > 0) {
                setFieldErrors(missing);
                toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", description: `عدد الحقول الناقصة: ${missing.size}`, variant: "destructive" });
                return;
              }
              {
                const isPassport = form.identityType === "جواز سفر";
                const isIqama = form.identityType === "إقامة نظامية" || form.identityType === "إقامة مؤقتة";
                if (isPassport) {
                  if (!/^[A-Z]/.test(form.applicantId)) { toast({ title: "رقم الجواز يجب أن يبدأ بحرف إنجليزي كبير", variant: "destructive" }); return; }
                  if (form.applicantId.length < 7) { toast({ title: "رقم الجواز يجب أن يتكون من 7 خانات على الأقل", variant: "destructive" }); return; }
                } else if (isIqama) {
                  if (!form.applicantId.startsWith("2")) { toast({ title: "رقم الإقامة يجب أن يبدأ بـ 2", variant: "destructive" }); return; }
                  if (form.applicantId.length < 10) { toast({ title: "رقم الإقامة يجب أن يتكون من 10 أرقام", variant: "destructive" }); return; }
                } else {
                  if (!form.applicantId.startsWith("1")) { toast({ title: "رقم الهوية يجب أن يبدأ بـ 1", variant: "destructive" }); return; }
                  if (form.applicantId.length < 10) { toast({ title: "رقم الهوية يجب أن يتكون من 10 أرقام", variant: "destructive" }); return; }
                }
              }
              if (!form.applicantPhone || form.applicantPhone.length < 10 || !form.applicantPhone.startsWith("05")) {
                toast({ title: "رقم الجوال مطلوب ويجب أن يبدأ بـ 05 ويتكون من 10 أرقام", variant: "destructive" }); return;
              }
              if (needsDocument && !form.documentNumber) {
                toast({ title: `يرجى إدخال ${docLabel}`, variant: "destructive" }); return;
              }
              setStep(2);
            }} data-testid="button-next-step-1">التالي</Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">نوع الطلب *</Label>
            <Select dir="rtl" value={form.requestType} onValueChange={(v) => updateForm({ requestType: v })}>
              <SelectTrigger className={`rounded-xl h-11 bg-white ${errCls("requestType")} focus:ring-[#187860]/20`} data-testid="select-request-type"><SelectValue placeholder="اختر نوع الطلب" /></SelectTrigger>
              <SelectContent className="max-w-[600px] w-[var(--radix-select-trigger-width)]">
                {REQUEST_TYPES
                  .filter((t) => form.applicantType !== "stakeholder" || t.value !== "replacement_doc")
                  .map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="text-sm font-medium leading-snug whitespace-normal break-words">{t.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.applicantType === "stakeholder" && (
              <p className="text-[11px] text-muted-foreground mt-1">صاحب المصلحة يمكنه طلب نسخة مصدقة أو الاطلاع على الأوراق فقط</p>
            )}
          </div>
          {form.requestType && (() => {
            const feeMap: Record<string, string> = {
              certified_copy: "١٠٠ ريال",
              case_review: "٥٠ ريال",
              replacement_doc: "١٠٠ ريال",
            };
            const fee = feeMap[form.requestType];
            if (!fee) return null;
            return (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[#187860]/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-[#187860]/[0.08] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4" style={{ color: "#187860" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-muted-foreground">رسوم الطلب</p>
                  <p className="font-bold text-base" style={{ color: "#187860" }}>{fee}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">تُسدَّد إلكترونياً</p>
              </div>
            );
          })()}
          <div>
            <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">رقم القضية (رقم القيد) {form.requestType === "replacement_doc" ? <span className="text-muted-foreground font-normal text-[11px]">(اختياري)</span> : "*"}</Label>
            <Input className={`rounded-xl h-11 bg-white ${errCls("caseNumber")} focus:ring-[#187860]/20`} data-testid="input-case-number" placeholder="رقم القيد"
              value={form.caseNumber} inputMode="numeric"
              onChange={(e) => updateForm({ caseNumber: onlyDigits(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">رقم الصك {form.requestType === "replacement_doc" ? "*" : <span className="text-muted-foreground font-normal text-[11px]">(اختياري)</span>}</Label>
              <Input className={`rounded-xl h-11 bg-white ${errCls("judgmentNumber")} focus:ring-[#187860]/20`} data-testid="input-judgment-number" placeholder="أرقام فقط"
                value={form.judgmentNumber} inputMode="numeric"
                onChange={(e) => updateForm({ judgmentNumber: onlyDigits(e.target.value) })} />
            </div>
            <div>
              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">تاريخ الصك {form.requestType === "replacement_doc" ? "*" : <span className="text-muted-foreground font-normal text-[11px]">(اختياري)</span>}</Label>
              <HijriDatePicker value={form.judgmentDate} onChange={(v) => updateForm({ judgmentDate: v })} testId="hijri-judgment" hasError={fieldErrors.has("judgmentDate")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">المدينة *</Label>
              <Select dir="rtl" value={form.city} onValueChange={(v) => updateForm({ city: v, court: "" })}>
                <SelectTrigger className={`rounded-xl h-11 bg-white ${errCls("city")} focus:ring-[#187860]/20`} data-testid="select-city"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {SAUDI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">الجهة *</Label>
              <Select dir="rtl" value={form.court} onValueChange={(v) => updateForm({ court: v, circuit: "" })} disabled={!form.city}>
                <SelectTrigger className={`rounded-xl h-11 bg-white ${errCls("court")} focus:ring-[#187860]/20`} data-testid="select-court"><SelectValue placeholder={form.city ? "اختر الجهة" : "اختر المدينة أولاً"} /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {(SAUDI_COURTS[form.city] || DEFAULT_COURTS).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.applicantType === "stakeholder" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">اذكر سبب المصلحة من الأوراق *</Label>
              <Textarea className={`rounded-xl bg-white ${errCls("interestStatement")} focus:ring-[#187860]/20`} data-testid="input-interest-statement" placeholder="اذكر سبب المصلحة من الأوراق المطلوبة"
                value={form.interestStatement} onChange={(e) => updateForm({ interestStatement: e.target.value })}
                rows={3} />
            </motion.div>
          )}
          <div className="rounded-xl border border-[#ebebeb] overflow-hidden">
            <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-medium text-foreground/80 hover:bg-muted/30 transition-colors"
              onClick={() => setShowOptionalFields(!showOptionalFields)} data-testid="toggle-optional-fields">
              <span className="flex items-center gap-2">
                <Plus className={`w-4 h-4 text-[#187860] transition-transform duration-200 ${showOptionalFields ? "rotate-45" : ""}`} />
                حقول إضافية
                <span className="text-[11px] text-muted-foreground font-normal">(القسم والمرفقات)</span>
              </span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showOptionalFields ? "rotate-90" : ""}`} />
            </button>
            {showOptionalFields && (
              <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[#ebebeb]">
                <div>
                  <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">{form.court === "ديوان الوزارة" ? "الإدارات والأقسام" : "القسم"} <span className="text-muted-foreground font-normal text-[11px]">(اختياري)</span></Label>
                  <Select dir="rtl" value={form.circuit} onValueChange={(v) => updateForm({ circuit: v })} disabled={!form.court}>
                    <SelectTrigger className="rounded-xl h-11 bg-white border-[#ebebeb] focus:ring-[#187860]/20" data-testid="select-circuit"><SelectValue placeholder={form.court ? (form.court === "ديوان الوزارة" ? "اختر الإدارة أو القسم" : "اختر الدائرة (إن وُجدت)") : "اختر الجهة أولاً"} /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {getCircuitsForCourt(form.court).map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#187860] dark:text-[#187860] mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    {form.court === "ديوان الوزارة" ? "في حال اختيار الإدارة أو القسم يتم إنجاز الطلب بشكل سريع" : "في حال اختيار الدائرة يسهل الوصول للقضية ويتم إنجاز الطلب بشكل سريع"}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">المرفقات <span className="text-muted-foreground font-normal text-[11px]">(اختياري)</span></Label>
                  <div className="space-y-3">
                    <label htmlFor="file-upload"
                      className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-[#ebebeb] p-3 transition-all hover:border-[#187860]/30 hover:bg-[#187860]/[0.02]"
                      data-testid="label-file-upload">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#187860]/[0.06]">
                        <Paperclip className="w-3.5 h-3.5" style={{ color: "#187860" }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-[12px]">إضافة مرفق</p>
                        <p className="text-muted-foreground text-[11px]">PDF، JPG، PNG حجم أقصى ١٠ ميجابايت</p>
                      </div>
                      <input id="file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                        data-testid="input-file-upload"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
                          if (oversized.length > 0) { toast({ title: "حجم الملف يتجاوز 10 ميجابايت", variant: "destructive" }); return; }
                    setAttachments((prev) => [...prev, ...files]);
                    e.target.value = "";
                  }} />
              </label>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, idx) => (
                    <motion.div key={`${file.name}-${idx}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 rounded-lg bg-muted/40 border border-border px-3 py-2"
                      data-testid={`attachment-item-${idx}`}>
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                      <button type="button" className="text-muted-foreground/60 hover:text-destructive transition-colors flex-shrink-0"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        data-testid={`button-remove-attachment-${idx}`}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setStep(1)} data-testid="button-prev-step-2">السابق</Button>
            <Button className="flex-1 font-medium rounded-xl h-11" style={{ background: "#187860", color: "white" }}
              onClick={() => {
                const missing = new Set<string>();
                if (!form.requestType) missing.add("requestType");
                if (!form.city) missing.add("city");
                if (!form.court) missing.add("court");
                if (form.requestType === "replacement_doc" && !form.judgmentNumber) missing.add("judgmentNumber");
                if (form.requestType === "replacement_doc" && !form.judgmentDate) missing.add("judgmentDate");
                if (form.requestType && form.requestType !== "replacement_doc" && !form.caseNumber) missing.add("caseNumber");
                if (form.applicantType === "stakeholder" && !form.interestStatement.trim()) missing.add("interestStatement");
                if (missing.size > 0) {
                  setFieldErrors(missing);
                  toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", description: `عدد الحقول الناقصة: ${missing.size}`, variant: "destructive" });
                  return;
                }
                const allReqs = [...MOCK_REQUESTS, ...existingRequests];
                const dup = detectDuplicate(form.caseNumber, form.requestType as RequestType, form.applicantId, allReqs, form.judgmentNumber);
                if (dup) { setDuplicateWarning(dup); return; }
                setStep(3);
              }} data-testid="button-next-step-2">التالي</Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="rounded-xl p-4 bg-[#187860]/[0.03] text-sm space-y-2 text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground text-[13px]">ملخص الطلب</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-muted-foreground">مقدم الطلب:</span>
              <span className="font-semibold text-foreground">{form.applicantName}</span>
              <span className="text-muted-foreground">نوع الهوية:</span>
              <span className="font-semibold text-foreground">{form.identityType}</span>
              <span className="text-muted-foreground">{form.identityType === "إقامة نظامية" || form.identityType === "إقامة مؤقتة" ? "رقم الإقامة:" : form.identityType === "جواز سفر" ? "رقم الجواز:" : "رقم الهوية:"}</span>
              <span className="font-semibold text-foreground">{form.applicantId}</span>
              <span className="text-muted-foreground">تاريخ الميلاد:</span>
              <span className="font-semibold text-foreground">{form.birthDate} هـ</span>
              <span className="text-muted-foreground">الدولة:</span>
              <span className="font-semibold text-foreground">{form.country}</span>
              {form.applicantCity && <><span className="text-muted-foreground">مدينة مقدم الطلب:</span><span className="font-semibold text-foreground">{form.applicantCity}</span></>}
              <span className="text-muted-foreground">نوع الطلب:</span>
              <span className="font-semibold text-foreground">{getRequestTypeLabel(form.requestType)}</span>
              <span className="text-muted-foreground">{form.requestType === "replacement_doc" ? "رقم الصك:" : "رقم القضية:"}</span>
              <span className="font-semibold text-foreground">{form.requestType === "replacement_doc" ? (form.judgmentNumber || "-") : form.caseNumber}</span>
              {form.city && <><span className="text-muted-foreground">المدينة:</span><span className="font-semibold text-foreground">{form.city}</span></>}
              {form.court && <><span className="text-muted-foreground">الجهة:</span><span className="font-semibold text-foreground">{form.court}</span></>}
              {form.circuit && <><span className="text-muted-foreground">الدائرة:</span><span className="font-semibold text-foreground">{getCircuitLabel(form.circuit)}</span></>}
              {form.judgmentDate && <><span className="text-muted-foreground">تاريخ الحكم:</span><span className="font-semibold text-foreground">{form.judgmentDate} هـ</span></>}
              {attachments.length > 0 && (
                <>
                  <span className="text-muted-foreground">المرفقات:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />{attachments.length} ملف مرفق
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl p-4 text-sm leading-relaxed text-muted-foreground bg-[#ec9a18]/[0.04]">
            <p className="font-medium text-foreground text-[13px] mb-3">إقرار بتقديم الطلب</p>
            <p className="mb-3">
              {(() => {
                const reqLabel = REQUEST_TYPES.find(r => r.value === form.requestType)?.shortLabel || form.requestType || "___________";
                const refPart = form.judgmentNumber
                  ? `رقم الصك: ${form.judgmentNumber}`
                  : form.caseNumber
                  ? `رقم القضية: ${form.caseNumber}`
                  : "___________";
                return `أقر أنا مقدم الطلب الوارد بياناته أعلاه بإطلاعي على التكاليف القضائية لطلب (${reqLabel} - ${refPart}) وتكلفته الواردة أعلاه، بموجب المادة (7) من اللائحة التنفيذية لنظام التكاليف القضائية، وأتعهد بسداد هذا المبلغ.`;
              })()}
            </p>
            <p className="font-semibold text-foreground">
              اسم مقدم الطلب: <span className="font-normal">{form.applicantName || "___________"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="agree" checked={form.agreed} onCheckedChange={(c) => updateForm({ agreed: !!c })} data-testid="checkbox-agree" />
            <Label htmlFor="agree" className="text-sm cursor-pointer">أوافق على إقرار تقديم الطلب وأتعهد بسداد التكاليف القضائية</Label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setStep(2)} data-testid="button-prev-step-3">السابق</Button>
            <Button className="flex-1 font-medium rounded-xl h-11" style={{ background: "#187860", color: "white" }}
              onClick={handleSubmit} data-testid="button-submit-request">تقديم الطلب</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function RatingModal({ request, onRate, onClose }: { request: Request; onRate: (id: string, rating: number, comment: string) => void; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">يرجى تقييم تجربتك مع الخدمة لتحسين جودتها</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setRating(s)} data-testid={`button-star-${s}`}>
            <Star className={`w-8 h-8 transition-all ${s <= rating ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>
      <Textarea placeholder="أضف تعليقك (اختياري)" value={comment} onChange={(e) => setComment(e.target.value)} data-testid="textarea-rating-comment" />
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        <Button className="flex-1 font-medium" style={{ background: "#187860", color: "white" }}
          onClick={() => {
            if (!rating) { toast({ title: "يرجى اختيار تقييم", variant: "destructive" }); return; }
            onRate(request.id, rating, comment);
            toast({ title: "شكراً على تقييمك" });
            onClose();
          }} data-testid="button-submit-rating">إرسال التقييم</Button>
      </div>
    </div>
  );
}

function RequestDetailModal({ request, onClose, onPay, onObjection, onComplaint, isCaseReviewViewed, onCaseReviewView, onConfirmCaseReview, autoOpenComplaint }: { request: Request; onClose: () => void; onPay?: (id: string) => void; onObjection?: (id: string, reason: string) => void; onComplaint?: (request: Request, reason: string) => void; isCaseReviewViewed?: boolean; onCaseReviewView?: (id: string) => void; onConfirmCaseReview?: (request: Request, onConfirm: () => void) => void; autoOpenComplaint?: boolean }) {
  const { toast } = useToast();
  const d = new Date();
  const trackingUrl = `${window.location.origin}/track/${request.trackingNumber}`;
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReviewPayModal, setShowReviewPayModal] = useState(false);
  const [showObjectionForm, setShowObjectionForm] = useState(false);
  const [objectionReason, setObjectionReason] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(autoOpenComplaint || false);
  const [complaintText, setComplaintText] = useState("");
  const requestPrice = REQUEST_TYPES.find(r => r.value === request.requestType)?.price || "";
  const hasFee = requestPrice !== "" && requestPrice !== "مجاني";
  const needsPayment = request.status === "completed" && hasFee && !request.isPaid;
  const daysPastDeadline = Math.ceil((Date.now() - new Date(request.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
  const isDelayed = request.status !== "completed" && request.status !== "rejected" && (daysPastDeadline > 0 || autoOpenComplaint);
  const existingComplaint = useMemo(
    () => loadTickets().find(t => t.requestNumber === request.trackingNumber && t.status !== "resolved"),
    [request.trackingNumber, showComplaintForm]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F2937]">تفاصيل الطلب</h2>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">رقم الطلب</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-black font-mono tracking-tight" style={{ color: "#187860" }}>{request.trackingNumber}</p>
              <button
                onClick={() => navigator.clipboard.writeText(request.trackingNumber)}
                className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
                data-testid="ben-copy-tracking"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border bg-muted/30 p-5">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3" />مقدم الطلب</p>
          <p className="text-sm font-bold">{request.applicantName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-3 h-3" />رقم الهوية</p>
          <p className="text-sm font-bold font-mono">{request.applicantId}</p>
        </div>
        <div className="space-y-1 col-span-2 border-t pt-3 mt-1">
          <p className="text-[11px] text-muted-foreground">نوع الطلب</p>
          <p className="text-sm font-bold leading-relaxed">{getRequestTypeLabel(request.requestType)}</p>
        </div>
        <div className="space-y-1 border-t pt-3">
          <p className="text-[11px] text-muted-foreground">{request.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold">{request.requestType === "replacement_doc" ? (request.judgmentNumber || "-") : request.caseNumber}</p>
            <button
              onClick={() => navigator.clipboard.writeText(request.requestType === "replacement_doc" ? (request.judgmentNumber || "") : request.caseNumber)}
              className="text-muted-foreground hover:text-[#187860] transition-colors p-0.5 rounded"
              data-testid="copy-case-number"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-1 border-t pt-3">
          <p className="text-[11px] text-muted-foreground">القسم</p>
          <p className="text-sm font-bold">{getCircuitLabel(request.circuit)}</p>
        </div>
        {request.court && (
          <div className="space-y-1 col-span-2 border-t pt-3 mt-1">
            <p className="text-[11px] text-muted-foreground">الجهة</p>
            <p className="text-sm font-bold">{request.court}</p>
          </div>
        )}
        <div className="space-y-1 border-t pt-3">
          <p className="text-[11px] text-muted-foreground">تاريخ التقديم</p>
          <p className="text-sm font-bold">{formatDate(request.createdAt)}</p>
        </div>
        <div className="space-y-1 border-t pt-3">
          <p className="text-[11px] text-muted-foreground">القسم</p>
          <p className="text-sm font-bold">{getCircuitLabel(request.circuit)}</p>
        </div>
        {request.assignedTo && (
          <div className="space-y-1 col-span-2 border-t pt-3 mt-1">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3" />الموظف المعين</p>
            <p className="text-sm font-bold">{request.assignedTo}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          الجدول الزمني للطلب
        </p>
        <div className="rounded-2xl border bg-card p-4">
          <RequestTimeline events={request.timeline} />
        </div>
      </div>

      {((request.fileAttachments && request.fileAttachments.length > 0) || (request.employeeAttachments && request.employeeAttachments.length > 0)) && (
        <div className="space-y-3">
          <p className="text-sm font-bold flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            المرفقات
          </p>
          {request.fileAttachments && request.fileAttachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-bold">مرفقات المستفيد:</p>
              {request.fileAttachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg bg-muted/40 border px-3 py-2" data-testid={`beneficiary-attachment-${idx}`}>
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{att.name}</span>
                  <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`button-download-att-${idx}`}>
                    <Download className="w-3 h-3 me-1" />تحميل
                  </Button>
                </div>
              ))}
            </div>
          )}
          {request.employeeAttachments && request.employeeAttachments.length > 0 && (() => {
            const isCaseReview = request.requestType === "case_review";
            const isLocked = !request.isPaid;
            const isCaseReviewPaidUnviewed = isCaseReview && request.isPaid && !isCaseReviewViewed;
            const isCaseReviewPaidViewed = isCaseReview && request.isPaid && isCaseReviewViewed;
            return (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-bold">مرفقات من الجهة المختصة:</p>
              {isLocked && (
                <div className="flex items-center gap-2 rounded-lg bg-[#5cb89c]/[0.06] border border-[#187860]/15 px-3 py-2">
                  <Lock className="w-3.5 h-3.5 text-[#187860]" />
                  <p className="text-xs text-[#187860]">يجب سداد الرسوم أولاً للاطلاع على المرفقات أو تحميلها</p>
                </div>
              )}
              {request.employeeAttachments.map((att, idx) => (
                <div key={idx} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${(isLocked || isCaseReviewPaidViewed) ? "bg-muted/30 border border-dashed opacity-60" : "bg-[#187860]/[0.06] dark:bg-[#187860]/[0.04] border border-[#187860]/20"}`} data-testid={`employee-attachment-${idx}`}>
                  <FileText className={`w-4 h-4 flex-shrink-0 ${(isLocked || isCaseReviewPaidViewed) ? "text-muted-foreground" : "text-[#187860]"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">{att.name}</span>
                    <span className="text-[11px] text-muted-foreground">بواسطة: {att.uploadedBy} {att.uploadedAt}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
                  {isCaseReview || isLocked ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground h-7 px-2">
                      <Lock className="w-3 h-3" />
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => downloadAttachment(att)} data-testid={`button-download-emp-att-${idx}`}>
                      <Download className="w-3 h-3 me-1" />تحميل
                    </Button>
                  )}
                </div>
              ))}
              {isCaseReviewPaidUnviewed && (
                <div className="rounded-xl p-3 bg-[#ec9a18]/[0.04] border border-[#ec9a18]/20 space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#ec9a18]" />
                    <p className="text-xs font-bold text-foreground">تنبيه مهم</p>
                  </div>
                  <ul className="text-[11px] text-foreground/75 leading-relaxed space-y-1 ps-5 list-disc marker:text-[#ec9a18]/60">
                    <li><span className="font-bold">يُسمح بالاطلاع على الوثيقة مرة واحدة فقط</span></li>
                    <li>لا يمكن تحميل أو حفظ الوثيقة</li>
                    <li>تظهر علامة مائية "غير معتمدة" على الوثيقة</li>
                    <li><span className="font-bold">الطباعة غير مسموح بها</span> لوثائق الاطلاع</li>
                    <li><span className="font-bold">تصوير الشاشة محمي</span> تظهر صفحة بيضاء</li>
                    <li>للاطلاع مرة أخرى يلزم سداد رسوم جديدة</li>
                  </ul>
                  <Button className="w-full font-medium rounded-xl h-10 mt-1" style={{ background: "#187860", color: "white" }}
                    onClick={() => onConfirmCaseReview?.(request, () => openCaseReviewViewer(request, () => onCaseReviewView?.(request.id)))}
                    data-testid="button-view-attachments-once">
                    <Eye className="w-4 h-4 me-2" />
                    الاطلاع على الوثيقة (مرة واحدة)
                  </Button>
                </div>
              )}
              {isCaseReviewPaidViewed && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-dashed px-3 py-2 mt-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">تم استخدام فرصة الاطلاع. للاطلاع مرة أخرى يلزم سداد رسوم جديدة.</p>
                </div>
              )}
            </div>
            );
          })()}
        </div>
      )}

      {isDelayed && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 bg-[#B42318]/[0.05] border border-[#B42318]/10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#B42318]/[0.08] flex items-center justify-center">
                <Timer className="w-3.5 h-3.5 text-[#B42318]/80" />
              </div>
              <p className="font-medium text-[13px] text-[#B42318]">تجاوز الموعد النهائي</p>
            </div>
            <p className="text-[12px] text-[#B42318]/70 leading-relaxed ps-9">
              تجاوز طلبك الموعد النهائي المحدد للمعالجة. يمكنك تقديم شكوى ليتم متابعة طلبك من قِبل الإدارة.
            </p>
          </div>
          {existingComplaint ? (
            <div className="rounded-xl p-4 bg-[#187860]/[0.05] border border-[#187860]/15 space-y-2" data-testid="status-complaint-filed">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#187860]/[0.1] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#187860]" />
                </div>
                <p className="font-medium text-[13px] text-[#187860]">تم تقديم الشكوى</p>
              </div>
              <p className="text-[12px] text-foreground/70 leading-relaxed ps-9">
                شكواك (رقم التذكرة: <span className="font-bold text-[#187860]" data-testid="text-ticket-number">{existingComplaint.id}</span>) قيد المتابعة من قِبل إدارة المحكمة. لا يمكن تقديم شكوى أخرى على نفس الطلب حتى الانتهاء من معالجتها.
              </p>
            </div>
          ) : !showComplaintForm ? (
            <Button className="w-full font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
              onClick={() => setShowComplaintForm(true)} data-testid="button-open-complaint">
              <AlertCircle className="w-4 h-4 me-2" />
              تقديم شكوى على تأخر الطلب
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 bg-muted/50 border border-[#ebebeb] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="font-medium text-[13px] text-foreground">تقديم شكوى</p>
              </div>
              <div>
                <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">تفاصيل الشكوى *</Label>
                <Textarea className="rounded-xl bg-white border-[#ebebeb]" data-testid="textarea-complaint"
                  placeholder="اذكر تفاصيل شكواك بخصوص تأخر معالجة الطلب..."
                  value={complaintText} onChange={(e) => setComplaintText(e.target.value)} rows={4} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-10" onClick={() => { setShowComplaintForm(false); setComplaintText(""); }}>إلغاء</Button>
                <Button className="flex-1 font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
                  disabled={!complaintText.trim()}
                  onClick={() => {
                    if (!complaintText.trim()) {
                      toast({ title: "يرجى كتابة تفاصيل الشكوى", variant: "destructive" });
                      return;
                    }
                    onComplaint?.(request, complaintText.trim());
                    setShowComplaintForm(false);
                    setComplaintText("");
                  }} data-testid="button-submit-complaint">
                  إرسال الشكوى
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {request.status === "rejected" && (
        <div className="space-y-4">
          {(request.rejectionReason || request.notes) && (
            <div className="rounded-xl p-4 bg-[#B42318]/[0.03] space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#B42318]/[0.06] flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-[#B42318]/80" />
                </div>
                <p className="font-medium text-[13px] text-foreground">سبب الرفض</p>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed ps-9" data-testid="text-rejection-reason">
                {request.rejectionReason || request.notes}
              </p>
            </div>
          )}
          {!showObjectionForm ? (
            <Button className="w-full font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
              onClick={() => setShowObjectionForm(true)} data-testid="button-open-objection">
              <AlertTriangle className="w-4 h-4 me-2" />
              تقديم اعتراض على الرفض
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 bg-muted/50 border border-[#ebebeb] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="font-medium text-[13px] text-foreground">تقديم اعتراض</p>
              </div>
              <div>
                <Label className="font-medium text-[13px] mb-1.5 block text-foreground/80">سبب الاعتراض *</Label>
                <Textarea className="rounded-xl bg-white border-[#ebebeb]" data-testid="input-objection-reason" placeholder="اذكر سبب اعتراضك على رفض الطلب بالتفصيل..."
                  value={objectionReason} onChange={(e) => setObjectionReason(e.target.value)} rows={4} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-10" onClick={() => { setShowObjectionForm(false); setObjectionReason(""); }}>إلغاء</Button>
                <Button className="flex-1 font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
                  onClick={() => {
                    if (!objectionReason.trim()) {
                      toast({ title: "يرجى كتابة سبب الاعتراض", variant: "destructive" });
                      return;
                    }
                    onObjection?.(request.id, objectionReason.trim());
                    setShowObjectionForm(false);
                    setObjectionReason("");
                  }} data-testid="button-submit-objection">
                  تقديم الاعتراض
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {request.status === "objected" && (
        <div className="rounded-xl p-4 bg-[#ec9a18]/[0.05] border border-[#ec9a18]/10 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ec9a18]/[0.1] flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ec9a18]" />
            </div>
            <p className="font-medium text-[13px] text-[#1F2937]">تم تقديم اعتراض على هذا الطلب</p>
          </div>
          <p className="text-[12px] text-[#1F2937]/60 leading-relaxed ps-9">اعتراضك قيد المراجعة من قِبل رئيس المحكمة</p>
          {request.objectionDate && (
            <p className="text-xs text-muted-foreground">تاريخ تقديم الاعتراض: {request.objectionDate}</p>
          )}
        </div>
      )}

      {request.status !== "completed" ? null : needsPayment ? (
        <div className="rounded-xl p-4 bg-[#ec9a18]/[0.04] space-y-4">
          <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
            <DialogContent hideClose className="max-w-md rounded-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#187860]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e6f4ea" }}>
                    <CreditCard className="w-4 h-4 text-[#187860]" />
                  </div>
                  سداد التكاليف القضائية
                </DialogTitle>
              </DialogHeader>
              <PaymentModal price={requestPrice} onPay={() => { setShowPayModal(false); onPay?.(request.id); toast({ title: "تم سداد التكاليف", description: "يمكنك الآن استلام وثيقتك" }); }} onClose={() => setShowPayModal(false)} />
            </DialogContent>
          </Dialog>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,168,108,0.15)" }}>
              <CreditCard className="w-5 h-5" style={{ color: "#ec9a18" }} />
            </div>
            <div>
              <p className="font-medium text-[13px] text-foreground">مطلوب سداد التكاليف القضائية</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">لا يمكن استلام الوثيقة إلا بعد سداد الرسوم المقررة</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-white border border-[#ebebeb]">
            <span className="text-sm text-muted-foreground">المبلغ المستحق</span>
            <span className="text-lg font-semibold text-[#187860]">{requestPrice}</span>
          </div>
          <Button className="w-full font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
            onClick={() => setShowPayModal(true)} data-testid="button-pay-fees">
            <CreditCard className="w-4 h-4 me-2" />
            سداد التكاليف القضائية ←
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pt-4 border-t">
          {request.isPaid && (
            <div className="flex items-center gap-2 text-[11px] text-[#187860] bg-[#187860]/[0.06] rounded-md px-2.5 py-1 justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
              تم سداد التكاليف القضائية
            </div>
          )}

          {request.requestType === "case_review" ? (
            <div className="space-y-4">
              {isCaseReviewViewed && (
                <div className="space-y-3">
                  <Dialog open={showReviewPayModal} onOpenChange={setShowReviewPayModal}>
                    <DialogContent hideClose className="max-w-md rounded-2xl" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#187860]">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e6f4ea" }}>
                            <Eye className="w-4 h-4 text-[#187860]" />
                          </div>
                          سداد رسوم الاطلاع مرة أخرى
                        </DialogTitle>
                      </DialogHeader>
                      <PaymentModal price={requestPrice} onPay={() => {
                        setShowReviewPayModal(false);
                        const updatedViewed = new Set<string>(JSON.parse(localStorage.getItem("viewedCaseReviews") || "[]"));
                        updatedViewed.delete(request.id);
                        localStorage.setItem("viewedCaseReviews", JSON.stringify(Array.from(updatedViewed)));
                        if (onCaseReviewView) {
                          (onCaseReviewView as any).__reset?.(request.id);
                        }
                        window.dispatchEvent(new CustomEvent("reset-case-review", { detail: request.id }));
                        toast({ title: "تم السداد بنجاح", description: "يمكنك الآن الضغط على زر الاطلاع لعرض الوثيقة" });
                      }} onClose={() => setShowReviewPayModal(false)} />
                    </DialogContent>
                  </Dialog>
                  <div className="rounded-xl p-4 bg-[#ec9a18]/[0.03] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#ec9a18]/[0.06] flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5 text-[#ec9a18]/80" />
                      </div>
                      <p className="font-medium text-[13px] text-foreground">الاطلاع مرة أخرى</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">يمكنك الاطلاع على الوثيقة مرة أخرى بعد سداد رسوم جديدة</p>
                    <div className="flex items-center justify-between rounded-lg p-3 bg-white">
                      <span className="text-[11px] text-muted-foreground">رسوم الاطلاع</span>
                      <span className="text-lg font-bold" style={{ color: "#187860" }}>{requestPrice}</span>
                    </div>
                    <Button className="w-full font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
                      onClick={() => setShowReviewPayModal(true)}
                      data-testid="button-rewatch-case-review">
                      <CreditCard className="w-4 h-4 me-2" />
                      سداد والاطلاع مرة أخرى ({requestPrice})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {request.digitalStamp?.applied && (
                <div className="rounded-2xl p-4 border border-[#187860]/20 bg-[#187860]/[0.03] space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#187860]" />
                    <p className="font-bold text-sm text-[#187860]">الاعتماد الرقمي</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 border">
                      <p className="text-muted-foreground text-[11px]">الختم الإلكتروني</p>
                      <p className="font-bold font-mono text-[#187860]">{request.digitalStamp.verificationCode}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{request.digitalStamp.circuitName}</p>
                    </div>
                    {request.digitalSignature?.applied && (
                      <div className="bg-white rounded-lg p-2 border">
                        <p className="text-muted-foreground text-[11px]">التوقيع الرقمي</p>
                        <p className="font-bold font-mono text-[11px] text-[#187860] break-all" dir="ltr">{request.digitalSignature.hash}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{request.digitalSignature.signDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button className="w-full font-medium" style={{ background: "#187860", color: "white" }}
                onClick={() => generateCertifiedDocument(request)}
                data-testid="button-download-document">
                <Download className="w-4 h-4 me-2" />
                تحميل الوثيقة المعتمدة
              </Button>

              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">رمز التحقق الرقمي</p>
                <div className="bg-white p-2 rounded-lg border">
                  <QRCodeSVG value={trackingUrl} size={100} />
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">{request.trackingNumber}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2 no-print">
        <Button variant="outline" className="flex-1 font-medium" onClick={onClose}>إغلاق</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="hover-elevate"
            onClick={() => {
              navigator.clipboard.writeText(request.trackingNumber);
              toast({ title: "تم نسخ رقم الطلب", description: request.trackingNumber });
            }}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="hover-elevate"
            onClick={() => {
              const trackUrl = `${window.location.origin}/track/${request.trackingNumber}`;
              const qrSvg = renderToStaticMarkup(createElement(QRCodeSVG, { value: trackUrl, size: 120, fgColor: "#187860", level: "M" }));
              const w = window.open("", "_blank");
              if (!w) return;
              w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>وزارة العدل - ${request.trackingNumber}</title>
                <link href="https://fonts.googleapis.com/css2?family=Droid+Arabic+Kufi:wght@400;700&display=swap" rel="stylesheet">
                <style>
                  *{margin:0;padding:0;box-sizing:border-box}
                  body{font-family:'Droid Arabic Kufi',sans-serif;direction:rtl;padding:30px 20px;color:#1F2937;background:white;max-width:700px;margin:0 auto}
                  h1{color:#187860;font-size:18px;font-weight:900;border-bottom:2px solid #187860;padding-bottom:12px;margin-bottom:8px;text-align:center}
                  .sub{font-size:11px;color:#666;margin-bottom:20px;text-align:center}
                  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
                  .field{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px}
                  .field label{display:block;font-size:10px;color:#999;font-weight:bold;margin-bottom:3px}
                  .field p{font-weight:bold;font-size:13px}
                  .qr-container{text-align:center;margin-top:20px;padding:15px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px}
                  .qr-container svg{width:120px;height:120px;max-width:120px;display:inline-block}
                  .qr-container p{font-size:10px;color:#666}
                  .qr-tracking{font-family:monospace;font-size:12px;font-weight:800;color:#187860;margin-top:6px}
                  .footer{margin-top:20px;font-size:9px;color:#999;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px}
                  @media print{body{padding:20px}@page{margin:15mm}}
                  @media (max-width:500px){.grid{grid-template-columns:1fr}body{padding:15px 12px}h1{font-size:16px}}
                </style></head><body>
                <h1>بوابة خدمات المستفيدين وزارة العدل</h1>
                <div class="sub">تفاصيل الطلب القضائي ${d.toLocaleDateString("ar-SA-u-ca-islamic-umalqura")} ${d.toLocaleTimeString("ar-SA")}</div>
                <div class="grid">
                  <div class="field"><label>رقم الطلب</label><p style="font-family:monospace">${request.trackingNumber}</p></div>
                  <div class="field"><label>الحالة</label><p>${request.status === "completed" ? "مكتمل" : request.status === "referred" ? "محال" : "قيد المعالجة"}</p></div>
                  <div class="field"><label>مقدم الطلب</label><p>${request.applicantName}</p></div>
                  <div class="field"><label>رقم الهوية</label><p style="font-family:monospace">${request.applicantId}</p></div>
                  <div class="field"><label>نوع الطلب</label><p>${getRequestTypeLabel(request.requestType)}</p></div>
                  <div class="field"><label>${request.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</label><p>${request.requestType === "replacement_doc" ? (request.judgmentNumber || "-") : request.caseNumber}</p></div>
                  <div class="field"><label>تاريخ التقديم</label><p>${formatDate(request.createdAt)}</p></div>
                  <div class="field"><label>القسم</label><p>${getCircuitLabel(request.circuit)}</p></div>
                  <div class="field"><label>الصفة</label><p>${getApplicantTypeLabel(request.applicantType)}</p></div>
                </div>
                <div class="qr-container">
                  <p style="font-weight:700;color:#333;margin-bottom:8px">رمز التحقق من الوثيقة</p>
                  ${qrSvg}
                  <p class="qr-tracking">${request.trackingNumber}</p>
                </div>
                <div class="footer">وزارة العدل المملكة العربية السعودية • هذه وثيقة رقمية لأغراض المتابعة فقط</div>
                </body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}>
            <Printer className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ viewMode, setViewMode, testIdPrefix = "" }: { viewMode: "list" | "grid"; setViewMode: (v: "list" | "grid") => void; testIdPrefix?: string }) {
  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-0.5 gap-0.5">
      <button
        className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => setViewMode("list")} title="عرض قائمة" data-testid={`button-${testIdPrefix}view-list`}>
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => setViewMode("grid")} title="عرض شبكة" data-testid={`button-${testIdPrefix}view-grid`}>
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function HistoryArchive({ completedRequests, onView, isCaseReviewViewed, onCaseReviewView, onConfirmCaseReview, viewMode, setViewMode }: { completedRequests: Request[]; onView: (r: Request) => void; isCaseReviewViewed: (id: string) => boolean; onCaseReviewView: (id: string) => void; onConfirmCaseReview: (request: Request, onConfirm: () => void) => void; viewMode: "list" | "grid"; setViewMode: (v: "list" | "grid") => void }) {
  const { toast } = useToast();
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [historySortOrder, setHistorySortOrder] = useState("newest");
  const [historyRatingFilter, setHistoryRatingFilter] = useState("all");
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);

  const filteredHistory = useMemo(() => {
    let result = [...completedRequests];
    if (historySearch) {
      const q = historySearch.toLowerCase();
      result = result.filter(r =>
        r.trackingNumber.includes(q) ||
        r.caseNumber.toLowerCase().includes(q) ||
        r.applicantName.toLowerCase().includes(q) ||
        getRequestTypeLabel(r.requestType).includes(q)
      );
    }
    if (historyTypeFilter !== "all") {
      result = result.filter(r => r.requestType === historyTypeFilter);
    }
    if (historyRatingFilter !== "all") {
      if (historyRatingFilter === "rated") result = result.filter(r => r.rating);
      else if (historyRatingFilter === "unrated") result = result.filter(r => !r.rating);
      else result = result.filter(r => r.rating === parseInt(historyRatingFilter));
    }
    if (historySortOrder === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [completedRequests, historySearch, historyTypeFilter, historySortOrder, historyRatingFilter]);

  const exportHistoryCSV = () => {
    const headers = ["رقم التتبع", "نوع الطلب", "الدائرة", "تاريخ التقديم", "التقييم"];
    const rows = filteredHistory.map(r => [
      r.trackingNumber, getRequestTypeLabel(r.requestType, true), getCircuitLabel(r.circuit), r.createdAt, r.rating ? `${r.rating}/5` : "بدون تقييم"
    ]);
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `سجل_الطلبات_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "تم تصدير السجل بنجاح" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-lg" data-testid="text-history-title">سجل الطلبات المكتملة</h3>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{filteredHistory.length} طلب</span>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} testIdPrefix="history-" />
          {completedRequests.length > 0 && (
            <Button size="sm" variant="outline" onClick={exportHistoryCSV} data-testid="button-export-history" className="text-xs h-8">
              <Download className="w-3 h-3 me-1" />تصدير
            </Button>
          )}
        </div>
      </div>

      {completedRequests.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistoryFilters(v => !v)}
              data-testid="button-toggle-history-search"
              className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-all ${
                showHistoryFilters
                  ? "bg-[#187860] text-white"
                  : "bg-white text-[#6B7280] border border-[#ebebeb] hover:border-[#187860]/30"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">بحث وفلترة</span>
              {(historySearch || historyTypeFilter !== "all" || historyRatingFilter !== "all") && !showHistoryFilters && (
                <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-[#187860]">
                  {[historySearch, historyTypeFilter !== "all", historyRatingFilter !== "all"].filter(Boolean).length}
                </span>
              )}
            </button>
            <span className="text-[11px] text-muted-foreground">
              {filteredHistory.length === completedRequests.length ? `${completedRequests.length} طلب` : `${filteredHistory.length} من ${completedRequests.length}`}
            </span>
          </div>

          <AnimatePresence>
            {showHistoryFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 rounded-2xl bg-white p-4 border" style={{ borderColor: "#ebebeb" }}>
                  <div className="relative">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1F2937]/40 pointer-events-none" />
                    <input
                      placeholder="ابحث برقم الطلب أو الاسم..."
                      className="w-full ps-12 pe-10 py-3.5 rounded-2xl text-sm bg-[#ebebeb] border-none focus:outline-none focus:ring-2 focus:ring-[#187860]/20 placeholder:text-[#1F2937]/40"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      data-testid="input-history-search"
                      autoFocus
                    />
                    {historySearch && (
                      <button className="absolute end-4 top-1/2 -translate-y-1/2 text-[#1F2937]/40 hover:text-[#1F2937]/70 transition-colors" onClick={() => setHistorySearch("")}>
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <Select dir="rtl" value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                      <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-history-type">
                        <SelectValue placeholder="جميع الأنواع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="certified_copy">نسخة مصدقة</SelectItem>
                        <SelectItem value="case_review">الاطلاع على الأوراق</SelectItem>
                        <SelectItem value="replacement_doc">نسخة بديلة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select dir="rtl" value={historyRatingFilter} onValueChange={setHistoryRatingFilter}>
                      <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-history-rating">
                        <SelectValue placeholder="التقييم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع التقييمات</SelectItem>
                        <SelectItem value="rated">تم التقييم</SelectItem>
                        <SelectItem value="unrated">بدون تقييم</SelectItem>
                        <SelectItem value="5">5 نجوم</SelectItem>
                        <SelectItem value="4">4 نجوم</SelectItem>
                        <SelectItem value="3">3 نجوم</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select dir="rtl" value={historySortOrder} onValueChange={setHistorySortOrder}>
                      <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-history-sort">
                        <SelectValue placeholder="الترتيب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">الأحدث أولاً</SelectItem>
                        <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(historySearch || historyTypeFilter !== "all" || historyRatingFilter !== "all") && (
                    <div className="flex justify-end">
                      <button onClick={() => { setHistorySearch(""); setHistoryTypeFilter("all"); setHistoryRatingFilter("all"); }} className="text-[11px] text-[#1F2937]/40 hover:text-[#1F2937]/70 underline" data-testid="button-clear-history-filters">
                        مسح الفلاتر
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {filteredHistory.length === 0 && completedRequests.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد طلبات مكتملة بعد</p>
        </div>
      )}
      {filteredHistory.length === 0 && completedRequests.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد نتائج تطابق البحث</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => { setHistorySearch(""); setHistoryTypeFilter("all"); setHistoryRatingFilter("all"); }}>
            مسح الفلاتر
          </Button>
        </div>
      )}
      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
      {filteredHistory.map((req, index) => (
        <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
          <Card className="hover-elevate" dir="rtl" data-testid={`card-history-${req.id}`}>
            <CardContent className="p-4">
              {/* Row 1: Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                  <span className="font-bold text-sm font-mono text-foreground">{req.trackingNumber}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#187860]/[0.08] text-[#187860]">
                  <CheckCircle className="w-3 h-3" />مكتمل
                </span>
              </div>
              <div className="mb-3">
                <RequestTypePill type={req.requestType} />
              </div>

              {/* Row 2: Info grid */}
              <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground mb-0.5">مقدم الطلب</p>
                  <p className="text-xs font-medium text-foreground truncate">{req.applicantName || "-"}</p>
                </div>
                <div className="text-center border-x border-[#ebebeb]">
                  <p className="text-[11px] text-muted-foreground mb-0.5">الدائرة</p>
                  <p className="text-xs font-medium text-foreground truncate px-1">{getCircuitLabel(req.circuit)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground mb-0.5">التاريخ</p>
                  <p className="text-xs font-medium text-foreground">{formatDate(req.createdAt)}</p>
                </div>
              </div>

              {/* Row 3: Rating */}
              {req.rating && (
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= req.rating! ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/20"}`} />
                  ))}
                  {req.ratingComment && <span className="text-xs text-muted-foreground ms-1">"{req.ratingComment}"</span>}
                </div>
              )}

              {/* Row 4: Actions */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-[#ebebeb]">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {req.requestType === "case_review" ? (
                    isCaseReviewViewed(req.id) ? (
                      <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#B42318] border-[#B42318]/30 hover:bg-[#B42318]/[0.06] rounded-xl font-medium"
                        onClick={() => onView(req)}
                        data-testid={`button-rewatch-history-${req.id}`}>
                        <Eye className="w-3 h-3 me-1" />تم الاطلاع
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#187860] border-[#187860]/25 hover:bg-[#187860]/[0.06] rounded-xl font-medium"
                        onClick={() => onConfirmCaseReview(req, () => openCaseReviewViewer(req, () => onCaseReviewView(req.id)))}
                        data-testid={`button-case-review-history-${req.id}`}>
                        <Eye className="w-3 h-3 me-1" />اطلاع
                      </Button>
                    )
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#187860] border-[#187860]/25 hover:bg-[#187860]/[0.06] rounded-xl font-medium"
                        onClick={() => generateCertifiedDocument(req)}
                        data-testid={`button-download-history-${req.id}`}>
                        <Download className="w-3 h-3 me-1" />تحميل
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs px-2 rounded-xl font-medium"
                        onClick={() => generateCertifiedDocument(req)}
                        data-testid={`button-print-history-${req.id}`}>
                        <Printer className="w-3 h-3 me-1" />طباعة
                      </Button>
                    </>
                  )}
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs px-3 rounded-xl font-medium"
                  onClick={() => onView(req)} data-testid={`button-view-history-${req.id}`}>
                  <FileText className="w-3.5 h-3.5 me-1" />تفاصيل
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      </div>
    </div>
  );
}

export default function BeneficiaryPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [storedRequests, setStoredRequests] = useState<Request[]>(() => loadRequests());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("track");
  const [showNewForm, setShowNewForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formGoBackTrigger, setFormGoBackTrigger] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [openComplaintOnSelect, setOpenComplaintOnSelect] = useState(false);
  const [ratingRequest, setRatingRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [beneficiaryPage, setBeneficiaryPage] = useState(1);
  const BENEFICIARY_PAGE_SIZE = 10;
  useEffect(() => { setBeneficiaryPage(1); }, [searchQuery, statusFilter, typeFilter, sortOrder]);
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [smsBanners, setSmsBanners] = useState<{ id: string; text: string; trackingNumber: string; type: "sms" | "email" }[]>([]);
  const [viewedCaseReviews, setViewedCaseReviews] = useState<Set<string>>(() => {
    try { const s = localStorage.getItem("viewedCaseReviews"); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); }
  });
  const [caseReviewConfirm, setCaseReviewConfirm] = useState<{ request: Request; onConfirm: () => void } | null>(null);
  const prevStatuses = useRef<Record<string, RequestStatus>>({});

  const markCaseReviewViewed = (reqId: string) => {
    setViewedCaseReviews(prev => {
      const next = new Set(prev);
      next.add(reqId);
      localStorage.setItem("viewedCaseReviews", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const confirmCaseReview = (request: Request, onConfirm: () => void) => {
    setCaseReviewConfirm({ request, onConfirm });
  };

  const resetCaseReviewViewed = (reqId: string) => {
    setViewedCaseReviews(prev => {
      const next = new Set(prev);
      next.delete(reqId);
      localStorage.setItem("viewedCaseReviews", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (id) resetCaseReviewViewed(id);
    };
    window.addEventListener("reset-case-review", handler);
    return () => window.removeEventListener("reset-case-review", handler);
  }, []);

  const isCaseReviewViewed = (reqId: string) => viewedCaseReviews.has(reqId);

  const getStatusArabic = (s: string) => s === "completed" ? "مكتمل" : s === "referred" ? "قيد الإحالة" : "قيد المعالجة";

  const allRequests = [...storedRequests, ...MOCK_REQUESTS.filter(
    (mr) => !storedRequests.some((sr) => sr.id === mr.id)
  )];

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") setNotifEnabled(true);
  }, []);

  useEffect(() => {
    const snapshot: Record<string, RequestStatus> = { ...prevStatuses.current };
    let justCompleted: Request | undefined;

    allRequests.forEach((r) => {
      const prev = snapshot[r.id];
      if (prev && prev !== r.status) {
        requestBrowserNotification("تحديث طلبك", `طلب ${r.trackingNumber} أصبح: ${r.status === "completed" ? "مكتمل" : r.status === "referred" ? "محال" : "قيد المعالجة"}`);
        const bannerId = `${r.id}-${Date.now()}`;
        setSmsBanners(prev => [...prev, { id: bannerId, trackingNumber: r.trackingNumber, text: getStatusArabic(r.status), type: "sms" }]);
        setTimeout(() => { setSmsBanners(prev => prev.filter(b => b.id !== bannerId)); }, 6000);
        const emailId = `${bannerId}-email`;
        setTimeout(() => {
          setSmsBanners(prev => [...prev, { id: emailId, trackingNumber: r.trackingNumber, text: getStatusArabic(r.status), type: "email" }]);
          setTimeout(() => { setSmsBanners(prev => prev.filter(b => b.id !== emailId)); }, 5000);
        }, 1200);

        if (prev !== "completed" && r.status === "completed" && !r.rating) {
          justCompleted = r;
        }
      }
      prevStatuses.current[r.id] = r.status;
    });

    if (justCompleted) {
      const req = justCompleted;
      setTimeout(() => setRatingRequest(req), 2000);
    }
  }, [allRequests]);

  const filtered = allRequests.filter((r) => {
    if (r.status === "completed" || r.status === "rejected" || r.status === "objected") return false;
    const matchSearch = !searchQuery ||
      r.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseNumber.includes(searchQuery) ||
      r.applicantName.includes(searchQuery);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.requestType === typeFilter;
    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortOrder === "urgent") return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
    return 0;
  });

  const activeFiltersCount = [statusFilter !== "all", typeFilter !== "all", searchQuery.trim() !== ""].filter(Boolean).length;

  const handleNewRequest = (req: Request) => {
    const updated = [req, ...storedRequests];
    setStoredRequests(updated);
    saveRequests(updated);
    setShowNewForm(false);
    setActiveTab("track");
  };

  const handleRate = (id: string, rating: number, comment: string) => {
    const updated = storedRequests.map((r) => r.id === id ? { ...r, rating, ratingComment: comment } : r);
    setStoredRequests(updated);
    saveRequests(updated);
  };

  const handlePayRequest = (id: string) => {
    const existsInStored = storedRequests.some((r) => r.id === id);
    let updated: Request[];
    if (existsInStored) {
      updated = storedRequests.map((r) => r.id === id ? { ...r, isPaid: true } : r);
    } else {
      const mockReq = MOCK_REQUESTS.find((r) => r.id === id);
      if (mockReq) {
        updated = [...storedRequests, { ...mockReq, isPaid: true }];
      } else {
        updated = storedRequests;
      }
    }
    setStoredRequests(updated);
    saveRequests(updated);
    if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, isPaid: true });
  };

  const handleObjection = (id: string, reason: string) => {
    const now = new Date();
    const objectionUpdate = {
      status: "objected" as RequestStatus,
      objectionReason: reason,
      objectionDate: now.toLocaleDateString("ar-EG"),
    };
    const existsInStored = storedRequests.some((r) => r.id === id);
    let updated: Request[];
    if (existsInStored) {
      updated = storedRequests.map((r) => r.id === id ? { ...r, ...objectionUpdate } : r);
    } else {
      const mockReq = MOCK_REQUESTS.find((r) => r.id === id);
      if (mockReq) {
        updated = [...storedRequests, { ...mockReq, ...objectionUpdate }];
      } else {
        updated = storedRequests;
      }
    }
    setStoredRequests(updated);
    saveRequests(updated);
    const updatedReq = updated.find(r => r.id === id) || MOCK_REQUESTS.find(r => r.id === id);
    if (updatedReq && selectedRequest?.id === id) {
      setSelectedRequest({ ...updatedReq, ...objectionUpdate });
    }
    toast({ title: "تم تقديم الاعتراض بنجاح", description: "سيتم مراجعة اعتراضك من قِبل رئيس المحكمة" });
  };

  const handleComplaint = (request: Request, reason: string) => {
    const existing = loadTickets();
    const alreadyFiled = existing.some(t => t.requestNumber === request.trackingNumber && t.status !== "resolved");
    if (alreadyFiled) {
      toast({ title: "تم تقديم شكوى على هذا الطلب مسبقاً", description: "الشكوى قيد المتابعة من الإدارة", variant: "destructive" });
      return;
    }
    const daysOverdue = Math.ceil((Date.now() - new Date(request.slaDeadline).getTime()) / (1000 * 60 * 60 * 24));
    const newTicket: Ticket = {
      id: `4${Math.floor(100000000 + Math.random() * 900000000)}`,
      title: `شكوى تأخر معالجة الطلب رقم ${request.trackingNumber}`,
      priority: daysOverdue > 5 ? "high" : daysOverdue > 2 ? "medium" : "low",
      status: "open",
      date: new Date().toISOString().split("T")[0],
      requestNumber: request.trackingNumber,
      requestType: getRequestTypeLabel(request.requestType),
      beneficiary: request.applicantName,
      idNumber: request.applicantId.slice(0, 4) + "******",
      department: request.assignedTo ? "خدمات المستفيدين" : "مركز تدقيق الطلبات",
      assignedTo: request.assignedTo || "غير معين",
      description: reason,
      slaRemaining: `متأخر بـ ${daysOverdue} ${daysOverdue === 1 ? "يوم" : "أيام"}`,
    };
    const updated = [...existing, newTicket];
    saveTickets(updated);
    toast({ title: "تم إرسال الشكوى بنجاح", description: "ستتم متابعة شكواك من قِبل إدارة المحكمة" });
  };

  const enableNotifications = async () => {
    if (notifEnabled) {
      toast({ title: "الإشعارات مفعّلة بالفعل", description: "ستصلك إشعارات عند تحديث حالة طلباتك" });
      return;
    }
    if (!("Notification" in window)) {
      toast({ title: "المتصفح لا يدعم الإشعارات", description: "جرّب متصفح آخر مثل Chrome", variant: "destructive" });
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifEnabled(true);
        new Notification("وزارة العدل", { body: "سيتم إشعارك عند تحديث حالة طلباتك" });
        toast({ title: "تم تفعيل الإشعارات" });
      } else {
        toast({ title: "لم يتم منح إذن الإشعارات", description: "يمكنك السماح بها من إعدادات المتصفح", variant: "destructive" });
      }
    } catch {
      toast({ title: "تعذّر تفعيل الإشعارات", description: "قد يكون المتصفح يمنع هذه الميزة", variant: "destructive" });
    }
  };

  const resubmitRequest = (req: Request) => {
    const draft = {
      applicantType: req.applicantType,
      applicantName: req.applicantName,
      applicantId: req.applicantId,
      documentNumber: "",
      requestType: req.requestType,
      caseNumber: req.caseNumber,
      judgmentNumber: req.judgmentNumber,
      judgmentDate: req.judgmentDate,
      circuit: req.circuit,
      agreed: false,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setActiveTab("new");
    setShowNewForm(true);
    toast({ title: "تم تحميل بيانات الطلب السابق", description: "يمكنك تعديل البيانات قبل الإرسال" });
  };

  const completedRequests = allRequests.filter((r) => r.status === "completed");
  const rejectedRequests = allRequests.filter((r) => r.status === "rejected");
  const objectedRequests = allRequests.filter((r) => r.status === "objected");
  const awaitingPaymentRequests = allRequests.filter((r) => {
    const rPrice = REQUEST_TYPES.find(rt => rt.value === r.requestType)?.price || "";
    const rHasFee = rPrice !== "" && rPrice !== "مجاني";
    return r.status === "completed" && rHasFee && !r.isPaid;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <PageHeader
        title="بوابة المستفيد"
        subtitle="تقديم ومتابعة الطلبات القضائية"
        role="beneficiary"
        userName="عبدالله محمد السبيعي"
        onBack={() => {
          if (selectedRequest) {
            setSelectedRequest(null);
          } else if (activeTab === "new") {
            if (formStep === 1) { setActiveTab("track"); setShowNewForm(false); setFormStep(1); }
            else { setFormGoBackTrigger(v => v + 1); }
          } else {
            navigate("/");
          }
        }}
      />

      <Dialog open={!!caseReviewConfirm} onOpenChange={() => setCaseReviewConfirm(null)}>
        <DialogContent hideClose className="max-w-md rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-start text-[#187860]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5cb89c]/[0.1]">
                <Eye className="w-4 h-4 text-[#187860]" />
              </div>
              إشعار قبل الاطلاع
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-[#5cb89c]/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#5cb89c]/[0.1] flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#187860]" />
                </div>
                <p className="font-medium text-[13px] text-foreground">تنبيه مهم</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-none ps-0 leading-relaxed">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#187860] mt-1.5 flex-shrink-0" />
                  <span>يُسمح بالاطلاع على الوثيقة <strong className="text-foreground">مرة واحدة فقط</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#187860] mt-1.5 flex-shrink-0" />
                  <span>لا يمكن تحميل أو حفظ أو طباعة الوثيقة</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#187860] mt-1.5 flex-shrink-0" />
                  <span>للاطلاع مرة أخرى يلزم <strong className="text-foreground">سداد رسوم جديدة</strong></span>
                </li>
              </ul>
            </div>
            {caseReviewConfirm && (
              <div className="rounded-lg p-3 bg-muted/40 border text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#187860] flex-shrink-0" />
                <div>
                  <span className="text-foreground font-medium">رقم الطلب: </span>
                  <span className="font-mono font-bold">{caseReviewConfirm.request.trackingNumber}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">هل أنت متأكد من رغبتك في الاطلاع الآن؟</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl h-10" onClick={() => setCaseReviewConfirm(null)}>
                إلغاء
              </Button>
              <Button className="flex-1 font-medium rounded-xl h-10" style={{ background: "#187860", color: "white" }}
                onClick={() => {
                  if (caseReviewConfirm) {
                    caseReviewConfirm.onConfirm();
                    setCaseReviewConfirm(null);
                  }
                }}
                data-testid="button-confirm-case-review">
                <Eye className="w-4 h-4 me-2" />
                موافق، الاطلاع الآن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8" dir="rtl">

        {selectedRequest ? (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <RequestDetailModal request={selectedRequest} onClose={() => { setSelectedRequest(null); setOpenComplaintOnSelect(false); }} onPay={handlePayRequest} onObjection={handleObjection} onComplaint={handleComplaint} isCaseReviewViewed={isCaseReviewViewed(selectedRequest.id)} onCaseReviewView={markCaseReviewViewed} onConfirmCaseReview={confirmCaseReview} autoOpenComplaint={openComplaintOnSelect} />
          </motion.div>
        ) : (<>

        

        <div className="mb-6">
          {!showNewForm && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-center mb-4 sm:mb-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowNewForm(true); setActiveTab("new"); }}
                  data-testid="button-new-request-fab"
                  className="flex items-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl font-medium text-white text-sm active:opacity-90"
                  style={{ background: "#187860" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>طلب جديد</span>
                </motion.button>
              </div>
              <div className="overflow-x-auto -mx-3 sm:-mx-0 px-3 sm:px-0 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
                <div className="inline-flex w-max sm:w-full gap-1 sm:gap-0 p-1 rounded-xl bg-muted/60">
                  {[
                    { value: "track", label: "متابعة", icon: FileText },
                    { value: "awaiting_payment", label: "بانتظار السداد", icon: CreditCard, badge: awaitingPaymentRequests.length, badgeColor: "#ec9a18" },
                    { value: "rejected", label: "المرفوضة", icon: XCircle, badge: rejectedRequests.length, badgeColor: "#B42318" },
                    { value: "objected", label: "المعترض عليها", icon: AlertTriangle, badge: objectedRequests.length, badgeColor: "#5cb89c" },
                    { value: "history", label: "المكتملة", icon: History },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = (activeTab === "new" ? "track" : activeTab) === tab.value;
                    return (
                      <button
                        key={tab.value}
                        data-testid={`tab-${tab.value === "awaiting_payment" ? "awaiting-payment" : tab.value}`}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap sm:flex-1 active:scale-[0.97] ${
                          isActive
                            ? "bg-white text-[#187860] shadow-sm"
                            : "text-[#6B7280] hover:text-[#1F2937]"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        {tab.label}
                        {tab.badge && tab.badge > 0 ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${tab.badgeColor}11`, color: tab.badgeColor }}>{tab.badge}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="hidden"></TabsList>

          <TabsContent value="track">
            {/* ── شريط الأدوات ── */}
            <div className="flex items-center justify-between mb-4 gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSearchFilter(v => !v)}
                  data-testid="button-toggle-search"
                  className={`h-9 sm:h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-all active:scale-[0.97] ${
                    showSearchFilter
                      ? "bg-[#187860] text-white"
                      : "bg-white text-[#6B7280] border border-[#ebebeb] hover:border-[#187860]/30"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">بحث وفلترة</span>
                  {activeFiltersCount > 0 && !showSearchFilter && (
                    <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-[#187860]">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">
                  {filtered.length === allRequests.length ? `${allRequests.length} طلب` : `${filtered.length} من ${allRequests.length}`}
                </span>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} testIdPrefix="beneficiary-" />
              </div>
            </div>

            <AnimatePresence>
              {showSearchFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 rounded-2xl bg-white p-4 border" style={{ borderColor: "#ebebeb" }}>
                    <div className="relative">
                      <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1F2937]/40 pointer-events-none" />
                      <input
                        placeholder="ابحث برقم الطلب أو رقم القضية أو الاسم"
                        className="w-full ps-12 pe-10 py-3.5 rounded-2xl text-sm bg-[#ebebeb] border-none focus:outline-none focus:ring-2 focus:ring-[#187860]/20 placeholder:text-[#1F2937]/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-requests"
                        autoFocus
                      />
                      {searchQuery && (
                        <button className="absolute end-4 top-1/2 -translate-y-1/2 text-[#1F2937]/40 hover:text-[#1F2937]/70 transition-colors" onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <Select dir="rtl" value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-type-filter">
                          <SelectValue placeholder="جميع الأنواع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          <SelectItem value="certified_copy">نسخة مصدقة</SelectItem>
                          <SelectItem value="case_review">الاطلاع على الأوراق</SelectItem>
                          <SelectItem value="replacement_doc">نسخة بديلة</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select dir="rtl" value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <SelectTrigger className="rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-status-filter">
                          <SelectValue placeholder="جميع الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الحالات</SelectItem>
                          <SelectItem value="processing">قيد المعالجة</SelectItem>
                          <SelectItem value="referred">محال</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select dir="rtl" value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-full rounded-2xl bg-[#ebebeb] border-none h-12 text-sm text-[#1F2937]/70 focus:ring-2 focus:ring-[#187860]/20" data-testid="select-sort-order">
                        <SelectValue placeholder="الأحدث أولاً" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">الأحدث أولاً</SelectItem>
                        <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                        <SelectItem value="urgent">الأكثر إلحاحاً</SelectItem>
                      </SelectContent>
                    </Select>

                    {activeFiltersCount > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs text-[#1F2937]/40">الفلاتر النشطة:</span>
                        {statusFilter !== "all" && (
                          <button onClick={() => setStatusFilter("all")} className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium bg-[#187860]/8 text-[#187860] hover:bg-[#187860]/12 transition-colors" data-testid="chip-clear-status">
                            {statusFilter === "completed" ? "مكتمل" : statusFilter === "processing" ? "قيد المعالجة" : "محال"}
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        {typeFilter !== "all" && (
                          <button onClick={() => setTypeFilter("all")} className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium bg-[#187860]/8 text-[#187860] hover:bg-[#187860]/12 transition-colors" data-testid="chip-clear-type">
                            {typeFilter === "certified_copy" ? "نسخة مصدقة" : typeFilter === "case_review" ? "الاطلاع" : "نسخة بديلة"}
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery(""); }} className="text-[11px] text-[#1F2937]/40 hover:text-[#1F2937]/70 underline" data-testid="button-clear-all-filters">
                          مسح الكل
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── نتائج البحث ── */}

            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
              {filtered.length === 0 && (
                <div className="text-center py-16 rounded-2xl border border-dashed">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">لا توجد نتائج</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">جرّب تعديل كلمة البحث أو الفلاتر</p>
                  {activeFiltersCount > 0 && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery(""); }}>
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              )}
              <AnimatePresence>
                {(() => { const _t = Math.max(1, Math.ceil(filtered.length / BENEFICIARY_PAGE_SIZE)); const _p = Math.min(beneficiaryPage, _t); return filtered.slice((_p - 1) * BENEFICIARY_PAGE_SIZE, _p * BENEFICIARY_PAGE_SIZE); })().map((req, index) => {
                  const sla = getSlaStatus(req.slaDeadline, req.status);
                  const daysLeft = Math.ceil((new Date(req.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const reqPrice = REQUEST_TYPES.find(r => r.value === req.requestType)?.price || "";
                  const reqHasFee = reqPrice !== "" && reqPrice !== "مجاني";
                  const needsPayment = req.status === "completed" && reqHasFee && !req.isPaid;
                  const isDelayed = isOverSla(req.slaDeadline, req.status);
                  const daysOverdue = isDelayed ? Math.abs(Math.ceil((new Date(req.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
                  const isCaseReview = req.requestType === "case_review";
                  const canDownload = req.status === "completed" && req.isPaid && !isCaseReview;
                  const canViewCaseReview = req.status === "completed" && req.isPaid && isCaseReview && !isCaseReviewViewed(req.id);
                  const caseReviewUsed = req.status === "completed" && req.isPaid && isCaseReview && isCaseReviewViewed(req.id);
                  const isExpanded = expandedRequestId === req.id;

                  return (
                    <motion.div key={req.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ delay: index * 0.04 }}>
                      <div
                        className="rounded-xl bg-card border border-border hover-elevate transition-all"
                        dir="rtl"
                        data-testid={`card-request-${req.id}`}
                      >
                        <div className="p-4">
                          {needsPayment && (
                            <div className="flex items-center gap-2 mb-3 text-[11px] font-medium bg-[#ec9a18]/[0.03] text-[#ec9a18]/80 rounded-lg px-3 py-1.5">
                              <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-[#ec9a18]/80" />
                              بانتظار السداد
                            </div>
                          )}

                          {/* Row 1: Header */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                              <span className="font-bold text-sm font-mono text-foreground">{req.trackingNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isDelayed && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenComplaintOnSelect(true); setSelectedRequest(req); }}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#ec9a18]/[0.08] text-[#ec9a18] hover:bg-[#ec9a18]/[0.15] transition-colors"
                                  data-testid={`delayed-icon-${req.id}`}
                                  title="تجاوز الطلب المدة المتوقعة - رفع شكوى"
                                >
                                  <Clock className="w-3 h-3" />
                                  متأخر
                                </button>
                              )}
                              <RequestStatusBadge status={req.status} size="sm" />
                            </div>
                          </div>
                          <div className="mb-3">
                            <RequestTypePill type={req.requestType} />
                          </div>

                          {/* Row 2: Info grid */}
                          <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                            <div className="text-center">
                              <p className="text-[11px] text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                              <p className="text-xs font-medium text-foreground font-mono">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</p>
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

                          {/* Row 3: Progress bar */}
                          <div className="mb-3" data-testid={`progress-bar-${req.id}`}>
                            {(() => {
                              const statusOrder = ["pending", "processing", "referred", "completed"];
                              const currentIdx = statusOrder.indexOf(req.status === "rejected" || req.status === "objected" ? "pending" : req.status);
                              const isRejected = req.status === "rejected";
                              const isObjected = req.status === "objected";
                              const steps = [
                                { key: "pending", label: "جديد" },
                                { key: "processing", label: "معالجة" },
                                { key: "referred", label: "إحالة" },
                                { key: "completed", label: "مكتمل" },
                              ];
                              const accentColor = isRejected ? "rgba(180,35,24,0.7)" : isObjected ? "#5cb89c" : "#5cb89c";
                              const labelColor = isRejected ? "rgba(180,35,24,0.8)" : isObjected ? "#187860" : "#187860";
                              return (
                                <div className="flex items-center gap-1">
                                  {steps.map((step, si) => {
                                    const stepIdx = statusOrder.indexOf(step.key);
                                    const isActive = stepIdx <= currentIdx && !isRejected && !isObjected;
                                    const isCurrent = stepIdx === currentIdx && !isRejected && !isObjected;
                                    return (
                                      <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: isActive ? `${accentColor}30` : "#ebebeb" }}>
                                          {isActive && (
                                            <motion.div
                                              className="h-full rounded-full"
                                              style={{ background: accentColor }}
                                              initial={{ width: 0 }}
                                              animate={{ width: "100%" }}
                                              transition={{ duration: 0.5, delay: si * 0.1 }}
                                            />
                                          )}
                                        </div>
                                        <span className={`text-[8px] sm:text-[9px] leading-none ${
                                          isCurrent ? "font-bold" : isActive ? "font-medium" : "font-normal"
                                        }`} style={{ color: isActive ? labelColor : "#9CA3AF" }}>{step.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Row 4: Rating if rated */}
                          {req.rating && (
                            <div className="flex items-center gap-1 mb-3">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= req.rating! ? "fill-[#C7A86C] text-[#C7A86C]" : "text-muted-foreground/20"}`} />
                              ))}
                              <span className="text-xs text-muted-foreground ms-1">تقييمك</span>
                            </div>
                          )}

                          {/* Row 5: Action buttons */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-[#ebebeb]">
                            <div className="flex flex-wrap gap-1.5 flex-1">
                              {needsPayment && (
                                <Button size="sm" className="h-8 text-xs px-3 bg-[#ec9a18]/80 hover:bg-[#ec9a18]/70 text-white border-0 rounded-xl font-medium"
                                  onClick={() => setSelectedRequest(req)}
                                  data-testid={`button-pay-${req.id}`}>
                                  <CreditCard className="w-3.5 h-3.5 me-1" />سداد
                                </Button>
                              )}
                              {req.status === "completed" && !req.rating && (
                                <Button size="sm" variant="outline" className="h-8 text-xs px-2 rounded-xl font-medium"
                                  onClick={() => setRatingRequest(req)}
                                  data-testid={`button-rate-${req.id}`}>
                                  <Star className="w-3 h-3 me-1" />تقييم
                                </Button>
                              )}
                              {canDownload && (
                                <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#187860] border-[#187860]/25 hover:bg-[#187860]/[0.06] rounded-xl font-medium"
                                  onClick={() => generateCertifiedDocument(req)}
                                  data-testid={`button-download-${req.id}`}>
                                  <Download className="w-3 h-3 me-1" />تحميل
                                </Button>
                              )}
                              {canViewCaseReview && (
                                <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#187860] border-[#187860]/25 hover:bg-[#187860]/[0.06] rounded-xl font-medium"
                                  onClick={() => confirmCaseReview(req, () => openCaseReviewViewer(req, () => markCaseReviewViewed(req.id)))}
                                  data-testid={`button-case-review-${req.id}`}>
                                  <Eye className="w-3 h-3 me-1" />اطلاع
                                </Button>
                              )}
                              {caseReviewUsed && (
                                <Button size="sm" variant="outline" className="h-8 text-xs px-2 text-[#B42318] border-[#B42318]/30 hover:bg-[#B42318]/[0.06] line-through rounded-xl font-medium"
                                  onClick={() => setSelectedRequest(req)}
                                  data-testid={`button-rewatch-${req.id}`}>
                                  <Eye className="w-3 h-3 me-1" />اطلاع مرة أخرى
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-1.5 shrink-0 items-center">
                              <Button size="sm" variant="outline" className="h-8 text-xs px-3 rounded-xl font-medium"
                                onClick={() => setSelectedRequest(req)}
                                data-testid={`button-view-${req.id}`}>
                                <FileText className="w-3.5 h-3.5 me-1" />عرض الطلب
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground rounded-xl font-medium"
                                onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                                data-testid={`button-preview-${req.id}`}>
                                <ChevronRight className={`w-3 h-3 me-1 transition-transform ${isExpanded ? "rotate-90" : "-rotate-90"}`} />
                                {isExpanded ? "إخفاء" : "ملخص"}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded preview panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs" dir="rtl">
                                  <div className="bg-muted/40 rounded-lg p-2 text-start">
                                    <p className="text-muted-foreground mb-0.5">مقدم الطلب</p>
                                    <p className="font-semibold">{req.applicantName}</p>
                                  </div>
                                  <div className="bg-muted/40 rounded-lg p-2 text-start">
                                    <p className="text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                                    <p className="font-semibold">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</p>
                                  </div>
                                  {req.court && (
                                    <div className="bg-muted/40 rounded-lg p-2 text-start">
                                      <p className="text-muted-foreground mb-0.5">الجهة</p>
                                      <p className="font-semibold">{req.court}</p>
                                    </div>
                                  )}
                                  {req.judgmentDate && (
                                    <div className="bg-muted/40 rounded-lg p-2 text-start">
                                      <p className="text-muted-foreground mb-0.5">تاريخ الحكم</p>
                                      <p className="font-semibold">{req.judgmentDate}</p>
                                    </div>
                                  )}
                                  <div className="bg-muted/40 rounded-lg p-2 text-start">
                                    <p className="text-muted-foreground mb-0.5">تاريخ التقديم</p>
                                    <p className="font-semibold">{formatDate(req.createdAt)}</p>
                                  </div>
                                  <div className="bg-muted/40 rounded-lg p-2 text-start">
                                    <p className="text-muted-foreground mb-0.5">القسم</p>
                                    <p className="font-semibold">{getCircuitLabel(req.circuit)}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <Pagination total={filtered.length} page={Math.min(beneficiaryPage, Math.max(1, Math.ceil(filtered.length / BENEFICIARY_PAGE_SIZE)))} pageSize={BENEFICIARY_PAGE_SIZE} onChange={setBeneficiaryPage} testIdPrefix="beneficiary-pagination" />
            </div>

            {/* ── اقتراحات ── */}
            {allRequests.length > 0 && (
              <div className="mt-8 rounded-2xl border p-4" style={{ background: "rgba(24,120,96,0.04)", borderColor: "rgba(24,120,96,0.08)" }}>
                <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#187860" }}>
                  <Zap className="w-4 h-4" />
                  نصائح لتسريع طلباتك
                </p>
                <div className="grid sm:grid-cols-3 gap-3" dir="rtl">
                  {[
                    { icon: CheckCircle2, tip: "تأكد من إرفاق هوية وطنية سارية لتجنب تأخير المعالجة" },
                    { icon: FileText, tip: "راجع تفاصيل طلبك بالضغط عليه لمتابعة الحالة والجدول الزمني" },
                    { icon: MessageCircle, tip: "استخدم المساعد الذكي للإجابة عن استفساراتك بسرعة" },
                  ].map(({ icon: Icon, tip }, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl p-3 bg-card border" dir="rtl">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(24,120,96,0.06)" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: "#187860" }} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed text-start">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#B42318]/[0.06] flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-[#B42318]/70" />
                </div>
                <h3 className="font-bold text-lg text-muted-foreground mb-1" data-testid="text-no-rejected">لا توجد طلبات مرفوضة</h3>
                <p className="text-sm text-muted-foreground/70">جميع طلباتك في حالة جيدة</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-rejected-title"><XCircle className="w-3.5 h-3.5" />{rejectedRequests.length} طلب مرفوض</p>
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} testIdPrefix="rejected-" />
                </div>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                {rejectedRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#B42318]/10 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                    dir="rtl"
                    onClick={() => setSelectedRequest(req)}
                    data-testid={`card-rejected-${req.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                        <span className="font-bold text-sm font-mono text-foreground">{req.trackingNumber}</span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#B42318]/[0.05] text-[#B42318]/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3 h-3" />مرفوض
                      </span>
                    </div>
                    <div className="mb-3">
                      <RequestTypePill type={req.requestType} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                      <div className="text-center">
                        <p className="text-[11px] text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                        <p className="text-xs font-medium text-foreground font-mono">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</p>
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
                    {req.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-[#B42318]/[0.03] border border-[#B42318]/[0.06]" dir="rtl">
                        <p className="text-xs text-[#B42318]/80 flex items-start gap-1.5 text-start">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span><span className="font-bold">سبب الرفض:</span> {req.rejectionReason}</span>
                        </p>
                      </div>
                    )}
                    {req.finalRejection && (
                      <div className="mt-2 p-2 rounded-lg bg-[#B42318]/[0.04] border border-[#B42318]/10 space-y-1" dir="rtl">
                        <p className="text-xs text-[#B42318]/80 flex items-start gap-1.5 font-bold text-start">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>تم رفض الطلب من قبل رئيس المحكمة لا يمكن الاعتراض مرة أخرى</span>
                        </p>
                        {req.finalRejectionReason && (
                          <p className="text-[11px] text-[#B42318]/80 pe-5 text-start">سبب الرفض: {req.finalRejectionReason}</p>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2 justify-end" dir="rtl">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }} data-testid={`button-view-rejected-${req.id}`}>
                        <Eye className="w-3 h-3 me-1" />عرض
                      </Button>
                      {!req.finalRejection && (
                        <Button size="sm" className="text-xs h-8 bg-[#187860] hover:bg-[#075e4a] text-white" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }} data-testid={`button-object-${req.id}`}>
                          <AlertTriangle className="w-3 h-3 me-1" />اعتراض
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="objected">
            {objectedRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5cb89c]/[0.1] flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-[#187860]" />
                </div>
                <h3 className="font-bold text-lg text-muted-foreground mb-1" data-testid="text-no-objected">لا توجد طلبات معترض عليها</h3>
                <p className="text-sm text-muted-foreground/70">لا يوجد أي اعتراض حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-objected-title"><AlertTriangle className="w-3.5 h-3.5" />{objectedRequests.length} طلب معترض عليه</p>
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} testIdPrefix="objected-" />
                </div>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                {objectedRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#ec9a18]/20 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                    dir="rtl"
                    onClick={() => setSelectedRequest(req)}
                    data-testid={`card-objected-${req.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                        <span className="font-bold text-sm font-mono text-foreground">{req.trackingNumber}</span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#ec9a18]/[0.07] text-[#ec9a18] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />معترض عليه
                      </span>
                    </div>
                    <div className="mb-3">
                      <RequestTypePill type={req.requestType} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                      <div className="text-center">
                        <p className="text-[11px] text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                        <p className="text-xs font-medium text-foreground font-mono">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</p>
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
                    {req.objectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-[#ec9a18]/[0.06] border border-[#ec9a18]/10" dir="rtl">
                        <p className="text-xs text-[#ec9a18] flex items-start gap-1.5 text-start">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span><span className="font-bold">سبب الاعتراض:</span> {req.objectionReason}</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-2 p-2 rounded-lg bg-[#ebebeb]/10 border border-[#ebebeb]/20" dir="rtl">
                      <p className="text-xs text-[#187860] flex items-center gap-1.5 text-start">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>قيد مراجعة الاعتراض من الجهة المختصة</span>
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end" dir="rtl">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }} data-testid={`button-view-objected-${req.id}`}>
                        <Eye className="w-3 h-3 me-1" />عرض
                      </Button>
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="awaiting_payment">
            <div className="space-y-4">
              {awaitingPaymentRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-bold">لا توجد طلبات بانتظار السداد</p>
                    <p className="text-xs text-muted-foreground mt-1">ستظهر هنا الطلبات المكتملة التي تحتاج لسداد الرسوم</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" />{awaitingPaymentRequests.length} طلب بانتظار السداد</p>
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} testIdPrefix="awaiting-" />
                </div>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                {awaitingPaymentRequests.map((req, index) => {
                  const requestPrice = REQUEST_TYPES.find(r => r.value === req.requestType)?.price || "";
                  return (
                    <motion.div key={req.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
                      <Card className="hover-elevate border-[#ec9a18]/20" dir="rtl" data-testid={`card-awaiting-${req.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground">رقم الطلب</span>
                              <span className="font-bold text-sm font-mono text-foreground">{req.trackingNumber}</span>
                            </div>
                            <span className="text-[11px] font-medium bg-[#ec9a18]/[0.07] text-[#ec9a18] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />بانتظار السداد
                            </span>
                          </div>
                          <div className="mb-3">
                            <RequestTypePill type={req.requestType} />
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3 bg-[#f8f9fa] rounded-lg p-2.5">
                            <div className="text-center">
                              <p className="text-[11px] text-muted-foreground mb-0.5">{req.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية"}</p>
                              <p className="text-xs font-medium text-foreground font-mono">{req.requestType === "replacement_doc" ? (req.judgmentNumber || "-") : req.caseNumber}</p>
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
                          <div className="flex items-center justify-between rounded-xl p-3 bg-[#ec9a18]/[0.06] border border-[#ec9a18]/20 mb-3">
                            <span className="text-sm text-muted-foreground">المبلغ المستحق</span>
                            <span className="text-lg font-black" style={{ color: "#ec9a18" }}>{requestPrice}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 font-medium" style={{ background: "#187860", color: "white" }}
                              onClick={() => setSelectedRequest(req)}
                              data-testid={`button-pay-${req.id}`}>
                              <CreditCard className="w-4 h-4 me-1" />
                              سداد الرسوم
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-3"
                              onClick={() => setSelectedRequest(req)}
                              data-testid={`button-view-awaiting-${req.id}`}>
                              <Eye className="w-3.5 h-3.5 me-1" />عرض
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>صفحة الطلب</CardTitle>
                  {localStorage.getItem(DRAFT_KEY) && (
                    <span className="text-[11px] text-[#187860] flex items-center gap-1 bg-[#187860]/[0.06] dark:bg-[#187860]/[0.06] px-2 py-1 rounded-md font-medium">
                      <Save className="w-3 h-3" />مسودة محفوظة
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <NewRequestForm onSubmit={handleNewRequest} onCancel={() => setActiveTab("track")} existingRequests={allRequests} onStepChange={setFormStep} goBackTrigger={formGoBackTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <HistoryArchive completedRequests={completedRequests} onView={setSelectedRequest} isCaseReviewViewed={isCaseReviewViewed} onCaseReviewView={markCaseReviewViewed} onConfirmCaseReview={confirmCaseReview} viewMode={viewMode} setViewMode={setViewMode} />
          </TabsContent>
        </Tabs>
        </>)}
      </main>

      <Dialog open={!!ratingRequest} onOpenChange={(open) => { if (!open) setRatingRequest(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>تقييم الخدمة</DialogTitle></DialogHeader>
          {ratingRequest && <RatingModal request={ratingRequest} onRate={handleRate} onClose={() => setRatingRequest(null)} />}
        </DialogContent>
      </Dialog>

      <MojFooter />

      <ChatbotWidget />

      <div className="fixed top-24 start-4 z-50 flex flex-col gap-2.5" data-testid="notification-banners">
        <AnimatePresence>
          {smsBanners.map(b => (
            <motion.div key={b.id}
              initial={{ x: -120, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -120, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`${b.type === "sms" ? "bg-[#187860]" : "bg-[#187860]"} text-white rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 max-w-xs border ${b.type === "sms" ? "border-[#187860]/25" : "border-[#187860]/20"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${b.type === "sms" ? "bg-[#187860]/[0.06]" : "bg-[#ebebeb]/30"}`}>
                {b.type === "sms" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium opacity-70 mb-0.5">{b.type === "sms" ? "رسالة نصية" : "بريد إلكتروني"}</p>
                <p className="text-sm font-bold leading-tight">طلب {b.trackingNumber}</p>
                <p className="text-xs opacity-90">{b.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
