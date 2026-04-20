import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Monitor, Users, Shield,
  Building2, MapPin, Layers, FileText, UserCheck, Briefcase, Crown, BarChart3,
  Clock, Zap, CheckCircle, Download, CreditCard, Bell, Search, MessageSquare,
  Star, QrCode, TrendingUp, Activity, Lock, Smartphone, Globe, Cpu, Eye,
  Maximize2, Minimize2, Target, Rocket, Scale,
  Stamp, ScanLine, ShieldCheck, Link, BadgeCheck, KeyRound,
  Play, Pause, HelpCircle, Route,
  AlertTriangle, XCircle, PhoneCall, ClipboardList, Timer, Landmark, X, Check,
  Flag, Calendar, Code, Database, Server, Wifi, Network, Award, Sparkles,
  FileDown, Loader2, Upload, Bot, MessageCircle, Headphones, LayoutGrid, FileX, Archive
} from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import mojLogo from "@assets/Ministry-of-Justice_(1)_1775587466447.png";

const APP_URL = "https://almabdi.com";

interface SlideProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  variant?: "default" | "dark" | "accent";
}

function Slide({ children, isFullscreen, variant = "default" }: SlideProps) {
  const bgClass = variant === "dark"
    ? "bg-[#187860]"
    : "bg-[#FAFAFA]";

  return (
    <div data-slide-content className={`relative w-full flex items-center justify-center ${isFullscreen ? "h-screen" : "h-[calc(100vh-80px)]"}`} style={{ background: "#1a1a1a" }} dir="rtl">
      <div className={`relative ${bgClass} shadow-2xl overflow-y-auto flex flex-col`} style={{ width: "min(100vw, calc((100vh - 80px) * 16 / 9))", height: isFullscreen ? "100vh" : "calc(100vh - 80px)", aspectRatio: "auto" }}>
        <div className="relative z-10 w-full mx-auto px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

function SlideTitle({ icon: Icon, title, subtitle, badge }: { icon: any; title: string; subtitle?: string; badge?: string }) {
  return (
    <div className="text-center mb-5 sm:mb-7 shrink-0">
      <motion.div
        className="inline-flex items-center gap-3 mb-2 sm:mb-3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <div className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl relative">
          <div className="absolute inset-0 rounded-xl shadow-sm" style={{ background: "rgba(199,168,108,0.08)", border: "1px solid rgba(199,168,108,0.25)" }} />
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A86C] relative z-10" />
        </div>
        {badge && (
          <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full" style={{ background: "rgba(199,168,108,0.1)", color: "#C7A86C", border: "1px solid rgba(199,168,108,0.2)" }}>{badge}</span>
        )}
      </motion.div>
      <motion.h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#187860] mb-1.5 leading-tight" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>{title}</motion.h2>
      {subtitle && (
        <motion.p className="text-[#1F2937]/60 text-[10px] sm:text-xs max-w-2xl mx-auto leading-relaxed" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>{subtitle}</motion.p>
      )}
      <div className="mt-3 sm:mt-4 mx-auto w-16 sm:w-20 h-px" style={{ background: "rgba(199,168,108,0.2)" }} />
    </div>
  );
}

function PremiumCard({ icon: Icon, title, desc, color = "#187860", index = 0 }: { icon: any; title: string; desc: string; color?: string; index?: number }) {
  return (
    <motion.div
      className="group bg-white rounded-xl border border-[#e8e8e8]/50 p-2.5 sm:p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 relative overflow-hidden"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-start gap-2 relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[#187860] text-[10px] sm:text-xs mb-0.5">{title}</h4>
          <p className="text-[8px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CompareRow({ label, before, after, index = 0 }: { label: string; before: string; after: string; index?: number }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      className={`grid grid-cols-[0.65fr_1fr_0.06fr_1fr] sm:grid-cols-[0.85fr_1.2fr_0.06fr_1.2fr] gap-0 items-stretch rounded-md overflow-hidden ${isEven ? "bg-[#fafafa]" : "bg-white"}`}
      initial={{ x: -8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-center gap-1 py-[4px] sm:py-[6px] px-1.5 sm:px-2.5 border-l border-[#187860]/10">
        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 bg-[#187860]/[0.07]">
          <span className="text-[7px] font-black text-[#187860]">{index + 1}</span>
        </div>
        <span className="font-bold text-[#1F2937] text-[8px] sm:text-[9.5px] lg:text-[10.5px]">{label}</span>
      </div>
      <div className="flex items-center gap-1 py-[4px] sm:py-[6px] px-1.5 sm:px-2 bg-[#B42318]/[0.03]">
        <XCircle className="w-2.5 h-2.5 text-[#B42318]/30 shrink-0" />
        <span className="text-[#B42318]/80 text-[8px] sm:text-[9.5px] lg:text-[10.5px] leading-tight">{before}</span>
      </div>
      <div className="flex items-center justify-center">
        <ArrowLeft className="w-2.5 h-2.5 text-[#187860]/25" />
      </div>
      <div className="flex items-center gap-1 py-[4px] sm:py-[6px] px-1.5 sm:px-2 bg-[#187860]/[0.03]">
        <CheckCircle className="w-2.5 h-2.5 text-[#187860]/40 shrink-0" />
        <span className="text-[#187860] text-[8px] sm:text-[9.5px] lg:text-[10.5px] font-medium leading-tight">{after}</span>
      </div>
    </motion.div>
  );
}

function TimelineStep({ step, title, desc, icon: Icon, isLast, index = 0 }: { step: string; title: string; desc: string; icon: any; isLast?: boolean; index?: number }) {
  return (
    <motion.div className="flex gap-2 sm:gap-3" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.04 }}>
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 shadow-md"
          style={{ background: "#187860", color: "white" }}>
          {step}
        </div>
        {!isLast && <div className="w-0.5 flex-1 my-0.5 rounded-full" style={{ background: "#C7A86C30" }} />}
      </div>
      <div className="pb-2 sm:pb-3 pt-0.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="w-3 h-3 text-[#C7A86C]" />
          <h4 className="font-bold text-[#187860] text-[10px] sm:text-xs">{title}</h4>
        </div>
        <p className="text-[8px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function SectionDivider({ number, title, subtitle, icon: Icon, color, isFullscreen }: {
  number: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  isFullscreen: boolean;
}) {
  return (
    <Slide isFullscreen={isFullscreen} variant="accent">
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100% - 2rem)" }}>
        <div className="text-center max-w-lg mx-auto">
          <motion.div
            className="relative inline-block mb-6"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <div className="absolute -inset-4 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-2xl relative mx-auto" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
              <Icon className="w-11 h-11 sm:w-13 sm:h-13 text-white relative z-10" />
              <div className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-md" style={{ background: "#C7A86C" }}>{number}</div>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl font-black mb-3 leading-tight"
            style={{ color }}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h2>

          <motion.div className="flex items-center justify-center gap-2 mb-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }}>
            <div className="w-12 h-0.5 rounded-full" style={{ background: `${color}15` }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#C7A86C" }} />
            <div className="w-20 h-0.5 rounded-full" style={{ background: color }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#C7A86C" }} />
            <div className="w-12 h-0.5 rounded-full" style={{ background: `${color}15` }} />
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 mx-auto max-w-md"
            style={{ borderColor: `${color}15` }}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm sm:text-base text-[#1F2937]/70 leading-relaxed">{subtitle}</p>
          </motion.div>
        </div>
      </div>
    </Slide>
  );
}

function MetricCard({ metric, impact, percent, desc, icon: Icon, color, index = 0 }: { metric: string; impact: string; percent: string; desc: string; icon: any; color: string; index?: number }) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-[#e8e8e8]/50 p-2.5 sm:p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] relative overflow-hidden"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-xl" style={{ background: color }} />
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}08` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-bold text-[10px] sm:text-xs text-[#187860]">{metric}</h4>
            <p className="text-[8px] sm:text-[10px] text-[#1F2937]/60">{impact}</p>
          </div>
        </div>
        <div className="text-left">
          <span className="text-base sm:text-lg font-black" style={{ color }}>{percent}</span>
          <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50">{desc}</p>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[#e8e8e8]/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: percent }}
          transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

const SLIDES = [
  {
    id: "cover",
    title: "الغلاف",
    section: "intro",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs} variant="dark">
        <div className="relative flex flex-col items-center justify-center h-full overflow-hidden" style={{ padding: "16px 0" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(199,168,108,0.08) 0%, transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-full h-1/2" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(7,94,74,0.3) 0%, transparent 70%)" }} />
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: [180, 120, 90][i],
                  height: [180, 120, 90][i],
                  border: "1px solid rgba(199,168,108,0.06)",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.2, duration: 0.8 }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-[700px] mx-auto">
            <motion.div
              className="flex flex-col items-center gap-1 mb-5"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.15 }}
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-full" style={{ background: "radial-gradient(circle, rgba(199,168,108,0.15) 0%, transparent 70%)" }} />
                <img
                  src={mojLogo}
                  alt="شعار وزارة العدل"
                  className="relative w-20 h-20 rounded-full object-contain"
                  style={{ background: "rgba(255,255,255,0.95)", padding: "6px", boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(199,168,108,0.2)" }}
                />
              </div>
              <p className="text-[13px] font-bold mt-2" style={{ color: "rgba(199,168,108,0.9)" }}>وزارة العدل</p>
              <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>المملكة العربية السعودية</p>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(199,168,108,0.4), transparent)" }} />
              <Scale className="w-4 h-4" style={{ color: "rgba(199,168,108,0.5)" }} />
              <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(199,168,108,0.4), transparent)" }} />
            </motion.div>

            <motion.h1
              className="text-center font-black leading-tight mb-2"
              style={{ fontSize: "clamp(36px, 5.5vw, 56px)" }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <span className="block text-white">منصة الوثائق</span>
              <span className="block" style={{ color: "#C7A86C" }}>القضائية</span>
            </motion.h1>

            <motion.div
              className="flex items-center gap-2 rounded-full px-5 py-2 mb-5"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(199,168,108,0.15)", backdropFilter: "blur(8px)" }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "#C7A86C" }} />
              <span className="text-[13px] font-bold text-white/80">مبادرة رقمنة الطلبات الورقية</span>
            </motion.div>

            <motion.p
              className="text-[12px] font-medium mb-6 text-center"
              style={{ color: "rgba(255,255,255,0.45)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              المحكمة العامة بمكة المكرمة
            </motion.p>

            <motion.div
              className="grid grid-cols-2 gap-4 w-full max-w-[580px]"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <div className="rounded-2xl p-5 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(199,168,108,0.12)", backdropFilter: "blur(8px)" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, rgba(199,168,108,0.3), transparent)" }} />
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(199,168,108,0.1)" }}>
                    <Award className="w-3.5 h-3.5" style={{ color: "#C7A86C" }} />
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>بدعم وإشراف من</p>
                </div>
                <p className="font-black text-[13px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.95)" }}>
                  <span className="block">فضيلة الشيخ</span>
                  <span className="block whitespace-nowrap">البراء بن سليمان بن محمد الربعي</span>
                </p>
                <div className="w-8 h-px mx-auto mb-2" style={{ background: "rgba(199,168,108,0.2)" }} />
                <p className="text-[11px] font-medium" style={{ color: "rgba(199,168,108,0.7)" }}>رئيس المحكمة العامة بمكة المكرمة</p>
              </div>

              <div className="rounded-2xl p-5 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(199,168,108,0.12)", backdropFilter: "blur(8px)" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, rgba(24,120,96,0.4), transparent)" }} />
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(24,120,96,0.15)" }}>
                    <Rocket className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>مبادرة من</p>
                </div>
                <p className="font-black text-[15px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.95)" }}>محمد بخيت حميد المعبدي</p>
                <div className="w-8 h-px mx-auto mb-2" style={{ background: "rgba(24,120,96,0.3)" }} />
                <p className="text-[11px] font-medium" style={{ color: "rgba(199,168,108,0.7)" }}>موظف بالمحكمة العامة بمكة المكرمة</p>
                <p className="text-[10px] mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.35)" }} dir="ltr">mbmaabdi@moj.gov.sa</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Slide>
    ),
  },

  {
    id: "toc",
    title: "محتوى العرض",
    section: "intro",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs} variant="accent">
        <SlideTitle icon={LayoutGrid} title="محتوى العرض" subtitle="٥ أقسام رئيسية تغطي المشكلة والحل والنظام والفائدة والأثر" badge="الفهرس" />
        <div className="space-y-3">
          {[
            { number: "١", title: "المشكلة", icon: AlertTriangle, color: "#B42318", desc: "الوضع الحالي قبل التحوّل الرقمي", subs: ["الوضع الحالي قبل التحوّل"] },
            { number: "٢", title: "الحل", icon: Rocket, color: "#C7A86C", desc: "المبادرة المقترحة وأهدافها", subs: ["الحل المقترح", "أهداف المبادرة"] },
            { number: "٣", title: "النظام", icon: Monitor, color: "#187860", desc: "البوابات الثلاث والبنية التقنية", subs: ["رحلة الطلب", "بوابة المستفيد (١/٢)", "بوابة المستفيد (٢/٢)", "بوابة الموظف (١/٢)", "بوابة الموظف (٢/٢)", "بوابة المدير (١/٢)", "بوابة المدير (٢/٢)", "الختم الرقمي", "الجهات القضائية", "البنية التقنية والتكامل"] },
            { number: "٤", title: "الفائدة", icon: TrendingUp, color: "#187860", desc: "المقارنات قبل وبعد التحوّل", subs: ["المقارنة البصرية", "المقارنة الزمنية"] },
            { number: "٥", title: "الأثر", icon: Landmark, color: "#187860", desc: "النتائج المتوقعة وخطة التنفيذ", subs: ["الأثر الاستراتيجي", "خارطة الطريق"] },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl border border-[#e8e8e8]/50 shadow-sm relative overflow-hidden"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="absolute top-0 right-0 w-1.5 h-full rounded-l-full" style={{ background: item.color }} />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: item.color }}>
                  <span className="text-white font-black text-base">{item.number}</span>
                </div>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                  <h3 className="font-black text-sm sm:text-base" style={{ color: item.color }}>{item.title}</h3>
                </div>
                <div className="h-8 w-px bg-[#e8e8e8]/60 shrink-0 mx-1" />
                <p className="text-[11px] sm:text-xs text-[#1F2937]/50 font-medium shrink-0 min-w-[140px]">{item.desc}</p>
                <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
                  {item.subs.map((sub, j) => (
                    <span key={j} className="text-[9px] sm:text-[10px] font-semibold px-2.5 py-1 rounded-lg border" style={{ color: item.color, background: `${item.color}08`, borderColor: `${item.color}18` }}>{sub}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Slide>
    ),
  },

  {
    id: "section-problem",
    title: "١ المشكلة",
    section: "problem",
    render: (fs: boolean) => (
      <SectionDivider
        number="١"
        title="المشكلة"
        subtitle="لماذا نحتاج التغيير؟ نظرة على التحديات الحالية"
        icon={AlertTriangle}
        color="#B42318"
        isFullscreen={fs}
      />
    ),
  },
  {
    id: "before-transformation",
    title: "الوضع الحالي",
    section: "problem",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={AlertTriangle} title="الوضع الحالي قبل التحوّل" subtitle="الإجراءات تتم يدويًا بتسلسل طويل ينتج عنه تحديات متعددة" badge="التحدي" />

        <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-3 shadow-sm mb-3 relative overflow-hidden" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]" />
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#B42318]/[0.06] flex items-center justify-center">
              <Route className="w-3.5 h-3.5 text-[#B42318]" />
            </div>
            <h3 className="font-black text-[#B42318] text-[11px] sm:text-xs">مسار الطلب اليدوي الحالي</h3>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            {[
              { num: "١", text: "رفع الطلب عبر البريد لقسم خدمات المستفيدين" },
              { num: "٢", text: "تحويل الطلب للدائرة القضائية المختصة" },
              { num: "٣", text: "طباعة الوثيقة والنموذج ورقياً" },
              { num: "٤", text: "حضور المستفيد للاستلام والتوقيع" },
              { num: "٥", text: "إرسال النموذج لقسم الخدمات المشتركة لرفعه للوزارة" },
              { num: "٦", text: "إصدار فاتورة للمستفيد لسداد رسوم التكاليف القضائية" },
            ].map((item, i) => (
              <motion.div key={i} className="flex-1 text-center" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-7 h-7 rounded-lg bg-[#B42318] flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0">{item.num}</div>
                  {i < 5 && <ChevronLeft className="w-4 h-4 text-[#B42318]/30 shrink-0" />}
                </div>
                <p className="text-[8px] sm:text-[9px] text-[#1F2937]/70 mt-1.5 leading-tight px-0.5">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="bg-[#B42318]/[0.03] rounded-xl border border-[#B42318]/8 p-2.5 mb-3" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
            <h3 className="font-black text-[#B42318] text-[10px] sm:text-[11px]">نتج عن هذا الإجراء</h3>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { icon: MapPin, text: "حضور شخصي إلزامي" },
              { icon: Route, text: "تعدد مراحل انتقال الطلب بين الأقسام" },
              { icon: ClipboardList, text: "تكرار الطباعة والإجراءات الورقية" },
              { icon: Timer, text: "تأخر بعض الطلبات نتيجة التسلسل اليدوي" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white rounded-lg p-2 border border-[#B42318]/8">
                <div className="w-6 h-6 rounded-md bg-[#B42318]/[0.06] flex items-center justify-center shrink-0">
                  <item.icon className="w-3 h-3 text-[#B42318]" />
                </div>
                <span className="font-bold text-[8px] sm:text-[9px] text-[#B42318]">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: UserCheck, role: "المستفيد", items: ["عدم وجود منصة إلكترونية لتقديم الطلبات", "عدم وجود وسيلة لمعرفة حالة الطلب", "يحضر شخصياً لاستلام الوثيقة ورقياً"], delay: 0.3 },
            { icon: Briefcase, role: "الموظف", items: ["لا يوجد مؤقت زمني ولا توزيع منظّم", "عبء العمل غير متوازن بين الموظفين", "عدم وجود مؤشر زمني للإنجاز"], delay: 0.38 },
            { icon: Crown, role: "المدير", items: ["عدم وجود مؤشرات أداء رقمية", "صعوبة تحديد الطلبات المتأخرة", "عدم وجود أداة قياس إنتاجية الموظفين"], delay: 0.46 },
          ].map((section, si) => (
            <motion.div key={si} className="bg-white rounded-xl border border-[#B42318]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: section.delay }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/70 rounded-t-xl" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#B42318]/[0.06] flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-[#B42318]" />
                </div>
                <h3 className="font-black text-[#B42318] text-xs">{section.role}</h3>
              </div>
              <div className="space-y-1.5">
                {section.items.map((text, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/80 bg-[#B42318]/[0.03] rounded-lg p-2 border border-[#B42318]/6">
                    <XCircle className="w-3 h-3 text-[#B42318] shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Slide>
    ),
  },

  {
    id: "section-solution",
    title: "٢ الحل",
    section: "solution",
    render: (fs: boolean) => (
      <SectionDivider number="٢" title="الحل" subtitle="ماذا نقترح لحل هذه التحديات؟" icon={Rocket} color="#C7A86C" isFullscreen={fs} />
    ),
  },
  {
    id: "the-solution",
    title: "الحل المقترح",
    section: "solution",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Rocket} title="الحل المقترح" subtitle="إنشاء منصة إلكترونية متكاملة لإدارة طلبات الوثائق القضائية" badge="الحل" />

        <motion.div className="solution-hero-card relative rounded-2xl overflow-hidden mb-3" style={{ background: "linear-gradient(135deg, #187860, #075e4a)", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
          <div className="relative p-4 sm:p-5 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <Monitor className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#ffffff" }} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base mb-1" style={{ color: "#ffffff" }}>إنشاء منصة رقمية موحدة</h3>
              <p className="text-[10px] sm:text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                بناء منصة إلكترونية متكاملة تستقبل طلبات المستفيدين وتوزّعها تلقائياً على الموظفين وتتابع مراحل المعالجة لحظياً حتى تسليم الوثيقة الرقمية المعتمدة
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { icon: UserCheck, title: "بوابة المستفيد", desc: "تقديم الطلبات ومتابعتها وسدادها واستلام الوثائق إلكترونياً من أي مكان", color: "#187860", num: "١" },
            { icon: Briefcase, title: "بوابة الموظف", desc: "استقبال الطلبات تلقائياً ومعالجتها عبر 4 أقسام مع مؤقت زمني حي", color: "#C7A86C", num: "٢" },
            { icon: Crown, title: "بوابة المدير", desc: "لوحة تحكم شاملة بإحصاءات لحظية وتنبيهات عاجلة وتحليلات أداء", color: "#187860", num: "٣" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 sm:p-4 shadow-sm relative overflow-hidden" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: item.color }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: `${item.color}0a`, border: `1px solid ${item.color}15` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ background: item.color }}>{item.num}</div>
              </div>
              <h4 className="font-black text-xs sm:text-sm mb-1" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-[9px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: FileText, label: "3 خدمات رقمية", desc: "نسخة مصدقة / اطلاع على أوراق الدعوى / نسخة بديلة", color: "#187860" },
            { icon: Building2, label: "كافة الجهات القضائية", desc: "محاكم + كتابة عدل + ديوان", color: "#C7A86C" },
            { icon: MapPin, label: "كافة مدن المملكة", desc: "تغطية شاملة للمملكة", color: "#187860" },
            { icon: Stamp, label: "ختم رقمي معتمد", desc: "توقيع مشفّر + رمز تحقق", color: "#C7A86C" },
          ].map((item, i) => (
            <motion.div key={i} className="rounded-xl p-2.5 sm:p-3 text-center relative" style={{ background: `${item.color}06`, border: `1px solid ${item.color}12` }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.06 }}>
              <item.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: item.color }} />
              <p className="text-[10px] sm:text-xs font-black mb-0.5" style={{ color: item.color }}>{item.label}</p>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50 leading-tight">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    id: "objectives",
    title: "أهداف المبادرة",
    section: "solution",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Target} title="لماذا هذه المبادرة؟" subtitle="التوافق مع التوجهات الاستراتيجية الوطنية والوزارية" badge="الأهداف" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: Rocket, title: "رؤية المملكة 2030", desc: "تحقيق مستهدف رقمنة الخدمات الحكومية في القطاع العدلي", color: "#C7A86C", num: "٢٠٣٠" },
            { icon: Building2, title: "توجهات الوزارة", desc: "أتمتة الإجراءات القضائية ورفع كفاءة الأداء", color: "#187860", num: "وزارة" },
            { icon: Landmark, title: "التحوّل المؤسسي", desc: "من بيئة ورقية حضورية إلى منظومة رقمية متكاملة", color: "#C7A86C", num: "رقمنة" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-sm relative overflow-hidden text-center" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm" style={{ background: `${item.color}10` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <h4 className="font-black text-xs sm:text-sm mb-1" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-[9px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { icon: FileX, title: "إلغاء الورق والحضور", desc: "لا تعبئة ورقية ولا مراجعة شخصية، تقديم إلكتروني من أي مكان", color: "#187860" },
            { icon: UserCheck, title: "تمكين المستفيد", desc: "خدمة ذاتية كاملة من التقديم حتى الاستلام دون تدخل بشري", color: "#C7A86C" },
            { icon: Sparkles, title: "الاستدامة", desc: "بنية تقنية قابلة للتوسع والتطوير المستمر لمواكبة المتطلبات المستقبلية", color: "#187860" },
          ].map((item, i) => (
            <PremiumCard key={i} icon={item.icon} title={item.title} desc={item.desc} color={item.color} index={i} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, title: "الحوكمة والشفافية", desc: "سجل تدقيق كامل لكل عملية + تتبع لحظي لحالة كل طلب", color: "#187860" },
            { icon: Scale, title: "العدالة التشغيلية", desc: "توزيع تلقائي متوازن للطلبات + مؤشرات أداء لكل موظف", color: "#C7A86C" },
            { icon: Rocket, title: "رؤية الوزارة للتحوّل الرقمي", desc: "مواكبة التوجه الرقمي للوزارة بأتمتة خدمات الوثائق القضائية وتقليل الإجراءات الورقية", color: "#187860" },
          ].map((item, i) => (
            <PremiumCard key={i} icon={item.icon} title={item.title} desc={item.desc} color={item.color} index={i + 3} />
          ))}
        </div>
      </Slide>
    ),
  },

  {
    id: "section-system",
    title: "٣ النظام",
    section: "system",
    render: (fs: boolean) => (
      <SectionDivider number="٣" title="النظام" subtitle="كيف يعمل النظام؟" icon={Monitor} color="#187860" isFullscreen={fs} />
    ),
  },
  {
    id: "journey",
    title: "رحلة الطلب",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Route} title="رحلة الطلب من التقديم إلى الاستلام" subtitle="المسار الرقمي الكامل عبر المنصة — من البداية إلى النهاية" badge="المسار" />

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 mb-3">
          {[
            { label: "المستفيد", icon: UserCheck, color: "#187860", steps: [
              { num: "١", icon: Shield, title: "تسجيل الدخول", desc: "التحقق عبر نفاذ" },
              { num: "٢", icon: FileText, title: "تعبئة النموذج", desc: "3 خطوات مختصرة" },
            ]},
            null,
            { label: "المعالجة الداخلية", icon: Briefcase, color: "#C7A86C", steps: [
              { num: "٣", icon: Zap, title: "التوزيع التلقائي", desc: "للموظف الأقل عبءً" },
              { num: "٤", icon: Activity, title: "مركز تدقيق الطلبات", desc: "مراجعة وقبول أو رفض" },
              { num: "٥", icon: UserCheck, title: "خدمات المستفيدين", desc: "قبول وإحالة للدائرة" },
              { num: "٦", icon: Scale, title: "الدائرة القضائية- القسم المختص", desc: "إنجاز وإرفاق المستند" },
            ]},
            null,
            { label: "النتيجة", icon: CheckCircle, color: "#187860", steps: [
              { num: "٧", icon: Stamp, title: "الختم الرقمي", desc: "توقيع + ختم + رمز تحقق" },
              { num: "٨", icon: CreditCard, title: "السداد الإلكتروني", desc: "مدى / سداد / آبل باي" },
              { num: "٩", icon: Download, title: "الاستلام أو الاطلاع", desc: "تحميل أو اطلاع محمي" },
            ]},
          ].map((col, ci) => {
            if (!col) return (
              <div key={ci} className="flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-[#C7A86C]" />
              </div>
            );
            return (
              <motion.div key={ci} className="bg-white rounded-xl border shadow-sm relative overflow-hidden" style={{ borderColor: `${col.color}15` }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ci * 0.06 }}>
                <div className="h-1 rounded-t-xl" style={{ background: col.color }} />
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${col.color}10` }}>
                      <col.icon className="w-3 h-3" style={{ color: col.color }} />
                    </div>
                    <h4 className="font-black text-[10px] sm:text-[11px]" style={{ color: col.color }}>{col.label}</h4>
                  </div>
                  <div className="space-y-1">
                    {col.steps.map((step, si) => (
                      <motion.div key={si} className="flex items-start gap-1.5 rounded-lg p-1.5 border" style={{ background: `${col.color}04`, borderColor: `${col.color}10` }} initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: ci * 0.06 + si * 0.04 }}>
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white font-black text-[8px] shrink-0" style={{ background: col.color }}>{step.num}</div>
                        <div>
                          <div className="flex items-center gap-1">
                            <step.icon className="w-2.5 h-2.5" style={{ color: col.color }} />
                            <span className="font-bold text-[9px] sm:text-[10px]" style={{ color: col.color }}>{step.title}</span>
                          </div>
                          <p className="text-[7px] sm:text-[8px] text-[#1F2937]/50 leading-tight">{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-2.5 shadow-sm relative overflow-hidden" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/60 rounded-t-xl" />
            <div className="flex items-center gap-2 mb-1.5">
              <XCircle className="w-4 h-4 text-[#B42318]" />
              <h4 className="font-black text-[#B42318] text-[10px] sm:text-[11px]">مسار الرفض والاعتراض</h4>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["رفض مع سبب إلزامي", "تبويب الطلبات المرفوضة", "اعتراض إلكتروني", "مراجعة المدير وقرار نهائي"].map((text, i) => (
                <span key={i} className="text-[8px] sm:text-[9px] bg-[#B42318]/[0.04] text-[#B42318] rounded-md px-2 py-1 border border-[#B42318]/10 font-medium">{text}</span>
              ))}
            </div>
          </motion.div>
          <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-2.5 shadow-sm relative overflow-hidden" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/60 rounded-t-xl" />
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-[#B42318]" />
              <h4 className="font-black text-[#B42318] text-[10px] sm:text-[11px]">نظام الشكاوى والتصعيد</h4>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["تأخر أكثر من 3 أيام عمل", "شكوى إلكترونية بنقرة", "إحالة تلقائية للمدير", "إحالة للقسم المختص"].map((text, i) => (
                <span key={i} className="text-[8px] sm:text-[9px] bg-[#B42318]/[0.04] text-[#B42318] rounded-md px-2 py-1 border border-[#B42318]/10 font-medium">{text}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </Slide>
    ),
  },
  {
    id: "beneficiary-1",
    title: "بوابة المستفيد (١)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={UserCheck} title="بوابة المستفيد — التقديم والمتابعة" subtitle="رحلة المستفيد من تسجيل الدخول حتى تقديم الطلب ومتابعته" badge="المستفيد ١/٢" />
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <motion.div className="bg-white rounded-2xl border border-[#187860]/10 p-4 shadow-sm relative overflow-hidden" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-2xl" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#187860]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#187860]" />
              </div>
              <h3 className="font-black text-[#187860] text-xs sm:text-sm">تقديم الطلب — 3 خطوات</h3>
            </div>
            <div className="space-y-2">
              {[
                { step: "١", title: "بيانات مقدم الطلب", desc: "الاسم + الهوية + المدينة + الجوال مع جلب تلقائي من أبشر" },
                { step: "٢", title: "تفاصيل القضية", desc: "نوع الطلب + رقم القضية + رقم الصك + تقويم هجري تفاعلي + مرفقات اختيارية" },
                { step: "٣", title: "المراجعة والإقرار", desc: "ملخص البيانات + إقرار بصحة المعلومات + الموافقة على الرسوم القضائية" },
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2.5 bg-[#187860]/[0.04] rounded-xl p-2.5 border border-[#187860]/8" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
                  <div className="w-7 h-7 rounded-lg bg-[#187860] flex items-center justify-center shrink-0 text-white font-black text-xs shadow-sm">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-[#187860] text-[11px] sm:text-xs">{item.title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2 mt-2.5">
              {[
                { icon: Cpu, label: "كشف التكرار" },
                { icon: FileDown, label: "حفظ المسودة" },
                { icon: Shield, label: "تحقق نفاذ" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-[8px] sm:text-[9px] text-[#187860] bg-[#187860]/[0.06] rounded-lg px-2 py-1 border border-[#187860]/10">
                  <item.icon className="w-2.5 h-2.5" />
                  <span className="font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-2xl border border-[#C7A86C]/15 p-4 shadow-sm relative overflow-hidden" initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C7A86C] rounded-t-2xl" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#C7A86C]/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[#C7A86C]" />
              </div>
              <h3 className="font-black text-[#C7A86C] text-xs sm:text-sm">5 تبويبات متابعة</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { tab: "متابعة الطلبات", desc: "عرض حالة كل طلب مع شريط تقدم (25%-50%-75%-100%) وإشعارات فورية", icon: Activity, color: "#187860" },
                { tab: "بانتظار السداد", desc: "الطلبات المكتملة تنتظر سداد الرسوم — زر سداد بجوار كل طلب", icon: CreditCard, color: "#C7A86C" },
                { tab: "المرفوضة", desc: "الطلبات المرفوضة مع عرض سبب الرفض وإمكانية تقديم اعتراض", icon: XCircle, color: "#B42318" },
                { tab: "المعترض عليها", desc: "متابعة حالة الاعتراضات المقدمة حتى صدور القرار النهائي", icon: Scale, color: "#C7A86C" },
                { tab: "المكتملة", desc: "أرشيف كامل مع بحث وفلترة وتصدير + تقييم بالنجوم", icon: CheckCircle, color: "#187860" },
              ].map((item, i) => (
                <motion.div key={i} className="flex items-center gap-2 rounded-lg p-2 border border-[#e8e8e8]/50 bg-[#FAFAFA]" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${item.color}10` }}>
                    <item.icon className="w-3 h-3" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[10px] sm:text-[11px]" style={{ color: item.color }}>{item.tab}</span>
                    <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50 leading-tight">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Slide>
    ),
  },
  {
    id: "beneficiary-2",
    title: "بوابة المستفيد (٢)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={UserCheck} title="بوابة المستفيد — الحماية والدعم" subtitle="السداد والاستلام وحماية الوثائق ونظام الشكاوى والمساعد الرقمي" badge="المستفيد ٢/٢" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { icon: CreditCard, title: "السداد الإلكتروني", desc: "زر سداد يفتح نافذة الدفع فوراً عبر مدى / سداد / آبل باي", color: "#C7A86C" },
            { icon: Download, title: "تحميل الوثيقة", desc: "وثيقة رسمية بختم رقمي + توقيع مشفّر + رمز تحقق إلكتروني + علامة مائية باسم المستفيد", color: "#187860" },
            { icon: Eye, title: "اطلاع محمي", desc: "عرض وثائق الاطلاع بحماية كاملة: منع الطباعة وتصوير الشاشة + إعادة اطلاع بسداد جديد", color: "#C7A86C" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-sm text-center relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}10` }}>
                <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
              </div>
              <h4 className="font-black text-[11px] sm:text-xs mb-1" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-[9px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/60 rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#B42318]/10 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B42318]" />
              </div>
              <h4 className="font-black text-[#B42318] text-[11px] sm:text-xs">نظام الشكاوى والاعتراضات</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "أيقونة ساعة تحذيرية تظهر بجانب الطلب المتأخر أكثر من 3 أيام عمل",
                "نافذة شكوى مباشرة تُحال تلقائياً للمدير ثم القسم المختص",
                "متابعة حالة الشكوى مع إشعارات بكل تحديث + منع التكرار",
                "تقديم اعتراض على الرفض مع سبب إلزامي ومتابعة القرار النهائي",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#B42318] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bg-white rounded-xl border border-[#187860]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#187860]/10 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-[#187860]" />
              </div>
              <h4 className="font-black text-[#187860] text-[11px] sm:text-xs">المساعد الرقمي والدعم</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "مساعد ذكي يجيب على 21 سؤالاً شائعاً بأسلوب احترافي",
                "تصنيفات ذكية + اقتراحات سياقية للأسئلة الشائعة",
                "إشعارات فورية متحركة عند كل تحديث على حالة الطلب",
                "تقييم الخدمة بالنجوم (1-5) مع تعليق اختياري بعد الاكتمال",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#187860] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Slide>
    ),
  },

  {
    id: "employee-1",
    title: "بوابة الموظف (١)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Briefcase} title="بوابة الموظف — الأقسام والمعالجة" subtitle="4 أقسام عمل مستقلة بمسار إحالة تلقائي واضح" badge="الموظف ١/٢" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { num: "١", title: "مركز التدقيق", desc: "قبول أو رفض الطلب — عند القبول يُحال تلقائياً لخدمات المستفيدين بالجهة المختارة", icon: Activity, color: "#187860" },
            { num: "٢", title: "خدمات المستفيدين", desc: "قبول وإحالة للدائرة القضائية / رفض / إعادة لمركز التدقيق — بإجراء واحد مدمج", icon: UserCheck, color: "#C7A86C" },
            { num: "٣", title: "الدائرة القضائية - القسم المختص", desc: "إرفاق الوثيقة القضائية + تطبيق الختم الرقمي تلقائياً + تسليم مباشر للمستفيد", icon: Scale, color: "#187860" },
            { num: "٤", title: "الوثائق والمحفوظات", desc: "إرفاق المستندات أو الوثيقة المطلوبة وختمها بختم رقمي وتسليمها مباشرة للمستفيد", icon: FileText, color: "#C7A86C" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm" style={{ background: item.color }}>{item.num}</div>
                <div className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  <h4 className="font-black text-[11px] sm:text-xs" style={{ color: item.color }}>{item.title}</h4>
                </div>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#1F2937]/60 leading-relaxed mr-9">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div className="bg-[#187860] rounded-xl p-3" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-[10px] sm:text-xs font-bold bg-white/20 rounded-lg px-2.5 py-1">تدقيق</span>
            <ChevronLeft className="w-4 h-4 text-[#C7A86C]" />
            <span className="text-[10px] sm:text-xs font-bold bg-white/20 rounded-lg px-2.5 py-1">خدمات مستفيدين</span>
            <ChevronLeft className="w-4 h-4 text-[#C7A86C]" />
            <span className="text-[10px] sm:text-xs font-bold bg-white/20 rounded-lg px-2.5 py-1">دائرة قضائية - القسم مختص</span>
            <ChevronLeft className="w-4 h-4 text-[#C7A86C]" />
            <span className="text-[10px] sm:text-xs font-bold bg-[#C7A86C]/30 rounded-lg px-2.5 py-1">تسليم للمستفيد</span>
          </div>
          <p className="text-center text-[8px] sm:text-[9px] text-white/50 mt-1">مسار الإحالة التلقائي — كل خطوة بنقرة واحدة</p>
        </motion.div>
      </Slide>
    ),
  },
  {
    id: "employee-2",
    title: "بوابة الموظف (٢)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Briefcase} title="بوابة الموظف — الأدوات والأداء" subtitle="مؤقت زمني حي + لوحة أداء + تذاكر وشكاوى + أدوات إنتاجية" badge="الموظف ٢/٢" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { icon: Clock, title: "المؤقت الزمني الحي", desc: "مؤقت تنازلي يتغير لونه: أخضر (وقت كافٍ) → أصفر (تحذير) → أحمر (متأخر) مع استثناء العطل الرسمية", color: "#187860" },
            { icon: BarChart3, title: "لوحة الأداء الموحدة", desc: "نسبة الإنجاز + توزيع الحالات/الأنواع + المؤشر الزمني + الإنتاجية اليومية — لكل قسم بيانات سياقية مختلفة", color: "#C7A86C" },
            { icon: Stamp, title: "الختم والتوقيع الرقمي", desc: "تطبيق تلقائي للختم الإلكتروني والتوقيع المشفّر + إرفاق المستندات مع وصف تفصيلي عند إنجاز الطلب", color: "#187860" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-sm text-center relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}10` }}>
                <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
              </div>
              <h4 className="font-black text-[10px] sm:text-[11px] mb-1" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/60 rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#B42318]" />
              <h4 className="font-black text-[#B42318] text-[11px] sm:text-xs">التذاكر والشكاوى</h4>
            </div>
            <div className="space-y-1">
              {["تبويب مخصص لاستقبال شكاوى المستفيدين المحالة من المدير", "حل التذكرة أو الرد على المستفيد أو إعادتها للمدير", "إلزامية كتابة الرد قبل تنفيذ أي إجراء", "تفاصيل كاملة: رقم الطلب + الأولوية + ملاحظة المدير"].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[8px] sm:text-[9px] text-[#1F2937]/70">
                  <CheckCircle className="w-2.5 h-2.5 text-[#B42318] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bg-white rounded-xl border border-[#187860]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-[#187860]" />
              <h4 className="font-black text-[#187860] text-[11px] sm:text-xs">أدوات الإنتاجية</h4>
            </div>
            <div className="space-y-1">
              {["لوحة مهام يومية مع أولويات عالية وشارة العدد", "سجل إجراءات كامل مع الوقت والتفاصيل", "بحث وفلترة متقدمة حسب النوع والحالة", "أرشيف الطلبات المكتملة مع عرض تفاصيل شاملة"].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[8px] sm:text-[9px] text-[#1F2937]/70">
                  <CheckCircle className="w-2.5 h-2.5 text-[#187860] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Slide>
    ),
  },

  {
    id: "manager-1",
    title: "بوابة المدير (١)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Crown} title="بوابة المدير — التحكم والمراقبة" subtitle="لوحة تحكم شاملة مع إحصاءات حية ورسوم بيانية عربية" badge="الإدارة ١/٢" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <motion.div className="bg-white rounded-xl border border-[#187860]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#187860]" />
              <h4 className="font-black text-[#187860] text-[11px] sm:text-xs">لوحة الإحصاءات المركزية</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "4 بطاقات ملخصة: إجمالي / قيد المعالجة / مكتملة / متأخرة",
                "أداء أسبوعي: مقارنة بصرية بين هذا الأسبوع والماضي",
                "إشغال حي يتحدث كل 5 ثوانٍ بألوان الحالة (أخضر/أصفر/أحمر)",
                "لوحة شرف الموظفين: ترتيب حسب الإنجاز (ذهبي/فضي/برونزي)",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#187860] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bg-white rounded-xl border border-[#C7A86C]/15 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C7A86C] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#C7A86C]" />
              <h4 className="font-black text-[#C7A86C] text-[11px] sm:text-xs">التحليلات والرسوم البيانية</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "وقت المعالجة: متوسط الإنجاز لكل قسم ونوع طلب",
                "أداء الموظفين: رادار + أعمدة مقارنة الإنتاجية",
                "ساعات الذروة: خريطة حرارية لأوقات الضغط",
                "رضا المستفيدين: اتجاه شهري + توزيع النجوم + التعليقات",
                "تحليل الاختناقات: رسم بياني للنقاط الحرجة + توصيات تلقائية",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#C7A86C] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.div className="bg-[#B42318]/[0.04] rounded-xl border border-[#B42318]/10 p-3" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
            <h4 className="font-black text-[#B42318] text-[11px] sm:text-xs">تنبيه المتأخرات والمصعّدة</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-[9px] sm:text-[10px] text-[#1F2937]/70 bg-white rounded-lg p-2 border border-[#B42318]/10">
              <strong className="text-[#B42318]">لافتة حمراء فورية</strong> — تظهر أعلى الصفحة عند تجاوز أي طلب الموعد النهائي مع عدد الطلبات المتأخرة
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#1F2937]/70 bg-white rounded-lg p-2 border border-[#B42318]/10">
              <strong className="text-[#B42318]">تبويب المصعّدة</strong> — بطاقات مفصّلة للطلبات العاجلة مع الأولوية والموعد النهائي والموظف المسؤول
            </div>
          </div>
        </motion.div>
      </Slide>
    ),
  },
  {
    id: "manager-2",
    title: "بوابة المدير (٢)",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Crown} title="بوابة المدير — القرارات والحوكمة" subtitle="الاعتراضات والتذاكر وسجل التدقيق وصحة النظام" badge="الإدارة ٢/٢" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <motion.div className="bg-white rounded-xl border border-[#C7A86C]/15 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C7A86C] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-[#C7A86C]" />
              <h4 className="font-black text-[#C7A86C] text-[11px] sm:text-xs">الاعتراضات والقرارات</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "مراجعة اعتراضات المستفيدين على الطلبات المرفوضة",
                "قبول الاعتراض وإعادة الطلب للمعالجة",
                "رفض نهائي مع سبب إلزامي يظهر للمستفيد",
                "كشف الطلبات المكررة تلقائياً مع تفاصيل التشابه",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#C7A86C] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="bg-white rounded-xl border border-[#B42318]/10 p-3 shadow-sm relative overflow-hidden" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B42318]/60 rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#B42318]" />
              <h4 className="font-black text-[#B42318] text-[11px] sm:text-xs">نظام التذاكر والشكاوى</h4>
            </div>
            <div className="space-y-1.5">
              {[
                "إنشاء تذاكر جديدة من شكاوى المستفيدين مع تحديد الأولوية",
                "إحالة للقسم المختص مع ملاحظة توجيهية من المدير",
                "متابعة حالات التذاكر: مفتوحة / محالة / محلولة / مُعادة",
                "تفاصيل كاملة: رقم الطلب + اسم المستفيد + تاريخ الإحالة",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-[#1F2937]/70">
                  <CheckCircle className="w-3 h-3 text-[#B42318] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, title: "سجل التدقيق", desc: "تتبع كامل: من فعل ماذا ومتى — فلترة وتصدير CSV", color: "#187860" },
            { icon: Monitor, title: "صحة النظام", desc: "وقت التشغيل + وقت الاستجابة + حالة الخوادم وقاعدة البيانات", color: "#C7A86C" },
            { icon: Download, title: "تصدير التقارير", desc: "طباعة + تقرير نصي تفصيلي + تصدير كملف بيانات + إرفاق مستندات", color: "#187860" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-lg border border-[#e8e8e8]/50 p-2.5 shadow-sm text-center" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.06 }}>
              <item.icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.color }} />
              <h4 className="font-black text-[10px] sm:text-[11px] mb-0.5" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    id: "digital-stamp",
    title: "الختم الرقمي",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Stamp} title="الختم والتوقيع الرقمي" subtitle="البديل الرقمي لختم الدائرة وختم طبق الأصل وختم التنفيذ" badge="الأمان" />
        <div className="grid grid-cols-[1fr_1fr] gap-3 mb-3">
          <motion.div className="bg-white rounded-xl border border-[#187860]/10 p-3.5 shadow-sm relative overflow-hidden" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#187860]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#187860]" />
              </div>
              <h3 className="font-black text-[#187860] text-xs">مكونات الختم الرقمي</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { icon: KeyRound, title: "التوقيع المشفّر", desc: "تشفير متقدم يُثبت أصالة الوثيقة ويمنع التعديل" },
                { icon: QrCode, title: "رمز التحقق", desc: "رمز فريد مُضمّن — مسحه يتحقق من الأصالة فوراً" },
                { icon: Stamp, title: "الختم المرئي", desc: "ختم الدائرة + «نسخة إلكترونية معتمدة» + رقم التحقق" },
                { icon: Eye, title: "العلامة المائية", desc: "باسم صاحب الطلب تُغطّي كامل الوثيقة لمنع التزوير" },
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2 bg-[#187860]/[0.04] rounded-lg p-2 border border-[#187860]/8" initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <div className="w-6 h-6 rounded-md bg-[#187860]/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-3 h-3 text-[#187860]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#187860] text-[10px] sm:text-[11px]">{item.title}</h4>
                    <p className="text-[8px] sm:text-[9px] text-[#1F2937]/60 leading-tight">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl border border-[#C7A86C]/15 p-3.5 shadow-sm relative overflow-hidden" initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C7A86C] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C7A86C]/10 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-[#C7A86C]" />
              </div>
              <h3 className="font-black text-[#C7A86C] text-xs">الاعتماد والتحقق</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { icon: Link, title: "سلسلة الاعتماد", desc: "موظف الدائرة → رئيس القسم → النظام يُضيف التوقيع والختم تلقائياً" },
                { icon: ScanLine, title: "التحقق من أي جهة", desc: "مسح رمز التحقق أو إدخال الرقم دون الرجوع للجهة القضائية" },
                { icon: BadgeCheck, title: "الحجية القانونية", desc: "متوافق مع نظام التعاملات الإلكترونية — ذات الحجية الختم والتوقيع اليدوي" },
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2 bg-[#C7A86C]/[0.04] rounded-lg p-2 border border-[#C7A86C]/10" initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <div className="w-6 h-6 rounded-md bg-[#C7A86C]/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-3 h-3 text-[#C7A86C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#C7A86C] text-[10px] sm:text-[11px]">{item.title}</h4>
                    <p className="text-[8px] sm:text-[9px] text-[#1F2937]/60 leading-tight">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-md" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="text-center">
              <div className="w-11 h-11 rounded-xl bg-[#B42318]/[0.06] flex items-center justify-center mx-auto mb-1.5">
                <Stamp className="w-5 h-5 text-[#B42318]" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-black text-[#B42318] mb-0.5">الختم الورقي التقليدي</p>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50">قابل للتزوير • بطيء • يتطلب حضور</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C7A86C]">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className="text-[8px] text-[#C7A86C] font-black">التحوّل</span>
            </div>
            <div className="text-center">
              <div className="w-11 h-11 rounded-xl bg-[#187860]/[0.06] flex items-center justify-center mx-auto mb-1.5">
                <ShieldCheck className="w-5 h-5 text-[#187860]" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-black text-[#187860] mb-0.5">الختم الرقمي المعتمد</p>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50">مشفّر • فوري • قابل للتحقق إلكترونياً</p>
            </div>
          </div>
        </motion.div>
      </Slide>
    ),
  },
  {
    id: "courts",
    title: "المحاكم المدعومة",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Building2} title="الجهات القضائية والتغطية الجغرافية" subtitle="كافة الجهات القضائية تغطي جميع مدن المملكة" badge="التغطية" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <motion.div className="bg-white rounded-xl border border-[#187860]/10 p-3.5 shadow-sm relative overflow-hidden" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#187860] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#187860]/10 flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#187860]" />
              </div>
              <h3 className="font-black text-[#187860] text-xs">المحاكم</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {["المحكمة العامة", "المحكمة التجارية", "محكمة الأحوال الشخصية", "المحكمة الجزائية", "المحكمة العمالية", "محكمة الاستئناف", "محكمة التنفيذ", "المحكمة العليا"].map((name, i) => (
                <motion.div key={i} className="flex items-center gap-1.5 bg-[#187860]/[0.04] rounded-lg p-2 border border-[#187860]/8" initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Building2 className="w-3 h-3 text-[#187860] shrink-0" />
                  <span className="font-bold text-[9px] sm:text-[10px] text-[#187860]">{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl border border-[#C7A86C]/15 p-3.5 shadow-sm relative overflow-hidden" initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C7A86C] rounded-t-xl" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C7A86C]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#C7A86C]" />
              </div>
              <h3 className="font-black text-[#C7A86C] text-xs">جهات أخرى</h3>
            </div>
            <div className="space-y-1.5 mb-3">
              {[
                { name: "كتابة العدل" },
                { name: "ديوان الوزارة" },
              ].map((item, i) => (
                <motion.div key={i} className="flex items-start gap-2 bg-[#C7A86C]/[0.04] rounded-lg p-2 border border-[#C7A86C]/10" initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <Building2 className="w-3.5 h-3.5 text-[#C7A86C] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#C7A86C] text-[10px] sm:text-[11px]">{item.name}</h4>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#187860]/[0.04] rounded-lg border border-[#187860]/8 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#187860]" />
                <span className="font-black text-[10px] sm:text-[11px] text-[#187860]">3 خدمات لكل جهة</span>
              </div>
              <div className="flex gap-1.5">
                {["نسخة مصدقة من أوراق الدعوى", "الاطلاع على أوراق الدعوى", "نسخة بديلة للوثائق القضائية"].map((s, i) => (
                  <span key={i} className="text-[8px] sm:text-[9px] bg-white rounded px-2 py-0.5 border border-[#e8e8e8]/50 text-[#1F2937]/70 font-medium">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="bg-[#187860] rounded-xl p-3 text-center" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <MapPin className="w-4 h-4 text-[#C7A86C] mx-auto mb-0.5" />
              <p className="text-base font-black text-white">كافة المدن</p>
              <p className="text-[8px] text-white/50">تغطية جغرافية شاملة</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <Building2 className="w-4 h-4 text-[#C7A86C] mx-auto mb-0.5" />
              <p className="text-base font-black text-white">كافة الجهات القضائية</p>
              <p className="text-[8px] text-white/50">تغطية شاملة</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <FileText className="w-4 h-4 text-[#C7A86C] mx-auto mb-0.5" />
              <p className="text-base font-black text-white">٣ خدمات</p>
              <p className="text-[8px] text-white/50">لكل جهة قضائية</p>
            </div>
          </div>
        </motion.div>
      </Slide>
    ),
  },
  {
    id: "architecture",
    title: "البنية التقنية والتكامل",
    section: "system",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Cpu} title="البنية التقنية والتكامل الحكومي" subtitle="طبقات المنصة والأنظمة الحكومية المتكاملة" badge="الهندسة" />
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <div className="space-y-1.5">
            <h4 className="text-[11px] sm:text-xs font-black text-[#187860] mb-1 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />طبقات المنصة</h4>
            {[
              { layer: "طبقة العرض", color: "#187860", techs: "واجهة متجاوبة + حركات سلسة + دعم كامل للعربية", icon: Monitor },
              { layer: "الخدمات الخلفية", color: "#187860", techs: "واجهة برمجية + مصادقة مشفّرة + اتصال فوري", icon: Server },
              { layer: "طبقة البيانات", color: "#C7A86C", techs: "قاعدة بيانات + تخزين مؤقت + نسخ احتياطي يومي", icon: Database },
              { layer: "الأمان", color: "#B42318", techs: "تشفير متقدم + توقيع رقمي + سجل تدقيق", icon: Shield },
            ].map((item, i) => (
              <motion.div key={i} className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm relative overflow-hidden" style={{ border: `1px solid ${item.color}15` }} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <div className="absolute top-0 right-0 w-1 h-full" style={{ background: item.color }} />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${item.color}10` }}>
                    <item.icon className="w-3 h-3" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[10px] sm:text-[11px]" style={{ color: item.color }}>{item.layer}</h4>
                    <p className="text-[8px] sm:text-[9px] text-[#1F2937]/60 leading-tight">{item.techs}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] sm:text-xs font-black text-[#187860] mb-1 flex items-center gap-1.5"><Network className="w-3.5 h-3.5" />التكامل الحكومي</h4>
            {[
              { name: "نفاذ الوطني", desc: "تسجيل دخول موحد بالهوية الوطنية", icon: Shield, color: "#187860", features: ["تسجيل الدخول الموحد", "التحقق برمز مؤقت", "ربط بالسجل المدني"] },
              { name: "ناجز", desc: "الربط بالخدمات القضائية الإلكترونية", icon: Scale, color: "#C7A86C", features: ["استعلام عن القضايا", "التحقق من الوثائق", "الربط بالدوائر القضائية"] },
              { name: "نظام سداد", desc: "سداد الرسوم القضائية إلكترونياً", icon: CreditCard, color: "#187860", features: ["فواتير إلكترونية", "سداد فوري", "إشعار تلقائي بالدفع"] },
            ].map((sys, i) => (
              <motion.div key={i} className="bg-white rounded-lg p-2 sm:p-2.5 shadow-sm relative overflow-hidden" style={{ border: `1px solid ${sys.color}15` }} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <div className="absolute top-0 right-0 w-1 h-full" style={{ background: sys.color }} />
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${sys.color}10` }}>
                    <sys.icon className="w-3 h-3" style={{ color: sys.color }} />
                  </div>
                  <h4 className="font-black text-[10px] sm:text-[11px]" style={{ color: sys.color }}>{sys.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1 mr-8">
                  {sys.features.map((f, fi) => (
                    <span key={fi} className="text-[8px] sm:text-[9px] text-[#1F2937]/70 bg-[#f3f3f3] rounded px-1.5 py-0.5 border border-[#e8e8e8]/50">{f}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div className="bg-[#187860] rounded-xl p-2.5 mt-2 text-center" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {[
              { label: "أنظمة متكاملة", value: "٣+", icon: Server },
              { label: "تشفير عالي", value: "TLS", icon: Shield },
              { label: "وقت الاستجابة", value: "< 1 ث", icon: Zap },
              { label: "التوافق", value: "١٠٠٪", icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <item.icon className="w-3.5 h-3.5 text-[#C7A86C] mx-auto mb-0.5" />
                <p className="text-sm sm:text-base font-black text-white">{item.value}</p>
                <p className="text-[8px] sm:text-[9px] text-white/50">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Slide>
    ),
  },

  {
    id: "section-benefit",
    title: "٤ الفائدة",
    section: "benefit",
    render: (fs: boolean) => (
      <SectionDivider number="٤" title="الفائدة" subtitle="ما الذي سيتغير بعد تطبيق المنصة؟" icon={TrendingUp} color="#187860" isFullscreen={fs} />
    ),
  },
  {
    id: "visual-comparison",
    title: "المقارنة البصرية",
    section: "benefit",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={TrendingUp} title="المقارنة البصرية: قبل وبعد التحوّل" subtitle="رؤية شاملة للتحسينات الجوهرية عبر جميع المعايير" badge="المقارنة" />
        <motion.div className="bg-white rounded-2xl border border-[#e8e8e8]/50 shadow-md overflow-hidden" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="grid grid-cols-[0.65fr_1fr_0.06fr_1fr] sm:grid-cols-[0.85fr_1.2fr_0.06fr_1.2fr] gap-0 items-center py-2 sm:py-2.5 px-0" style={{ background: "linear-gradient(135deg, #187860, #075e4a)" }}>
            <span className="text-[10px] sm:text-xs font-black text-white/90 px-2 sm:px-2.5">المعيار</span>
            <span className="text-[10px] sm:text-xs font-black text-white/80 flex items-center gap-1 px-1.5 sm:px-2"><XCircle className="w-3 h-3 text-[#ff9999]/60" />قبل التحوّل</span>
            <span></span>
            <span className="text-[10px] sm:text-xs font-black text-white/80 flex items-center gap-1 px-1.5 sm:px-2"><CheckCircle className="w-3 h-3 text-[#90ffcc]/60" />بعد التحوّل</span>
          </div>
          <div className="p-1 sm:p-1.5 space-y-[1px]">
          <CompareRow label="تقديم الطلب" before="عدم وجود آلية موحدة" after="منصة إلكترونية" index={0} />
          <CompareRow label="اختيار الجهة" before="يحتاج معرفة مسبقة" after="قوائم ذكية تلقائية" index={1} />
          <CompareRow label="وقت التقديم" before="نصف ساعة إلى ساعة" after="دقائق معدودة" index={2} />
          <CompareRow label="متابعة الطلب" before="مراجعة شخصية أو اتصال" after="لحظي مع إشعارات" index={3} />
          <CompareRow label="توزيع العمل" before="يدوي وغير متوازن" after="تلقائي على الأقل عبءً" index={4} />
          <CompareRow label="السداد" before="عبر الوزارة برقم فاتورة سداد" after="زر سداد مباشر بجوار كل طلب" index={5} />
          <CompareRow label="استلام الوثيقة" before="حضور للمحكمة" after="تحميل رقمي فوري" index={6} />
          <CompareRow label="ختم الوثائق" before="ختم يدوي" after="مشفّر + رمز تحقق + ختم رقمي" index={7} />
          <CompareRow label="حماية الوثائق" before="لا توجد حماية" after="علامة مائية باسم المستفيد" index={8} />
          <CompareRow label="الطلبات المرفوضة" before="مراجعة شخصية" after="تبويب مخصص + اعتراض إلكتروني" index={9} />
          <CompareRow label="تنبيه المتأخرات" before="اكتشاف متأخر يدوياً" after="تنبيه عاجل فوري للمدير" index={10} />
          <CompareRow label="ضياع الملفات" before="مرتفع (ورق)" after="معدوم (رقمي)" index={11} />
          <CompareRow label="رؤية المدير" before="تقارير ورقية متأخرة" after="رسوم بيانية عربية + تحليلات حية" index={12} />
          <CompareRow label="التدقيق" before="غياب التوثيق" after="سجل تدقيق كامل" index={13} />
          <CompareRow label="شكاوى التأخير" before="مراجعة شخصية أو اتصال" after="شكوى إلكترونية فورية تُحال تلقائياً" index={14} />
          <CompareRow label="رضا المستفيد" before="لا يوجد آلية قياس" after="تقييم تلقائي بعد كل طلب" index={15} />
          </div>
        </motion.div>
      </Slide>
    ),
  },

  {
    id: "timeline-comparison",
    title: "المقارنة الزمنية",
    section: "benefit",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Clock} title="المقارنة الزمنية: قبل وبعد" subtitle="الفرق الجوهري في الوقت المستغرق لكل مرحلة من مراحل الطلب" badge="الزمن" />
        <div className="space-y-1.5">
          {[
            { stage: "تقديم الطلب", before: "60", after: "2", unit: "دقيقة", beforeLabel: "تعبئة ورقية", afterLabel: "تقديم إلكتروني من أي مكان" },
            { stage: "وصول الطلب للموظف", before: "1440", after: "1", unit: "دقيقة", beforeLabel: "يوم عمل (بريد + تحويل)", afterLabel: "توزيع تلقائي فوري" },
            { stage: "معالجة الطلب", before: "4320", after: "1440", unit: "دقيقة", beforeLabel: "غير محدد", afterLabel: "يوم واحد (رقمي)", beforeDisplayOverride: "غير محدد", afterDisplayOverride: "3 أيام بحد أقصى" },
            { stage: "إشعار المستفيد", before: "2880", after: "0", unit: "دقيقة", beforeLabel: "يومان (اتصال أو حضور)", afterLabel: "فوري رسالة نصية + بريد" },
            { stage: "سداد الرسوم", before: "60", after: "2", unit: "دقيقة", beforeLabel: "فاتورة نصية من الوزارة", afterLabel: "زر سداد مباشر", beforeDisplayOverride: "غير محدد", afterDisplayOverride: "فوري" },
            { stage: "استلام الوثيقة", before: "60", after: "1", unit: "دقيقة", beforeLabel: "حضور للمحكمة", afterLabel: "تحميل رقمي فوري" },
          ].map((item, i) => {
            const beforeVal = parseInt(item.before);
            const afterVal = parseInt(item.after);
            const saving = Math.round(((beforeVal - afterVal) / beforeVal) * 100);
            const beforeDisplay = (item as any).beforeDisplayOverride || (beforeVal >= 1440 ? `${(beforeVal / 1440).toFixed(0)} يوم` : beforeVal >= 60 ? `${(beforeVal / 60).toFixed(0)} ساعة` : `${beforeVal} د`);
            const afterDisplay = (item as any).afterDisplayOverride || (afterVal >= 1440 ? `${(afterVal / 1440).toFixed(0)} يوم` : afterVal >= 60 ? `${(afterVal / 60).toFixed(0)} ساعة` : afterVal === 0 ? "فوري" : `${afterVal} د`);
            return (
              <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-2.5 sm:p-3 shadow-sm" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-[#187860] text-[11px] sm:text-xs">{item.stage}</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-[#187860] bg-[#187860]/[0.06] px-1.5 py-0.5 rounded-full">توفير {saving}%</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="relative">
                    <div className="h-4 sm:h-5 rounded-lg bg-[#B42318]/[0.08] overflow-hidden">
                      <div className="h-full rounded-lg bg-[#B42318]/70" style={{ width: "80%" }} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[8px] sm:text-[9px] text-[#1F2937]/50">{item.beforeLabel}</span>
                      <span className="text-[10px] sm:text-[11px] font-black text-[#B42318]">{beforeDisplay}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-4 sm:h-5 rounded-lg bg-[#187860]/10 overflow-hidden">
                      <motion.div className="h-full rounded-lg bg-[#187860]" initial={{ width: 0 }} animate={{ width: `${Math.max((afterVal / beforeVal) * 100, 3)}%` }} transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }} />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[8px] sm:text-[9px] text-[#1F2937]/50">{item.afterLabel}</span>
                      <span className="text-[10px] sm:text-[11px] font-black text-[#187860]">{afterDisplay}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Slide>
    ),
  },

  {
    id: "section-impact",
    title: "٥ الأثر",
    section: "impact",
    render: (fs: boolean) => (
      <SectionDivider number="٥" title="الأثر" subtitle="ما النتائج المتوقعة على المدى البعيد؟" icon={Landmark} color="#187860" isFullscreen={fs} />
    ),
  },
  {
    id: "strategic-impact",
    title: "الأثر الاستراتيجي",
    section: "impact",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs}>
        <SlideTitle icon={Landmark} title="الأثر المتوقع بالأرقام" subtitle="مؤشرات أداء قابلة للقياس بعد تطبيق المنصة" badge="الأرقام" />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MetricCard metric="وقت التقديم" impact="من ساعة → دقيقتين" percent="90%" desc="توفير في الوقت" icon={Clock} color="#187860" index={0} />
          <MetricCard metric="الزيارات الحضورية" impact="إلغاء معظم الزيارات" percent="90%" desc="تقليل في الحضور" icon={MapPin} color="#C7A86C" index={1} />
          <MetricCard metric="دورة المعالجة" impact="بحد أقصى 3 أيام" percent="70%" desc="تسريع الإنجاز" icon={Timer} color="#187860" index={2} />
          <MetricCard metric="إنتاجية الموظف" impact="توزيع متوازن + تنبيهات" percent="50%" desc="زيادة في الإنتاجية" icon={Users} color="#C7A86C" index={3} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: "فوري", label: "إشعار المستفيد", desc: "بدلاً من يومين انتظار للاتصال أو الحضور", icon: Bell, color: "#C7A86C" },
            { value: "7/24", label: "توفر المنصة", desc: "تقديم الطلبات متاح في أي وقت ومن أي مكان", icon: Globe, color: "#187860" },
            { value: "٤.٧", label: "رضا المستفيد", desc: "تقييم إلكتروني فوري بعد كل طلب لقياس جودة الخدمة", icon: Star, color: "#C7A86C" },
            { value: "١٠٠%", label: "الأرشفة والحفظ", desc: "حفظ رقمي دائم لجميع الوثائق والطلبات والمرفقات", icon: Archive, color: "#187860" },
          ].map((item, i) => (
            <motion.div key={i} className="bg-white rounded-xl border border-[#e8e8e8]/50 p-3 shadow-sm text-center relative overflow-hidden" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />
              <item.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: item.color }} />
              <p className="text-xl sm:text-2xl font-black mb-0.5" dir="ltr" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#1F2937]/80 mb-0.5">{item.label}</p>
              <p className="text-[8px] sm:text-[9px] text-[#1F2937]/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Slide>
    ),
  },
  {
    id: "roadmap",
    title: "خارطة الطريق",
    section: "impact",
    render: (fs: boolean) => {
      const phases = [
        { phase: "المرحلة الأولى", title: "التصميم والنموذج الأولي", period: "شهرين", color: "#C7A86C", icon: Layers, items: ["تصميم واجهات وتجربة المستخدم", "بناء النموذج التشغيلي التجريبي", "اختبار القوائم المتسلسلة والتحقق", "تقييم أولي من المستخدمين"], status: "مكتمل" },
        { phase: "المرحلة الثانية", title: "التطوير والربط", period: "شهر", color: "#187860", icon: Code, items: ["ربط مع أنظمة نفاذ والسداد الإلكتروني", "تطوير البنية الخلفية وقاعدة البيانات", "ربط مع أنظمة المحاكم القائمة", "تطبيق التوقيع الرقمي والختم الإلكتروني"], status: "قادمة" },
        { phase: "المرحلة الثالثة", title: "الإطلاق التجريبي", period: "شهرين", color: "#187860", icon: Rocket, items: ["إطلاق في محكمة واحدة كمرحلة تجريبية", "تدريب الموظفين والمراقبة المكثفة", "جمع الملاحظات وقياس مؤشرات الأداء", "تعديلات وتحسينات بناءً على التغذية الراجعة"], status: "قادمة" },
        { phase: "المرحلة الرابعة", title: "التوسع والتعميم", period: "٣ شهور", color: "#187860", icon: Globe, items: ["توسيع التغطية لمحاكم أخرى تدريجياً", "تعميم على جميع المناطق والمدن", "تحسينات مستمرة بناءً على البيانات", "تطوير تطبيق جوال مخصص"], status: "قادمة" },
      ];
      return (
        <Slide isFullscreen={fs}>
          <SlideTitle icon={Flag} title="خارطة الطريق" subtitle="المراحل التنفيذية للمشروع من الفكرة إلى التوسع" badge="التنفيذ" />

          <motion.div className="relative flex items-center justify-between mb-5 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="absolute top-1/2 right-4 left-4 h-1 rounded-full -translate-y-1/2" style={{ background: "linear-gradient(to left, #187860, #C7A86C)" }} />
            {phases.map((p, i) => (
              <motion.div key={i} className="relative z-10 flex flex-col items-center" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.1, type: "spring" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg ring-4 ring-[#FAFAFA]" style={{ background: p.color }}>
                  <p.icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[8px] font-bold mt-1.5" style={{ color: p.color }}>{p.period}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase, i) => (
              <motion.div key={i} className="bg-white rounded-xl border shadow-sm relative overflow-hidden flex flex-col" style={{ borderColor: `${phase.color}18` }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <div className="h-1 w-full" style={{ background: phase.color }} />
                <div className="p-2.5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: phase.color }}>{phase.phase}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${phase.status === "مكتمل" ? "bg-[#075e4a]/10 text-[#075e4a] border border-[#075e4a]/15" : "bg-[#f0f0f0] text-[#1F2937]/50 border border-[#e8e8e8]"}`}>
                      {phase.status === "مكتمل" ? "✓ مكتمل" : "قادمة"}
                    </span>
                  </div>
                  <h4 className="font-black text-[10px] sm:text-[11px] mb-2" style={{ color: phase.color }}>{phase.title}</h4>
                  <div className="space-y-1 flex-1">
                    {phase.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-1 text-[8px] sm:text-[9px] text-[#1F2937]/75 leading-tight">
                        <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ background: phase.color }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-3 bg-[#187860] rounded-xl p-2.5 text-center" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center justify-center gap-8">
              {[
                { label: "المدة الإجمالية", value: "٨ شهور", icon: Calendar },
                { label: "عدد المراحل", value: "٤ مراحل", icon: Flag },
                { label: "المرحلة الحالية", value: "التصميم", icon: Layers },
                { label: "الإنجاز", value: "٢٥٪", icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <item.icon className="w-3.5 h-3.5 text-[#C7A86C] mx-auto mb-0.5" />
                  <p className="text-sm font-black text-white">{item.value}</p>
                  <p className="text-[8px] text-white/50">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </Slide>
      );
    },
  },

  {
    id: "closing",
    title: "الختام",
    section: "appendix",
    render: (fs: boolean) => (
      <Slide isFullscreen={fs} variant="dark">
        <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(199,168,108,0.1) 0%, transparent 60%)" }} />
            <div className="absolute bottom-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(7,94,74,0.35) 0%, transparent 60%)" }} />
            {[220, 160, 100].map((size, i) => (
              <motion.div key={i} className="absolute rounded-full" style={{ width: size, height: size, border: `1px solid rgba(199,168,108,${0.04 + i * 0.02})`, top: "38%", left: "50%", transform: "translate(-50%, -50%)" }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.12 + 0.3, duration: 0.7 }} />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-[750px] mx-auto">
            <motion.div className="flex items-center gap-3 mb-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <div className="h-px w-14" style={{ background: "linear-gradient(to left, rgba(199,168,108,0.4), transparent)" }} />
              <Scale className="w-5 h-5" style={{ color: "rgba(199,168,108,0.5)" }} />
              <div className="h-px w-14" style={{ background: "linear-gradient(to right, rgba(199,168,108,0.4), transparent)" }} />
            </motion.div>

            <motion.h2 className="text-4xl sm:text-5xl font-black text-center leading-tight mb-1.5" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <span className="text-white">شكراً </span>
              <span style={{ color: "#C7A86C" }}>لاهتمامكم</span>
            </motion.h2>

            <motion.p className="text-[13px] sm:text-[15px] font-medium text-center mb-6" style={{ color: "rgba(255,255,255,0.45)" }} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              منصة الوثائق القضائية — نحو قضاء رقمي متكامل
            </motion.p>

            <motion.div className="grid grid-cols-[1fr_auto_1fr] gap-5 w-full items-start mb-6" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="space-y-3">
                <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(199,168,108,0.12)", backdropFilter: "blur(8px)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, rgba(199,168,108,0.3), transparent)" }} />
                  <Rocket className="w-5 h-5 mx-auto mb-2" style={{ color: "#C7A86C" }} />
                  <h4 className="font-black text-sm text-white mb-1.5">رؤية 2030</h4>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>المساهمة في تحقيق مستهدفات التحول الرقمي في القطاع القضائي</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {[Target, Globe, TrendingUp].map((Ic, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(199,168,108,0.1)" }}>
                        <Ic className="w-3.5 h-3.5" style={{ color: "#C7A86C" }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(24,120,96,0.15)", backdropFilter: "blur(8px)" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, rgba(24,120,96,0.4), transparent)" }} />
                  <Monitor className="w-5 h-5 mx-auto mb-2" style={{ color: "#4ade80" }} />
                  <h4 className="font-black text-sm text-white mb-1.5">التحوّل الرقمي</h4>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>من الإجراءات الورقية والحضورية إلى بيئة عمل رقمية متكاملة</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {[Zap, Shield, Star].map((Ic, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(24,120,96,0.15)" }}>
                        <Ic className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-8">
                <div className="w-px h-16" style={{ background: "linear-gradient(to bottom, transparent, rgba(199,168,108,0.2), transparent)" }} />
              </div>

              <div className="flex flex-col items-center justify-center">
                <motion.div className="rounded-2xl p-5 text-center relative overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(199,168,108,0.15)", backdropFilter: "blur(12px)" }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, rgba(199,168,108,0.4), transparent)" }} />
                  <p className="text-[10px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>امسح الباركود للوصول السريع للمنصة</p>
                  <div className="inline-block rounded-2xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(199,168,108,0.15)" }}>
                    <QRCode value={APP_URL} size={110} level="H" fgColor="#187860" />
                  </div>
                  <div>
                    <p className="text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>رابط المنصة</p>
                    <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold transition-colors" style={{ color: "#C7A86C" }} dir="ltr">
                      {APP_URL.replace("https://", "")}
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div className="flex flex-wrap items-center justify-center gap-2.5" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              {[
                { text: "قضاء رقمي", icon: Scale },
                { text: "خدمة أسرع", icon: Zap },
                { text: "شفافية أعلى", icon: Eye },
                { text: "رضا المستفيد", icon: Star },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-full px-4 py-1.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(199,168,108,0.1)" }}>
                  <item.icon className="w-3.5 h-3.5" style={{ color: "#C7A86C" }} />
                  <span className="text-[10px] font-bold text-white/70">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Slide>
    ),
  },
];

const SECTION_COLORS: Record<string, string> = {
  intro: "#187860",
  problem: "#B42318",
  solution: "#C7A86C",
  system: "#187860",
  benefit: "#187860",
  impact: "#187860",
  appendix: "#6b7280",
};

function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "1051505012") {
      onAuthenticated();
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl border border-[#e8e8e8]/50 overflow-hidden">
          <div className="bg-[#187860] px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black text-white mb-1">العرض التقديمي</h1>
            <p className="text-white/60 text-xs">يرجى إدخال الرقم السري للمتابعة</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                placeholder="الرقم السري"
                data-testid="input-presentation-password"
                className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-medium tracking-widest bg-[#f3f3f3] outline-none transition-colors ${
                  passwordError ? "border-[#B42318] bg-[#B42318]/5" : "border-[#e8e8e8]/50 focus:border-[#187860]"
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-[#B42318] text-xs font-bold mt-2 text-center">الرقم السري غير صحيح</p>
              )}
            </div>
            <button
              type="submit"
              data-testid="button-submit-password"
              className="w-full py-3 rounded-xl text-white font-medium text-sm transition-colors"
              style={{ background: "#187860" }}
            >
              دخول
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function PresentationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNav, setShowNav] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exportPDF = useCallback((orientation: "portrait" | "landscape") => {
    setShowPrintDialog(false);
    setIsExporting(true);
    setExportProgress("جاري تجهيز الملف للطباعة...");

    setTimeout(() => {
      try {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("يرجى السماح بالنوافذ المنبثقة لتحميل الملف");
          setIsExporting(false);
          setExportProgress("");
          return;
        }

        const styleSheets = Array.from(document.styleSheets);
        let cssText = "";
        for (const sheet of styleSheets) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              cssText += rule.cssText + "\n";
            }
          } catch {}
        }

        let slidesHTML = "";
        const isLandscape = orientation === "landscape";
        const renderW = isLandscape ? 1122 : 794;
        const renderH = isLandscape ? 794 : 1122;

        const tempDiv = document.createElement("div");
        tempDiv.style.cssText = `position:fixed;top:-99999px;left:0;width:${renderW}px;visibility:hidden;`;
        document.body.appendChild(tempDiv);

        const renderSlides = async () => {
          const { createRoot } = await import("react-dom/client");
          for (let i = 0; i < SLIDES.length; i++) {
            const container = document.createElement("div");
            container.style.cssText = `width:${renderW}px;height:${renderH}px;direction:rtl;overflow:hidden;`;
            tempDiv.appendChild(container);
            const root = createRoot(container);
            root.render(SLIDES[i].render(false));
          }
        };
        renderSlides();

        setTimeout(() => {
          tempDiv.querySelectorAll("*").forEach((el) => {
            const h = el as HTMLElement;
            if (h.style) {
              h.style.setProperty("animation", "none", "important");
              h.style.setProperty("transition", "none", "important");
              if (!h.hasAttribute("data-slide-content")) {
                h.style.setProperty("transform", "none", "important");
              }
            }
          });

          tempDiv.querySelectorAll("[data-slide-content]").forEach((slide) => {
            const s = slide as HTMLElement;
            const slideClass = s.getAttribute("class") || "";
            const childClass = s.querySelector(":scope > div")?.getAttribute("class") || "";
            const isDark = slideClass.includes("bg-[#187860]") || childClass.includes("bg-[#187860]");

            Array.from(s.children).forEach(child => {
              const tag = child.tagName.toLowerCase();
              if (tag === "svg") { child.remove(); return; }
              const cl = child.getAttribute("class") || "";
              if (cl.includes("pointer-events-none") || (cl.includes("absolute") && cl.includes("inset-0") && !cl.includes("flex"))) {
                child.remove();
              }
            });

            s.querySelectorAll("*").forEach(el => {
              const h = el as HTMLElement;
              const cl = h.getAttribute("class") || "";
              if (cl.includes("absolute") && cl.includes("inset-0") && (cl.includes("opacity-") || cl.includes("pointer-events-none")) && !cl.includes("flex")) {
                h.remove();
                return;
              }
              h.style.setProperty("animation", "none", "important");
              h.style.setProperty("transition", "none", "important");
              h.style.setProperty("visibility", "visible", "important");
              const currentOpacity = window.getComputedStyle(h).opacity;
              if (currentOpacity === "0") {
                h.style.setProperty("opacity", "1", "important");
              }
              if (h.style.backdropFilter) {
                h.style.removeProperty("backdrop-filter");
                const bg = window.getComputedStyle(h).backgroundColor;
                if (bg && bg.includes("rgba") && parseFloat(bg.split(",")[3] || "1") < 0.15) {
                  h.style.setProperty("background", isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)", "important");
                }
              }
            });

            s.querySelectorAll("svg.absolute, svg[class*='absolute']").forEach(el => el.remove());

            const allEls = [s, ...Array.from(s.querySelectorAll("*"))] as HTMLElement[];
            allEls.forEach((el) => {
              if (!el.style) return;
              const cs = window.getComputedStyle(el);
              const bg = cs.backgroundColor;
              const bgImg = cs.backgroundImage;
              if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && (!bgImg || bgImg === "none")) {
                el.style.setProperty("background-image", `linear-gradient(${bg}, ${bg})`, "important");
                el.style.setProperty("-webkit-print-color-adjust", "exact", "important");
                el.style.setProperty("print-color-adjust", "exact", "important");
              }
              const color = cs.color;
              if (color) {
                el.style.setProperty("color", color, "important");
              }
              const borderColor = cs.borderColor;
              if (borderColor && cs.borderStyle !== "none") {
                el.style.setProperty("border-color", borderColor, "important");
              }
            });

            const wrapper = document.createElement("div");
            wrapper.className = "slide-page";
            wrapper.setAttribute("data-dark", isDark ? "1" : "0");
            s.parentNode?.insertBefore(wrapper, s);
            wrapper.appendChild(s);
          });

          slidesHTML = tempDiv.innerHTML;
          document.body.removeChild(tempDiv);

          const pageW = isLandscape ? "297mm" : "210mm";
          const pageH = isLandscape ? "210mm" : "297mm";

          printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>العرض التقديمي - منصة الوثائق القضائية</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Droid+Arabic+Kufi:wght@400;700&family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet">
<style>
${cssText}

@page {
  size: ${pageW} ${pageH};
  margin: 0;
}

*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }

body {
  width: ${pageW} !important;
  direction: rtl;
  font-family: 'Droid Arabic Kufi', 'Noto Sans Arabic', sans-serif !important;
  background: #d4d4d4 !important;
}

.slide-page {
  width: ${pageW} !important;
  height: ${pageH} !important;
  position: relative !important;
  overflow: hidden !important;
  margin: 0 auto !important;
  padding: 0 !important;
  background: white !important;
  page-break-after: always !important;
  break-after: page !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.slide-page[data-dark="1"] {
  background: #187860 !important;
}
.slide-page[data-dark="1"] [data-slide-content] {
  background: #187860 !important;
}
.slide-page[data-dark="1"] [data-slide-content] > div {
  background: #187860 !important;
}
.slide-page[data-dark="1"] h4,
.slide-page[data-dark="1"] h3 {
  color: white !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.slide-page[data-dark="1"] .page-number {
  background: rgba(0,0,0,0.4) !important;
  border-color: rgba(199,168,108,0.25) !important;
}
.slide-page[data-dark="1"] .page-number span { color: #C7A86C !important; }

.solution-hero-card,
.solution-hero-card * {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
.solution-hero-card {
  background: linear-gradient(135deg, #187860, #075e4a) !important;
}
.solution-hero-card h3 { color: #ffffff !important; }
.solution-hero-card p { color: rgba(255,255,255,0.7) !important; }
.solution-hero-card svg { color: #ffffff !important; }
.slide-page:last-child {
  page-break-after: auto !important;
  break-after: auto !important;
}

.slide-page [data-slide-content] {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  animation: none !important;
  transition: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.slide-page [data-slide-content] > div {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.slide-page [data-slide-content] > div > div {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
}

.slide-page [data-slide-content] * {
  visibility: visible !important;
  animation: none !important;
  transition: none !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
.slide-page [data-slide-content] *::-webkit-scrollbar { display: none !important; }

.slide-page .overflow-y-auto,
.slide-page .overflow-auto,
.slide-page .overflow-x-auto {
  overflow: hidden !important;
}

.slide-page .h-screen,
.slide-page .min-h-screen,
.slide-page .h-\\[calc\\(100vh-80px\\)\\],
.slide-page .min-h-\\[60vh\\] {
  height: 100% !important;
  min-height: auto !important;
}

.slide-page .pb-16, .slide-page .pb-20 {
  padding-bottom: 8px !important;
}

.page-number {
  position: absolute !important;
  bottom: 4mm !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  font-family: 'Droid Arabic Kufi', sans-serif !important;
  font-size: 10px !important;
  z-index: 100 !important;
  direction: ltr !important;
  background: rgba(255,255,255,0.9) !important;
  padding: 2px 14px !important;
  border-radius: 10px !important;
  border: 1px solid rgba(199,168,108,0.18) !important;
}

nav, header, footer, .no-print, .print\\:hidden,
[data-testid="chatbot-widget"], [data-testid="button-logout"],
[data-testid="button-refresh"] { display: none !important; }

@media screen {
  body { overflow-y: auto !important; }
  .slide-page {
    margin: 6mm auto !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important;
  }
}

@media print {
  html, body {
    width: 100% !important;
    background: white !important;
    overflow: visible !important;
  }
  .slide-page {
    width: 100% !important;
    height: 100vh !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
</style>
</head>
<body>
${slidesHTML}
<script>
(function(){
  function boostSmallText(){
    var els = document.querySelectorAll(".slide-page p, .slide-page span, .slide-page h4, .slide-page h3, .slide-page a, .slide-page li, .slide-page div");
    for(var i=0;i<els.length;i++){
      var cs = window.getComputedStyle(els[i]);
      var fs = parseFloat(cs.fontSize);
      if(fs > 0 && fs < 9){
        els[i].style.fontSize = (fs + 1) + "px";
      }
    }
  }
  function fit(){
    boostSmallText();
    var pages = document.querySelectorAll(".slide-page");
    var total = pages.length;
    pages.forEach(function(page, idx){
      var s = page.querySelector("[data-slide-content]");
      if(!s) return;
      s.style.removeProperty("transform");
      s.style.removeProperty("transform-origin");
      s.style.removeProperty("width");
      var pH = page.clientHeight || page.offsetHeight;
      var pW = page.clientWidth || page.offsetWidth;
      if(pH < 50) return;

      var allOverflow = s.querySelectorAll("*");
      for(var i=0;i<allOverflow.length;i++){
        allOverflow[i].style.overflow = "visible";
        allOverflow[i].style.scrollbarWidth = "none";
      }

      s.style.height = "auto";
      s.style.minHeight = "auto";
      s.style.overflow = "visible";
      var inner = s.querySelector(":scope > div");
      if(inner){
        inner.style.height = "auto";
        inner.style.minHeight = "auto";
        inner.style.overflow = "visible";
        var innerContent = inner.querySelector(":scope > div");
        if(innerContent){
          innerContent.style.height = "auto";
          innerContent.style.minHeight = "auto";
          innerContent.style.overflow = "visible";
        }
      }

      var cH = s.scrollHeight;
      var cW = s.scrollWidth;

      s.style.height = "100%";
      s.style.overflow = "hidden";
      if(inner){ inner.style.height = "100%"; inner.style.overflow = "hidden"; }

      if(cH > pH * 0.95 || cW > pW){
        var scY = cH > pH * 0.95 ? (pH / cH) * 0.90 : 1;
        var scX = cW > pW ? (pW / cW) * 0.92 : 1;
        var sc = Math.min(scY, scX);
        sc = Math.max(sc, 0.32);
        s.style.transform = "scale("+sc+")";
        s.style.transformOrigin = "top center";
        s.style.width = (100/sc)+"%";
        s.style.height = (100/sc)+"%";
        s.style.marginLeft = "auto";
        s.style.marginRight = "auto";
      }

      if(!page.querySelector(".page-number")){
        var n = document.createElement("div");
        n.className = "page-number";
        n.innerHTML = '<span style="color:#C7A86C;font-weight:900">'+(idx+1)+'</span><span style="color:#999"> / '+total+'</span>';
        page.appendChild(n);
      }
    });
  }
  setTimeout(fit, 800);
  setTimeout(fit, 2500);
})();
</script>
</body>
</html>`);

          printWindow.document.close();

          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            setIsExporting(false);
            setExportProgress("");
          }, 3500);
        }, 1500);
      } catch (err) {
        console.error("PDF export error:", err);
        alert("حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.");
        setIsExporting(false);
        setExportProgress("");
      }
    }, 200);
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev < SLIDES.length - 1) return prev + 1;
      setAutoPlay(false);
      return prev;
    });
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") goPrev();
      else if (e.key === "Escape") {
        if (isFullscreen) {
          const efs = (document as any).exitFullscreen || (document as any).webkitExitFullscreen;
          if (document.fullscreenElement && efs) efs.call(document).catch(() => {});
          setIsFullscreen(false);
        }
      }
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
      else if (e.key === " ") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        setIsFullscreen(false);
        setShowNav(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(goNext, 8000);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, goNext]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current as any;
    const doc = document as any;
    const isCurrentlyFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
    if (!isCurrentlyFullscreen && el) {
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen || el.msRequestFullscreen;
      if (rfs) {
        try {
          const result = rfs.call(el);
          if (result && result.then) {
            result.then(() => { setIsFullscreen(true); setShowNav(false); }).catch(() => {});
          } else {
            setIsFullscreen(true);
            setShowNav(false);
          }
        } catch { setIsFullscreen(true); setShowNav(false); }
      }
    } else if (isCurrentlyFullscreen) {
      const efs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.webkitCancelFullScreen || doc.msExitFullscreen;
      if (efs) {
        try {
          const result = efs.call(document);
          if (result && result.then) {
            result.then(() => { setIsFullscreen(false); setShowNav(true); }).catch(() => {});
          } else {
            setIsFullscreen(false);
            setShowNav(true);
          }
        } catch { setIsFullscreen(false); setShowNav(true); }
      }
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  const currentSection = SLIDES[currentSlide].section;
  const sectionColor = SECTION_COLORS[currentSection] || "#187860";


  return (
    <div
      ref={containerRef}
      className={`h-screen select-none overflow-hidden`}
      style={{ background: "#1a1a1a" }}
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-transform duration-300 ${isFullscreen && !showNav ? "-translate-y-full" : "translate-y-0"}`}
        style={{ background: "rgba(26,26,26,0.95)", borderColor: "rgba(199,168,108,0.15)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {!isFullscreen && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-white/70 hover:text-[#C7A86C] text-xs sm:text-sm px-2 sm:px-3" data-testid="button-back-home">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
                <div className="h-4 sm:h-5 w-px bg-white/15" />
              </>
            )}
            <div className="flex items-center gap-2">
              <img src={mojLogo} alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain hidden sm:block" />
              <span className="text-xs sm:text-sm font-bold text-white/90">العرض التقديمي</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors duration-300" style={{ background: `${sectionColor}12`, color: sectionColor, border: `1px solid ${sectionColor}20` }}>
              {currentSlide + 1}/{SLIDES.length}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPrintDialog(true)} disabled={isExporting} className="text-white/50 hover:text-[#C7A86C] p-1.5 sm:p-2" title="تصدير العرض" data-testid="button-export-pdf">
              {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAutoPlay(!autoPlay)} className="text-white/50 hover:text-[#C7A86C] p-1.5 sm:p-2" title={autoPlay ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي"} data-testid="button-autoplay">
              {autoPlay ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white/50 hover:text-[#C7A86C] p-1.5 sm:p-2" title={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"} data-testid="button-fullscreen">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>
            {isFullscreen && (
              <Button variant="ghost" size="sm" onClick={() => setShowNav(!showNav)} className="text-white/50 hover:text-[#C7A86C] p-1.5 sm:p-2 text-[10px] sm:text-xs" data-testid="button-toggle-nav">
                {showNav ? "إخفاء" : "إظهار"}
              </Button>
            )}
            <div className="h-4 w-px bg-white/15 mx-0.5" />
            <Button variant="outline" size="sm" onClick={goPrev} disabled={currentSlide === 0} className="border-white/20 text-white/70 hover:text-white hover:border-white/40 disabled:text-white/20 disabled:border-white/10 p-1.5 sm:p-2" data-testid="button-prev-slide">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} disabled={currentSlide === SLIDES.length - 1} className="border-white/20 text-white/70 hover:text-white hover:border-white/40 disabled:text-white/20 disabled:border-white/10 p-1.5 sm:p-2" data-testid="button-next-slide">
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {showNav && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-2 sm:pb-2.5">
            <div className="flex gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {SLIDES.map((slide, i) => {
                const slideColor = SECTION_COLORS[slide.section] || "#187860";
                const isSectionDivider = slide.id.startsWith("section-");
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`الانتقال إلى شريحة ${slide.title}`}
                    aria-current={i === currentSlide ? "true" : undefined}
                    className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs whitespace-nowrap transition-all duration-200 ${
                      i === currentSlide
                        ? "text-white shadow-md font-black"
                        : isSectionDivider
                        ? "font-bold hover:bg-white/10"
                        : "text-white/50 hover:bg-white/10 hover:text-white/80 font-medium"
                    }`}
                    style={
                      i === currentSlide
                        ? { background: slideColor }
                        : isSectionDivider
                        ? { color: slideColor, borderBottom: `2px solid ${slideColor}40` }
                        : undefined
                    }
                    data-testid={`button-slide-${slide.id}`}
                  >
                    {slide.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isFullscreen && !showNav && (
        <button onClick={() => setShowNav(true)} className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] bg-black/20 hover:bg-black/40 text-white rounded-full px-3 py-1 text-[10px] sm:text-xs backdrop-blur-sm transition-opacity opacity-30 hover:opacity-100" data-testid="button-show-toolbar">
          اضغط لإظهار القائمة
        </button>
      )}

      {showPrintDialog && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowPrintDialog(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm mx-4 w-full" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#187860] text-center mb-2">طباعة العرض التقديمي</h3>
            <p className="text-sm text-[#1F2937]/60 text-center mb-6">اختر اتجاه الصفحة</p>
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => exportPDF("portrait")}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#e8e8e8] hover:border-[#187860] hover:bg-[#187860]/5 transition-all cursor-pointer group w-[130px]"
                data-testid="button-print-portrait"
              >
                <div className="w-12 h-16 border-2 border-[#e8e8e8] group-hover:border-[#187860] rounded-md transition-colors flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-[#1F2937]/50 group-hover:text-[#187860] transition-colors" />
                </div>
                <span className="text-sm font-semibold text-[#1F2937]/80 group-hover:text-[#187860] transition-colors">عمودي</span>
              </button>
              <button
                onClick={() => exportPDF("landscape")}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#e8e8e8] hover:border-[#187860] hover:bg-[#187860]/5 transition-all cursor-pointer group w-[130px]"
                data-testid="button-print-landscape"
              >
                <div className="w-16 h-12 border-2 border-[#e8e8e8] group-hover:border-[#187860] rounded-md transition-colors flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-[#1F2937]/50 group-hover:text-[#187860] transition-colors" />
                </div>
                <span className="text-sm font-semibold text-[#1F2937]/80 group-hover:text-[#187860] transition-colors">أفقي</span>
              </button>
            </div>
            <button
              onClick={() => setShowPrintDialog(false)}
              className="w-full text-sm text-[#1F2937]/50 hover:text-[#1F2937]/80 transition-colors py-2"
              data-testid="button-print-cancel"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4" dir="rtl">
            <Loader2 className="w-12 h-12 text-[#187860] animate-spin" />
            <h3 className="text-lg font-bold text-[#187860]">جاري تصدير العرض</h3>
            <p className="text-sm text-[#1F2937]/60 text-center">{exportProgress}</p>
          </div>
        </div>
      )}

      <div data-slide-area>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={isExporting ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={isExporting ? undefined : { opacity: 0, x: 30 }}
            transition={{ duration: isExporting ? 0 : 0.3, ease: "easeInOut" }}
          >
            {SLIDES[currentSlide].render(isFullscreen)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={`fixed z-50 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-xl ${isFullscreen ? "bottom-4" : "bottom-4 sm:bottom-6"}`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {SLIDES.map((slide, i) => {
          const dotColor = SECTION_COLORS[slide.section] || "#C7A86C";
          const isSectionDivider = slide.id.startsWith("section-");
          return (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`شريحة ${i + 1}: ${slide.title}`}
              className={`rounded-full transition-all duration-200 ${
                i === currentSlide
                  ? "w-5 sm:w-7 h-3"
                  : isSectionDivider
                  ? "w-3 h-3"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5"
              }`}
              style={
                i === currentSlide
                  ? { background: dotColor }
                  : isSectionDivider
                  ? { backgroundColor: `${dotColor}50` }
                  : { backgroundColor: "rgba(255,255,255,0.3)" }
              }
              data-testid={`dot-slide-${i}`}
            />
          );
        })}
      </div>

      {autoPlay && (
        <div className="fixed bottom-0 left-0 right-0 h-0.5 sm:h-1 z-50">
          <motion.div
            className="h-full"
            style={{ background: sectionColor }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
            key={`progress-${currentSlide}`}
          />
        </div>
      )}
    </div>
  );
}
