import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { HelpCircle, Info, MessageSquare, Star, FileText, Eye, Phone, Mail, ChevronUp } from "lucide-react";
import { SiFacebook, SiYoutube, SiLinkedin, SiInstagram, SiX } from "react-icons/si";
import mojFullLogo from "@assets/IMG_3679_1775729102413.png";
import visionLogo from "@assets/2030-logo-1-300x219_1775649111665.png";

const socialLinks = [
  { icon: SiX, label: "X", href: "https://x.com/MojKsa" },
  { icon: SiInstagram, label: "Instagram", href: "https://www.instagram.com/mojksa" },
  { icon: SiLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/mojksa" },
  { icon: SiYoutube, label: "YouTube", href: "https://www.youtube.com/@ksamoj" },
  { icon: SiFacebook, label: "Facebook", href: "https://www.facebook.com/SaudiMoj" },
];

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 start-6 z-30 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{ background: "#187860", color: "#ffffff", marginBottom: "env(safe-area-inset-bottom)" }}
      data-testid="button-scroll-top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

export default function MojFooter() {
  const [, navigate] = useLocation();
  const [fontScale, setFontScale] = useState(0);
  const [highContrast, setHighContrast] = useState(false);

  const changeFontSize = (delta: number) => {
    const newScale = fontScale + delta;
    if (newScale < -2 || newScale > 3) return;
    setFontScale(newScale);
    document.documentElement.style.fontSize = `${100 + newScale * 10}%`;
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle("high-contrast");
  };

  return (
    <>
      <ScrollToTopButton />
      <footer className="print:hidden mt-auto" dir="rtl" style={{ background: "#f7f7f7", borderTop: "1px solid #ebebeb" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          <div className="flex flex-col items-center mb-10">
            <img src={mojFullLogo} alt="وزارة العدل" className="h-20 sm:h-24 object-contain mb-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 sm:gap-6 mb-10 relative">
            <div className="block sm:hidden absolute top-1/2 inset-x-[7.5%] w-[85%] border-t" style={{ borderColor: "#e5e5e5" }} />

            <div className="text-center sm:text-start">
              <p className="text-[13px] font-bold text-[#1F2937] mb-4">عن المنصة</p>
              <div className="space-y-2.5">
                {[
                  { label: "مزايا المنصة", path: "/features", icon: Star },
                  { label: "عن المبادرة", path: "/about", icon: Info },
                  { label: "العرض التقديمي", path: "/presentation", icon: FileText },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 w-full text-[11px] text-[#1F2937]/50 hover:text-[#187860] transition-colors justify-center sm:justify-start group"
                    data-testid={`footer-link-${link.path.replace("/", "")}`}>
                    <link.icon className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center sm:text-start">
              <p className="text-[13px] font-bold text-[#1F2937] mb-4">روابط سريعة</p>
              <div className="space-y-2.5">
                {[
                  { label: "الأسئلة الشائعة", path: "/faq", icon: HelpCircle },
                  { label: "شاركنا رأيك", path: "/contact", icon: MessageSquare },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 w-full text-[11px] text-[#1F2937]/50 hover:text-[#187860] transition-colors justify-center sm:justify-start group"
                    data-testid={`footer-link-${link.path.replace("/", "")}`}>
                    <link.icon className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center sm:text-start">
              <p className="text-[13px] font-bold text-[#1F2937] mb-4">تواصل معنا</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] text-[#1F2937]/50 justify-center sm:justify-start">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span dir="ltr">1950</span>
                </div>
                <a href="mailto:1950@moj.gov.sa" className="flex items-center gap-2 text-[11px] text-[#1F2937]/50 hover:text-[#187860] transition-colors justify-center sm:justify-start">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span dir="ltr">1950@moj.gov.sa</span>
                </a>
              </div>
            </div>

            <div className="text-center sm:text-start">
              <p className="text-[13px] font-bold text-[#1F2937] mb-4">أدوات المساعدة</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={toggleContrast}
                  className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${highContrast ? "border-[#187860] text-[#187860] bg-[#187860]/10" : "border-[#d0d0d0] text-[#1F2937]/35 hover:text-[#187860] hover:border-[#187860]/30"}`}
                  title="أبيض وأسود"
                  data-testid="button-high-contrast"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => changeFontSize(1)}
                  disabled={fontScale >= 3}
                  className="w-8 h-8 rounded-full border-[1.5px] border-[#d0d0d0] flex items-center justify-center text-[#1F2937]/35 hover:text-[#187860] hover:border-[#187860]/30 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="تكبير الخط"
                  data-testid="button-increase-font"
                >
                  <span className="text-[11px] font-bold">+A</span>
                </button>
                <button
                  onClick={() => changeFontSize(-1)}
                  disabled={fontScale <= -2}
                  className="w-8 h-8 rounded-full border-[1.5px] border-[#d0d0d0] flex items-center justify-center text-[#1F2937]/35 hover:text-[#187860] hover:border-[#187860]/30 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="تصغير الخط"
                  data-testid="button-decrease-font"
                >
                  <span className="text-[11px] font-bold">-A</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mb-6" style={{ borderColor: "#e0e0e0" }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                {socialLinks.map(social => {
                  const Icon = social.icon;
                  return (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#1F2937]/30 hover:text-white hover:bg-[#187860] hover:border-[#187860] bg-white transition-all duration-200 hover:scale-110"
                      aria-label={social.label}
                      data-testid={`footer-social-${social.label.toLowerCase()}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
              <img src={visionLogo} alt="رؤية 2030" className="h-12 sm:h-14 object-contain opacity-60" />
            </div>
          </div>

          <div className="border-t pt-5" style={{ borderColor: "#e0e0e0" }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] text-[#1F2937]/35">مبادرة مقدمة من/ <a href="mailto:mbmaabdi@moj.gov.sa" className="text-[#187860] hover:text-[#075e4a] transition-colors underline decoration-[#187860]/30">محمد بخيت حميد المعبدي</a></p>
              <p className="text-[10px] text-[#1F2937]/35">جميع الحقوق محفوظة © ١٤٤٧ هـ</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
