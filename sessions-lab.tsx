import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Printer, X, Eye, EyeOff, FileText, Building2, Calendar, Search, Copy, BookOpen, Replace, MapPin, Inbox, ChevronDown, Clock, AlertCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

type RequestType = "certified_copy" | "case_review" | "replacement_doc";
type RequestStatus = "new" | "processing" | "referred" | "completed" | "rejected";

interface DocumentRequest {
  id: string;
  trackingNumber: string;
  requestType: RequestType;
  caseNumber?: string;
  deedNumber?: string;
  court: string;
  city: string;
  applicantName: string;
  submissionDate: string;
  status: RequestStatus;
}

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; color: string; icon: any }> = {
  certified_copy: { label: "نسخة مصدقة", color: "#187860", icon: Copy },
  case_review: { label: "اطلاع على أوراق الدعوى", color: "#075e4a", icon: BookOpen },
  replacement_doc: { label: "نسخة بديلة", color: "#C7A86C", icon: Replace },
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  new: "#1F2937",
  processing: "#ec9a18",
  referred: "#187860",
  completed: "#075e4a",
  rejected: "#B42318",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "طلب جديد",
  processing: "قيد المعالجة",
  referred: "محال",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const MOCK_REQUESTS: DocumentRequest[] = [
  {
    id: "1",
    trackingNumber: "١٤٤٧-٠٠٠١",
    requestType: "certified_copy",
    caseNumber: "٤٣٠٨١٢٣٤",
    court: "المحكمة العامة",
    city: "مكة المكرمة",
    applicantName: "عبدالله محمد الأحمدي",
    submissionDate: "١٤٤٧/٠٣/١٠",
    status: "completed",
  },
  {
    id: "2",
    trackingNumber: "١٤٤٧-٠٠٠٢",
    requestType: "case_review",
    caseNumber: "٤٣٠٩٥٦٧٨",
    court: "المحكمة التجارية",
    city: "جدة",
    applicantName: "سعد خالد العتيبي",
    submissionDate: "١٤٤٧/٠٣/١٢",
    status: "processing",
  },
  {
    id: "3",
    trackingNumber: "١٤٤٧-٠٠٠٣",
    requestType: "replacement_doc",
    deedNumber: "٣٤٢٠١٩٨٧٦",
    court: "المحكمة الجزائية",
    city: "الرياض",
    applicantName: "فهد ناصر القحطاني",
    submissionDate: "١٤٤٧/٠٣/١٣",
    status: "referred",
  },
  {
    id: "4",
    trackingNumber: "١٤٤٧-٠٠٠٤",
    requestType: "certified_copy",
    caseNumber: "٤٣١١٢٣٤٥",
    court: "محكمة الأحوال الشخصية",
    city: "المدينة المنورة",
    applicantName: "أحمد يوسف الشمري",
    submissionDate: "١٤٤٧/٠٣/١٤",
    status: "processing",
  },
  {
    id: "5",
    trackingNumber: "١٤٤٧-٠٠٠٥",
    requestType: "case_review",
    caseNumber: "٤٣١٢٦٧٨٩",
    court: "المحكمة العمالية",
    city: "الدمام",
    applicantName: "محمد علي الزهراني",
    submissionDate: "١٤٤٧/٠٣/١٤",
    status: "rejected",
  },
  {
    id: "6",
    trackingNumber: "١٤٤٧-٠٠٠٦",
    requestType: "certified_copy",
    caseNumber: "٤٣١٣٤٥٦٧",
    court: "المحكمة العامة",
    city: "تبوك",
    applicantName: "خالد إبراهيم المالكي",
    submissionDate: "١٤٤٧/٠٣/١٥",
    status: "completed",
  },
  {
    id: "7",
    trackingNumber: "١٤٤٧-٠٠٠٧",
    requestType: "replacement_doc",
    deedNumber: "٣٤٢١٤٧٨٩٠",
    court: "كتابة العدل",
    city: "أبها",
    applicantName: "عمر سلطان الدوسري",
    submissionDate: "١٤٤٧/٠٣/١٥",
    status: "processing",
  },
  {
    id: "8",
    trackingNumber: "١٤٤٧-٠٠٠٨",
    requestType: "certified_copy",
    caseNumber: "٤٣١٥١٢٣٤",
    court: "المحكمة العامة",
    city: "حائل",
    applicantName: "ياسر عبدالرحمن الحربي",
    submissionDate: "١٤٤٧/٠٣/١٥",
    status: "new",
  },
  {
    id: "9",
    trackingNumber: "١٤٤٧-٠٠٠٩",
    requestType: "case_review",
    caseNumber: "٤٣١٦٥٦٧٨",
    court: "المحكمة التجارية",
    city: "الطائف",
    applicantName: "تركي سعود العنزي",
    submissionDate: "١٤٤٧/٠٣/١٥",
    status: "new",
  },
];


function RequestRow({ request, index }: { request: DocumentRequest; index: number }) {
  const typeConfig = REQUEST_TYPE_CONFIG[request.requestType];
  const statusColor = STATUS_COLORS[request.status];
  const statusLabel = STATUS_LABELS[request.status];
  const TypeIcon = typeConfig.icon;
  const [expanded, setExpanded] = useState(false);
  const refNumber = request.requestType === "replacement_doc" ? request.deedNumber : request.caseNumber;
  const refLabel = request.requestType === "replacement_doc" ? "رقم الصك" : "رقم القضية";

  return (
    <motion.div
      className="border border-[#ebebeb] rounded-xl overflow-hidden bg-white mb-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      data-testid={`card-request-${request.id}`}
    >
      <div
        className={`grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] items-center gap-4 py-3 px-4 hover:bg-[#FAFAFA]/50 transition-colors cursor-pointer ${expanded ? "bg-[#FAFAFA]/30" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: statusColor }} />

        <div>
          <p className="text-sm font-black" style={{ color: typeConfig.color }}>{request.trackingNumber}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <TypeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: typeConfig.color }} />
          <p className="text-xs font-bold text-[#1F2937]">{typeConfig.label}</p>
        </div>

        <div>
          <p className="text-xs text-[#1F2937]">{refNumber}</p>
        </div>

        <div>
          <p className="text-xs text-[#1F2937]/70">{request.submissionDate}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-xs text-[#187860] hover:bg-[#187860]/5 font-medium h-7 px-2"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          data-testid={`button-view-request-${request.id}`}
        >
          {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="bg-[#FAFAFA]/60 px-4 py-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-4 ps-6">
              <div>
                <p className="text-[10px] text-[#1F2937]/40 mb-0.5">مقدم الطلب</p>
                <p className="text-sm font-bold text-[#1F2937]">{request.applicantName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#1F2937]/40 mb-0.5">الجهة</p>
                <p className="text-sm font-bold text-[#1F2937]">{request.court}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#1F2937]/40 mb-0.5">المدينة</p>
                <p className="text-sm font-bold text-[#1F2937]">{request.city}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SessionsLabPage() {
  const [, navigate] = useLocation();
  const [filterType, setFilterType] = useState<RequestType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = MOCK_REQUESTS.filter((r) => {
    if (filterType !== "all" && r.requestType !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery;
      const matchTrack = r.trackingNumber.includes(q);
      const matchCase = r.caseNumber?.includes(q) || false;
      const matchDeed = r.deedNumber?.includes(q) || false;
      const matchName = r.applicantName.includes(q);
      if (!matchTrack && !matchCase && !matchDeed && !matchName) return false;
    }
    return true;
  });

  const statusCounts: Record<RequestStatus, number> = {
    new: MOCK_REQUESTS.filter(r => r.status === "new").length,
    processing: MOCK_REQUESTS.filter(r => r.status === "processing").length,
    referred: MOCK_REQUESTS.filter(r => r.status === "referred").length,
    completed: MOCK_REQUESTS.filter(r => r.status === "completed").length,
    rejected: MOCK_REQUESTS.filter(r => r.status === "rejected").length,
  };

  const typeCounts = {
    certified_copy: MOCK_REQUESTS.filter(r => r.requestType === "certified_copy").length,
    case_review: MOCK_REQUESTS.filter(r => r.requestType === "case_review").length,
    replacement_doc: MOCK_REQUESTS.filter(r => r.requestType === "replacement_doc").length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      <header className="bg-white border-b border-[#ebebeb] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mojLogo} alt="شعار وزارة العدل" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-sm font-bold text-[#187860]">وزارة العدل</h1>
              <p className="text-[10px] text-[#1F2937]/50">تجربة تصميم - الوثائق القضائية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#ec9a18]/10 text-[#ec9a18] px-2.5 py-1 rounded-full font-bold border border-[#ec9a18]/20">تجربة تصميم</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-[#1F2937]/60 hover:text-[#187860] text-xs" data-testid="button-back-home">
              <ArrowRight className="w-4 h-4 me-1" />
              الرئيسية
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          className="bg-white rounded-2xl border border-[#ebebeb] shadow-sm overflow-hidden"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="border-b border-[#ebebeb] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#187860]">طلبات الوثائق القضائية</h2>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1F2937]/30" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب أو رقم القضية أو الاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 pe-4 py-2 text-xs bg-[#FAFAFA] border border-[#ebebeb] rounded-xl w-72 focus:outline-none focus:border-[#187860]/30 focus:ring-1 focus:ring-[#187860]/10 placeholder:text-[#1F2937]/30"
                  data-testid="input-search-requests"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] text-[#1F2937]/40 font-bold">نوع الطلب:</span>
              <button
                onClick={() => setFilterType("all")}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${filterType === "all" ? "bg-[#187860] text-white font-bold" : "text-[#1F2937]/50 hover:bg-[#FAFAFA]"}`}
                data-testid="filter-type-all"
              >
                الكل {MOCK_REQUESTS.length}
              </button>
              {(Object.entries(REQUEST_TYPE_CONFIG) as [RequestType, typeof REQUEST_TYPE_CONFIG[RequestType]][]).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = filterType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isActive ? "font-bold" : "text-[#1F2937]/50 hover:bg-[#FAFAFA]"}`}
                    style={isActive ? { background: `${config.color}12`, color: config.color } : undefined}
                    data-testid={`filter-type-${key}`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label} {typeCounts[key]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#1F2937]/40 font-bold">الحالة:</span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-[#187860]/10 text-[#187860] font-bold" : "text-[#1F2937]/50 hover:bg-[#FAFAFA]"}`}
                data-testid="filter-status-all"
              >
                الكل
              </button>
              {(Object.keys(STATUS_LABELS) as RequestStatus[]).map(key => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${filterStatus === key ? "font-bold" : "text-[#1F2937]/50 hover:bg-[#FAFAFA]"}`}
                  style={filterStatus === key ? { background: `${STATUS_COLORS[key]}0F`, color: STATUS_COLORS[key] } : undefined}
                  data-testid={`filter-status-${key}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[key] }} />
                  {STATUS_LABELS[key]} {statusCounts[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] items-center gap-4 py-2 px-4 mb-2 text-[10px] font-bold text-[#1F2937]/40">
              <div className="w-1.5" />
              <div>رقم الطلب</div>
              <div>نوع الطلب</div>
              <div>رقم القضية / الصك</div>
              <div>تاريخ التقديم</div>
              <div className="w-8" />
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <Inbox className="w-12 h-12 text-[#1F2937]/15 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#1F2937]/40 mb-1">لا توجد طلبات</p>
                <p className="text-xs text-[#1F2937]/30">جرّب تغيير معايير البحث أو الفلترة</p>
              </div>
            ) : (
              filteredRequests.map((request, i) => (
                <RequestRow key={request.id} request={request} index={i} />
              ))
            )}
          </div>

          <div className="border-t border-[#ebebeb] px-4 sm:px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button className="rounded-xl bg-[#187860] hover:bg-[#075e4a] text-white font-medium text-xs px-4 h-8" data-testid="button-print">
                <Printer className="w-3.5 h-3.5 me-1.5" />
                طباعة
              </Button>
              <Button variant="outline" className="rounded-xl border-[#ebebeb] text-[#1F2937]/50 font-medium text-xs px-4 h-8" onClick={() => navigate("/")} data-testid="button-close">
                <X className="w-3.5 h-3.5 me-1.5" />
                إغلاق
              </Button>
            </div>
            <p className="text-[11px] text-[#1F2937]/35">
              عرض <span className="font-bold text-[#1F2937]/60">{filteredRequests.length}</span> من <span className="font-bold text-[#1F2937]/60">{MOCK_REQUESTS.length}</span>
            </p>
          </div>
        </motion.div>

        <motion.div className="mt-6 bg-white rounded-2xl border border-[#ebebeb] shadow-sm overflow-hidden" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="px-4 sm:px-5 py-3 border-b border-[#ebebeb] bg-[#FAFAFA]">
            <h2 className="text-sm font-bold text-[#1F2937]">أفكار عرض الطلبات المتأخرة</h2>
            <p className="text-[11px] text-[#1F2937]/50 mt-0.5">3 أنماط نظيفة وبسيطة — بدون أيقونات إضافية</p>
          </div>

          <div className="p-4 sm:p-5 space-y-5">

            <div>
              <p className="text-xs font-bold text-[#ec9a18] mb-2">النمط ١: خلفية ذهبية خفيفة للبطاقة كاملة</p>
              <p className="text-[10px] text-[#1F2937]/40 mb-2">البطاقة نفسها تتلوّن — بدون أي شارة أو أيقونة إضافية</p>
              <div className="bg-[#ec9a18]/[0.04] rounded-xl border border-[#ec9a18]/15 p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#187860]/10 text-[#187860]">محال</span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-[#1F2937]">4710001253</span>
                    <span className="text-[10px] text-[#1F2937]/40 ms-2">رقم الطلب</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#1F2937]/40">نسخة مصدقة من أوراق الدعوى</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white/70 rounded-lg p-2.5">
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">الجهة</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">المحكمة العامة بالرياض</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">رقم القضية</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">46705512</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">التاريخ</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">٢٣ شوال ١٤٤٧</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#ec9a18] mb-2">النمط ٢: شريط تقدم ذهبي بدل الأخضر</p>
              <p className="text-[10px] text-[#1F2937]/40 mb-2">نفس البطاقة العادية لكن شريط التقدم يتحوّل للذهبي</p>
              <div className="bg-white rounded-xl border border-[#ebebeb] p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#187860]/10 text-[#187860]">محال</span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-[#1F2937]">4710001260</span>
                    <span className="text-[10px] text-[#1F2937]/40 ms-2">رقم الطلب</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#1F2937]/40">اطلاع على أوراق الدعوى</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#FAFAFA] rounded-lg p-2.5 mb-3">
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">الجهة</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">المحكمة الجزائية بجدة</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">رقم القضية</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">33208814</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">التاريخ</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">٢٠ شوال ١٤٤٧</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-0.5">
                    <div className="h-1 flex-1 rounded-full bg-[#ec9a18]" />
                    <div className="h-1 flex-1 rounded-full bg-[#ec9a18]" />
                    <div className="h-1 flex-1 rounded-full bg-[#ec9a18]/30" />
                    <div className="h-1 flex-1 rounded-full bg-[#ebebeb]" />
                  </div>
                  <span className="text-[9px] text-[#ec9a18] font-medium">إحالة</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#ec9a18] mb-2">النمط ٣: نص بسيط تحت التاريخ</p>
              <p className="text-[10px] text-[#1F2937]/40 mb-2">فقط سطر نصي صغير بعدد أيام التأخر — بدون شارة ولا أيقونة</p>
              <div className="bg-white rounded-xl border border-[#ebebeb] p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-[#187860]/10 text-[#187860]">محال</span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-[#1F2937]">4710001275</span>
                    <span className="text-[10px] text-[#1F2937]/40 ms-2">رقم الطلب</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#1F2937]/40">نسخة بديلة للوثائق القضائية</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#FAFAFA] rounded-lg p-2.5">
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">الجهة</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">محكمة الأحوال بالدمام</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">رقم القضية</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">7891234</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#1F2937]/40">التاريخ</p>
                    <p className="text-[11px] font-medium text-[#1F2937]/70">١٨ شوال ١٤٤٧</p>
                    <p className="text-[9px] text-[#ec9a18] font-medium mt-0.5">تجاوز ٥ أيام عمل</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </main>
    </div>
  );
}
