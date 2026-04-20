import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Target, Globe, Clock, Scale, Star, Rocket, Users,
  Shield, BarChart3, Building2, MapPin, Cpu, Smartphone, Eye,
  CheckCircle, Zap, FileText, CreditCard, Crown, Briefcase, UserCheck,
  FileCheck, Search, Replace, Bell, ClipboardList, Timer, TrendingUp,
  Layers, ArrowDownToLine, MessageSquare, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MojFooter from "@/components/moj-footer";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

const fadeUp = (delay: number) => ({
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.4 },
});

export default function AboutPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#ebebeb" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mojLogo} alt="وزارة العدل" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <div>
              <p className="text-sm sm:text-base font-bold text-[#187860]">عن المبادرة</p>
              <p className="text-[10px] sm:text-xs text-[#1F2937]/40">منصة الوثائق القضائية</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} data-testid="button-about-back"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-[#ebebeb]/50"
            style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}>
            <ArrowRight className="w-4 h-4 text-[#1F2937]/70" />
          </button>
        </div>
      </header>

      <div className="relative overflow-hidden py-12 sm:py-16 px-4" style={{ background: "linear-gradient(135deg, #187860 0%, #075e4a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-4xl mx-auto relative">
          <motion.div className="text-center" {...fadeUp(0)}>
            <motion.img src={mojLogo} alt="شعار وزارة العدل"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 object-contain"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">عن المبادرة</h1>
            <p className="text-white/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              مبادرة التحول الرقمي لإدارة طلبات الوثائق القضائية
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">

        <motion.section {...fadeUp(0.1)}>
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-5 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#187860]" />
              رؤية المبادرة
            </h2>
            <p className="text-sm sm:text-base text-[#1F2937]/80 leading-[1.9] mb-6">
              مبادرة التحول الرقمي لإدارة طلبات المستفيدين هي نموذج تشغيلي رقمي مقترح يهدف إلى تطوير آلية استقبال ومعالجة طلبات المستفيدين، من خلال تحويل الإجراءات التقليدية إلى مسار إلكتروني متكامل يعتمد على الأتمتة، والتوزيع العادل للمهام، واحتساب المدد النظامية بشكل لحظي، مع توفير لوحة رقابية للإدارة وسجل تدقيق رقمي يعزز الشفافية والمساءلة، بما يسهم في رفع كفاءة الأداء وتحسين تجربة المستفيد.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Globe, label: "تحوّل رقمي كامل", color: "#187860" },
                { icon: Clock, label: "تقليص وقت الإنجاز", color: "#075e4a" },
                { icon: Scale, label: "عدالة التوزيع", color: "#187860" },
                { icon: BarChart3, label: "قرارات مبنية على البيانات", color: "#075e4a" },
                { icon: Star, label: "رضا المستفيدين", color: "#187860" },
                { icon: Rocket, label: "رؤية 2030", color: "#075e4a" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-[#ebebeb]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}10` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.15)}>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#187860]" />
            الخدمات المقدمة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: FileCheck, title: "نسخة مصدقة من أوراق الدعوى", color: "#187860",
                desc: "الحصول على نسخة مصدقة من أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية أو الوثائق تحت يد المحكمة",
                price: "١٠٠ ريال"
              },
              {
                icon: Search, title: "الاطلاع على أوراق الدعوى", color: "#075e4a",
                desc: "الاطلاع على أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية دون الحصول على نسخة",
                price: "٥٠ ريال"
              },
              {
                icon: Replace, title: "نسخة بديلة للوثائق القضائية", color: "#187860",
                desc: "إصدار نسخة بديلة من الوثائق القضائية في حال فقدان أو تلف النسخة الأصلية",
                price: "١٠٠ ريال"
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#ebebeb] p-4 sm:p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-sm mb-2 text-foreground">{item.title}</h3>
                <p className="text-[11px] text-[#1F2937]/60 leading-relaxed mb-3">{item.desc}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#187860] bg-[#187860]/5 rounded-lg px-2.5 py-1.5 w-fit">
                  <CreditCard className="w-3 h-3" />
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.2)}>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#075e4a]" />
            بوابات المنصة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: UserCheck, title: "بوابة المستفيد", color: "#187860",
                features: [
                  "تقديم الطلبات إلكترونياً عبر نفاذ مع اختيار المدينة والجهة والدائرة",
                  "5 تبويبات: متابعة / سداد / مرفوضة / اعتراض / مكتملة",
                  "تقويم هجري تفاعلي كامل لتاريخ الصك مع عرض ميلادي مقابل",
                  "سداد إلكتروني مباشر وتحميل وثائق بختم رقمي وعلامة مائية",
                  "أيقونة ساعة تحذيرية للطلبات المتأخرة مع تقديم شكوى فوري",
                  "مساعد رقمي ذكي وتقييم رضا بالنجوم",
                ]
              },
              {
                icon: Briefcase, title: "بوابة الموظف", color: "#075e4a",
                features: [
                  "4 أقسام: تدقيق / خدمات مستفيدين / دائرة قضائية / وثائق",
                  "توزيع تلقائي عادل حسب حمل العمل",
                  "عرض اسم الجهة على البطاقات والدائرة في التفاصيل فقط",
                  "مؤقت زمني حي (أخضر / أصفر / أحمر) مع لوحة أداء موحدة",
                  "نظام تذاكر الشكاوى مع إجراءات حل ورد وإعادة",
                ]
              },
              {
                icon: Crown, title: "بوابة المدير", color: "#187860",
                features: [
                  "لوحة إحصاءات ومؤشرات أداء لحظية مع رسوم بيانية عربية",
                  "تنبيه عاجل عند تجاوز الطلبات الموعد النهائي",
                  "تبويب المصعّدة للطلبات العاجلة والاعتراضات",
                  "نظام تذاكر وشكاوى مع إحالة للأقسام المختصة",
                  "سجل تدقيق كامل + تصدير البيانات + تحليل اختناقات",
                ]
              },
            ].map((role, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#ebebeb] p-4 sm:p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${role.color}10` }}>
                  <role.icon className="w-5 h-5" style={{ color: role.color }} />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-3 text-foreground">{role.title}</h3>
                <ul className="space-y-2">
                  {role.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-[11px] sm:text-xs text-[#1F2937]/70">
                      <CheckCircle className="w-3.5 h-3.5 text-[#187860] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.25)}>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#187860]" />
            مسار الطلب
          </h2>
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-5 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
              {[
                { step: "١", icon: FileText, label: "تقديم الطلب", desc: "المستفيد يقدم طلبه إلكترونياً عبر نفاذ" },
                { step: "٢", icon: Shield, label: "التدقيق", desc: "مركز التدقيق يراجع البيانات والمرفقات" },
                { step: "٣", icon: Building2, label: "الإحالة", desc: "إحالة الطلب للجهة والدائرة القضائية المختصة" },
                { step: "٤", icon: CreditCard, label: "السداد", desc: "المستفيد يسدد التكاليف القضائية إلكترونياً" },
                { step: "٥", icon: ArrowDownToLine, label: "التسليم", desc: "تحميل الوثيقة الرقمية أو الاطلاع عليها" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 relative" style={{ backgroundColor: "#187860" }}>
                    <item.icon className="w-5 h-5 text-white" />
                    <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#187860] text-[10px] font-bold text-[#187860] flex items-center justify-center">{item.step}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground mb-1">{item.label}</p>
                  <p className="text-[10px] text-[#1F2937]/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.3)}>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#075e4a]" />
            مميزات المنصة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "التحقق من الهوية", value: "نفاذ الوطني الموحد + رمز تحقق", icon: Lock },
              { label: "التقويم", value: "تقويم هجري تفاعلي كامل (1400 إلى 1450 هـ) مع عرض ميلادي", icon: Clock },
              { label: "الإشعارات", value: "تنبيهات لحظية لحالة الطلب عبر جرس الإشعارات", icon: Bell },
              { label: "نظام التذاكر", value: "شكاوى المستفيدين مع إحالة للأقسام المختصة", icon: ClipboardList },
              { label: "المدد النظامية", value: "احتساب لحظي مع أيقونة ساعة تحذيرية للطلبات المتأخرة", icon: Timer },
              { label: "التغطية الجغرافية", value: "كافة مدن المملكة", icon: MapPin },
              { label: "الجهات", value: "كافة الجهات القضائية: محاكم + كتابة عدل + المحكمة العليا + ديوان الوزارة", icon: Building2 },
              { label: "السداد الإلكتروني", value: "مدى / سداد / آبل باي", icon: CreditCard },
              { label: "التقييم", value: "تقييم رضا المستفيد بالنجوم والتعليق", icon: Star },
              { label: "التقارير", value: "تصدير البيانات والتحليلات مع رسوم بيانية عربية", icon: TrendingUp },
              { label: "الشكاوى", value: "رفع شكوى فوري بنقرة على أيقونة الساعة في الطلبات المتأخرة", icon: MessageSquare },
              { label: "التوافقية", value: "جوال وتابلت وسطح مكتب بتصميم متجاوب", icon: Smartphone },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-[#ebebeb] p-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#187860]/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#187860]" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">{item.label}</span>
                  <p className="text-xs sm:text-sm text-[#1F2937]/80">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.35)}>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#075e4a]" />
            الأثر المتوقع
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "90%+", label: "توفير في الوقت", desc: "بدل الحضور الشخصي", color: "#187860" },
              { value: "90%+", label: "تقليل الحضور", desc: "للجهات القضائية", color: "#075e4a" },
              { value: "70%+", label: "تسريع الإنجاز", desc: "للطلبات والمعاملات", color: "#187860" },
              { value: "50%+", label: "رفع الإنتاجية", desc: "للموظفين والإدارة", color: "#075e4a" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#ebebeb] p-4 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs font-bold text-foreground mb-0.5">{item.label}</p>
                <p className="text-[10px] text-[#1F2937]/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp(0.4)}
          className="text-center bg-gradient-to-br from-[#187860]/5 to-[#075e4a]/5 rounded-2xl p-6 sm:p-10 border border-[#ebebeb]"
        >
          <img src={mojLogo} alt="وزارة العدل" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">مبادرة مقدمة من</h3>
          <p className="text-foreground font-bold text-base sm:text-lg mb-1">محمد بخيت حميد المعبدي</p>
          <p className="text-xs text-[#1F2937]/50 mb-6" dir="ltr">mbmaabdi@moj.gov.sa</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={() => navigate("/presentation")}
              className="bg-[#187860] hover:bg-[#075e4a] text-white rounded-xl font-medium text-xs sm:text-sm"
              data-testid="button-about-presentation"
            >
              <Eye className="w-3.5 h-3.5 ms-1" />
              العرض التقديمي
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/faq")}
              className="border-[#187860]/20 text-[#187860] hover:bg-[#187860]/5 rounded-xl font-medium text-xs sm:text-sm"
              data-testid="button-about-faq"
            >
              الأسئلة الشائعة
            </Button>
          </div>
        </motion.section>
      </div>

      <MojFooter />
    </div>
  );
}
