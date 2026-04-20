import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Shield, Globe, Clock, Bot, Users, Scale,
  FileText, CreditCard, Eye, Lock, Bell, BarChart3, Search,
  CheckCircle, Layers, Cpu, ClipboardList, Star, Briefcase,
  Crown, UserCheck, Building2, Download, XCircle,
  Activity, Stamp, MapPin, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MojFooter from "@/components/moj-footer";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: "easeOut" },
});

const features = [
  {
    category: "تجربة المستفيد",
    icon: UserCheck,
    color: "#187860",
    items: [
      { icon: Layers, title: "نموذج ذكي من 3 خطوات", desc: "بيانات مقدم الطلب → تفاصيل القضية → المراجعة والإقرار مع حفظ تلقائي للمسودات" },
      { icon: ClipboardList, title: "5 تبويبات للمتابعة", desc: "متابعة | بانتظار السداد | المرفوضة | المعترض عليها | المكتملة كل طلب في مكانه" },
      { icon: Bell, title: "إشعارات لحظية", desc: "إشعارات فورية متحركة عند كل تحديث على حالة الطلب مع شارات ملونة" },
      { icon: Activity, title: "شريط تقدم بنسبة مئوية", desc: "شريط متحرك يُظهر نسبة الإنجاز: 25% ثم 50% ثم 75% ثم 100%" },
      { icon: Star, title: "تقييم رضا المستفيدين", desc: "تقييم بالنجوم والتعليق بعد اكتمال الطلب لتحسين جودة الخدمة" },
      { icon: Bot, title: "مساعد رقمي ذكي", desc: "21 سؤالاً شائعاً + فهم اللهجة السعودية + تصنيفات + اقتراحات سياقية" },
    ],
  },
  {
    category: "الأمان والتوثيق",
    icon: Shield,
    color: "#075e4a",
    items: [
      { icon: Shield, title: "تحقق عبر نفاذ", desc: "تسجيل دخول موحد عبر النفاذ الوطني مع رمز تحقق على الجوال" },
      { icon: Stamp, title: "ختم رقمي رسمي", desc: "توقيع إلكتروني مشفّر + ختم الدائرة + رمز تحقق إلكتروني على كل وثيقة" },
      { icon: Eye, title: "علامة مائية لمنع التزوير", desc: "علامة مائية مكررة باسم المستفيد على الوثيقة المحملة" },
      { icon: Lock, title: "حماية وثائق الاطلاع", desc: "منع الطباعة وتصوير الشاشة تظهر صفحة بيضاء عند محاولة التصوير" },
      { icon: Cpu, title: "كشف التكرار التلقائي", desc: "تنبيه فوري إذا وُجد طلب مشابه سابق لنفس المستفيد والقضية" },
      { icon: Search, title: "سجل تدقيق رقمي", desc: "تسجيل كل إجراء بالتاريخ والوقت والمسؤول لضمان الشفافية والمساءلة" },
    ],
  },
  {
    category: "كفاءة العمليات",
    icon: Zap,
    color: "#187860",
    items: [
      { icon: Zap, title: "توزيع تلقائي عادل", desc: "النظام يُوزّع الطلبات فوراً على الموظف الأقل تحميلاً في القسم المناسب" },
      { icon: Clock, title: "مؤقت زمني حي", desc: "احتساب المدد النظامية لحظياً مع تنبيهات عند اقتراب الموعد النهائي" },
      { icon: Scale, title: "مسار إحالة متعدد", desc: "إحالة الطلبات بين الأقسام والدوائر القضائية مع تتبع كامل للمسار" },
      { icon: XCircle, title: "نظام اعتراض متكامل", desc: "إمكانية تقديم اعتراض على الرفض خلال 30 يوماً مع مبررات ومستندات" },
      { icon: CreditCard, title: "سداد إلكتروني متعدد", desc: "الدفع عبر مدى / سداد / آبل باي بعد اكتمال الطلب مباشرة" },
      { icon: Download, title: "تسليم رقمي فوري", desc: "تحميل الوثيقة الرسمية فور السداد أو استلام شخصي من المحكمة" },
    ],
  },
  {
    category: "الإدارة والرقابة",
    icon: Crown,
    color: "#075e4a",
    items: [
      { icon: BarChart3, title: "لوحة إحصاءات لحظية", desc: "إحصاءات شاملة: الطلبات النشطة، المكتملة، المتأخرة، ومتوسط الإنجاز" },
      { icon: Users, title: "تحليل أداء الموظفين", desc: "متوسط وقت الإنجاز ونسبة الإنجاز لكل موظف مع مقارنات بيانية" },
      { icon: Activity, title: "رصد الاختناقات", desc: "تحديد نقاط التأخير والأقسام الأعلى تحميلاً لاتخاذ قرارات مبنية على البيانات" },
      { icon: FileText, title: "تصدير التقارير", desc: "تصدير البيانات والتقارير بصيغ متعددة للمراجعة والتحليل" },
      { icon: MapPin, title: "تغطية جغرافية واسعة", desc: "20+ مدينة رئيسية مع جميع أنواع المحاكم والدوائر القضائية" },
      { icon: Globe, title: "متاحة على مدار الساعة", desc: "المنصة الإلكترونية متاحة 24 ساعة لتقديم الطلبات والمتابعة" },
    ],
  },
];

const highlights = [
  { icon: Zap, value: "١-٣", unit: "أيام عمل", label: "متوسط الإنجاز" },
  { icon: FileText, value: "٣", unit: "خدمات", label: "مصدقة + اطلاع + بديلة" },
  { icon: Building2, value: "١٠", unit: "جهات", label: "جهة قضائية" },
  { icon: MapPin, value: "٢٠+", unit: "مدينة", label: "تغطية شاملة" },
  { icon: Bot, value: "٢١", unit: "سؤال", label: "مساعد رقمي" },
  { icon: Shield, value: "٢٤/٧", unit: "", label: "متاحة دائماً" },
];

export default function FeaturesPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#ebebeb" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mojLogo} alt="وزارة العدل" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <div>
              <p className="text-sm sm:text-base font-bold text-[#187860]">مزايا المنصة</p>
              <p className="text-[10px] sm:text-xs text-[#1F2937]/40">منصة الوثائق القضائية</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} data-testid="button-features-back"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-[#ebebeb]/50"
            style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}>
            <ArrowRight className="w-4 h-4 text-[#1F2937]/70" />
          </button>
        </div>
      </header>
      <div className="relative overflow-hidden pt-12 sm:pt-16 pb-12 sm:pb-16 px-4" style={{ background: "#187860" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-[10%] w-32 h-32 rounded-full border border-white/5" />
          <div className="absolute bottom-4 right-[15%] w-48 h-48 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/[0.03]" />
        </div>

        <div className="max-w-5xl mx-auto relative">

          <motion.div className="text-center" {...fadeUp(0)}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-white/10">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">مزايا المنصة</h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              منصة رقمية متكاملة لإدارة طلبات الوثائق القضائية مصمَّمة وفق أعلى معايير المنصات الحكومية الرقمية
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-6 gap-3"
          {...fadeUp(0.1)}
        >
          {highlights.map((h, i) => {
            const HIcon = h.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-[#ebebeb] p-3 sm:p-4 text-center">
                <div className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: "rgba(24,120,96,0.06)" }}>
                  <HIcon className="w-4 h-4" style={{ color: "#187860" }} />
                </div>
                <p className="text-lg sm:text-xl font-black leading-none mb-0.5 text-foreground">
                  {h.value}
                </p>
                {h.unit && <p className="text-[10px] text-[#075e4a] font-bold">{h.unit}</p>}
                <p className="text-[9px] sm:text-[10px] text-[#1F2937]/40 mt-0.5">{h.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {features.map((section, si) => {
          const SIcon = section.icon;
          return (
            <motion.section key={si} {...fadeUp(0.1 + si * 0.08)}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${section.color}10` }}>
                  <SIcon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: "#1F2937" }}>{section.category}</h2>
                  <div className="w-10 h-0.5 rounded-full mt-1" style={{ background: section.color }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {section.items.map((item, ii) => {
                  const IIcon = item.icon;
                  return (
                    <motion.div
                      key={ii}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + si * 0.05 + ii * 0.04 }}
                      className="bg-white rounded-xl border border-[#ebebeb] p-4 sm:p-5 group hover:border-[#187860]/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${section.color}0A` }}>
                          <IIcon className="w-4 h-4" style={{ color: section.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold mb-1" style={{ color: "#1F2937" }}>{item.title}</h3>
                          <p className="text-[11px] sm:text-xs text-[#1F2937]/50 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        <motion.section {...fadeUp(0.4)}>
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-base sm:text-lg font-bold mb-1" style={{ color: "#1F2937" }}>البوابات الثلاث</h2>
              <p className="text-xs text-[#1F2937]/40">كل مستخدم يدخل عبر بوابته المخصصة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: UserCheck, title: "بوابة المستفيد", color: "#187860",
                  points: ["تقديم الطلبات إلكترونياً", "متابعة لحظية بالإشعارات", "سداد إلكتروني وتحميل رقمي", "مساعد رقمي ذكي", "تقييم رضا المستفيدين"],
                },
                {
                  icon: Briefcase, title: "بوابة الموظف", color: "#075e4a",
                  points: ["استقبال تلقائي عادل", "مؤقت زمني حي", "إحالة وتصعيد بنقرة", "تصنيف ذكي بالذكاء الاصطناعي", "إرفاق الوثائق والختم الرقمي"],
                },
                {
                  icon: Crown, title: "بوابة المدير", color: "#187860",
                  points: ["لوحة إحصاءات لحظية", "تحليلات الأداء والاختناقات", "سجل تدقيق كامل", "إدارة الموظفين والأقسام", "تصدير التقارير والبيانات"],
                },
              ].map((portal, i) => {
                const PIcon = portal.icon;
                return (
                  <div key={i} className="rounded-xl border border-[#ebebeb] p-4 sm:p-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${portal.color}10` }}>
                      <PIcon className="w-5 h-5" style={{ color: portal.color }} />
                    </div>
                    <h3 className="text-sm font-bold mb-3 text-foreground">{portal.title}</h3>
                    <ul className="space-y-2">
                      {portal.points.map((p, pi) => (
                        <li key={pi} className="flex items-center gap-2 text-[11px] sm:text-xs text-[#1F2937]/75">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: portal.color }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.div className="text-center pb-8" {...fadeUp(0.5)}>
          <Button
            onClick={() => navigate("/")}
            className="text-white text-sm px-8 py-3 rounded-xl font-medium"
            style={{ background: "#187860" }}
            data-testid="button-features-start"
          >
            ابدأ الآن
            <ChevronLeft className="w-4 h-4 me-2" />
          </Button>
        </motion.div>
      </div>

      <MojFooter />
    </div>
  );
}