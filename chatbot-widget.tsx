import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Bot, CreditCard, Search, ChevronRight, ChevronDown,
  FileText, Users, LayoutGrid, ClipboardList, Headphones
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CHATBOT_FAQ, CHATBOT_CATEGORIES, CHATBOT_GREETINGS,
  matchChatbotQuery, normalizeArabic
} from "@/lib/data";

type ChatMsg = { from: "user" | "bot"; text: string; suggestions?: string[]; timestamp?: string };

function getTimeLabel(): string {
  return "منذ ثوان";
}

function getGreeting(): string {
  const h = new Date().getHours();
  const period = h >= 5 && h < 12 ? "morning" : h >= 12 ? "afternoon" : "default";
  const greetings = CHATBOT_GREETINGS[period] || CHATBOT_GREETINGS.default;
  return greetings[Math.floor(Math.random() * greetings.length)];
}

const WELCOME_MSG = "مرحباً بك في المساعد الرقمي للإجابة على الأسئلة المتعلقة بخدمات الوثائق القضائية.\nيمكنني حالياً مساعدتك في التعرف على خدمات المنصة وإجراءاتها.\n\n(الرجاء عدم مشاركة البيانات الشخصية من خلال المساعد الرقمي)";
const DISCLAIMER_MSG = "تنبيه:\nلا تعد المعلومات التي قد يقدمها هذا المساعد الرقمي استشارة قانونية.\nالإجابات مبنية على الأسئلة الشائعة وقد لا تغطي جميع الحالات.";

const SMART_REPLIES: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [
      /السلام\s*عليكم/,
      /^السلام/,
      /^وعليكم\s*السلام/,
      /^(هلا|مرحبا|اهلا|هاي|يا\s*هلا|حياك|الله\s*يحييك)/,
      /^(مساء|صباح)\s*(الخير|النور|الورد)/,
      /سلام\s*عليكم/,
      /^سلام$/,
    ],
    response: "وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك.\n\nكيف يمكنني مساعدتك اليوم؟\n\nيمكنك سؤالي عن:\n• الخدمات المتاحة والرسوم\n• كيفية تقديم طلب جديد\n• متابعة حالة طلبك\n• المستندات المطلوبة"
  },
  {
    patterns: [
      /بترد\s*السلام/,
      /ترد\s*السلام/,
      /رد\s*السلام/,
      /ما\s*رديت/,
      /مارديت/,
      /ليش\s*ما\s*رديت/,
      /وين\s*السلام/,
      /اتوقعت.*سلام/,
      /توقعت.*سلام/,
      /ما\s*سلمت/,
    ],
    response: "وعليكم السلام ورحمة الله وبركاته! عذراً على التأخير.\n\nأهلاً وسهلاً بك في المساعد الرقمي لوزارة العدل.\nكيف يمكنني خدمتك؟"
  },
  {
    patterns: [
      /كيف\s*(حالك|الحال)/,
      /^(شلونك|كيفك|عساك بخير|عساك طيب)/,
      /وش\s*اخبارك/,
      /ايش\s*اخبارك/,
      /شخبارك/,
    ],
    response: "الحمد لله بخير! شكراً لسؤالك.\nأنا جاهز لمساعدتك. وش أقدر أسوي لك؟"
  },
  {
    patterns: [
      /^(شكرا|مشكور|الله\s*يعطيك|يعطيك\s*العافي|تسلم|جزاك\s*الله|بارك\s*الله|ما\s*قصرت|يعافيك)/,
      /شكرا\s*(لك|جزيلا)/,
      /مشكور\s*(يالغالي|كثير|جدا)/,
    ],
    response: "العفو! سعيد بمساعدتك. هل لديك أسئلة أخرى؟"
  },
  {
    patterns: [
      /^(لا\s*شكرا|مافي|خلاص|تمام|اوكي|باي|مع\s*السلامه|الله\s*يسلمك)/,
      /^لا\s*بس$/,
      /ما\s*عندي\s*(شي|اسئل)/,
      /كذا\s*تمام/,
      /كفايه/,
      /يكفي/,
    ],
    response: "شكراً لتواصلك مع المساعد الرقمي لوزارة العدل. نتمنى لك يوماً سعيداً!\n\nلا تتردد بالعودة في أي وقت."
  },
  {
    patterns: [
      /انت\s*(روبوت|آلي|بوت|برنامج|ذكاء\s*اصطناعي|مو\s*بشر)/,
      /هل\s*انت\s*(بشر|انسان|شخص|حقيقي)/,
      /وش\s*انت/,
      /ايش\s*انت/,
      /من\s*انت/,
      /مين\s*انت/,
    ],
    response: "أنا المساعد الرقمي لمنصة الوثائق القضائية التابعة لوزارة العدل.\n\nمهمتي مساعدتك في:\n• الإجابة على أسئلتك عن خدمات المنصة\n• شرح إجراءات تقديم الطلبات\n• توضيح الرسوم وطرق السداد\n\nلست بشراً، لكنني أفهم العربية الفصحى واللهجة السعودية."
  },
  {
    patterns: [
      /ما\s*تفهم/,
      /مو\s*فاهم/,
      /ما\s*فهمت/,
      /غبي/,
      /ما\s*تنفع/,
      /سيء|سيئ/,
      /ما\s*عندك\s*فايد/,
      /بايخ/,
      /ما\s*يرد/,
      /ما\s*يفيد/,
    ],
    response: "أعتذر عن أي إزعاج! أنا أتعلم وأتحسن باستمرار.\n\nيمكنني مساعدتك بشكل أفضل إذا:\n• صغت سؤالك بطريقة مختلفة\n• اخترت موضوعاً من القائمة أدناه\n\nأو يمكنك التواصل مع الدعم البشري على الرقم الموحد 1950"
  },
  {
    patterns: [
      /^(وش|ايش|ماذا)\s*(هي|هو|يعني|معنى)\s*(المنصة|البوابة|الموقع|هالمنصة|النظام|الخدمة)/,
      /عن\s*(المنصة|البوابة|الموقع)/,
      /عرفني\s*(عن|على)\s*(المنصة|الموقع)/,
    ],
    response: "بوابة خدمات الوثائق القضائية هي منصة إلكترونية تابعة لوزارة العدل تتيح للمستفيدين:\n\n• طلب نسخ مصدقة من أوراق الدعاوى\n• الاطلاع على أوراق القضايا\n• طلب نسخ بديلة للوثائق المفقودة\n\nكل ذلك إلكترونياً دون الحاجة لزيارة المحكمة."
  },
  {
    patterns: [
      /ايش الفايد/,
      /وش الفايد/,
      /ليش\s*استخدم/,
      /فايدة\s*المنصة/,
      /ليه\s*اقدم\s*الكتروني/,
      /وش\s*يفيدني/,
    ],
    response: "فوائد استخدام المنصة:\n\n• توفير الوقت: لا حاجة لزيارة المحكمة\n• متاحة 24 ساعة: قدّم طلبك في أي وقت\n• سهولة المتابعة: تتبع طلبك لحظة بلحظة\n• دفع إلكتروني: بدون الحاجة لتحويل بنكي\n• وثائق رقمية معتمدة: بنفس حجية الورقية\n• إشعارات فورية: تنبيهات عند كل تحديث"
  },
  {
    patterns: [
      /ابغى\s*(اسال|أسأل|استفسر)/,
      /عندي\s*(سوال|سؤال|استفسار)/,
      /ممكن\s*(اسال|أسأل|استفسر)/,
      /ابي\s*(اسال|أسأل)/,
    ],
    response: "بالتأكيد! تفضل بسؤالك وأنا جاهز للإجابة.\n\nيمكنك أيضاً اختيار موضوع من القائمة أدناه لتصفح الأسئلة الشائعة."
  },
  {
    patterns: [
      /^(ساعدني|ابغى\s*مساعده|ابي\s*مساعده|محتاج\s*مساعد|احتاج\s*مساعد)/,
      /ممكن\s*تساعدني/,
      /تقدر\s*تساعدني/,
    ],
    response: "بالتأكيد! أنا هنا لمساعدتك.\n\nقلي وش تحتاج بالضبط:\n• معلومات عن الخدمات؟\n• كيفية تقديم طلب جديد؟\n• متابعة طلب حالي؟\n• الرسوم وطرق السداد؟\n• أي شيء ثاني؟"
  },
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "bot", text: WELCOME_MSG, timestamp: getTimeLabel() },
    { from: "bot", text: DISCLAIMER_MSG, timestamp: getTimeLabel() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, open, isTyping]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (text: string, suggestions?: string[]) => {
    setIsTyping(true);
    const delay = Math.min(400 + text.length * 3, 1500);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text, suggestions, timestamp: getTimeLabel() }]);
    }, delay);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!disclaimerAccepted) return;
    setMessages((prev) => [...prev, { from: "user", text: suggestion }]);
    processQuery(suggestion);
  };

  const processQuery = (q: string) => {
    const normalized = normalizeArabic(q);
    for (const sr of SMART_REPLIES) {
      if (sr.patterns.some(p => p.test(normalized))) {
        addBotMessage(sr.response);
        return;
      }
    }

    const { match, score, relatedSuggestions } = matchChatbotQuery(q);
    if (match && score >= 2) {
      setConversationContext(prev => [...prev.slice(-3), match.category]);
      const suggestions = relatedSuggestions.slice(0, 3);
      addBotMessage(match.answer, suggestions.length > 0 ? suggestions : undefined);
    } else if (relatedSuggestions.length > 0) {
      addBotMessage("أعتقد أن سؤالك يتعلق بأحد هذه المواضيع. اختر الأقرب لسؤالك:", relatedSuggestions.slice(0, 4));
    } else {
      const lastCtx = conversationContext[conversationContext.length - 1];
      const contextSuggestions = lastCtx
        ? CHATBOT_FAQ.filter(f => f.category === lastCtx).slice(0, 3).map(f => f.question)
        : ["ما أنواع الخدمات المتاحة؟", "كيف أقدم طلبًا جديدًا؟", "ما رسوم الخدمة؟"];
      addBotMessage("عذراً، لم أستطع فهم سؤالك بشكل دقيق.\n\nجرّب:\n• اختيار سؤال من الأسئلة المقترحة أدناه\n• صياغة سؤالك بكلمات مختلفة\n• تصفح القائمة الرئيسية\n• أو تواصل مع الدعم على الرقم الموحد 1950", contextSuggestions);
    }
  };

  const sendMessage = () => {
    const q = input.trim();
    if (!q || isTyping || !disclaimerAccepted) return;
    setMessages((prev) => [...prev, { from: "user", text: q }]);
    setInput("");
    processQuery(q);
  };

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    addBotMessage(getGreeting());
  };

  const handleCategorySelect = (catId: string) => {
    setShowCategories(false);
    const catFaqs = CHATBOT_FAQ.filter(f => f.category === catId);
    if (catFaqs.length > 0) {
      const catLabel = CHATBOT_CATEGORIES.find(c => c.id === catId)?.label || "";
      addBotMessage(`إليك الأسئلة المتعلقة بـ «${catLabel}»:\nاختر سؤالك:`, catFaqs.slice(0, 4).map(f => f.question));
    }
  };

  const getContextualSuggestions = (): string[] => {
    if (!disclaimerAccepted) return [];
    const userMsgCount = messages.filter(m => m.from === "user").length;
    if (userMsgCount === 0) return ["كيف أقدم طلب جديد؟", "كم رسوم الخدمة؟", "ما المستندات المطلوبة؟"];
    const lastBotMsg = [...messages].reverse().find(m => m.from === "bot");
    if (lastBotMsg?.suggestions && lastBotMsg.suggestions.length > 0) return [];
    const lastCtx = conversationContext[conversationContext.length - 1];
    if (lastCtx === "fees") return ["كيف أسدد الرسوم؟", "هل يمكن الاسترداد؟"];
    if (lastCtx === "tracking") return ["كم يستغرق الإنجاز؟", "ما معنى محال؟"];
    if (lastCtx === "submission") return ["ما المستندات المطلوبة؟", "من يحق له التقديم؟"];
    return ["تقديم طلب جديد", "متابعة طلب", "الرسوم والسداد"];
  };

  const BotMsgBubble = ({ msg, index }: { msg: ChatMsg; index: number }) => (
    <div className="flex gap-2 items-start justify-end">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-[9px] text-[#1F2937]/35">{msg.timestamp}</span>
          <span className="text-[11px] font-medium text-[#187860]">المساعد الرقمي</span>
        </div>
        <div className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13px] whitespace-pre-line leading-[1.7] bg-white shadow-sm"
          style={{ color: "#374151" }}>
          {msg.text}
        </div>
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 justify-end">
            {msg.suggestions.map((s, si) => (
              <button key={si} onClick={() => handleSuggestionClick(s)}
                className="text-[11px] text-[#187860] rounded-lg px-2.5 py-1.5 hover:bg-[#187860]/[0.08] transition-colors text-start leading-tight max-w-[90%] bg-white border border-[#187860]/10 shadow-sm"
                data-testid={`button-suggestion-${index}-${si}`}>
                {s.length > 40 ? s.slice(0, 40) + "..." : s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-5 shadow-sm"
        style={{ background: "#e8f5ee" }}>
        <Bot className="w-3.5 h-3.5 text-[#187860]" />
      </div>
    </div>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 end-6 z-50 w-12 h-12 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#187860]/20 print:hidden"
        style={{ background: "#187860", color: "#ffffff", marginBottom: "env(safe-area-inset-bottom)" }}
        data-testid="button-open-chatbot"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed z-50 flex flex-col overflow-hidden inset-0 sm:top-auto rounded-none sm:rounded-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[95vw] sm:max-w-md"
              style={{ maxHeight: "100vh", background: "#f5f5f5" }}
              dir="rtl"
            >
              <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1a8a6a 0%, #187860 100%)", paddingTop: "max(14px, env(safe-area-inset-top))" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white leading-tight">المساعد الرقمي</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                      <p className="text-[10px] text-white/70">متصل الآن</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  data-testid="button-minimize-chatbot"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                >
                  <ChevronDown className="w-4 h-4 text-white/80" />
                </button>
              </div>

              <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5 overscroll-contain touch-pan-y relative"
                style={{ WebkitOverflowScrolling: "touch", background: "#f5f5f5" }}
              >
                {messages.map((m, i) => (
                  <div key={i}>
                    {m.from === "bot" ? (
                      <BotMsgBubble msg={m} index={i} />
                    ) : (
                      <div className="flex gap-2 items-start justify-start">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-5 shadow-sm"
                          style={{ background: "#187860" }}>
                          <Users className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-medium text-[#1F2937]/50">أنت</span>
                          </div>
                          <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] whitespace-pre-line leading-[1.7] shadow-sm"
                            style={{ background: "#187860", color: "white" }}>
                            {m.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {!disclaimerAccepted && !isTyping && (
                  <div className="flex justify-end pt-1">
                    <button onClick={handleAcceptDisclaimer}
                      className="text-[13px] font-medium px-6 py-2.5 rounded-xl text-white transition-colors shadow-sm hover:shadow-md"
                      style={{ background: "#187860" }}
                      data-testid="button-accept-disclaimer">
                      موافق
                    </button>
                  </div>
                )}

                {isTyping && (
                  <div className="flex gap-2 items-start justify-end">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className="text-[11px] font-medium text-[#187860]">المساعد الرقمي</span>
                      </div>
                      <div className="rounded-2xl rounded-tr-sm px-3.5 py-3 bg-white shadow-sm">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#187860", animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#187860", animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#187860", animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-5 shadow-sm"
                      style={{ background: "#e8f5ee" }}>
                      <Bot className="w-3.5 h-3.5 text-[#187860]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />

                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="sticky bottom-2 mx-auto block w-9 h-9 rounded-xl flex items-center justify-center text-white z-10 shadow-md"
                      style={{ background: "#187860" }}
                      data-testid="button-scroll-bottom"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {disclaimerAccepted && (
                <div className="flex-shrink-0 border-t" style={{ borderColor: "#ebebeb", background: "#FFFFFF" }}>
                  {showCategories && (
                    <div className="grid grid-cols-3 gap-1.5 p-3 border-b" style={{ borderColor: "#ebebeb", background: "#FFFFFF" }}>
                      {CHATBOT_CATEGORIES.map((cat) => (
                        <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white hover:bg-[#187860]/[0.03] transition-colors text-center"
                          data-testid={`button-category-${cat.id}`}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#187860]/[0.08]">
                            {cat.icon === "FileText" && <FileText className="w-3.5 h-3.5 text-[#187860]" />}
                            {cat.icon === "CreditCard" && <CreditCard className="w-3.5 h-3.5 text-[#187860]" />}
                            {cat.icon === "Search" && <Search className="w-3.5 h-3.5 text-[#187860]" />}
                            {cat.icon === "Send" && <Send className="w-3.5 h-3.5 text-[#187860]" />}
                            {cat.icon === "ClipboardList" && <ClipboardList className="w-3.5 h-3.5 text-[#187860]" />}
                            {cat.icon === "Headphones" && <Headphones className="w-3.5 h-3.5 text-[#187860]" />}
                          </div>
                          <span className="text-[9px] leading-tight text-[#1F2937]/50">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
                    {getContextualSuggestions().length > 0 && !isTyping && (
                      <div className="mb-2.5 flex items-center justify-center gap-3 text-[11px] flex-wrap">
                        <button onClick={() => setShowCategories(!showCategories)}
                          className="flex items-center gap-1 text-[#187860] hover:underline"
                          data-testid="button-chatbot-categories">
                          <LayoutGrid className="w-3 h-3" />
                          <span>القائمة الرئيسية</span>
                        </button>
                        <span className="text-[#ebebeb]">|</span>
                        {getContextualSuggestions().slice(0, 2).map((q) => (
                          <button key={q} onClick={() => handleSuggestionClick(q)}
                            className="text-[#187860] hover:underline">
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setShowCategories(!showCategories)}
                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-[#ebebeb]/50 bg-white active:bg-[#ebebeb]">
                        <ChevronRight className="w-3.5 h-3.5 text-[#1F2937]/40 rotate-180" />
                      </button>
                      <div className="flex-1 relative">
                        <Input value={input} onChange={(e) => setInput(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          className="ps-3 pe-10 h-10 sm:h-9 rounded-xl text-sm sm:text-[13px] border-[#ebebeb] bg-white"
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                          disabled={isTyping}
                          data-testid="input-chatbot-message" />
                        <button onClick={sendMessage} disabled={isTyping}
                          className="absolute start-1 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white transition-colors disabled:opacity-50 active:opacity-80"
                          style={{ background: "#187860" }}
                          data-testid="button-send-chatbot">
                          <Send className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
