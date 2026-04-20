export type RequestStatus = "completed" | "processing" | "referred" | "pending" | "rejected" | "objected";
export type RequestType = "certified_copy" | "case_review" | "replacement_doc";
export type ApplicantType = "plaintiff" | "defendant" | "heir" | "agent" | "stakeholder" | "liquidator" | "judicial_guardian";
export type ReferralSection = "judicial" | "documents" | null;
export type EmployeeSection = "verification_center" | "beneficiary_services" | "judicial" | "documents" | "archive";

export interface Request {
  id: string;
  trackingNumber: string;
  applicantName: string;
  applicantId: string;
  applicantType: ApplicantType;
  requestType: RequestType;
  caseNumber: string;
  judgmentNumber: string;
  judgmentDate: string;
  circuit: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  notes?: string;
  rating?: number;
  ratingComment?: string;
  assignedTo?: string;
  referredTo?: string;
  referralSection?: "judicial" | "documents";
  attachedDocument?: string;
  attachedAt?: string;
  isFastTrack?: boolean;
  internalNote?: string;
  isPaid?: boolean;
  city?: string;
  court?: string;
  interestStatement?: string;
  rejectionReason?: string;
  assignedSection?: "verification_center" | "beneficiary_services";
  objectionReason?: string;
  objectionDate?: string;
  finalRejection?: boolean;
  finalRejectionReason?: string;
  fileAttachments?: { name: string; type: string; size: number; data: string }[];
  employeeAttachments?: { name: string; type: string; size: number; data: string; uploadedBy: string; uploadedAt: string }[];
  digitalStamp?: {
    applied: boolean;
    verificationCode: string;
    stampDate: string;
    circuitName: string;
  };
  digitalSignature?: {
    applied: boolean;
    hash: string;
    signDate: string;
  };
  timeline: TimelineEvent[];
}

export type NotificationType = "referral" | "fasttrack" | "completed" | "overdue" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  trackingNumber?: string;
  portal?: "beneficiary" | "employee" | "manager";
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "b1", type: "completed", title: "اكتمل الطلب", body: "تم إنجاز طلبك رقم 4710001244 بنجاح ويمكنك الآن تحميل الوثيقة من صفحة طلباتي", timestamp: "07/04/2026 14:30", read: false, portal: "beneficiary" },
  { id: "b2", type: "referral", title: "تحديث حالة الطلب", body: "تم إحالة طلبك رقم 4710001252 إلى الدائرة القضائية رقم 3 وسيتم إشعارك عند الانتهاء", timestamp: "06/04/2026 09:03", read: false, portal: "beneficiary" },
  { id: "b3", type: "system", title: "طلب يحتاج تعديل", body: "طلبك رقم 4710001250 يحتاج إلى تعديل بعض البيانات المرفقة. يرجى مراجعة الملاحظات وإعادة الإرسال", timestamp: "04/04/2026 11:00", read: true, portal: "beneficiary" },
  { id: "b4", type: "completed", title: "اكتمل الطلب", body: "تم إنجاز طلبك رقم 4710001248 بنجاح ويمكنك الآن تحميل الوثيقة من صفحة طلباتي", timestamp: "01/04/2026 15:45", read: true, portal: "beneficiary" },
  { id: "b5", type: "system", title: "تأكيد استلام الطلب", body: "تم استلام طلبك رقم 4710001255 بنجاح وهو الآن قيد التدقيق في مركز التحقق", timestamp: "28/03/2026 10:20", read: true, portal: "beneficiary" },

  { id: "e1", type: "referral", title: "طلب محال إليك", body: "تم إحالة الطلب 4710001252 من مركز التحقق إلى قسمك للمراجعة والاعتماد", timestamp: "07/04/2026 09:03", read: false, portal: "employee" },
  { id: "e2", type: "overdue", title: "تنبيه تجاوز SLA", body: "الطلب 4710001247 تجاوز الموعد النهائي بمقدار يوم واحد ويتطلب متابعة عاجلة", timestamp: "06/04/2026 08:00", read: false, portal: "employee" },
  { id: "e3", type: "fasttrack", title: "طلب طارئ جديد", body: "تم تصعيد الطلب 4710001251 بسبب تجاوز المدة النظامية للإنجاز ويتطلب تدخل فوري", timestamp: "05/04/2026 14:30", read: false, portal: "employee" },
  { id: "e4", type: "completed", title: "اكتمل الطلب", body: "تم إغلاق الطلب 4710001244 بنجاح وإرسال إشعار للمستفيد", timestamp: "03/04/2026 09:30", read: true, portal: "employee" },
  { id: "e5", type: "referral", title: "تذكرة محالة إليك", body: "تم إحالة التذكرة رقم 4710001253 إلى قسمك للمتابعة بخصوص تأخر معالجة نسخة مصدقة", timestamp: "02/04/2026 10:15", read: true, portal: "employee" },
  { id: "e6", type: "system", title: "تحديث النظام", body: "تم تطبيق تحديثات على المنصة وتحسين أداء معالجة الطلبات", timestamp: "30/03/2026 22:00", read: true, portal: "employee" },

  { id: "m1", type: "overdue", title: "تنبيه تجاوز SLA", body: "الطلب 4710001250 تجاوز الموعد النهائي بمقدار 3 أيام ولم يتم اتخاذ أي إجراء حتى الآن", timestamp: "07/04/2026 08:00", read: false, portal: "manager" },
  { id: "m2", type: "fasttrack", title: "تصعيد تذكرة", body: "تم تصعيد التذكرة رقم 4710001249 بسبب شكوى المستفيد عبدالله محمد الشهري من تأخر معالجة طلبه", timestamp: "06/04/2026 11:20", read: false, portal: "manager" },
  { id: "m3", type: "overdue", title: "تنبيه تجاوز SLA", body: "الطلب 4710001247 تجاوز الموعد النهائي بمقدار يوم واحد في الدائرة القضائية رقم 2", timestamp: "05/04/2026 08:00", read: false, portal: "manager" },
  { id: "m4", type: "system", title: "تقرير الأداء الأسبوعي", body: "تم إصدار تقرير الأداء الأسبوعي: 45 طلب مكتمل، 3 طلبات متجاوزة للمدة النظامية، معدل الإنجاز 93%", timestamp: "04/04/2026 07:00", read: true, portal: "manager" },
  { id: "m5", type: "referral", title: "طلب انتظار موافقة", body: "الطلب 4710001255 يحتاج موافقة إدارية للإحالة إلى جهة خارجية", timestamp: "02/04/2026 09:45", read: true, portal: "manager" },
  { id: "m6", type: "system", title: "صيانة مجدولة", body: "سيتم إجراء صيانة دورية لأنظمة المنصة يوم الخميس القادم من الساعة 12 إلى 2 صباحا", timestamp: "28/03/2026 10:00", read: true, portal: "manager" },
];

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  department: string;
  status: "active" | "frozen";
  requestsHandled: number;
  avgResponseTime: string;
  avgRating?: number;
  badge?: "gold" | "silver" | "bronze";
}

export interface Department {
  id: string;
  name: string;
  type: "general" | "partial" | "traffic" | "documents";
  employeesCount: number;
  requestsCount: number;
}

export type TicketStatus = "open" | "referred" | "resolved" | "returned";
export type TicketPriority = "high" | "medium" | "low";

export interface Ticket {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
  requestNumber: string;
  requestType: string;
  beneficiary: string;
  idNumber: string;
  department: string;
  assignedTo: string;
  description: string;
  slaRemaining?: string;
  resolvedDate?: string;
  referredToDept?: string;
  referralNote?: string;
  referredAt?: string;
  employeeResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  returnNote?: string;
  returnedAt?: string;
}

export const TICKETS_KEY = "moj_tickets";

export function loadTickets(): Ticket[] {
  try {
    const stored = localStorage.getItem(TICKETS_KEY);
    if (!stored) return [];
    const parsed: Ticket[] = JSON.parse(stored);
    let migrated = false;
    const fixed = parsed.map((t) => {
      if (/^t/i.test(t.id) || /^tc_/i.test(t.id)) {
        migrated = true;
        return { ...t, id: `4${Math.floor(100000000 + Math.random() * 900000000)}` };
      }
      return t;
    });
    if (migrated) localStorage.setItem(TICKETS_KEY, JSON.stringify(fixed));
    return fixed;
  } catch { return []; }
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "4100000001",
    title: "شكوى مستفيد: تأخر معالجة طلب رقم 4710001249",
    priority: "medium",
    status: "open",
    date: "2026-03-19",
    requestNumber: "4710001249",
    requestType: "نسخة مصدقة من حكم",
    beneficiary: "عبدالله محمد الشهري",
    idNumber: "1088******",
    department: "خدمات المستفيدين",
    assignedTo: "أحمد الحربي",
    description: "قدّم المستفيد عبدالله محمد الشهري شكوى عبر بوابة المستفيدين بسبب تأخر معالجة طلبه المقدّم بتاريخ 15 رمضان. الطلب لا يزال في مرحلة المعالجة رغم مرور المدة المحددة (5 أيام عمل). يرجى التحقق من سبب التأخير وتحديث حالة الطلب.",
    slaRemaining: "متأخر بيومين",
  },
  {
    id: "4100000002",
    title: "شكوى مستفيد: استفسار عن إجراءات إحالة طلب رقم 4710001251",
    priority: "medium",
    status: "open",
    date: "2026-02-27",
    requestNumber: "4710001251",
    requestType: "اطلاع على أوراق قضية",
    beneficiary: "نورة سعد العتيبي",
    idNumber: "1092******",
    department: "الدائرة القضائية رقم 2",
    assignedTo: "يزيد العتيبي",
    description: "قدّمت المستفيدة نورة سعد العتيبي شكوى عبر بوابة المستفيدين تستفسر عن سبب إحالة طلبها إلى الدائرة الجزئية بدلاً من الدائرة العامة، وتطلب توضيح الإجراءات اللازمة لاستكمال الطلب وموعد الحصول على الوثيقة.",
    slaRemaining: "متبقي 8 ساعات",
  },
  {
    id: "4100000003",
    title: "شكوى مستفيد: طلب تعديل بيانات في وثيقة رقم 4710001244",
    priority: "low",
    status: "resolved",
    date: "2026-02-25",
    requestNumber: "4710001244",
    requestType: "تحديث بيانات",
    beneficiary: "سلطان خالد الدوسري",
    idNumber: "1075******",
    department: "خدمات المستفيدين",
    assignedTo: "علي المطيري",
    description: "قدّم المستفيد سلطان خالد الدوسري شكوى عبر بوابة المستفيدين يطلب تصحيح خطأ إملائي في اسمه الوارد في وثيقة سابقة. تم التحقق من الهوية الوطنية وتصحيح البيانات وإعادة إصدار الوثيقة بنجاح.",
    slaRemaining: "تم الإنجاز",
    resolvedDate: "2026-02-26",
  },
  {
    id: "4100000004",
    title: "شكوى مستفيد: تأخر إغلاق طلب مكتمل رقم 4710001247",
    priority: "high",
    status: "open",
    date: "2026-02-28",
    requestNumber: "4710001247",
    requestType: "نسخة مصدقة من حكم",
    beneficiary: "فهد عبدالعزيز القحطاني",
    idNumber: "1063******",
    department: "الدوائر القضائية",
    assignedTo: "أحمد الحربي",
    description: "قدّم المستفيد فهد عبدالعزيز القحطاني شكوى رسمية عبر بوابة المستفيدين بسبب تأخر إغلاق طلبه المكتمل منذ أسبوع. يفيد بأنه سدّد الرسوم لكنه لم يتمكن من تحميل الوثيقة النهائية. يتطلب تدخل عاجل.",
    slaRemaining: "متأخر بـ 5 أيام",
  },
  {
    id: "4100000005",
    title: "شكوى مستفيد: تأخر تدقيق طلب نسخة بديلة رقم 4710001250",
    priority: "high",
    status: "referred",
    date: "2026-03-25",
    requestNumber: "4710001250",
    requestType: "نسخة بديلة للوثائق القضائية",
    beneficiary: "خالد سعود المطيري",
    idNumber: "1045******",
    department: "مركز تدقيق الطلبات",
    assignedTo: "سعود الزهراني",
    description: "قدّم المستفيد خالد سعود المطيري شكوى رسمية عبر بوابة المستفيدين بسبب تأخر تدقيق طلبه المقدّم منذ أكثر من 10 أيام عمل. يذكر المستفيد أنه لم يتلقَّ أي تحديث على حالة الطلب رغم مرور المدة النظامية.",
    slaRemaining: "متأخر بـ 10 أيام",
    referredToDept: "verification_center",
    referralNote: "شكوى مستفيد واردة من بوابة المستفيدين. يرجى التحقق من سبب تأخر التدقيق والرد بشكل عاجل",
    referredAt: "2026-03-26",
  },
  {
    id: "4100000006",
    title: "شكوى مستفيد: تأخر معالجة طلب نسخة مصدقة رقم 4710001253",
    priority: "medium",
    status: "referred",
    date: "2026-03-28",
    requestNumber: "4710001253",
    requestType: "نسخة مصدقة من أوراق الدعوى",
    beneficiary: "عبدالرحمن فيصل الحربي",
    idNumber: "1067******",
    department: "خدمات المستفيدين",
    assignedTo: "محمد العمري",
    description: "قدّم المستفيد عبدالرحمن فيصل الحربي شكوى عبر بوابة المستفيدين بسبب تأخر إصدار النسخة المصدقة. يفيد بأنه سدّد الرسوم لكن الطلب لا يزال قيد المعالجة منذ 8 أيام عمل دون تحديث.",
    slaRemaining: "متأخر بـ 3 أيام",
    referredToDept: "beneficiary_services",
    referralNote: "شكوى مستفيد واردة من بوابة المستفيدين. يرجى متابعة الطلب والتنسيق مع قسم الوثائق لتسريع الإصدار",
    referredAt: "2026-03-29",
  },
  {
    id: "4100000007",
    title: "شكوى مستفيد: تأخر الدائرة القضائية في معالجة طلب اطلاع رقم 4710001255",
    priority: "medium",
    status: "referred",
    date: "2026-04-01",
    requestNumber: "4710001255",
    requestType: "الاطلاع على أوراق الدعوى",
    beneficiary: "هند محمد الشمري",
    idNumber: "1089******",
    department: "الدوائر القضائية",
    assignedTo: "يزيد العتيبي",
    description: "قدّمت المستفيدة هند محمد الشمري شكوى عبر بوابة المستفيدين تفيد بأن طلبها محال للدائرة القضائية منذ أسبوع كامل دون اتخاذ أي إجراء. تطلب المستفيدة تسريع المعالجة لحاجتها العاجلة للاطلاع على أوراق الدعوى.",
    slaRemaining: "متأخر بيومين",
    referredToDept: "judicial",
    referralNote: "شكوى مستفيد واردة من بوابة المستفيدين. يرجى مراجعة الطلب المحال واتخاذ الإجراء اللازم بشكل عاجل",
    referredAt: "2026-04-02",
  },
  {
    id: "4100000008",
    title: "شكوى مستفيد: تأخر استخراج وثيقة بديلة رقم 4710001248",
    priority: "low",
    status: "referred",
    date: "2026-04-03",
    requestNumber: "4710001248",
    requestType: "نسخة بديلة للوثائق القضائية",
    beneficiary: "سلمان عادل الغامدي",
    idNumber: "1054******",
    department: "قسم الوثائق والمحفوظات",
    assignedTo: "علي المطيري",
    description: "قدّم المستفيد سلمان عادل الغامدي شكوى عبر بوابة المستفيدين بسبب تأخر البحث عن وثيقته القضائية القديمة في الأرشيف. يفيد المستفيد بأنه ينتظر منذ فترة طويلة دون أي تحديث على حالة الطلب.",
    slaRemaining: "متبقي يوم واحد",
    referredToDept: "documents",
    referralNote: "شكوى مستفيد واردة من بوابة المستفيدين. يرجى البحث في الأرشيف القديم والرد على المستفيد بحالة الوثيقة",
    referredAt: "2026-04-04",
  },
];

export function initializeTickets(): Ticket[] {
  const stored = loadTickets();
  if (stored.length > 0) return stored;
  saveTickets(INITIAL_TICKETS);
  return INITIAL_TICKETS;
}

export const REFERRAL_DEPARTMENTS = [
  { value: "verification_center", label: "مركز تدقيق الطلبات" },
  { value: "beneficiary_services", label: "قسم خدمات المستفيدين" },
  { value: "judicial", label: "الدوائر القضائية" },
  { value: "documents", label: "قسم الوثائق والمحفوظات" },
];

export const REQUEST_TYPES = [
  {
    value: "certified_copy",
    label: "نسخة مصدقة من أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية أو الوثائق أو الأوراق تحت يد المحكمة",
    shortLabel: "نسخة مصدقة من أوراق الدعوى",
    price: "١٠٠ ريال",
  },
  {
    value: "case_review",
    label: "الاطلاع على أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية",
    shortLabel: "الاطلاع على أوراق الدعوى",
    price: "٥٠ ريال",
  },
  {
    value: "replacement_doc",
    label: "نسخة بديلة للوثائق القضائية",
    shortLabel: "نسخة بديلة للوثائق القضائية",
    price: "١٠٠ ريال",
  },
];

export const APPLICANT_TYPES = [
  { value: "plaintiff", label: "مدعي" },
  { value: "defendant", label: "مدعى عليه" },
  { value: "heir", label: "وارث" },
  { value: "agent", label: "وكيل" },
  { value: "stakeholder", label: "صاحب مصلحة" },
  { value: "liquidator", label: "مصفي" },
  { value: "judicial_guardian", label: "حارس قضائي" },
];

export const CIRCUITS = [
  ...Array.from({ length: 33 }, (_, i) => ({
    value: `general_${i + 1}`,
    label: `الدائرة القضائية العامة ${i + 1}`,
    type: "general" as const,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    value: `partial_${i + 1}`,
    label: `الدائرة الجزئية ${i + 1}`,
    type: "partial" as const,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    value: `traffic_${i + 1}`,
    label: `الدائرة المرورية ${i + 1}`,
    type: "traffic" as const,
  })),
  {
    value: "documents",
    label: "قسم الوثائق والمحفوظات",
    type: "documents" as const,
  },
];

const _CIRCUIT_EMPLOYEE_NAMES: [string, string][] = [
  ["عبدالله سعد الشمري", "سعد ناصر الحربي"],
  ["يوسف خالد العنزي", "حمود عبدالرحمن الدوسري"],
  ["سلطان فهد المالكي", "تميم سعيد القحطاني"],
  ["فيصل عبدالله الزهراني", "عبدالمجيد محمد الغامدي"],
  ["ماجد سالم الحارثي", "حسين علي العتيبي"],
  ["ناصر إبراهيم الشهري", "سلمان خالد المطيري"],
  ["بدر عبدالعزيز الرشيدي", "منصور فهد السبيعي"],
  ["حمد سلمان العمري", "صقر سعد البقمي"],
  ["طلال محمد الجهني", "غازي عبدالله الحربي"],
  ["مشاري ناصر الخالدي", "عبدالكريم سلطان العنزي"],
  ["عادل فيصل السلمي", "ياسر محمد الشمري"],
  ["سامي عبدالله الثقفي", "شادي ناصر الدوسري"],
  ["وليد خالد الأحمدي", "حامد سعد المالكي"],
  ["تركي سعود القرني", "عبدالهادي فهد الزهراني"],
  ["زياد إبراهيم الغامدي", "نايف عبدالله الحارثي"],
  ["رائد محمد البلوي", "سلطان خالد الشهري"],
  ["صالح ناصر الثبيتي", "عبدالعزيز سلمان الرشيدي"],
  ["خلف سعد الصاعدي", "هيثم محمد العمري"],
  ["عمر فيصل اللحياني", "جمال ناصر الجهني"],
  ["حاتم عبدالله الزبيدي", "رشيد خالد الخالدي"],
  ["راشد سلطان الأسمري", "إبراهيم فهد السلمي"],
  ["محسن إبراهيم الفيفي", "وليد عبدالله الثقفي"],
  ["فواز محمد الكلبي", "تركي سعد الأحمدي"],
  ["سعود ناصر الصبحي", "مهند خالد القرني"],
  ["عبدالرحيم فهد اليامي", "طارق محمد البلوي"],
  ["مازن سلمان الشعلان", "عماد ناصر الثبيتي"],
  ["هاني عبدالله الغبيوي", "جاسم فيصل الصاعدي"],
  ["أنس خالد المرواني", "عبدالإله سعد اللحياني"],
  ["ثامر محمد الروقي", "زكريا عبدالله الزبيدي"],
  ["نواف ناصر الحويطي", "أسامة خالد الأسمري"],
  ["مقبل فهد الرحيلي", "داوود محمد الفيفي"],
  ["شايع سلمان الأكلبي", "حاكم ناصر الكلبي"],
  ["جابر عبدالله الشريف", "ماهر فهد الصبحي"],
  ["حسام محمد الأنصاري", "عثمان سعد اليامي"],
  ["كريم ناصر المدني", "لؤي خالد الشعلان"],
  ["وائل فيصل الفقيه", "رياض محمد الغبيوي"],
  ["إياد عبدالله الهاشمي", "سراج ناصر المرواني"],
  ["أيمن سلمان النعمي", "همام فهد الروقي"],
  ["باسل خالد الريثي", "أمجد عبدالله الحويطي"],
  ["غسان محمد الشولي", "ضيف الله سعد الرحيلي"],
  ["معاذ ناصر الكناني", "نبيل فيصل الأكلبي"],
];
export const CIRCUIT_EMPLOYEES: Record<string, { id: string; name: string }[]> = {};
CIRCUITS.forEach((c, idx) => {
  if (c.type !== "documents") {
    const names = _CIRCUIT_EMPLOYEE_NAMES[idx % _CIRCUIT_EMPLOYEE_NAMES.length];
    CIRCUIT_EMPLOYEES[c.value] = [
      { id: `${c.value}_emp1`, name: names[0] },
      { id: `${c.value}_emp2`, name: names[1] },
    ];
  }
});

export const DOCS_EMPLOYEES: { id: string; name: string }[] = [
  { id: "docs_emp1", name: "خالد فهد الرشيدي" },
  { id: "docs_emp2", name: "عمار سعد الغامدي" },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  completed: {
    label: "مكتمل",
    color: "bg-[#075e4a]/[0.07] text-[#075e4a]",
    dot: "bg-[#075e4a]",
  },
  processing: {
    label: "قيد المعالجة",
    color: "bg-[#ec9a18]/[0.05] text-[#ec9a18]/80",
    dot: "bg-[#ec9a18]/70",
  },
  referred: {
    label: "محال",
    color: "bg-[#187860]/[0.07] text-[#187860]",
    dot: "bg-[#187860]",
  },
  pending: {
    label: "قيد المراجعة",
    color: "bg-[#ec9a18]/[0.05] text-[#ec9a18]/80",
    dot: "bg-[#ec9a18]/70",
  },
  rejected: {
    label: "مرفوض",
    color: "bg-[#B42318]/[0.05] text-[#B42318]/80",
    dot: "bg-[#B42318]/70",
  },
  objected: {
    label: "معترض عليه",
    color: "bg-[#5cb89c]/[0.08] text-[#187860]",
    dot: "bg-[#5cb89c]",
  },
};

export const MOCK_REQUESTS: Request[] = [
  {
    id: "1",
    trackingNumber: "4710001247",
    applicantName: "عبدالله محمد السبيعي",
    applicantId: "1054789632",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46102534",
    judgmentNumber: "2456781",
    judgmentDate: "2025-11-15",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "completed",
    isPaid: true,
    createdAt: "2026-03-15",
    updatedAt: "2026-03-18",
    slaDeadline: "2026-04-15",
    notes: "تم إصدار الصورة الطبق الأصل",
    rating: 5,
    ratingComment: "خدمة ممتازة وسريعة",
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-02-20 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-21 10:30", title: "مراجعة الطلب", description: "جاري مراجعة المستندات", status: "completed" },
      { id: "t3", date: "2026-02-23 14:00", title: "المعالجة", description: "تمت المعالجة من قِبل الموظف المختص", status: "completed" },
      { id: "t4", date: "2026-02-24 11:00", title: "إغلاق الطلب", description: "تم إغلاق الطلب بنجاح", status: "completed" },
    ],
  },
  {
    id: "2",
    trackingNumber: "4710001248",
    applicantName: "سارة أحمد القحطاني",
    applicantId: "1098765432",
    applicantType: "heir",
    requestType: "case_review",
    caseNumber: "46205678",
    judgmentNumber: "3901234",
    judgmentDate: "2025-12-01",
    circuit: "partial_2",
    court: "المحكمة العامة بجدة",
    status: "processing",
    createdAt: "2026-04-08",
    updatedAt: "2026-04-10",
    slaDeadline: "2026-04-17",
    assignedTo: "يزيد محمد العتيبي",
    timeline: [
      { id: "t1", date: "2026-02-25 08:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-26 09:00", title: "مراجعة الطلب", description: "جاري مراجعة المستندات", status: "completed" },
      { id: "t3", date: "2026-02-27 14:00", title: "المعالجة", description: "الطلب قيد المعالجة", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "3",
    trackingNumber: "4710001249",
    applicantName: "محمد سعد الدوسري",
    applicantId: "1087654321",
    applicantType: "agent",
    requestType: "replacement_doc",
    caseNumber: "46309012",
    judgmentNumber: "4345612",
    judgmentDate: "2025-10-20",
    circuit: "general_5",
    court: "المحكمة العامة بالجوف",
    status: "referred",
    createdAt: "2026-04-06",
    updatedAt: "2026-04-07",
    slaDeadline: "2026-04-19",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    timeline: [
      { id: "t1", date: "2026-02-22 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-23 11:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-02-26 09:30", title: "الإحالة", description: "تم إحالة الطلب إلى القسم المختص", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "4",
    trackingNumber: "4710001250",
    applicantName: "نورة عبدالرحمن الشمري",
    applicantId: "1065432198",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46102534",
    judgmentNumber: "2789045",
    judgmentDate: "2026-01-10",
    circuit: "traffic_1",
    court: "المحكمة العامة بالدمام",
    status: "processing",
    createdAt: "2026-04-04",
    updatedAt: "2026-04-06",
    slaDeadline: "2026-04-14",
    assignedTo: "علي عبدالله المطيري",
    timeline: [
      { id: "t1", date: "2026-02-26 08:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-27 10:00", title: "مراجعة الطلب", description: "جاري مراجعة المستندات", status: "current" },
      { id: "t3", date: "", title: "المعالجة", description: "في انتظار المعالجة", status: "pending" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "5",
    trackingNumber: "4710001251",
    applicantName: "خالد إبراهيم الزهراني",
    applicantId: "1043219876",
    applicantType: "defendant",
    requestType: "case_review",
    caseNumber: "46407890",
    judgmentNumber: "3123467",
    judgmentDate: "2025-09-05",
    circuit: "general_12",
    court: "المحكمة العامة بالرياض",
    status: "completed",
    isPaid: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-14",
    slaDeadline: "2026-04-13",
    rating: 4,
    ratingComment: "الخدمة جيدة لكن تستغرق وقتاً",
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-02-15 09:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-16 10:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-02-18 14:30", title: "المعالجة", description: "تمت المعالجة", status: "completed" },
      { id: "t4", date: "2026-02-19 11:30", title: "إغلاق الطلب", description: "تم إغلاق الطلب بنجاح", status: "completed" },
    ],
  },
  {
    id: "6",
    trackingNumber: "4710001244",
    applicantName: "ريم عبدالعزيز المالكي",
    applicantId: "1076543219",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46502211",
    judgmentNumber: "4881123",
    judgmentDate: "2025-08-12",
    circuit: "general_3",
    court: "المحكمة العامة بالمدينة المنورة",
    status: "processing",
    createdAt: "2026-03-16",
    updatedAt: "2026-03-19",
    slaDeadline: "2026-03-20",
    assignedTo: "محمد ناصر الشهري",
    timeline: [
      { id: "t1", date: "2026-02-10 08:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-11 09:00", title: "مراجعة الطلب", description: "جاري المراجعة", status: "completed" },
      { id: "t3", date: "2026-02-14 11:00", title: "المعالجة", description: "الطلب قيد المعالجة", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "7",
    trackingNumber: "4710001252",
    applicantName: "تركي محمد العسيري",
    applicantId: "1032198765",
    applicantType: "plaintiff",
    requestType: "case_review",
    caseNumber: "46205678",
    judgmentNumber: "2223345",
    judgmentDate: "2025-07-20",
    circuit: "partial_1",
    court: "المحكمة العامة بالخبر",
    status: "referred",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-10",
    slaDeadline: "2026-04-18",
    referredTo: "الدائرة القضائية رقم 3",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-02-27 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-02-27 10:30", title: "مراجعة الطلب", description: "تمت المراجعة من مركز التدقيق", status: "completed" },
      { id: "t3", date: "2026-02-28 08:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 3", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "8",
    trackingNumber: "4710001253",
    applicantName: "عبدالعزيز سالم الحارثي",
    applicantId: "1021345678",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46705512",
    judgmentNumber: "3440156",
    judgmentDate: "2025-06-18",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "referred",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-11",
    slaDeadline: "2026-04-16",
    referredTo: "الدائرة القضائية رقم 6",
    referralSection: "judicial" as const,
    isFastTrack: true,
    timeline: [
      { id: "t1", date: "2026-03-19 08:15", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-19 09:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-20 07:30", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 6", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "9",
    trackingNumber: "4710001254",
    applicantName: "هدى عبدالله الشهراني",
    applicantId: "1045678912",
    applicantType: "heir",
    requestType: "replacement_doc",
    caseNumber: "46808821",
    judgmentNumber: "4662234",
    judgmentDate: "2025-04-10",
    circuit: "general_5",
    court: "المحكمة العامة بالجوف",
    status: "referred",
    createdAt: "2026-04-06",
    updatedAt: "2026-04-07",
    slaDeadline: "2026-04-16",
    referredTo: "الدائرة القضائية رقم 2",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-17 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-17 11:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-18 09:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 2", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "10",
    trackingNumber: "4710001255",
    applicantName: "فهد ناصر القرني",
    applicantId: "1067891234",
    applicantType: "agent",
    requestType: "certified_copy",
    caseNumber: "46913317",
    judgmentNumber: "2771189",
    judgmentDate: "2026-01-25",
    circuit: "general_12",
    court: "المحكمة العامة بالرياض",
    status: "referred",
    createdAt: "2026-04-06",
    updatedAt: "2026-04-07",
    slaDeadline: "2026-04-20",
    referredTo: "الدائرة القضائية رقم 9",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-20 07:45", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-20 08:30", title: "مراجعة الطلب", description: "تمت المراجعة وتم التحقق", status: "completed" },
      { id: "t3", date: "2026-03-20 10:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 9", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "11",
    trackingNumber: "4710001256",
    applicantName: "منال سعيد الغامدي",
    applicantId: "1089123456",
    applicantType: "stakeholder",
    requestType: "case_review",
    caseNumber: "46101199",
    judgmentNumber: "3993312",
    judgmentDate: "2025-11-03",
    circuit: "partial_2",
    court: "المحكمة العامة بجدة",
    status: "referred",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-10",
    slaDeadline: "2026-04-17",
    referredTo: "الدائرة القضائية رقم 7",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-16 09:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-16 10:15", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-17 08:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 7", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "12",
    trackingNumber: "4710001257",
    applicantName: "سلطان خالد المطيري",
    applicantId: "1012345679",
    applicantType: "defendant",
    requestType: "certified_copy",
    caseNumber: "46117744",
    judgmentNumber: "4334456",
    judgmentDate: "2025-09-15",
    circuit: "traffic_1",
    court: "المحكمة العامة بالدمام",
    status: "referred",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-06",
    slaDeadline: "2026-04-16",
    referredTo: "الدائرة القضائية رقم 4",
    referralSection: "judicial" as const,
    internalNote: "المستفيد طلب استعجال حاجته للوثيقة لتسوية مالية",
    timeline: [
      { id: "t1", date: "2026-03-15 11:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-15 13:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-16 09:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 4", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "13",
    trackingNumber: "4710001258",
    applicantName: "أمل إبراهيم الزهراني",
    applicantId: "1056789123",
    applicantType: "plaintiff",
    requestType: "replacement_doc",
    caseNumber: "46126655",
    judgmentNumber: "2556678",
    judgmentDate: "2025-05-22",
    circuit: "general_3",
    court: "المحكمة العامة بالمدينة المنورة",
    status: "referred",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-11",
    slaDeadline: "2026-04-19",
    referredTo: "الدائرة القضائية رقم 1",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-20 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-20 10:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-21 08:30", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 1", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "14",
    trackingNumber: "4710001259",
    applicantName: "ياسر أحمد العمري",
    applicantId: "1034567891",
    applicantType: "plaintiff",
    requestType: "case_review",
    caseNumber: "46132288",
    judgmentNumber: "3882234",
    judgmentDate: "2026-02-05",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "referred",
    createdAt: "2026-04-02",
    updatedAt: "2026-04-03",
    slaDeadline: "2026-04-09",
    referredTo: "الدائرة القضائية رقم 11",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-21 07:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-21 08:15", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-21 09:00", title: "الإحالة إلى الدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 11", status: "current" },
      { id: "t4", date: "", title: "استقبال الطلب من الدائرة القضائية", description: "في انتظار استقبال الطلب وإحالته للدائرة المختصة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs1",
    trackingNumber: "4710002001",
    applicantName: "راكان عبدالرحمن الحربي",
    applicantId: "1091234567",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46141122",
    judgmentNumber: "4110145",
    judgmentDate: "2026-01-05",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "pending",
    createdAt: "2026-04-08",
    updatedAt: "2026-04-08",
    slaDeadline: "2026-04-16",
    assignedSection: "beneficiary_services",
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-03-20 08:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "", title: "مراجعة الطلب", description: "في انتظار المراجعة", status: "current" },
      { id: "t3", date: "", title: "الإحالة للدائرة القضائية", description: "في انتظار الإحالة", status: "pending" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs2",
    trackingNumber: "4710002002",
    applicantName: "مها سليمان العنزي",
    applicantId: "1082345678",
    applicantType: "heir",
    requestType: "replacement_doc",
    caseNumber: "46153344",
    judgmentNumber: "2220267",
    judgmentDate: "2025-11-20",
    circuit: "general_3",
    court: "المحكمة العامة بالمدينة المنورة",
    status: "processing",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-07",
    slaDeadline: "2026-04-14",
    assignedSection: "beneficiary_services",
    assignedTo: "يزيد محمد العتيبي",
    timeline: [
      { id: "t1", date: "2026-03-18 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-18 10:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-19 08:00", title: "المعالجة", description: "الطلب قيد المعالجة", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs3",
    trackingNumber: "4710002003",
    applicantName: "عمر حسن الشمراني",
    applicantId: "1073456789",
    applicantType: "defendant",
    requestType: "case_review",
    caseNumber: "46165566",
    judgmentNumber: "3330378",
    judgmentDate: "2025-08-15",
    circuit: "partial_1",
    court: "المحكمة العامة بالخبر",
    status: "referred",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-06",
    slaDeadline: "2026-04-18",
    assignedSection: "beneficiary_services",
    referredTo: "الدائرة القضائية رقم 5",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-17 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-17 11:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-19 09:00", title: "الإحالة للدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة القضائية رقم 5", status: "current" },
      { id: "t4", date: "", title: "إرفاق المستند وإعادة الطلب", description: "في انتظار إرفاق المستند", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs4",
    trackingNumber: "4710002004",
    applicantName: "نوف عبدالله الرشيدي",
    applicantId: "1064567890",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46177788",
    judgmentNumber: "4440489",
    judgmentDate: "2025-07-10",
    circuit: "general_5",
    court: "المحكمة العامة بالجوف",
    status: "pending",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-09",
    slaDeadline: "2026-04-17",
    assignedSection: "beneficiary_services",
    assignedTo: "علي عبدالله المطيري",
    isFastTrack: true,
    timeline: [
      { id: "t1", date: "2026-03-21 07:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "", title: "مراجعة الطلب", description: "في انتظار المراجعة", status: "current" },
      { id: "t3", date: "", title: "المعالجة", description: "في انتظار المعالجة", status: "pending" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs5",
    trackingNumber: "4710002005",
    applicantName: "إبراهيم فهد الجهني",
    applicantId: "1055678901",
    applicantType: "agent",
    requestType: "case_review",
    caseNumber: "46189900",
    judgmentNumber: "2550512",
    judgmentDate: "2025-06-25",
    circuit: "general_12",
    court: "المحكمة العامة بالرياض",
    status: "processing",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-11",
    slaDeadline: "2026-04-18",
    assignedSection: "beneficiary_services",
    assignedTo: "محمد ناصر الشهري",
    timeline: [
      { id: "t1", date: "2026-03-16 08:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-16 09:45", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-18 10:00", title: "المعالجة", description: "الطلب قيد المعالجة", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs6",
    trackingNumber: "4710002006",
    applicantName: "لطيفة محمد البقمي",
    applicantId: "1046789012",
    applicantType: "stakeholder",
    requestType: "replacement_doc",
    caseNumber: "46192233",
    judgmentNumber: "3660623",
    judgmentDate: "2026-02-10",
    circuit: "partial_2",
    court: "المحكمة العامة بجدة",
    status: "referred",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-10",
    slaDeadline: "2026-04-17",
    assignedSection: "beneficiary_services",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    timeline: [
      { id: "t1", date: "2026-03-19 11:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-19 12:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-20 08:30", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب إلى قسم الوثائق والمحفوظات", status: "current" },
      { id: "t4", date: "", title: "إرفاق المستند وإعادة الطلب", description: "في انتظار إصدار الوثيقة البديلة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs7",
    trackingNumber: "4710002007",
    applicantName: "سعود ناصر الدوسري",
    applicantId: "1037890123",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46204455",
    judgmentNumber: "4770734",
    judgmentDate: "2025-10-05",
    circuit: "traffic_1",
    court: "المحكمة العامة بالدمام",
    status: "completed",
    isPaid: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-15",
    slaDeadline: "2026-04-14",
    assignedSection: "beneficiary_services",
    rating: 5,
    ratingComment: "سرعة في التنفيذ وتعامل راقي",
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-03-10 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-10 10:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-12 14:00", title: "المعالجة", description: "تمت المعالجة", status: "completed" },
      { id: "t4", date: "2026-03-15 09:00", title: "إغلاق الطلب", description: "تم إغلاق الطلب بنجاح", status: "completed" },
    ],
  },
  {
    id: "bs8",
    trackingNumber: "4710002008",
    applicantName: "غادة عبدالعزيز الحربي",
    applicantId: "1028901234",
    applicantType: "heir",
    requestType: "case_review",
    caseNumber: "46216677",
    judgmentNumber: "2880845",
    judgmentDate: "2025-04-18",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "pending",
    createdAt: "2026-03-21",
    updatedAt: "2026-03-21",
    slaDeadline: "2026-04-14",
    assignedSection: "beneficiary_services",
    assignedTo: "يزيد محمد العتيبي",
    timeline: [
      { id: "t1", date: "2026-03-21 08:15", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "", title: "مراجعة الطلب", description: "في انتظار المراجعة", status: "current" },
      { id: "t3", date: "", title: "الإحالة للدائرة القضائية", description: "في انتظار الإحالة", status: "pending" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs9",
    trackingNumber: "4710002009",
    applicantName: "ماجد سعيد القحطاني",
    applicantId: "1019012345",
    applicantType: "defendant",
    requestType: "certified_copy",
    caseNumber: "46228899",
    judgmentNumber: "3990956",
    judgmentDate: "2025-03-28",
    circuit: "general_3",
    court: "المحكمة العامة بالمدينة المنورة",
    status: "processing",
    createdAt: "2026-04-05",
    updatedAt: "2026-04-07",
    slaDeadline: "2026-04-15",
    assignedSection: "beneficiary_services",
    assignedTo: "علي عبدالله المطيري",
    timeline: [
      { id: "t1", date: "2026-03-15 07:45", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-15 09:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-17 10:00", title: "المعالجة", description: "الطلب قيد المعالجة", status: "current" },
      { id: "t4", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "bs10",
    trackingNumber: "4710002010",
    applicantName: "وفاء خالد المطيري",
    applicantId: "1010123456",
    applicantType: "plaintiff",
    requestType: "replacement_doc",
    caseNumber: "46231100",
    judgmentNumber: "4101067",
    judgmentDate: "2026-01-15",
    circuit: "general_5",
    court: "المحكمة العامة بالجوف",
    status: "referred",
    createdAt: "2026-04-10",
    updatedAt: "2026-04-11",
    slaDeadline: "2026-04-19",
    assignedSection: "beneficiary_services",
    referredTo: "الدائرة الجزئية 3",
    referralSection: "judicial" as const,
    timeline: [
      { id: "t1", date: "2026-03-20 09:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-20 10:45", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-21 08:00", title: "الإحالة للدائرة القضائية", description: "تم إحالة الطلب إلى الدائرة الجزئية 3", status: "current" },
      { id: "t4", date: "", title: "إرفاق المستند وإعادة الطلب", description: "في انتظار إصدار الوثيقة البديلة", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "rej1",
    trackingNumber: "4710003001",
    applicantName: "عمر حسن الشريف",
    applicantId: "1098712345",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46249911",
    judgmentNumber: "2990178",
    judgmentDate: "2025-10-10",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "rejected",
    createdAt: "2026-03-25",
    updatedAt: "2026-03-27",
    slaDeadline: "2026-04-08",
    rejectionReason: "المستندات المرفقة غير مكتملة يرجى إرفاق صورة من الهوية وصك الحكم",
    assignedTo: "تركي سلطان العمري",
    assignedSection: "verification_center",
    timeline: [
      { id: "t1", date: "2026-03-25 08:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-26 09:30", title: "مراجعة الطلب", description: "تمت المراجعة من مركز التدقيق", status: "completed" },
      { id: "t3", date: "2026-03-27 10:00", title: "رفض الطلب", description: "تم رفض الطلب المستندات غير مكتملة", status: "completed" },
    ],
  },
  {
    id: "rej2",
    trackingNumber: "4710003002",
    applicantName: "فاطمة علي الدوسري",
    applicantId: "1087654329",
    applicantType: "heir",
    requestType: "replacement_doc",
    caseNumber: "46258822",
    judgmentNumber: "3880289",
    judgmentDate: "2025-08-15",
    circuit: "general_5",
    court: "المحكمة العامة بالجوف",
    status: "rejected",
    createdAt: "2026-03-22",
    updatedAt: "2026-03-24",
    slaDeadline: "2026-04-21",
    rejectionReason: "رقم القضية المدخل غير صحيح يرجى التأكد من البيانات وإعادة التقديم",
    assignedTo: "سامي فيصل الحارثي",
    assignedSection: "verification_center",
    timeline: [
      { id: "t1", date: "2026-03-22 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-23 11:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-24 09:00", title: "رفض الطلب", description: "تم رفض الطلب بيانات غير صحيحة", status: "completed" },
    ],
  },
  {
    id: "obj1",
    trackingNumber: "4710003003",
    applicantName: "سلمان عبدالله القحطاني",
    applicantId: "1076543218",
    applicantType: "plaintiff",
    requestType: "case_review",
    caseNumber: "46267733",
    judgmentNumber: "4770390",
    judgmentDate: "2025-09-20",
    circuit: "partial_2",
    court: "المحكمة العامة بجدة",
    status: "objected",
    createdAt: "2026-03-20",
    updatedAt: "2026-03-26",
    slaDeadline: "2026-03-27",
    objectionReason: "تم رفض الطلب بسبب نقص المستندات لكنني أرفقت جميع المستندات المطلوبة أرجو إعادة المراجعة",
    assignedTo: "بندر عبدالله الشهراني",
    assignedSection: "verification_center",
    timeline: [
      { id: "t1", date: "2026-03-20 08:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-21 10:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-23 09:00", title: "رفض الطلب", description: "تم رفض الطلب", status: "completed" },
      { id: "t4", date: "2026-03-26 08:00", title: "تقديم اعتراض", description: "تم تقديم اعتراض من المستفيد", status: "current" },
    ],
  },
  {
    id: "pay1",
    trackingNumber: "4710003001",
    applicantName: "عبدالله محمد السبيعي",
    applicantId: "1054789632",
    applicantType: "plaintiff",
    requestType: "certified_copy",
    caseNumber: "46272210",
    judgmentNumber: "2442112",
    judgmentDate: "2025-12-10",
    circuit: "general_1",
    court: "المحكمة العامة بالرياض",
    status: "completed",
    createdAt: "2026-03-28",
    updatedAt: "2026-04-01",
    slaDeadline: "2026-04-18",
    assignedTo: "أحمد علي الحربي",
    digitalStamp: { applied: true, verificationCode: "MOJ-STM-88421", circuitName: "الدائرة القضائية العامة 1", stampDate: "2026-04-01" },
    digitalSignature: { applied: true, hash: "e3b0c44298fc1c149afb", signDate: "2026-04-01" },
    timeline: [
      { id: "t1", date: "2026-03-28 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-29 10:00", title: "مراجعة الطلب", description: "تمت المراجعة والتحقق", status: "completed" },
      { id: "t3", date: "2026-03-31 14:00", title: "المعالجة", description: "تمت المعالجة من الدائرة القضائية", status: "completed" },
      { id: "t4", date: "2026-04-01 11:00", title: "إغلاق الطلب", description: "تم إغلاق الطلب بانتظار سداد الرسوم", status: "completed" },
    ],
  },
  {
    id: "pay2",
    trackingNumber: "4710003002",
    applicantName: "عبدالله محمد السبيعي",
    applicantId: "1054789632",
    applicantType: "agent",
    requestType: "case_review",
    caseNumber: "46283355",
    judgmentNumber: "3773023",
    judgmentDate: "2026-03-20",
    circuit: "commercial_1",
    court: "المحكمة التجارية بالرياض",
    status: "completed",
    isPaid: true,
    createdAt: "2026-03-25",
    updatedAt: "2026-03-30",
    slaDeadline: "2026-04-22",
    assignedTo: "يزيد محمد العتيبي",
    digitalStamp: { applied: true, verificationCode: "MOJ-STM-77302", circuitName: "الدائرة التجارية 1", stampDate: "2026-03-30" },
    digitalSignature: { applied: true, hash: "a1b2c3d4e5f6a7b8c9d0", signDate: "2026-03-30" },
    timeline: [
      { id: "t1", date: "2026-03-25 08:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-26 09:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-28 13:00", title: "المعالجة", description: "تمت المعالجة", status: "completed" },
      { id: "t4", date: "2026-03-30 10:00", title: "إغلاق الطلب", description: "تم إغلاق الطلب وسداد الرسوم", status: "completed" },
    ],
  },
  {
    id: "pay3",
    trackingNumber: "4710003003",
    applicantName: "عبدالله محمد السبيعي",
    applicantId: "1054789632",
    applicantType: "plaintiff",
    requestType: "replacement_doc",
    caseNumber: "46291188",
    judgmentNumber: "4991234",
    judgmentDate: "2024-08-22",
    circuit: "family_1",
    court: "المحكمة العامة بالرياض",
    status: "completed",
    isPaid: true,
    createdAt: "2026-03-20",
    updatedAt: "2026-03-27",
    slaDeadline: "2026-04-17",
    assignedTo: "محمد سعد الدوسري",
    digitalStamp: { applied: true, verificationCode: "MOJ-STM-55103", circuitName: "دائرة الأحوال الشخصية 1", stampDate: "2026-03-27" },
    digitalSignature: { applied: true, hash: "f9e8d7c6b5a4f3e2d1c0", signDate: "2026-03-27" },
    timeline: [
      { id: "t1", date: "2026-03-20 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-21 11:30", title: "مراجعة الطلب", description: "تمت المراجعة والتدقيق", status: "completed" },
      { id: "t3", date: "2026-03-24 14:00", title: "المعالجة", description: "تمت المعالجة من الدائرة المختصة", status: "completed" },
      { id: "t4", date: "2026-03-27 09:30", title: "إغلاق الطلب", description: "تم إغلاق الطلب وسداد الرسوم", status: "completed" },
    ],
  },
  {
    id: "doc1",
    trackingNumber: "4710003001",
    applicantName: "عبدالله خالد العنزي",
    applicantId: "1091234567",
    applicantType: "plaintiff",
    requestType: "replacement_doc",
    caseNumber: "46701122",
    judgmentNumber: "4990189",
    judgmentDate: "2025-06-15",
    circuit: "general_2",
    court: "المحكمة العامة بجدة",
    status: "referred",
    createdAt: "2026-04-08",
    updatedAt: "2026-04-09",
    slaDeadline: "2026-04-18",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    assignedTo: "علي المطيري",
    timeline: [
      { id: "t1", date: "2026-03-20 08:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-21 09:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-22 10:00", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب إلى قسم الوثائق والمحفوظات", status: "current" },
      { id: "t4", date: "", title: "إرفاق الوثيقة البديلة", description: "في انتظار البحث في الأرشيف", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "doc2",
    trackingNumber: "4710003002",
    applicantName: "منال سعيد الغامدي",
    applicantId: "1082345678",
    applicantType: "heir",
    requestType: "certified_copy",
    caseNumber: "46703344",
    judgmentNumber: "2990245",
    judgmentDate: "2024-11-20",
    circuit: "partial_1",
    court: "المحكمة العامة بالرياض",
    status: "referred",
    createdAt: "2026-04-07",
    updatedAt: "2026-04-09",
    slaDeadline: "2026-04-17",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-03-18 10:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-19 11:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-20 09:00", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب إلى قسم الوثائق والمحفوظات لاستخراج النسخة", status: "current" },
      { id: "t4", date: "", title: "إرفاق النسخة المصدقة", description: "في انتظار استخراج النسخة من الأرشيف", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "doc3",
    trackingNumber: "4710003003",
    applicantName: "فيصل عادل الشهري",
    applicantId: "1073456789",
    applicantType: "agent",
    requestType: "replacement_doc",
    caseNumber: "46705566",
    judgmentNumber: "3990356",
    judgmentDate: "2025-03-10",
    circuit: "general_4",
    court: "المحكمة العامة بالدمام",
    status: "referred",
    createdAt: "2026-03-15",
    updatedAt: "2026-03-17",
    slaDeadline: "2026-04-06",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    assignedTo: "علي المطيري",
    timeline: [
      { id: "t1", date: "2026-03-15 07:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-16 08:45", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-17 11:00", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب إلى قسم الوثائق للبحث عن الوثيقة الأصلية", status: "current" },
      { id: "t4", date: "", title: "إصدار النسخة البديلة", description: "في انتظار الإصدار", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "doc4",
    trackingNumber: "4710003004",
    applicantName: "ريما ناصر القحطاني",
    applicantId: "1064567890",
    applicantType: "stakeholder",
    requestType: "certified_copy",
    caseNumber: "46707788",
    judgmentNumber: "4990467",
    judgmentDate: "2025-08-25",
    circuit: "general_3",
    court: "المحكمة العامة بالمدينة المنورة",
    status: "referred",
    createdAt: "2026-04-09",
    updatedAt: "2026-04-10",
    slaDeadline: "2026-04-19",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    assignedTo: "أحمد علي الحربي",
    timeline: [
      { id: "t1", date: "2026-03-22 09:00", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-23 10:30", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-24 08:00", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب لاستخراج نسخة مصدقة من الأرشيف", status: "current" },
      { id: "t4", date: "", title: "إرفاق النسخة المصدقة", description: "في انتظار الاستخراج", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
  {
    id: "doc5",
    trackingNumber: "4710003005",
    applicantName: "تركي محمد الحربي",
    applicantId: "1055678901",
    applicantType: "defendant",
    requestType: "replacement_doc",
    caseNumber: "46709900",
    judgmentNumber: "2990578",
    judgmentDate: "2024-12-01",
    circuit: "partial_2",
    court: "المحكمة العامة بمكة المكرمة",
    status: "referred",
    createdAt: "2026-03-25",
    updatedAt: "2026-03-27",
    slaDeadline: "2026-04-14",
    referredTo: "قسم الوثائق والمحفوظات",
    referralSection: "documents" as const,
    assignedTo: "علي المطيري",
    timeline: [
      { id: "t1", date: "2026-03-25 08:30", title: "تقديم الطلب", description: "تم تقديم الطلب بنجاح", status: "completed" },
      { id: "t2", date: "2026-03-26 09:00", title: "مراجعة الطلب", description: "تمت المراجعة", status: "completed" },
      { id: "t3", date: "2026-03-27 10:30", title: "الإحالة لقسم الوثائق", description: "تم إحالة الطلب لقسم الوثائق والمحفوظات", status: "current" },
      { id: "t4", date: "", title: "البحث في المحفوظات", description: "في انتظار البحث عن الوثيقة الأصلية", status: "pending" },
      { id: "t5", date: "", title: "إغلاق الطلب", description: "في انتظار الإغلاق", status: "pending" },
    ],
  },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "e13", name: "تركي سلطان العمري", username: "turki.amri", department: "مركز تدقيق الطلبات", status: "active", requestsHandled: 210, avgResponseTime: "0.8 يوم", avgRating: 4.9, badge: "gold" },
  { id: "e14", name: "سامي فيصل الحارثي", username: "sami.harthi", department: "مركز تدقيق الطلبات", status: "active", requestsHandled: 185, avgResponseTime: "1.0 يوم", avgRating: 4.7, badge: "silver" },
  { id: "e15", name: "بندر عبدالله الشهراني", username: "bandar.shahrani", department: "مركز تدقيق الطلبات", status: "active", requestsHandled: 156, avgResponseTime: "1.2 يوم", avgRating: 4.6 },
  { id: "e1", name: "أحمد علي الحربي", username: "ahmed.harbi", department: "الدائرة القضائية العامة 1", status: "active", requestsHandled: 142, avgResponseTime: "1.5 يوم", avgRating: 4.8, badge: "gold" },
  { id: "e2", name: "يزيد محمد العتيبي", username: "yazeed.otaibi", department: "الدائرة الجزئية 2", status: "active", requestsHandled: 98, avgResponseTime: "2.1 يوم", avgRating: 4.5, badge: "silver" },
  { id: "e3", name: "علي عبدالله المطيري", username: "ali.mutairi", department: "الدائرة المرورية 1", status: "active", requestsHandled: 87, avgResponseTime: "1.8 يوم", avgRating: 4.3, badge: "bronze" },
  { id: "e4", name: "عمار سعد الغامدي", username: "ammar.ghamdi", department: "قسم الوثائق والمحفوظات", status: "frozen", requestsHandled: 63, avgResponseTime: "2.5 يوم", avgRating: 3.9 },
  { id: "e5", name: "محمد ناصر الشهري", username: "mohammed.shehri", department: "الدائرة القضائية العامة 5", status: "active", requestsHandled: 115, avgResponseTime: "1.3 يوم", avgRating: 4.6 },
  { id: "e6", name: "حسن خالد الدوسري", username: "hassan.dosari", department: "خدمات المستفيدين", status: "active", requestsHandled: 201, avgResponseTime: "0.9 يوم", avgRating: 4.9, badge: "gold" },
  { id: "e7", name: "عبدالرحمن يوسف القحطاني", username: "abdulrahman.qahtani", department: "خدمات المستفيدين", status: "active", requestsHandled: 174, avgResponseTime: "1.1 يوم", avgRating: 4.7, badge: "silver" },
  { id: "e8", name: "وائل سلمان العنزي", username: "wael.anazi", department: "خدمات المستفيدين", status: "active", requestsHandled: 138, avgResponseTime: "1.4 يوم", avgRating: 4.5 },
  { id: "e9", name: "خالد فهد الرشيدي", username: "khalid.rashidi", department: "قسم الوثائق والمحفوظات", status: "active", requestsHandled: 79, avgResponseTime: "2.2 يوم", avgRating: 4.2 },
  { id: "e10", name: "حمزة عبدالعزيز السبيعي", username: "hamza.subai", department: "الدائرة الجزئية 1", status: "active", requestsHandled: 91, avgResponseTime: "1.9 يوم", avgRating: 4.4 },
  { id: "e11", name: "ماجد سعيد الزهراني", username: "majed.zahrani", department: "الدائرة المرورية 3", status: "active", requestsHandled: 67, avgResponseTime: "2.0 يوم", avgRating: 4.1 },
  { id: "e12", name: "سعود إبراهيم الشمري", username: "saud.shammari", department: "الدائرة القضائية العامة 12", status: "active", requestsHandled: 105, avgResponseTime: "1.6 يوم", avgRating: 4.5 },
];

export function getDepartmentSection(department: string): "verification_center" | "beneficiary_services" | "judicial" | "documents" {
  if (department === "مركز تدقيق الطلبات" || department === "قسم التدقيق") return "verification_center";
  if (department === "قسم الوثائق والمحفوظات") return "documents";
  if (department === "خدمات المستفيدين") return "beneficiary_services";
  return "judicial";
}

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "d1", name: "قسم خدمات المستفيدين", type: "general", employeesCount: 8, requestsCount: 513 },
  { id: "d2", name: "الدوائر القضائية العامة", type: "general", employeesCount: 33, requestsCount: 412 },
  { id: "d3", name: "الدوائر الجزئية", type: "partial", employeesCount: 12, requestsCount: 178 },
  { id: "d4", name: "الدوائر المرورية", type: "traffic", employeesCount: 8, requestsCount: 94 },
  { id: "d5", name: "قسم الوثائق والمحفوظات", type: "documents", employeesCount: 5, requestsCount: 56 },
];

export const DAILY_STATS = [
  { day: "الأحد", completed: 18, processing: 12, referred: 5 },
  { day: "الاثنين", completed: 24, processing: 15, referred: 7 },
  { day: "الثلاثاء", completed: 21, processing: 18, referred: 4 },
  { day: "الأربعاء", completed: 28, processing: 11, referred: 9 },
  { day: "الخميس", completed: 32, processing: 14, referred: 6 },
];

export const MONTHLY_PERFORMANCE = [
  { month: "سبتمبر", ahmed: 65, fatima: 52, ali: 48 },
  { month: "أكتوبر", ahmed: 72, fatima: 58, ali: 53 },
  { month: "نوفمبر", ahmed: 68, fatima: 64, ali: 61 },
  { month: "ديسمبر", ahmed: 80, fatima: 70, ali: 65 },
  { month: "يناير", ahmed: 88, fatima: 75, ali: 72 },
  { month: "فبراير", ahmed: 94, fatima: 80, ali: 79 },
];

export const SATISFACTION_DATA = [
  { month: "سبتمبر", نسخة_مصدقة: 3.8, اطلاع: 4.0, نسخة_بديلة: 3.5 },
  { month: "أكتوبر", نسخة_مصدقة: 4.0, اطلاع: 4.1, نسخة_بديلة: 3.7 },
  { month: "نوفمبر", نسخة_مصدقة: 4.1, اطلاع: 4.2, نسخة_بديلة: 3.9 },
  { month: "ديسمبر", نسخة_مصدقة: 4.2, اطلاع: 4.3, نسخة_بديلة: 4.0 },
  { month: "يناير", نسخة_مصدقة: 4.4, اطلاع: 4.5, نسخة_بديلة: 4.2 },
  { month: "فبراير", نسخة_مصدقة: 4.6, اطلاع: 4.7, نسخة_بديلة: 4.4 },
];

export const GEOGRAPHIC_DATA = [
  { name: "الدوائر العامة", requests: 412, color: "#187860", zone: "شمال" },
  { name: "الدوائر الجزئية", requests: 178, color: "#ec9a18", zone: "جنوب" },
  { name: "الدوائر المرورية", requests: 94, color: "#075e4a", zone: "شرق" },
  { name: "الوثائق", requests: 56, color: "#ebebeb", zone: "غرب" },
];

export const COURT_DISTRIBUTION_DATA = [
  { name: "الدوائر القضائية العامة", requests: 412, color: "#187860", group: "circuits" as const },
  { name: "الدوائر الجزئية", requests: 168, color: "#075e4a", group: "circuits" as const },
  { name: "الدوائر المرورية", requests: 124, color: "#1a9e75", group: "circuits" as const },
  { name: "قسم الوثائق", requests: 232, color: "#C7A86C", group: "documents" as const },
];

export const WEEKLY_REPORT_DATA = {
  weekLabel: "الأسبوع الأخير (22 - 28 فبراير 2026)",
  totalRequests: 148,
  completed: 87,
  processing: 41,
  referred: 20,
  avgResponseTime: "1.7 يوم",
  satisfactionScore: 4.5,
  topEmployee: "أحمد علي الحربي",
  topEmployeeRequests: 38,
  slaCompliance: 94,
};

export function getSlaStatus(slaDeadline: string, status: RequestStatus) {
  if (status === "completed") return { label: "مكتمل في الوقت", color: "text-[#075e4a]" };
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `متأخر ${Math.abs(diffDays)} يوم`, color: "text-[#B42318]" };
  if (diffDays <= 1) return { label: `${diffDays} يوم متبقي`, color: "text-[#ec9a18]" };
  return { label: `${diffDays} أيام متبقية`, color: "text-[#187860]" };
}

export function isOverSla(slaDeadline: string, status: RequestStatus) {
  if (status === "completed") return false;
  const deadline = new Date(slaDeadline);
  const now = new Date();
  return now > deadline;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" });
}

const ALL_CIRCUIT_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  CIRCUITS.forEach((c) => { map[c.value] = c.label; });
  for (let i = 1; i <= 12; i++) map[`commercial_${i}`] = `الدائرة التجارية ${i}`;
  for (let i = 1; i <= 8; i++) map[`family_${i}`] = `دائرة الأحوال الشخصية ${i}`;
  for (let i = 1; i <= 10; i++) map[`criminal_${i}`] = `الدائرة الجزائية ${i}`;
  for (let i = 1; i <= 8; i++) map[`labor_${i}`] = `الدائرة العمالية ${i}`;
  for (let i = 1; i <= 6; i++) map[`appeal_general_${i}`] = `دائرة الاستئناف العامة ${i}`;
  for (let i = 1; i <= 4; i++) map[`appeal_criminal_${i}`] = `دائرة الاستئناف الجزائية ${i}`;
  for (let i = 1; i <= 3; i++) map[`appeal_family_${i}`] = `دائرة استئناف الأحوال الشخصية ${i}`;
  for (let i = 1; i <= 3; i++) map[`appeal_commercial_${i}`] = `دائرة الاستئناف التجارية ${i}`;
  for (let i = 1; i <= 10; i++) map[`execution_${i}`] = `دائرة التنفيذ ${i}`;
  for (let i = 1; i <= 6; i++) map[`notary_${i}`] = `الدائرة التوثيقية ${i}`;
  map["notary_endorsement"] = "دائرة التصديقات";
  map["notary_agencies"] = "دائرة الوكالات والإقرارات";
  map["notary_realestate"] = "دائرة الإفراغات العقارية";
  map["supreme_general"] = "الدائرة العامة";
  for (let i = 1; i <= 5; i++) map[`supreme_criminal_${i}`] = `الدائرة الجزائية ${i}`;
  for (let i = 1; i <= 4; i++) map[`supreme_family_${i}`] = `دائرة الأحوال الشخصية ${i}`;
  for (let i = 1; i <= 3; i++) map[`supreme_commercial_${i}`] = `الدائرة التجارية ${i}`;
  for (let i = 1; i <= 3; i++) map[`supreme_labor_${i}`] = `الدائرة العمالية ${i}`;
  map["bureau_general_secretariat"] = "الأمانة العامة";
  map["bureau_inspection"] = "إدارة التفتيش القضائي";
  map["bureau_legal"] = "الإدارة القانونية";
  map["bureau_documentation"] = "إدارة التوثيق";
  map["bureau_beneficiary_services"] = "إدارة خدمات المستفيدين";
  map["bureau_it"] = "إدارة تقنية المعلومات";
  map["bureau_hr"] = "إدارة الموارد البشرية";
  map["bureau_finance"] = "الإدارة المالية";
  map["bureau_planning"] = "إدارة التخطيط والتطوير";
  map["bureau_media"] = "إدارة الإعلام والتواصل";
  map["bureau_international"] = "إدارة التعاون الدولي";
  return map;
})();

export function getCircuitLabel(value: string) {
  return ALL_CIRCUIT_LABELS[value] || value;
}

export function getRequestTypeLabel(value: string, short = false) {
  const found = REQUEST_TYPES.find((r) => r.value === value);
  if (!found) return value;
  return (found as any).shortLabel || found.label;
}

export function getApplicantTypeLabel(value: string) {
  const found = APPLICANT_TYPES.find((a) => a.value === value);
  return found ? found.label : value;
}

export function getSlaCountdown(slaDeadline: string): { hours: number; minutes: number; seconds: number; isOverdue: boolean } {
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) {
    const absDiff = Math.abs(diff);
    return {
      hours: Math.floor(absDiff / (1000 * 60 * 60)),
      minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
      isOverdue: true,
    };
  }
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isOverdue: false,
  };
}

export const SAUDI_HOLIDAYS_2026 = [
  "2026-02-22", "2026-02-23", "2026-09-23", "2026-09-24",
  "2026-04-01", "2026-04-02", "2026-04-03",
  "2026-06-26", "2026-06-27", "2026-06-28", "2026-06-29", "2026-06-30",
];

export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 5 || day === 6) return false;
  const dateStr = date.toISOString().split("T")[0];
  return !SAUDI_HOLIDAYS_2026.includes(dateStr);
}

export function addWorkingDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) added++;
  }
  return result;
}

export function getSlaWithHolidays(requestType: RequestType): { days: number; deadline: Date; label: string } {
  const workingDays: Record<RequestType, number> = {
    certified_copy: 3,
    case_review: 3,
    replacement_doc: 3,
  };
  const days = workingDays[requestType] || 5;
  const deadline = addWorkingDays(new Date(), days);
  return { days, deadline, label: `${days} أيام عمل (استثناء الإجازات والعطل)` };
}

export function getAiClassification(requestType: RequestType, circuit: string, court?: string): {
  type: "refer" | "direct";
  suggestion: string;
  specificCircuit?: string;
  confidence: number;
  reason: string;
  estimatedDays: number;
  tip?: string;
} {
  const circuitHash = circuit.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  if (requestType === "case_review") {
    const reviewCircuitNum = ((circuitHash % 10) + 1);
    const reviewCircuit = `الدائرة القضائية العامة ${reviewCircuitNum}`;
    return {
      type: "refer",
      suggestion: "الدائرة القضائية",
      specificCircuit: reviewCircuit,
      confidence: 91,
      reason: `أوراق الدعوى محفوظة لدى الدائرة القضائية بناءً على تحليل 287 طلب مشابه من ${court || "المحكمة"}`,
      estimatedDays: 2,
      tip: "تأكد من رقم القضية والتحقق من صفة مقدم الطلب قبل الإحالة",
    };
  }
  if (requestType === "replacement_doc") {
    return {
      type: "refer",
      suggestion: "قسم الوثائق والمحفوظات",
      confidence: 94,
      reason: "النسخ البديلة تُعالج من قسم الوثائق والمحفوظات بناءً على 156 طلب مشابه",
      estimatedDays: 5,
      tip: "تأكد من إرفاق صورة الصك الأصلي إن وُجدت",
    };
  }
  const suggestedCircuitNum = ((circuitHash % 12) + 1);
  const specificCircuit = `الدائرة القضائية العامة ${suggestedCircuitNum}`;
  return {
    type: "refer",
    suggestion: "الدائرة القضائية",
    specificCircuit,
    confidence: 89,
    reason: `بناءً على تحليل 412 طلب مشابه من ${court || "المحكمة"}، يُنصح بالإحالة لـ ${specificCircuit}`,
    estimatedDays: 3,
    tip: "النسخ المصدقة تُنجز أسرع عند الإحالة للدائرة المختصة مباشرة",
  };
}

export function getProcessingTimePrediction(requestType: RequestType): {
  avgDays: number;
  minDays: number;
  maxDays: number;
  similarCount: number;
} {
  const predictions: Record<RequestType, { avgDays: number; minDays: number; maxDays: number; similarCount: number }> = {
    certified_copy: { avgDays: 3, minDays: 1, maxDays: 5, similarCount: 412 },
    case_review: { avgDays: 2, minDays: 1, maxDays: 3, similarCount: 287 },
    replacement_doc: { avgDays: 5, minDays: 3, maxDays: 7, similarCount: 156 },
  };
  return predictions[requestType] || { avgDays: 3, minDays: 1, maxDays: 5, similarCount: 0 };
}

export function detectDuplicate(
  caseNumber: string,
  requestType: RequestType,
  applicantId: string,
  existingRequests: Request[],
  judgmentNumber?: string
): Request | null {
  return existingRequests.find(
    (r) => {
      if (r.requestType !== requestType || r.status === "rejected") return false;
      if (requestType === "replacement_doc") {
        return !!judgmentNumber && r.judgmentNumber === judgmentNumber;
      }
      return !!caseNumber && r.caseNumber === caseNumber;
    }
  ) || null;
}


export interface AuditEntry {
  id: string;
  timestamp: string;
  employeeName: string;
  employeeRole: string;
  action: string;
  targetId: string;
  targetLabel: string;
  before?: string;
  after?: string;
  ip: string;
}

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: "a1", timestamp: "2026-03-20 08:12:33", employeeName: "أحمد علي الحربي", employeeRole: "خدمات المستفيدين", action: "قبول الطلب", targetId: "4710001248", targetLabel: "طلب اطلاع على أوراق الدعوى", before: "قيد المراجعة", after: "قيد المعالجة", ip: "10.1.2.45" },
  { id: "a2", timestamp: "2026-03-20 08:45:10", employeeName: "يزيد محمد العتيبي", employeeRole: "الدائرة الجزئية 2", action: "إرفاق مستند وإعادة", targetId: "4710001247", targetLabel: "طلب نسخة مصدقة", before: "محال", after: "قيد المعالجة", ip: "10.1.3.12" },
  { id: "a3", timestamp: "2026-03-19 09:03:55", employeeName: "علي عبدالله المطيري", employeeRole: "خدمات المستفيدين", action: "إحالة للدائرة القضائية", targetId: "4710001252", targetLabel: "طلب اطلاع الدائرة الجزئية 1", before: "قيد المعالجة", after: "محال", ip: "10.1.2.67" },
  { id: "a4", timestamp: "2026-03-18 09:30:20", employeeName: "محمد ناصر الشهري", employeeRole: "خدمات المستفيدين", action: "إغلاق الطلب", targetId: "4710001244", targetLabel: "طلب نسخة مصدقة", before: "قيد المعالجة", after: "مكتمل", ip: "10.1.2.89" },
  { id: "a5", timestamp: "2026-03-17 14:20:05", employeeName: "أحمد علي الحربي", employeeRole: "خدمات المستفيدين", action: "رفض الطلب", targetId: "4710001245", targetLabel: "طلب نسخة بديلة", before: "قيد المراجعة", after: "مرفوض", ip: "10.1.2.45" },
  { id: "a6", timestamp: "2026-03-17 11:05:44", employeeName: "عمار سعد الغامدي", employeeRole: "قسم الوثائق والمحفوظات", action: "إرفاق مستند وإعادة", targetId: "4710001249", targetLabel: "طلب نسخة بديلة", before: "محال", after: "قيد المعالجة", ip: "10.1.5.33" },
  { id: "a7", timestamp: "2026-03-16 16:44:19", employeeName: "يزيد محمد العتيبي", employeeRole: "خدمات المستفيدين", action: "قبول الطلب", targetId: "4710001246", targetLabel: "طلب اطلاع على أوراق الدعوى", before: "قيد المراجعة", after: "قيد المعالجة", ip: "10.1.3.12" },
  { id: "a8", timestamp: "2026-03-16 10:11:02", employeeName: "علي عبدالله المطيري", employeeRole: "خدمات المستفيدين", action: "إحالة لقسم الوثائق", targetId: "4710001249", targetLabel: "طلب نسخة بديلة", before: "قيد المراجعة", after: "محال", ip: "10.1.2.67" },
];

export const SYSTEM_HEALTH = {
  uptime: 99.97,
  avgResponseMs: 124,
  requestsPerMin: 18,
  activeUsers: 34,
  errorRate: 0.03,
  lastIncident: "لا توجد أعطال",
  dbStatus: "متصل",
  apiStatus: "يعمل",
};

export const BOTTLENECK_DATA = [
  { section: "خدمات المستفيدين", متوسط_الانتظار: 1.2, pendingCount: 3, trend: "stable" },
  { section: "الدوائر الجزئية", متوسط_الانتظار: 18.4, pendingCount: 7, trend: "up" },
  { section: "الدوائر العامة", متوسط_الانتظار: 9.1, pendingCount: 4, trend: "stable" },
  { section: "الدوائر المرورية", متوسط_الانتظار: 5.3, pendingCount: 2, trend: "down" },
  { section: "قسم الوثائق والمحفوظات", متوسط_الانتظار: 28.7, pendingCount: 7, trend: "up" },
];

export const CHATBOT_FAQ: { question: string; answer: string; keywords: string[]; category: string; relatedQuestions?: number[] }[] = [
  {
    question: "ما أنواع الوثائق القضائية التي يمكن طلبها عبر المنصة؟",
    answer: "تتيح منصة الوثائق القضائية طلب ثلاثة أنواع من الخدمات:\n\n- نسخة مصدقة من أوراق الدعوى: نسخة رسمية موقّعة ومختومة من المحكمة لأوراق قضية محددة.\n- الاطلاع على أوراق الدعوى: تمكين المعنيين من مراجعة وثائق القضية بإشراف المختص.\n- نسخة بديلة للوثائق القضائية: إصدار نسخة جديدة عند فقدان الأصل أو تلفه.\n\nتُقدَّم الخدمات لأصحاب الصفة القانونية: المدعي، المدعى عليه، الوريث، الوكيل، أو ذوي المصلحة.",
    keywords: ["أنواع", "وثيقة", "خدمة", "نسخة", "مصدقة", "اطلاع", "بديلة", "ما يمكن", "أطلب", "الخدمات", "ايش", "وش", "شنو", "خدمات"],
    category: "services",
    relatedQuestions: [1, 2, 7],
  },
  {
    question: "ما البيانات والمستندات المطلوبة لتقديم الطلب؟",
    answer: "البيانات المطلوبة في نموذج الطلب:\n\n• رقم الهوية لمقدم الطلب (10 أرقام)\n• رقم الهوية لصاحب القضية\n• رقم القضية المراد الحصول على وثائقها\n• المدينة والمحكمة التي نُظرت فيها القضية\n• الدائرة القضائية المختصة (اختياري لكن يُسرّع المعالجة)\n• رقم الصك أو تاريخ الحكم (اختياري)\n\nحالات خاصة:\n• الوريث: يُطلب رقم صك إثبات الوراثة\n• الوكيل: يُطلب رقم وثيقة الوكالة الرسمية",
    keywords: ["مستند", "وثيق", "متطلب", "مطلوب", "أحتاج", "ماذا أحضر", "أوراق", "الهوية", "يلزم", "بيانات", "احتاج", "ابي", "أبي", "وش احتاج"],
    category: "requirements",
    relatedQuestions: [0, 7],
  },
  {
    question: "ما رسوم خدمات المنصة وكيف تُسدَّد؟",
    answer: "رسوم الخدمات المقررة نظاماً:\n\n• طلب نسخة مصدقة من أوراق الدعوى: 100 ريال سعودي\n• طلب الاطلاع على أوراق الدعوى: 50 ريال سعودي\n• طلب نسخة بديلة للوثائق القضائية: 100 ريال سعودي\n\nطرق السداد الإلكتروني المتاحة:\n- بطاقة مدى (البنوك السعودية)\n- سداد (خدمة الدفع الإلكتروني)\n- آبل باي\n\nمهم: تُسدَّد الرسوم بعد اكتمال معالجة الطلب وليس عند التقديم، سواءً تم قبول الطلب أو رفضه. لا يمكن تحميل الوثيقة إلا بعد السداد.",
    keywords: ["رسوم", "سعر", "تكلفة", "أدفع", "دفع", "مجاني", "كم", "مبلغ", "سداد", "مدى", "ريال", "فلوس", "بكم", "السعر", "تكاليف", "مقابل مالي"],
    category: "fees",
    relatedQuestions: [5, 0, 4],
  },
  {
    question: "كيف أتابع حالة طلبي؟",
    answer: "يمكنك متابعة طلبك بعد تسجيل الدخول عبر نفاذ:\n\n1. من داخل البوابة: انتقل لتبويب «متابعة» لرؤية جميع طلباتك وحالتها التفصيلية.\n2. رمز التحقق: امسح الرمز الموجود في تفاصيل الطلب للوصول الفوري.\n\nرقم الطلب يظهر فور تقديم الطلب بنجاح ويُحفظ تلقائياً في صفحتك.",
    keywords: ["تتبع", "متابع", "أين طلبي", "حالة", "رقم طلب", "استعلام", "استفسار", "كيف أعرف", "وين طلبي", "وين صار", "وصل وين"],
    category: "tracking",
    relatedQuestions: [6, 4, 8],
  },
  {
    question: "كم يستغرق إنجاز الطلب؟",
    answer: "المدة الزمنية المتوقعة وفق معايير الأداء:\n\n• نسخة مصدقة من أوراق الدعوى: 1 إلى 3 أيام عمل\n• الاطلاع على أوراق الدعوى: 1 إلى 3 أيام عمل\n• نسخة بديلة للوثائق القضائية: 1 إلى 3 أيام عمل\n\nأيام العمل الرسمية: الأحد إلى الخميس\n(يُستثنى الجمعة والسبت وأيام الإجازات الرسمية)\n\nيمكنك متابعة المدة المتبقية من الشارة الملونة على بطاقة طلبك.",
    keywords: ["وقت", "مدة", "يوم", "يستغرق", "متى", "انتظار", "أسبوع", "سريع", "كم ياخذ", "يطول", "طويل", "اليوم", "باقي كم"],
    category: "timing",
    relatedQuestions: [3, 5, 8],
  },
  {
    question: "كيف أستلم الوثيقة بعد اكتمال الطلب وسداد الرسوم؟",
    answer: "عند اكتمال طلبك ستصلك إشعار فوري. خطوات الاستلام:\n\n1. اسدد الرسوم المقررة إلكترونياً من صفحة متابعة الطلبات (الرسوم تُسدَّد بعد الاكتمال وليس عند التقديم).\n2. بعد التأكيد، تظهر أيقونة التحميل مباشرةً.\n3. حمّل النسخة الرقمية الموقّعة إلكترونياً.\n\nملاحظة: لا يمكن تحميل الوثيقة إلا بعد سداد الرسوم.\n\nأو الاستلام الشخصي: مراجعة قسم خدمات المستفيدين في المحكمة المختصة مع الهوية.\n\nالنسخة الرقمية معتمدة قانونياً وتحمل ختم المحكمة الرقمي.",
    keywords: ["استلام", "أحصل", "تسليم", "آخذ", "تحميل", "download", "بعد السداد", "وثيقة جاهزة", "اخذ", "حمل", "نزل", "تنزيل"],
    category: "delivery",
    relatedQuestions: [2, 3, 4],
  },
  {
    question: "ما هي حالات الطلب وما معناها؟",
    answer: "ثلاث حالات رئيسية لتتبع الطلب:\n\n- قيد المعالجة: الطلب وصل لموظف الخدمة المختص وجارٍ مراجعته وإنجازه.\n\n- محال: تطلب الطلب إحالته لقسم متخصص (الدائرة القضائية أو قسم الوثائق) لاستكمال المعالجة، وسيعود إليك عند الانتهاء.\n\n- مكتمل: تم إنجاز الطلب بنجاح. سدّد الرسوم لتتمكن من تحميل الوثيقة (لا يمكن التحميل بدون سداد).\n\nملاحظة: الرسوم تُسدَّد بعد اكتمال الطلب وليس عند التقديم.\n\nفعّل الإشعارات لتصلك رسالة عند كل تغيير في حالة طلبك.",
    keywords: ["حالة", "قيد", "محال", "مكتمل", "معنى", "الحالات", "ماذا تعني", "وش يعني", "ايش معنى", "معالجة", "لون"],
    category: "tracking",
    relatedQuestions: [3, 4, 8],
  },
  {
    question: "كيف أقدم طلبًا جديدًا؟",
    answer: "خطوات تقديم طلب عبر المنصة:\n\n1. اضغط «تقديم طلب جديد» في أعلى الصفحة.\n2. الخطوة الأولى بيانات مقدم الطلب: أدخل صفتك القانونية، اسمك، ورقم هويتك.\n3. الخطوة الثانية تفاصيل القضية: حدد نوع الطلب، المدينة، المحكمة، الدائرة، ورقم القضية.\n4. الخطوة الثالثة الإقرار: راجع الملخص، وافق على الإقرار، ثم أرسل.\n\nستحصل فوراً على رقم الطلب الخاص بطلبك.",
    keywords: ["جديد", "أقدم", "طريقة التقديم", "كيف أرسل", "كيف أبدأ", "تقديم", "خطوات", "ابدأ", "أبدا", "ابدا", "ابغى اقدم"],
    category: "submission",
    relatedQuestions: [1, 0, 2],
  },
  {
    question: "ماذا أفعل إذا واجهت مشكلة أو لم يتقدم طلبي؟",
    answer: "إذا واجهت أي مشكلة:\n\n• تأكد من صحة البيانات المُدخلة (رقم الهوية 10 أرقام، رقم القضية صحيح).\n• راجع الجدول الزمني داخل تفاصيل الطلب للاطلاع على آخر تحديث.\n• إذا تجاوز طلبك الموعد النهائي، يُشير النظام بالتلوين الأحمر وتُنبَّه الجهة المختصة تلقائياً.\n• للتواصل: اتصل على الرقم الموحد 1950 أو عبر بوابة ناجز.\n• يمكنك استخدام المساعد الذكي في أسفل الشاشة للحصول على إجابات فورية.",
    keywords: ["مشكلة", "تأخر", "لم يتقدم", "تجاوز", "الموعد المحدد", "متأخر", "شكوى", "مساعدة", "تواصل", "خطأ", "مشاكل", "معلق", "واقف"],
    category: "support",
    relatedQuestions: [3, 6, 4],
  },
  {
    question: "من يحق له تقديم طلب على المنصة؟",
    answer: "يحق تقديم الطلب للأشخاص التالية صفاتهم:\n\n- المدعي: صاحب الدعوى الأصلي.\n- المدعى عليه: الطرف المقابل في الدعوى.\n- الوريث: وارث أحد أطراف الدعوى (يُطلب صك إثبات الوراثة).\n- الوكيل: من يحمل وكالة رسمية عن أحد الأطراف.\n- ذو مصلحة: من له مصلحة قانونية مباشرة في القضية.\n\nيجب أن تتطابق الصفة القانونية مع البيانات المدخلة في الطلب.",
    keywords: ["من يحق", "صفة", "مدعي", "مدعى عليه", "وريث", "وكيل", "مصلحة", "يقدر", "أقدر", "حق", "مؤهل", "شروط"],
    category: "eligibility",
    relatedQuestions: [1, 7, 0],
  },
  {
    question: "هل يمكن تعديل أو إلغاء طلب بعد تقديمه؟",
    answer: "بخصوص تعديل أو إلغاء الطلب:\n\nالتعديل: لا يمكن تعديل الطلب بعد إرساله. إذا كانت هناك بيانات خاطئة، يُفضَّل تقديم طلب جديد بالبيانات الصحيحة.\n\nالإلغاء: لا يتوفر حالياً خيار إلغاء إلكتروني. يمكنك:\n• عدم سداد الرسوم بعد اكتمال الطلب (الرسوم تُسدَّد بعد الاكتمال وليس عند التقديم).\n• التواصل مع قسم خدمات المستفيدين في المحكمة.\n\nنصيحة: راجع بياناتك جيداً في خطوة الإقرار قبل الإرسال.",
    keywords: ["تعديل", "إلغاء", "الغاء", "تغيير", "حذف", "ارجع", "غلط", "خطأ بالبيانات", "أعدل", "ألغي", "كنسل"],
    category: "modification",
    relatedQuestions: [7, 8, 1],
  },
  {
    question: "ما هو نفاذ وكيف أسجل الدخول؟",
    answer: "نفاذ هو نظام الدخول الموحد للخدمات الحكومية السعودية:\n\nطرق تسجيل الدخول:\n1. عبر تطبيق «نفاذ» على الجوال (الطريقة الأسرع)\n2. عبر بصمة الإصبع في أجهزة الخدمة الذاتية\n3. عبر اسم المستخدم وكلمة المرور في أبشر\n\nإعداد نفاذ لأول مرة:\n1. حمّل تطبيق «نفاذ» من متجر التطبيقات\n2. سجّل الدخول ببيانات أبشر\n3. فعّل التحقق البيومتري\n\nبعد التسجيل، يمكنك الدخول لجميع الخدمات الحكومية بنقرة واحدة.",
    keywords: ["نفاذ", "تسجيل دخول", "دخول", "لوقن", "login", "أبشر", "كلمة مرور", "حساب", "تسجيل", "دخل"],
    category: "access",
    relatedQuestions: [7, 0, 9],
  },
  {
    question: "هل الوثيقة الرقمية معتمدة رسمياً؟",
    answer: "نعم، الوثيقة الرقمية معتمدة رسمياً:\n\n- تحمل الختم الرقمي الرسمي للمحكمة.\n- موقّعة إلكترونياً وفق نظام التعاملات الإلكترونية.\n- لها نفس الحجية القانونية للنسخة الورقية.\n- يمكن التحقق من صحتها عبر رمز التحقق الإلكتروني المرفق.\n\nيمكنك استخدامها في:\n• الجهات الحكومية والخاصة\n• المحاكم والجهات القضائية\n• البنوك والمؤسسات المالية\n• السفارات والقنصليات",
    keywords: ["معتمدة", "رسمية", "قانونية", "صالحة", "حجية", "ختم", "موثقة", "تنفع", "مقبولة", "إلكترونية"],
    category: "legal",
    relatedQuestions: [5, 0, 2],
  },
  {
    question: "ما أوقات العمل الرسمية للمحكمة؟",
    answer: "أوقات العمل الرسمية:\n\nالأحد إلى الخميس: 7:30 صباحاً - 2:30 مساءً\nالجمعة والسبت: عطلة رسمية\n\nالمنصة الإلكترونية متاحة 24 ساعة لتقديم الطلبات والمتابعة.\n\nملاحظات:\n• تُعالج الطلبات خلال أيام العمل الرسمية فقط.\n• الطلبات المقدمة في العطل تُعالج أول يوم عمل.\n• الإجازات الرسمية (عيد الفطر، عيد الأضحى، اليوم الوطني) لا تُحتسب ضمن مدة الإنجاز.",
    keywords: ["أوقات", "دوام", "عمل", "ساعات", "متى تفتح", "إجازة", "عطلة", "مفتوح", "مغلق", "الحين مفتوح"],
    category: "info",
    relatedQuestions: [4, 8, 3],
  },
  {
    question: "كيف أعترض على قرار رفض الطلب؟",
    answer: "إذا تم رفض طلبك، لديك حق الاعتراض:\n\nخطوات الاعتراض:\n1. من تبويب «المرفوضة»، افتح تفاصيل الطلب المرفوض.\n2. اطلع على سبب الرفض المذكور.\n3. اضغط على زر «اعتراض» أسفل التفاصيل.\n4. اكتب مبررات الاعتراض بوضوح.\n5. أرفق أي مستندات داعمة إن وُجدت.\n\nمدة الاعتراض: يجب تقديمه خلال 30 يوماً من تاريخ الرفض.\n\nسيُراجع الاعتراض من قِبل المشرف المختص وستُبلَّغ بالنتيجة.",
    keywords: ["اعتراض", "رفض", "مرفوض", "رُفض", "ليش رفض", "سبب الرفض", "أعترض", "ارفعة", "تظلم"],
    category: "objection",
    relatedQuestions: [8, 3, 6],
  },
  {
    question: "ما هي المحاكم والمدن المتاحة على المنصة؟",
    answer: "المنصة تغطي المحاكم التالية:\n\nالمحاكم العامة في المدن الرئيسية:\n• الرياض • جدة • مكة المكرمة • المدينة المنورة\n• الدمام • الأحساء • تبوك • أبها\n• جازان • نجران • حائل • الطائف\n\nكل محكمة تشمل:\n• الدوائر العامة (القضايا المدنية والتجارية)\n• الدوائر الجزئية (القضايا الأقل قيمة)\n• الدوائر المرورية (قضايا الحوادث)\n• قسم الوثائق والمحفوظات\n\nاختر المدينة والمحكمة التي نُظرت فيها قضيتك عند تقديم الطلب.",
    keywords: ["محكمة", "مدينة", "محاكم", "أي محكمة", "الرياض", "جدة", "مكة", "المدينة", "الدمام", "المتاحة", "فروع"],
    category: "courts",
    relatedQuestions: [0, 7],
  },
  {
    question: "هل يمكنني التقديم نيابة عن شخص آخر؟",
    answer: "نعم، يمكنك التقديم نيابة عن غيرك في الحالات التالية:\n\nكوكيل شرعي:\n• يجب أن تكون لديك وكالة رسمية سارية المفعول.\n• أدخل رقم وثيقة الوكالة في النموذج.\n• اختر صفة «وكيل» عند التقديم.\n\nكوريث:\n• يجب أن تكون مسجلاً في صك إثبات الوراثة.\n• أدخل رقم صك حصر الورثة.\n• اختر صفة «وريث» عند التقديم.\n\nملاحظة: لا يُقبل التقديم بالإنابة دون وثيقة رسمية تثبت الصفة.",
    keywords: ["نيابة", "شخص آخر", "وكالة", "غيري", "لغيري", "وكيل", "بدال", "عن أبوي", "عن أمي", "لأحد"],
    category: "eligibility",
    relatedQuestions: [9, 1, 7],
  },
  {
    question: "ما سياسة الاسترداد إذا سددت الرسوم وكان الطلب خاطئاً؟",
    answer: "سياسة استرداد الرسوم:\n\nملاحظة: الرسوم تُسدَّد بعد اكتمال معالجة الطلب وليس عند التقديم، سواءً تم القبول أو الرفض.\n\nحالات يُسترد فيها المبلغ:\n• إذا تعذر تنفيذ الطلب لأسباب تقنية من جهة المحكمة.\n• إذا صدر قرار بإعفاء المستفيد.\n\nحالات لا يُسترد فيها المبلغ:\n• خطأ في البيانات المدخلة من المستفيد.\n• تقديم طلب مكرر على نفس القضية.\n• عدم الحاجة للوثيقة بعد السداد.\n\nللاستفسار عن حالة استرداد:\n• تواصل مع قسم خدمات المستفيدين في المحكمة.\n• أو اتصل على الرقم الموحد 1950.",
    keywords: ["استرداد", "ارجاع", "استرجاع", "فلوسي", "دفعت غلط", "مكرر", "ارجع فلوسي", "استرد", "المبلغ"],
    category: "fees",
    relatedQuestions: [2, 10, 8],
  },
  {
    question: "كيف أتواصل مع الدعم الفني أو خدمات المستفيدين؟",
    answer: "قنوات التواصل المتاحة:\n\nالرقم الموحد: 1950\nمتاح خلال أوقات الدوام الرسمي\n\nالمساعد الرقمي (أنا):\n• متاح 24 ساعة للأسئلة الشائعة.\n\nبوابة ناجز: najiz.sa\n• لجميع الخدمات العدلية الإلكترونية.\n\nالبريد الإلكتروني:\n• يمكنك إرسال استفسارك عبر نموذج التواصل في بوابة ناجز.\n\nللشكاوى والملاحظات يمكنك التواصل عبر الرقم الموحد 1950.",
    keywords: ["تواصل", "اتصال", "رقم", "هاتف", "جوال", "تلفون", "دعم", "خدمة عملاء", "شكوى", "1950", "ناجز"],
    category: "support",
    relatedQuestions: [8, 13, 3],
  },
];

export const CHATBOT_GREETINGS: Record<string, string[]> = {
  morning: ["صباح الخير! كيف أقدر أساعدك اليوم؟", "أهلاً بك! صباح النور، كيف يمكنني خدمتك؟"],
  afternoon: ["مساء الخير! كيف يمكنني مساعدتك؟", "أهلاً! كيف أقدر أخدمك هذا المساء؟"],
  default: ["مرحباً! أنا مساعدك الرقمي لبوابة خدمات المستفيدين. كيف يمكنني مساعدتك؟"],
};

export const CHATBOT_CATEGORIES = [
  { id: "services", label: "الخدمات المتاحة", icon: "FileText" },
  { id: "fees", label: "الرسوم والسداد", icon: "CreditCard" },
  { id: "tracking", label: "متابعة الطلبات", icon: "Search" },
  { id: "submission", label: "تقديم طلب", icon: "Send" },
  { id: "requirements", label: "المتطلبات", icon: "ClipboardList" },
  { id: "support", label: "الدعم والمساعدة", icon: "Headphones" },
];

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/[ىئ]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set(["من", "في", "على", "الى", "عن", "هل", "هو", "هي", "ان", "لا", "ما", "مع", "او", "اذا", "بعد", "قبل", "كل", "هذا", "هذه", "ذلك", "تلك", "التي", "الذي", "لي", "لك", "به", "بها", "فيه", "فيها", "انا", "انت", "نحن", "هم"]);

const DIALECT_MAP: Record<string, string[]> = {
  "خدمه": ["خدمة", "سيرفس"],
  "ابغى": ["ابي", "اريد", "اود", "ودي", "حاب"],
  "وش": ["ايش", "ماذا", "شنو", "شو"],
  "كيف": ["شلون", "كيفية", "طريقة"],
  "فلوس": ["رسوم", "مبلغ", "سعر", "تكلفه", "كم"],
  "ورقه": ["وثيقه", "مستند", "صك"],
  "اخذ": ["استلم", "حصل", "نزل", "حمل"],
  "طلب": ["معامله", "خدمه", "اجراء"],
  "محكمه": ["قضاء", "عدل", "دائره"],
  "وين": ["اين", "فين"],
  "ليش": ["لماذا", "ليه", "عشان"],
  "متى": ["وقت", "مده", "كم ياخذ"],
  "يطول": ["يتاخر", "بطيء", "طويل"],
};

export function matchChatbotQuery(query: string): { match: typeof CHATBOT_FAQ[number] | null; score: number; relatedSuggestions: string[] } {
  const normalized = normalizeArabic(query);
  const words = normalized.split(" ").filter(w => w.length > 1 && !STOP_WORDS.has(w));

  const expandedWords = new Set(words);
  for (const w of words) {
    for (const [key, synonyms] of Object.entries(DIALECT_MAP)) {
      const nKey = normalizeArabic(key);
      if (w === nKey || w.includes(nKey) || nKey.includes(w)) {
        for (const syn of synonyms) expandedWords.add(normalizeArabic(syn));
      }
      for (const syn of synonyms) {
        const nSyn = normalizeArabic(syn);
        if (w === nSyn || w.includes(nSyn)) {
          expandedWords.add(nKey);
          for (const s2 of synonyms) expandedWords.add(normalizeArabic(s2));
        }
      }
    }
  }

  let bestMatch: typeof CHATBOT_FAQ[number] | null = null;
  let bestScore = 0;
  const scores: { faq: typeof CHATBOT_FAQ[number]; score: number }[] = [];

  for (const faq of CHATBOT_FAQ) {
    let score = 0;

    for (const kw of faq.keywords) {
      const nkw = normalizeArabic(kw);
      if (normalized.includes(nkw)) {
        score += nkw.length * 2;
      }
      const expArr = Array.from(expandedWords);
      for (const w of expArr) {
        if (w.length >= 2 && nkw.includes(w)) score += w.length;
        if (nkw.length >= 2 && w.includes(nkw)) score += nkw.length;
      }
    }

    const qWords = normalizeArabic(faq.question).split(" ").filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const expArr2 = Array.from(expandedWords);
    for (const qw of qWords) {
      if (normalized.includes(qw)) score += 2;
      for (const w of expArr2) {
        if (w.length >= 2 && qw.includes(w)) score += 1;
      }
    }

    if (score > 0) scores.push({ faq, score });
    if (score > bestScore) { bestScore = score; bestMatch = faq; }
  }

  const relatedSuggestions: string[] = [];
  if (bestMatch && bestMatch.relatedQuestions) {
    for (const idx of bestMatch.relatedQuestions) {
      if (CHATBOT_FAQ[idx]) relatedSuggestions.push(CHATBOT_FAQ[idx].question);
    }
  }
  if (!bestMatch || bestScore < 2) {
    const topScored = scores.sort((a, b) => b.score - a.score).slice(0, 3);
    for (const s of topScored) {
      if (!relatedSuggestions.includes(s.faq.question)) relatedSuggestions.push(s.faq.question);
    }
  }

  return { match: bestMatch && bestScore >= 2 ? bestMatch : null, score: bestScore, relatedSuggestions };
}

export type ChatbotFAQ = typeof CHATBOT_FAQ[number];

export function getCircuitsForCourt(court: string): { value: string; label: string }[] {
  if (!court) return [];
  const base = [{ value: "documents", label: "قسم الوثائق والمحفوظات" }];
  if (court === "ديوان الوزارة") {
    return [{ value: "documents", label: "قسم الوثائق والمحفوظات" }];
  }
  if (court.includes("التجارية")) {
    return [...base, ...Array.from({ length: 12 }, (_, i) => ({ value: `commercial_${i + 1}`, label: `الدائرة التجارية ${i + 1}` }))];
  }
  if (court.includes("الأحوال الشخصية")) {
    return [...base, ...Array.from({ length: 8 }, (_, i) => ({ value: `family_${i + 1}`, label: `دائرة الأحوال الشخصية ${i + 1}` }))];
  }
  if (court.includes("الجزائية")) {
    return [...base, ...Array.from({ length: 10 }, (_, i) => ({ value: `criminal_${i + 1}`, label: `الدائرة الجزائية ${i + 1}` }))];
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
    return [...base, ...Array.from({ length: 10 }, (_, i) => ({ value: `execution_${i + 1}`, label: `دائرة التنفيذ ${i + 1}` }))];
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
  return [...base,
    ...Array.from({ length: 33 }, (_, i) => ({ value: `general_${i + 1}`, label: `الدائرة القضائية العامة ${i + 1}` })),
    ...Array.from({ length: 4 }, (_, i) => ({ value: `partial_${i + 1}`, label: `الدائرة الجزئية ${i + 1}` })),
    ...Array.from({ length: 4 }, (_, i) => ({ value: `traffic_${i + 1}`, label: `الدائرة المرورية ${i + 1}` })),
  ];
}

