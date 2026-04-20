import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, MapPin, Phone, Mail, Clock, Send, Building2,
  MessageSquare, Globe, CheckCircle, Paperclip, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MojFooter from "@/components/moj-footer";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

export default function ContactPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", nationalId: "", email: "", phone: "", subject: "", message: "" });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast({ title: "تم إرسال رسالتك بنجاح", description: "سنتواصل معك في أقرب وقت ممكن" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#ebebeb" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mojLogo} alt="وزارة العدل" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <div>
              <p className="text-sm sm:text-base font-bold text-[#187860]">تواصل معنا</p>
              <p className="text-[10px] sm:text-xs text-[#1F2937]/40">منصة الوثائق القضائية</p>
            </div>
          </div>
          <button onClick={() => navigate("/")} data-testid="button-back-home"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-[#ebebeb]/50 active:bg-[#ebebeb]"
            style={{ background: "#FFFFFF", border: "1px solid #ebebeb" }}>
            <ArrowRight className="w-4 h-4 text-[#1F2937]/70" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-3 sm:mb-4"
            style={{ background: "rgba(24,120,96,0.06)", border: "1px solid rgba(24,120,96,0.15)" }}>
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#187860" }} />
          </div>
          <h2 className="text-xl sm:text-3xl font-black mb-1.5 sm:mb-2 text-foreground">نسعد بتواصلك</h2>
          <p className="text-muted-foreground text-[13px] sm:text-base max-w-lg mx-auto px-2">
            فريقنا جاهز لمساعدتك والإجابة على استفساراتك حول منصة الوثائق القضائية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              {
                icon: Building2,
                title: "العنوان",
                lines: ["وزارة العدل", "الرياض، المملكة العربية السعودية", "حي المعذر، طريق الملك فهد"],
                iconColor: "#187860"
              },
              {
                icon: Phone,
                title: "الهاتف",
                lines: ["الرقم الموحد: 1950", "هاتف: 011-4057777"],
                iconColor: "#187860"
              },
              {
                icon: Mail,
                title: "البريد الإلكتروني",
                lines: ["info@moj.gov.sa"],
                iconColor: "#187860"
              },
              {
                icon: Clock,
                title: "ساعات العمل",
                lines: ["الأحد إلى الخميس", "٧:٣٠ صباحاً إلى ٢:٣٠ مساءً", "الجمعة والسبت: إجازة رسمية"],
                iconColor: "#187860"
              },
              {
                icon: Globe,
                title: "الموقع الإلكتروني",
                lines: ["www.moj.gov.sa"],
                iconColor: "#187860"
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-shadow"
                data-testid={`contact-info-${i}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.iconColor}10`, border: `1px solid ${item.iconColor}15` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1 text-foreground">{item.title}</p>
                  {item.lines.map((line, j) => (
                    <p key={j} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl border" style={{ background: "rgba(14,59,46,0.03)", borderColor: "rgba(14,59,46,0.12)" }}>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">ملاحظة:</span> للاستفسارات العاجلة المتعلقة بالطلبات، يُرجى استخدام المساعد الذكي المتوفر في بوابة المستفيد أو الاتصال على الرقم الموحد 1950.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border bg-card p-5 sm:p-8 shadow-sm">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(4,120,87,0.1)" }}>
                    <CheckCircle className="w-8 h-8 text-[#187860]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">تم إرسال رسالتك بنجاح</h3>
                  <p className="text-sm text-muted-foreground mb-6">سيتم الرد عليك خلال 1-3 أيام عمل</p>
                  <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", nationalId: "", email: "", phone: "", subject: "", message: "" }); setAttachments([]); }}
                    data-testid="button-send-another">
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-bold text-lg mb-1 text-foreground">إرسال</h3>
                  <p className="text-xs text-muted-foreground mb-4">الحقول المميزة بـ (*) مطلوبة</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium text-xs mb-1.5 block">الاسم الكامل *</Label>
                      <Input placeholder="أدخل اسمك" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        data-testid="input-contact-name" />
                    </div>
                    <div>
                      <Label className="font-medium text-xs mb-1.5 block">رقم الهوية *</Label>
                      <Input placeholder="أدخل رقم الهوية الوطنية" dir="ltr" className="text-left"
                        value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                        maxLength={10}
                        data-testid="input-contact-national-id" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium text-xs mb-1.5 block">البريد الإلكتروني *</Label>
                      <Input type="email" placeholder="بريدك الإلكتروني" dir="ltr" className="text-left"
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        data-testid="input-contact-email" />
                    </div>
                    <div>
                      <Label className="font-medium text-xs mb-1.5 block">رقم الجوال</Label>
                      <Input placeholder="05XXXXXXXX" dir="ltr" className="text-left"
                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        data-testid="input-contact-phone" />
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-xs mb-1.5 block">الموضوع *</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectTrigger data-testid="select-contact-subject">
                        <SelectValue placeholder="اختر الموضوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inquiry">استفسار عام</SelectItem>
                        <SelectItem value="support">دعم فني</SelectItem>
                        <SelectItem value="complaint">شكوى</SelectItem>
                        <SelectItem value="suggestion">اقتراح تحسين</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-medium text-xs mb-1.5 block">نص الرسالة *</Label>
                    <Textarea placeholder="اكتب رسالتك هنا..." rows={5}
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      data-testid="input-contact-message" />
                  </div>

                  <div>
                    <Label className="font-medium text-xs mb-1.5 block">إضافة مرفق</Label>
                    <div
                      className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "#ebebeb" }}
                      onClick={() => document.getElementById("contact-file-input")?.click()}
                      data-testid="button-add-attachment"
                    >
                      <Paperclip className="w-6 h-6 mx-auto mb-2 text-[#1F2937]/40" />
                      <p className="text-xs text-[#1F2937]/50">اضغط لإرفاق ملف</p>
                      <p className="text-[10px] text-[#1F2937]/40 mt-1">PDF, JPG, PNG الحد الأقصى 10 ميغابايت</p>
                    </div>
                    <input
                      id="contact-file-input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setAttachments(prev => [...prev, ...files]);
                        e.target.value = "";
                      }}
                    />
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-[#ebebeb] px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip className="w-3.5 h-3.5 text-[#1F2937]/40 shrink-0" />
                              <span className="text-xs text-[#1F2937]/60 truncate">{file.name}</span>
                              <span className="text-[10px] text-[#1F2937]/40 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-[#1F2937]/40 hover:text-[#B42318] transition-colors shrink-0 me-1"
                              data-testid={`button-remove-attachment-${i}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full font-medium text-white py-5 rounded-xl" disabled={sending}
                    style={{ background: "#187860" }}
                    data-testid="button-submit-contact">
                    {sending ? (
                      <span className="flex items-center gap-2">جارٍ الإرسال...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        إرسال
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <MojFooter />
    </div>
  );
}
