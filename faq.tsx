import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Search, ChevronDown, ArrowRight, FileText, CreditCard,
  Clock, Shield, Users, Settings, MessageSquare, Globe, ClipboardList, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MojFooter from "@/components/moj-footer";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

const FAQ_CATEGORIES = [
  { id: "general", label: "عام", icon: Globe, color: "#187860" },
  { id: "requests", label: "الطلبات", icon: FileText, color: "#075e4a" },
  { id: "payment", label: "السداد", icon: CreditCard, color: "#187860" },
  { id: "tracking", label: "المتابعة", icon: Clock, color: "#075e4a" },
  { id: "complaints", label: "الشكاوى", icon: ClipboardList, color: "#187860" },
  { id: "security", label: "الأمان", icon: Shield, color: "#075e4a" },
  { id: "technical", label: "تقني", icon: Settings, color: "#187860" },
];

const FAQ_ITEMS = [
  { category: "general", q: "ما هي منصة الوثائق القضائية؟", a: "منصة إلكترونية متكاملة تمكّن المستفيدين من تقديم طلبات الوثائق القضائية ومتابعتها واستلامها رقمياً دون الحاجة للحضور الشخصي. تتكوّن المنصة من ثلاث بوابات: بوابة المستفيد لتقديم الطلبات ومتابعتها، بوابة الموظف لمعالجة الطلبات وإحالتها، وبوابة المدير للرقابة والتحليلات." },
  { category: "general", q: "من يمكنه استخدام المنصة؟", a: "يمكن لأي شخص لديه رقم هوية وطنية الدخول عبر نفاذ الوطني الموحد كمستفيد. كما يمكن للموظفين والمديرين الدخول لبواباتهم المخصصة بصلاحيات مختلفة حسب أدوارهم." },
  { category: "general", q: "هل المنصة متاحة على مدار الساعة؟", a: "نعم، المنصة متاحة على مدار الساعة طوال أيام الأسبوع. يمكنك تقديم الطلبات ومتابعتها في أي وقت ومن أي مكان عبر المتصفح من الجوال أو التابلت أو سطح المكتب." },
  { category: "general", q: "ما الجهات المدعومة في المنصة؟", a: "تدعم المنصة جميع أنواع المحاكم: المحكمة العامة، المحكمة التجارية، محكمة الأحوال الشخصية، المحكمة الجزائية، المحكمة العمالية، محكمة الاستئناف، محكمة التنفيذ، كتابة العدل، المحكمة العليا، وديوان الوزارة. وتغطي كافة مدن المملكة." },
  { category: "general", q: "ما الفرق بين الدائرة القضائية والإدارات والأقسام؟", a: "عند اختيار محكمة كجهة تظهر الدوائر القضائية التابعة لها (مثل الدائرة التجارية أو الجزائية). أما عند اختيار ديوان الوزارة تظهر الإدارات والأقسام (مثل الأمانة العامة أو إدارة التوثيق). اختيار الدائرة أو الإدارة اختياري لكنه يسرّع إنجاز الطلب." },
  { category: "general", q: "ما أنواع صفة مقدم الطلب؟", a: "يمكن تقديم الطلب بصفة: مدعي، مدعى عليه، وارث، وكيل شرعي، أو صاحب مصلحة. في حال اختيار صاحب المصلحة يُطلب ذكر سبب المصلحة من الأوراق المطلوبة." },

  { category: "requests", q: "ما أنواع الطلبات المتاحة؟", a: "ثلاثة أنواع: (1) نسخة مصدقة من أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية أو الوثائق تحت يد المحكمة. (2) الاطلاع على أوراق الدعوى أو سجلاتها الورقية أو الإلكترونية. (3) نسخة بديلة للوثائق القضائية في حال الفقد أو التلف." },
  { category: "requests", q: "كيف أقدم طلباً جديداً؟", a: "الخطوة الأولى: تعبئة بيانات مقدم الطلب (الاسم، رقم الهوية، رقم الجوال، صفة مقدم الطلب). الخطوة الثانية: اختيار نوع الطلب، المدينة، الجهة، الدائرة القضائية أو الإدارة، وإدخال رقم القضية وتاريخ الصك. الخطوة الثالثة: مراجعة ملخص الطلب والموافقة على إقرار تقديم الطلب والتعهد بسداد التكاليف القضائية." },
  { category: "requests", q: "ما البيانات المطلوبة في النموذج؟", a: "البيانات الإلزامية: الاسم، رقم الهوية، رقم الجوال، صفة مقدم الطلب، نوع الطلب، المدينة، الجهة، ورقم القضية. البيانات الاختيارية: رقم القيد، الدائرة القضائية، تاريخ الصك، والمرفقات. ملاحظة: عند اختيار نسخة بديلة يصبح رقم الصك وتاريخ الصك إلزاميين." },
  { category: "requests", q: "ما التقويم المستخدم في تاريخ الصك؟", a: "المنصة توفر تقويم تفاعلي يدعم التاريخين الهجري والميلادي. يمكنك التبديل بين الوضعين عبر زر في أعلى التقويم. كل خلية تعرض التاريخ الهجري والميلادي معاً. القيمة تُحفظ دائماً بالتاريخ الهجري بغض النظر عن وضع العرض." },
  { category: "requests", q: "كم يستغرق إنجاز الطلب؟", a: "المدة المتوقعة لجميع أنواع الطلبات من 1 إلى 3 أيام عمل. يتم استثناء أيام الجمعة والسبت والإجازات الرسمية من حساب المدة النظامية." },
  { category: "requests", q: "هل يمكنني إرفاق مستندات مع الطلب؟", a: "نعم، يمكنك إرفاق ملفات بصيغة PDF أو JPG. المرفقات اختيارية لكنها قد تساعد في تسريع معالجة الطلب، خصوصاً صورة الهوية وصورة الوكالة الشرعية إن وُجدت." },
  { category: "requests", q: "ماذا يحدث لو قدمت طلباً مكرراً؟", a: "النظام يكتشف الطلبات المكررة تلقائياً بناءً على رقم القضية ونوع الطلب ورقم الهوية. عند محاولة تقديم طلب مكرر يظهر تنبيه يوضح تفاصيل الطلب السابق مع خيار المتابعة أو التراجع." },
  { category: "requests", q: "هل يمكنني حفظ مسودة الطلب وإكماله لاحقاً؟", a: "نعم، المنصة تحفظ مسودة الطلب تلقائياً أثناء تعبئة النموذج. عند العودة للمنصة ستجد بياناتك محفوظة ويمكنك إكمال الطلب من حيث توقفت." },

  { category: "payment", q: "كم تبلغ رسوم الخدمة؟", a: "الرسوم: 100 ريال للنسخة المصدقة من أوراق الدعوى، 50 ريال للاطلاع على أوراق الدعوى، 100 ريال للنسخة البديلة للوثائق القضائية. الرسوم محددة وفقاً للائحة التنفيذية لنظام التكاليف القضائية." },
  { category: "payment", q: "ما طرق السداد المتاحة؟", a: "يمكنك السداد إلكترونياً عبر: بطاقة مدى أو آبل باي. واجهة السداد تظهر مباشرة بعد اكتمال الطلب ضمن تفاصيل الطلب في بوابة المستفيد." },
  { category: "payment", q: "متى يتم السداد؟", a: "السداد يكون بعد اكتمال معالجة الطلب وليس عند تقديمه. بعد أن يُكمل الموظف المختص معالجة الطلب، يظهر للمستفيد شريط 'بانتظار السداد' على بطاقة الطلب مع خيارات الدفع. لا يمكن تحميل الوثيقة أو الاطلاع عليها إلا بعد إتمام السداد." },
  { category: "payment", q: "ماذا يحدث بعد السداد؟", a: "بعد السداد مباشرة: للنسخة المصدقة والنسخة البديلة يظهر زر تحميل الوثيقة الرقمية بصيغة PDF مع ختم رقمي ورمز تحقق. للاطلاع على أوراق الدعوى يظهر زر لعرض الأوراق إلكترونياً لمرة واحدة فقط." },
  { category: "payment", q: "لماذا الاطلاع على الأوراق متاح لمرة واحدة فقط؟", a: "خدمة الاطلاع مصممة لمرة واحدة لضمان سرية وأمان أوراق الدعوى. بعد الاطلاع تُغلق الجلسة ولا يمكن إعادة فتحها. إذا احتجت الاطلاع مرة أخرى يمكنك تقديم طلب جديد." },

  { category: "tracking", q: "كيف أتابع حالة طلبي؟", a: "بعد تسجيل الدخول، انتقل لتبويب 'متابعة الطلبات' في بوابة المستفيد. ستجد جميع طلباتك النشطة مع شريط تقدم يوضح المرحلة الحالية (جديد، معالجة، إحالة، مكتمل) والمدة المتبقية." },
  { category: "tracking", q: "ما هي حالات الطلب الممكنة؟", a: "الحالات: (1) جديد: تم استلام الطلب وبانتظار التدقيق. (2) قيد المعالجة: يعمل عليه موظف في مركز التدقيق. (3) محال: أُحيل للدائرة القضائية أو الإدارة المختصة. (4) مكتمل: جاهز للسداد وتحميل الوثيقة. (5) مرفوض: تم رفضه مع ذكر السبب. (6) معترض عليه: تم تقديم اعتراض على الرفض." },
  { category: "tracking", q: "هل أحصل على إشعارات عند تحديث الحالة؟", a: "نعم، المنصة ترسل إشعارات فورية عبر جرس الإشعارات في أعلى الصفحة عند كل تغيير في حالة الطلب، سواء قُبل أو رُفض أو أُحيل أو اكتمل. يمكنك تفعيل أو إيقاف الإشعارات من إعدادات البوابة." },
  { category: "tracking", q: "كيف أحمّل الوثيقة بعد الإنجاز؟", a: "بعد اكتمال الطلب وسداد الرسوم، يظهر زر تحميل أخضر في تفاصيل الطلب. الوثيقة الرقمية تكون بصيغة PDF مع ختم رقمي رسمي، ورمز تحقق QR، وتوقيع رقمي مشفر يمكن التحقق منه." },
  { category: "tracking", q: "ماذا لو تأخر طلبي عن الموعد المحدد؟", a: "عند تأخر الطلب تظهر أيقونة ساعة بلون تحذيري على بطاقة الطلب. بالضغط عليها يمكنك رفع شكوى مباشرة على التأخير. الشكوى تُسجّل كتذكرة في نظام التذاكر ويتابعها المدير المختص." },
  { category: "tracking", q: "هل يمكنني البحث في طلباتي وفلترتها؟", a: "نعم، توفر المنصة بحث بالنص الحر (رقم التتبع أو رقم القضية)، وفلترة حسب حالة الطلب ونوعه، وترتيب حسب الأحدث أو الأقدم أو الأكثر استعجالاً. كما يمكنك التبديل بين عرض الشبكة وعرض القائمة." },

  { category: "complaints", q: "كيف أرفع شكوى على طلب متأخر؟", a: "عند تأخر طلبك عن المدة المحددة تظهر أيقونة ساعة تحذيرية على بطاقة الطلب. اضغط عليها لفتح نموذج الشكوى مباشرة، اكتب تفاصيل شكواك ثم اضغط 'إرسال الشكوى'. يمكنك أيضاً الوصول لنموذج الشكوى من داخل تفاصيل الطلب." },
  { category: "complaints", q: "ماذا يحدث بعد تقديم الشكوى؟", a: "الشكوى تُسجّل كتذكرة في نظام التذاكر المركزي وتظهر مباشرة في بوابة المدير ضمن التنبيهات. يحدد النظام أولوية الشكوى تلقائياً بناءً على مدة التأخير (منخفضة، متوسطة، عالية). يتابعها المدير ويمكنه إحالتها أو حلها." },
  { category: "complaints", q: "هل يمكنني تقديم أكثر من شكوى على نفس الطلب؟", a: "لا، لا يمكن تقديم شكوى جديدة على طلب لديه شكوى قائمة لم تُحل بعد. يجب انتظار حل الشكوى الحالية أولاً. يظهر تنبيه يوضح أن الشكوى قيد المتابعة." },
  { category: "complaints", q: "هل يمكنني الاعتراض على رفض الطلب؟", a: "نعم، عند رفض الطلب يمكنك تقديم اعتراض مع ذكر السبب. الاعتراض يُراجع من قِبل رئيس المحكمة. يمكن تقديم اعتراض واحد فقط على كل طلب مرفوض." },
  { category: "complaints", q: "كيف أقيّم الخدمة بعد اكتمال الطلب؟", a: "بعد اكتمال الطلب وسداد الرسوم، يمكنك تقييم الخدمة من 1 إلى 5 نجوم مع إمكانية إضافة ملاحظة. التقييم يساعد في تحسين جودة الخدمة ويظهر في تحليلات أداء الإدارة." },

  { category: "security", q: "كيف يتم التحقق من هويتي؟", a: "يتم التحقق عبر نظام نفاذ الوطني الموحد. تُدخل رقم الهوية الوطنية ثم يتم التحقق من خلال رسالة نصية OTP أو تطبيق نفاذ. بعد التحقق الناجح يتم توجيهك مباشرة للبوابة المطلوبة." },
  { category: "security", q: "هل بياناتي آمنة؟", a: "نعم، جميع البيانات محمية بتشفير عالي المستوى وفقاً لأنظمة حماية البيانات الشخصية في المملكة العربية السعودية. رقم الهوية يُعرض مخفياً جزئياً في نظام التذاكر لحماية الخصوصية." },
  { category: "security", q: "كيف أتأكد من صحة الوثيقة الرقمية؟", a: "كل وثيقة تحمل رمز تحقق QR وتوقيع رقمي مشفر ورقم تحقق فريد. يمكن لأي جهة مسح رمز QR أو زيارة رابط التحقق للتثبت من أصالة الوثيقة وصحتها." },
  { category: "security", q: "ما الحجية القانونية للوثيقة الرقمية؟", a: "الوثيقة الرقمية المصدرة من المنصة تحمل نفس الحجية القانونية للوثيقة الورقية المختومة، وفقاً لنظام التعاملات الإلكترونية في المملكة العربية السعودية ولائحته التنفيذية." },

  { category: "technical", q: "ما المتصفحات والأجهزة المدعومة؟", a: "المنصة متجاوبة بالكامل وتعمل على الجوال والتابلت وسطح المكتب. تدعم جميع المتصفحات الحديثة مثل Chrome وFirefox وSafari وEdge. لا تحتاج تثبيت أي تطبيق." },
  { category: "technical", q: "هل يمكنني طباعة الوثيقة أو مشاركتها؟", a: "نعم، بعد تحميل الوثيقة يمكنك طباعتها أو مشاركتها. كما يمكنك نسخ رابط التتبع ومشاركته مع الجهات المعنية للتحقق من صحة الوثيقة إلكترونياً." },
  { category: "technical", q: "ماذا أفعل إذا واجهت مشكلة تقنية؟", a: "يمكنك التواصل عبر المساعد الذكي المتاح في بوابة المستفيد (أيقونة المحادثة أسفل يسار الشاشة)، أو عبر رابط 'شاركنا رأيك' في أسفل الصفحة الرئيسية." },
  { category: "technical", q: "هل يدعم الموقع اللغة الإنجليزية؟", a: "المنصة مصممة بالكامل باللغة العربية لخدمة المستفيدين في المملكة العربية السعودية. جميع الواجهات والنماذج والوثائق باللغة العربية." },
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-right px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2.5 sm:gap-3 hover:bg-[#FAFAFA] transition-colors"
        data-testid={`faq-toggle-${item.q.slice(0, 20)}`}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#187860]/[0.06] flex items-center justify-center shrink-0">
          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#187860]" />
        </div>
        <span className="flex-1 font-medium text-foreground text-[12px] sm:text-sm leading-relaxed">{item.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[#1F2937]/40 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-5 pb-3 sm:pb-4 pe-11 sm:pe-16">
              <p className="text-[11px] sm:text-sm text-[#1F2937]/70 leading-[1.9]">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const filtered = FAQ_ITEMS.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = !searchQuery || item.q.includes(searchQuery) || item.a.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#ebebeb" }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img src={mojLogo} alt="وزارة العدل" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-[#187860] truncate">الأسئلة الشائعة</p>
              <p className="text-[10px] sm:text-xs text-[#1F2937]/40 truncate">منصة الوثائق القضائية</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} data-testid="button-faq-back"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-[#FAFAFA] active:bg-[#ebebeb] shrink-0"
            style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}>
            <ArrowRight className="w-4 h-4 text-[#1F2937]/60" />
          </button>
        </div>
      </header>

      <div className="relative overflow-hidden py-8 sm:py-14 px-3 sm:px-4" style={{ background: "linear-gradient(135deg, #187860 0%, #075e4a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 mb-3 sm:mb-4">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">الأسئلة الشائعة</h1>
            <p className="text-white/60 text-[11px] sm:text-sm mb-4 sm:mb-6 px-2">إجابات شاملة على كل ما تحتاج معرفته عن منصة الوثائق القضائية</p>
            <div className="relative max-w-md mx-auto px-2 sm:px-0">
              <Search className="absolute end-5 sm:end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2937]/40" />
              <Input
                placeholder="ابحث في الأسئلة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pe-10 bg-white/95 border-0 rounded-xl h-9 sm:h-10 text-xs sm:text-sm placeholder:text-[#1F2937]/40"
                data-testid="input-faq-search"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8 flex-1">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === "all"
                ? "bg-[#187860] text-white font-medium"
                : "bg-[#FAFAFA] text-[#1F2937]/70 hover:bg-[#ebebeb] border border-[#ebebeb]"
            }`}
            data-testid="button-faq-category-all"
          >
            الكل ({FAQ_ITEMS.length})
          </button>
          {FAQ_CATEGORIES.map(cat => {
            const count = FAQ_ITEMS.filter(i => i.category === cat.id).length;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-[#187860] text-white font-medium"
                    : "bg-[#FAFAFA] text-[#1F2937]/70 hover:bg-[#ebebeb] border border-[#ebebeb]"
                }`}
                data-testid={`button-faq-category-${cat.id}`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-[#1F2937]/20 mx-auto mb-3" />
              <p className="text-[#1F2937]/40 text-sm">لا توجد نتائج تطابق بحثك</p>
            </div>
          )}
          {filtered.map((item, i) => {
            const stableKey = `${item.category}-${item.q}`;
            return (
              <motion.div
                key={stableKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <FAQItem
                  item={item}
                  isOpen={openItems.has(stableKey)}
                  onToggle={() => toggleItem(stableKey)}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 text-center bg-[#187860]/[0.03] rounded-2xl p-5 sm:p-8 border border-[#ebebeb]">
          <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#187860] mx-auto mb-2.5 sm:mb-3" />
          <h3 className="font-bold text-foreground text-sm sm:text-base mb-1.5 sm:mb-2">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-[11px] sm:text-sm text-[#1F2937]/50 mb-3 sm:mb-4">يمكنك استخدام المساعد الذكي في بوابة المستفيد أو التواصل معنا</p>
          <Button
            onClick={() => navigate("/beneficiary")}
            className="bg-[#187860] hover:bg-[#075e4a] text-white rounded-xl font-medium text-xs sm:text-sm h-9 sm:h-10"
            data-testid="button-faq-to-beneficiary"
          >
            الذهاب لبوابة المستفيد
          </Button>
        </div>
      </div>

      <MojFooter />
    </div>
  );
}
