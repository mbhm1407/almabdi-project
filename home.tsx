import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldCheck, UserCircle, Briefcase, Crown, Fingerprint,
  Building2, ChevronLeft, BookOpen, Archive, CheckCircle, Clock,
  TrendingUp, Award, FileText, Eye, RotateCcw, Users,
  ArrowLeft, X, Zap, CreditCard,
  Download, HelpCircle, Scale,
  Menu, Info, Phone, ArrowRight,
  MessageSquare, Star, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOCK_EMPLOYEES, MOCK_REQUESTS, getDepartmentSection, type Employee } from "@/lib/data";
import { ChatbotWidget } from "@/components/chatbot-widget";
import MojFooter from "@/components/moj-footer";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";


function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        obs.disconnect();
        const startTime = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={elRef}>{count.toLocaleString("ar-SA")}{suffix}</span>;
}




function NafathScreen({ onDone, portalLabel }: { onDone: () => void; portalLabel: string }) {
  const [step, setStep] = useState<"id" | "verifying" | "done">("id");

  useEffect(() => {
    const t1 = setTimeout(() => setStep("verifying"), 500);
    const t2 = setTimeout(() => setStep("done"), 1300);
    const t3 = setTimeout(onDone, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
        <div className="w-8" />
        <p className="text-xs text-[#187860] font-medium">العودة</p>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-6">
        <motion.div
          className="text-center mb-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-[22px] font-bold text-[#1F2937] mb-3 leading-snug">تسجيل الدخول عبر النفاذ الوطني</h1>
          <p className="text-[13px] text-[#1F2937]/45 leading-relaxed">
            تسجيل الدخول لخدمات منصة الوثائق القضائية يتطلب تحميل تطبيق "نفاذ" من متجر التطبيقات، وذلك من أجل التحقق الآمن لهويتك الرقمية
          </p>
        </motion.div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {(step === "id" || step === "verifying") && (
            <div className="mb-6">
              <div className="mb-1.5">
                <p className="text-[13px] font-medium text-[#1F2937]/70 text-start">رقم بطاقة الأحوال / الإقامة</p>
              </div>
              <div className="border border-[#e5e5e5] rounded-2xl px-4 py-3.5 bg-white">
                <p className="text-[15px] text-[#1F2937]/50 text-start">ادخل رقم الهوية أو الإقامة</p>
              </div>
            </div>
          )}

          {step === "id" && (
            <motion.div
              className="w-full py-3.5 rounded-2xl text-[15px] font-medium text-white text-center"
              style={{ background: "#187860" }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              تسجيل الدخول
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full py-3.5 rounded-2xl text-[15px] font-medium text-white text-center bg-[#187860]/60 mb-8">
                تسجيل الدخول
              </div>
              <div className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2.5px solid #f0f0f0" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2.5px solid transparent", borderTopColor: "#187860" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="text-sm font-medium text-[#1F2937]">جارٍ التحقق...</p>
                <p className="text-[12px] text-[#1F2937]/35 mt-1">يرجى الموافقة من تطبيق نفاذ</p>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="text-center pt-4"
            >
              <motion.div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#e6f4ea" }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: "#187860" }} />
              </motion.div>
              <p className="text-[15px] font-bold" style={{ color: "#187860" }}>تم التحقق بنجاح</p>
              <p className="text-[12px] text-[#1F2937]/35 mt-1.5">جارٍ توجيهك إلى بوابة {portalLabel}...</p>
              <motion.div
                className="w-20 h-0.5 rounded-full mx-auto mt-5"
                style={{ background: "#187860" }}
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          )}
        </motion.div>

        {step === "id" && (
          <motion.div
            className="w-full max-w-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#e5e5e5]" />
              <span className="text-[12px] text-[#1F2937]/30">أو عن طريق</span>
              <div className="flex-1 h-px bg-[#e5e5e5]" />
            </div>
            <div className="border border-[#187860] rounded-2xl py-3 text-center">
              <p className="text-[13px] font-medium" style={{ color: "#187860" }}>تسجيل الدخول باسم المستخدم وكلمة المرور</p>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        className="border-t border-[#f0f0f0] px-6 py-5 text-center bg-[#FAFAFA]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-2.5 flex items-center justify-center" style={{ background: "#1878600F" }}>
          <Fingerprint className="w-7 h-7" style={{ color: "#187860" }} />
        </div>
        <p className="text-[13px] font-bold" style={{ color: "#187860" }}>تطبيق نفاذ</p>
        <p className="text-[11px] text-[#1F2937]/35 mt-0.5">النفاذ الوطني الموحد</p>
      </motion.div>
    </motion.div>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <img src={mojLogo} alt="وزارة العدل" className="w-20 h-20 object-contain" />
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "#187860" }}>وزارة العدل</h1>
          <p className="text-[#1F2937]/40 text-xs">منصة الوثائق القضائية</p>
        </div>
        <motion.div
          className="w-12 h-0.5 rounded-full mt-2"
          style={{ background: "#187860" }}
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
      </motion.div>
    </motion.div>
  );
}

function EmployeeSelectModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (emp: Employee) => void;
}) {
  const departments = [
    {
      key: "verification",
      label: "مركز تدقيق الطلبات",
      sublabel: "تدقيق الطلبات ومراجعتها وإحالتها للمحاكم",
      icon: ShieldCheck,
    },
    {
      key: "beneficiary_services",
      label: "قسم خدمات المستفيدين",
      sublabel: "استقبال الطلبات، مراجعتها، وإحالتها",
      icon: Users,
    },
    {
      key: "judicial",
      label: "الدوائر القضائية",
      sublabel: "إرفاق المستندات القضائية",
      icon: Scale,
    },
    {
      key: "documents",
      label: "قسم الوثائق والمحفوظات",
      sublabel: "إرفاق الوثائق المحفوظة وإعادتها",
      icon: Archive,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 rounded-2xl overflow-hidden border-0" dir="rtl">
        <DialogHeader className="p-0 space-y-0">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between" style={{ background: "#187860" }}>
            <div>
              <DialogTitle className="text-white font-bold text-base">اختر قسمك</DialogTitle>
              <DialogDescription className="text-white/60 text-xs mt-0.5">سيتم تحديد صلاحياتك تلقائياً بناءً على القسم المختار</DialogDescription>
            </div>
            <Briefcase className="w-6 h-6 text-white/40" />
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const courtEmployeeMap: Record<string, string[]> = {
              verification: ["مركز تدقيق الطلبات", "قسم التدقيق"],
              beneficiary_services: ["خدمات المستفيدين"],
              judicial: ["الدائرة القضائية", "الدائرة الجزئية", "الدائرة المرورية"],
              documents: ["قسم الوثائق والمحفوظات"],
            };
            const patterns = courtEmployeeMap[dept.key] || [];
            const employees = MOCK_EMPLOYEES.filter((e) =>
              e.status === "active" && patterns.some((p) => e.department.includes(p))
            );
            const empCount = employees.length;

            return (
              <button
                key={dept.key}
                data-testid={`dept-${dept.key}`}
                className="w-full text-start rounded-2xl bg-white group cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] border border-[#ebebeb] hover:border-[#187860]/30"
                onClick={() => {
                  const emp = employees[0] || MOCK_EMPLOYEES.find(e => e.status === "active");
                  if (emp) onSelect(emp);
                }}
              >
                <div className="px-4 py-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#e6f4ea" }}>
                    <Icon className="w-5 h-5" style={{ color: "#187860" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1F2937] text-sm leading-tight">{dept.label}</p>
                    <p className="text-[#1F2937]/50 text-[11px] mt-0.5 line-clamp-1">{dept.sublabel}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#1878600A" }}>
                      <span className="text-sm font-bold" style={{ color: "#187860" }}>{empCount}</span>
                      <span className="text-[9px] text-[#1F2937]/40">موظف</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#1F2937]/30 group-hover:text-[#187860] transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const roles = [
  {
    key: "beneficiary",
    label: "أفراد",
    sublabel: "تسجيل الدخول للأفراد من مواطنين ومقيمين",
    icon: UserCircle,
    accentColor: "#187860",
    iconBg: "#e6f4ea",
    iconColor: "#187860",
    path: "/beneficiary",
    nafath: true,
    requiresSelection: false,
  },
  {
    key: "employee",
    label: "موظفين",
    sublabel: "تسجيل الدخول لموظفي وزارة العدل عبر اختيار القسم",
    icon: Briefcase,
    accentColor: "#187860",
    iconBg: "#e6f4ea",
    iconColor: "#187860",
    path: "/employee",
    nafath: true,
    requiresSelection: true,
  },
  {
    key: "manager",
    label: "إدارة",
    sublabel: "تسجيل الدخول للمدراء والمشرفين",
    icon: Crown,
    accentColor: "#075e4a",
    iconBg: "#e6f4ea",
    iconColor: "#187860",
    path: "/manager",
    nafath: true,
    requiresSelection: false,
  },
];

const services = [
  {
    title: "نسخة مصدقة من أوراق الدعوى",
    desc: "الحصول على نسخة رسمية من وثائق القضية",
    icon: FileText,
    sla: "١ إلى ٣ أيام عمل",
  },
  {
    title: "الاطلاع على أوراق الدعوى",
    desc: "الاطلاع على أوراق الدعوى لمرة واحدة مع الحماية من الطباعة والتصوير",
    icon: Eye,
    sla: "١ إلى ٣ أيام عمل",
  },
  {
    title: "نسخة بديلة من الوثيقة القضائية",
    desc: "إصدار نسخة طبق الأصل للوثيقة القضائية",
    icon: Download,
    sla: "١ إلى ٣ أيام عمل",
  },
];

function LoginSection({ roles, onRoleClick }: { roles: any[]; onRoleClick: (role: any) => void }) {
  const { ref, inView } = useInView(0.15);
  return (
    <section className="py-6 sm:py-14" ref={ref}>
      <div className={`text-center mb-6 sm:mb-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 max-w-2xl lg:max-w-4xl mx-auto">
        {roles.map((role: any, index: number) => {
          const Icon = role.icon;
          return (
            <div
              key={role.key}
              className={`h-full transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: inView ? `${index * 120}ms` : "0ms" }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onRoleClick(role)}
                data-testid={`card-role-${role.key}`}
                className="w-full h-full group text-center bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(24,120,96,0.1)] border border-[#ebebeb] hover:border-[#187860]/20 p-4 sm:p-7 lg:p-9 flex flex-col items-center justify-center min-h-[120px] sm:min-h-0"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full mx-auto mb-2.5 sm:mb-3 lg:mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ background: role.iconBg }}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" style={{ color: role.iconColor }} />
                </div>
                <h3 className="text-[13px] sm:text-base lg:text-lg font-bold mb-1 leading-tight" style={{ color: role.accentColor }}>{role.label}</h3>
                <p className="text-[11px] lg:text-xs text-[#1F2937]/40 leading-relaxed mb-3 lg:mb-4 hidden sm:block">{role.sublabel}</p>
                <div className="flex items-center justify-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg mx-auto w-fit" style={{ background: `${role.accentColor}08` }}>
                  <Fingerprint className="w-3 h-3" style={{ color: role.accentColor }} />
                  <span className="text-[11px] font-medium" style={{ color: role.accentColor }}>نفاذ</span>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, inView } = useInView(0.15);
  const stats = [
    { value: 1420, suffix: "+", label: "الطلبات المُنجزة خلال ٣ أيام عمل", icon: CheckCircle },
    { value: 98, suffix: "٪", label: "رضا المستفيدين", icon: Star },
    { value: 10, suffix: "", label: "جهات قضائية مدعومة", icon: Building2 },
    { value: 1253, suffix: "+", label: "المستفيدين المسجّلين", icon: Users },
  ];
  return (
    <section className="pb-8 sm:pb-16" ref={ref}>
      <div className={`text-center mb-5 sm:mb-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h2 className="text-lg sm:text-2xl font-black" style={{ color: "#1F2937" }}>بيانات المنصة</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map(({ value, suffix, label, icon: SIcon }, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl py-5 sm:py-8 px-3 sm:px-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: inView ? `${i * 100}ms` : "0ms" }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: "#e6f4ea" }}>
              <SIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#187860" }} strokeWidth={1.5} />
            </div>
            <p className="text-2xl sm:text-4xl font-black leading-none mb-1.5 sm:mb-2" style={{ color: "#187860" }}>
              <AnimatedCounter target={value} suffix={suffix} />
            </p>
            <p className="text-[11px] sm:text-xs text-[#1F2937]/40 leading-relaxed">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({ services, onNavigate }: { services: any[]; onNavigate: (path: string) => void }) {
  const { ref, inView } = useInView(0.15);
  return (
    <section id="services-section" className="pb-10 sm:pb-16" ref={ref}>
      <div className={`text-center mb-5 sm:mb-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h2 className="text-lg sm:text-2xl font-black mb-1" style={{ color: "#1F2937" }}>الخدمات الإلكترونية</h2>
        <p className="text-[#1F2937]/40 text-[11px] sm:text-sm">ثلاث خدمات رئيسية متاحة عبر المنصة</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-5">
        {services.map((svc: any, i: number) => {
          const SvcIcon = svc.icon;
          return (
            <div
              key={i}
              className={`h-full transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: inView ? `${i * 120}ms` : "0ms" }}
            >
              <button
                onClick={() => onNavigate("/beneficiary")}
                className="w-full h-full group bg-white rounded-2xl py-5 sm:py-9 px-4 sm:px-5 cursor-pointer transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(24,120,96,0.1)] border border-[#ebebeb] hover:border-[#187860]/20 flex sm:flex-col items-center sm:justify-center gap-4 sm:gap-0 active:scale-[0.98]"
                data-testid={`card-service-${i}`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex-shrink-0 sm:mx-auto sm:mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: "#e6f4ea" }}>
                  <SvcIcon className="w-5 h-5" style={{ color: "#187860" }} strokeWidth={1.5} />
                </div>
                <div className="text-start sm:text-center flex-1 min-w-0">
                  <h3 className="font-bold text-[13px] sm:text-sm mb-1 sm:mb-2" style={{ color: "#1F2937" }}>{svc.title}</h3>
                  <p className="text-[11px] sm:text-xs text-[#1F2937]/40 leading-relaxed">{svc.desc}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [showNafath, setShowNafath] = useState<{ show: boolean; path: string; label: string }>({ show: false, path: "", label: "" });
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeSubmenu, setShowEmployeeSubmenu] = useState(false);
  const [, navigate] = useLocation();
  const homeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHomeMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (homeMenuRef.current && !homeMenuRef.current.contains(e.target as Node)) {
        setShowHomeMenu(false);
        setShowEmployeeSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showHomeMenu]);

  const handleRoleClick = (role: typeof roles[0]) => {
    if (role.requiresSelection) {
      setShowEmployeeModal(true);
    } else {
      setShowNafath({ show: true, path: role.path, label: role.label });
    }
  };

  const handleEmployeeSelect = (emp: Employee) => {
    sessionStorage.setItem("currentEmployee", JSON.stringify(emp));
    setShowEmployeeModal(false);
    setShowNafath({ show: true, path: "/employee", label: "موظفين" });
  };

  const menuDepartments = [
    { key: "verification", label: "مركز تدقيق الطلبات", icon: ShieldCheck, patterns: ["مركز تدقيق الطلبات", "قسم التدقيق"] },
    { key: "beneficiary_services", label: "قسم خدمات المستفيدين", icon: Users, patterns: ["خدمات المستفيدين"] },
    { key: "judicial", label: "الدوائر القضائية", icon: Scale, patterns: ["الدائرة القضائية", "الدائرة الجزئية", "الدائرة المرورية"] },
    { key: "documents", label: "قسم الوثائق والمحفوظات", icon: Archive, patterns: ["قسم الوثائق والمحفوظات"] },
  ];

  const handleDeptQuickSelect = (dept: typeof menuDepartments[0]) => {
    const emp = MOCK_EMPLOYEES.find(e =>
      e.status === "active" && dept.patterns.some(p => e.department.includes(p))
    ) || MOCK_EMPLOYEES.find(e => e.status === "active");
    if (emp) {
      sessionStorage.setItem("currentEmployee", JSON.stringify(emp));
      setShowHomeMenu(false);
      setShowEmployeeSubmenu(false);
      setShowNafath({ show: true, path: "/employee", label: "موظفين" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        {showNafath.show && (
          <NafathScreen
            portalLabel={showNafath.label}
            onDone={() => {
              setShowNafath({ show: false, path: "", label: "" });
              navigate(showNafath.path);
            }}
          />
        )}
      </AnimatePresence>

      <EmployeeSelectModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={handleEmployeeSelect}
      />

      {!showSplash && (
        <>
          <motion.nav
            className="sticky top-0 z-40 bg-white border-b"
            style={{ borderColor: "#ebebeb" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img src={mojLogo} alt="وزارة العدل" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                  <div className="text-start">
                    <p className="font-bold text-[#187860] text-[13px] sm:text-base leading-tight">وزارة العدل</p>
                    <p className="text-[#1F2937]/40 text-[11px] sm:text-[11px]">منصة الوثائق القضائية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div ref={homeMenuRef} className="relative">
                    <button
                      onClick={() => { setShowHomeMenu(v => !v); setShowEmployeeSubmenu(false); }}
                      data-testid="button-home-menu"
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg flex items-center justify-center transition-all hover:bg-[#ebebeb]/50 active:bg-[#ebebeb]"
                      style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}
                    >
                      <Menu className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-[#1F2937]/60" />
                    </button>

            <AnimatePresence>
              {showHomeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute end-0 top-full mt-1 w-64 rounded-xl shadow-lg border bg-white z-50 overflow-hidden py-1"
                  style={{ borderColor: "#ebebeb" }}
                  dir="rtl"
                >
                  {[
                    { label: "عن المبادرة", icon: Info, action: () => navigate("/about") },
                    { label: "الأسئلة الشائعة", icon: HelpCircle, action: () => navigate("/faq") },
                    { label: "تواصل معنا", icon: Phone, action: () => navigate("/contact") },
                  ].map((item, i) => (
                    <button key={i} onClick={() => { item.action(); setShowHomeMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors">
                      <item.icon className="w-4 h-4 text-[#1F2937]/40" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t my-1" style={{ borderColor: "#ebebeb" }} />
                  <button onClick={() => { setShowHomeMenu(false); setShowEmployeeSubmenu(false); setShowNafath({ show: true, path: "/beneficiary", label: "أفراد" }); }}
                    className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                    data-testid="menu-beneficiary">
                    <UserCircle className="w-4 h-4 text-[#1F2937]/40" />
                    <span>بوابة المستفيد</span>
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowEmployeeSubmenu(!showEmployeeSubmenu)}
                      className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                      data-testid="menu-employee">
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
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#1F2937]/70 hover:bg-[#187860]/[0.04] hover:text-[#187860] transition-colors whitespace-nowrap"
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
                  <button onClick={() => { setShowHomeMenu(false); setShowEmployeeSubmenu(false); setShowNafath({ show: true, path: "/manager", label: "إدارة" }); }}
                    className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-[#1F2937]/80 hover:bg-[#ebebeb]/50 active:bg-[#ebebeb] transition-colors"
                    data-testid="menu-manager">
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
          </motion.nav>


          <motion.section
            className="relative"
            style={{ background: "linear-gradient(to bottom, #1878600A, transparent)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-4 sm:pt-14 sm:pb-8">
              <div className="text-center max-w-2xl mx-auto">
                <motion.h1
                  className="text-[22px] sm:text-4xl font-black mb-2 sm:mb-3 leading-snug"
                  style={{ color: "#187860" }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  منصة الوثائق القضائية
                </motion.h1>

                <motion.p
                  className="text-[#1F2937]/45 text-[13px] sm:text-base leading-relaxed mb-5 sm:mb-6 max-w-lg mx-auto px-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  تتيح المنصة تقديم ومتابعة وسداد واستلام الطلبات القضائية إلكترونيًا بكل سهولة وأمان
                </motion.p>

                <motion.div
                  className="flex items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={() => setShowNafath({ show: true, path: "/beneficiary", label: "أفراد" })}
                    className="px-6 py-2.5 sm:px-5 sm:py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ background: "#187860" }}
                    data-testid="button-hero-start"
                  >
                    اطلب وثيقتك
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.section>

          <main className="max-w-6xl mx-auto px-4 sm:px-6">

            <LoginSection roles={roles} onRoleClick={handleRoleClick} />
            <StatsSection />
            <ServicesSection services={services} onNavigate={navigate} />

          </main>

          <MojFooter />
        </>
      )}
      <ChatbotWidget />
    </div>
  );
}
