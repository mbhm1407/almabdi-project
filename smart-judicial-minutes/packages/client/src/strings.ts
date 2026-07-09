/**
 * Central Arabic copy for the application. Keeping every user-facing label here
 * guarantees consistent, official Ministry-of-Justice terminology and keeps the
 * UI free of developer/technical wording.
 */
export const AR = {
  ministry: 'وزارة العدل',
  appName: 'المحضر الذكي',

  // Actions
  startDocumentation: 'بدء التوثيق',
  stopDocumentation: 'إيقاف التوثيق',
  pause: 'إيقاف مؤقت',
  resume: 'استئناف',
  search: 'البحث',
  export: 'تصدير',
  print: 'طباعة',
  settings: 'الإعدادات',
  addBookmark: 'إضافة علامة',
  copyLine: 'نسخ السطر',
  copyAll: 'نسخ النص كاملاً',
  close: 'إغلاق',
  cancel: 'إلغاء',
  save: 'حفظ',
  retry: 'إعادة المحاولة',
  download: 'تنزيل',

  // Sections / labels
  liveTranscript: 'النص المباشر',
  recording: 'التسجيل الصوتي',
  attendees: 'الحاضرون',
  statistics: 'إحصائيات الجلسة',
  bookmarks: 'العلامات المرجعية',
  caseNumber: 'رقم القضية',
  circuit: 'اسم الدائرة',
  judge: 'القاضي',
  clerk: 'كاتب الضبط',
  hearingDate: 'تاريخ الجلسة',
  startTime: 'وقت بدء الجلسة',
  sessionDuration: 'مدة الجلسة',
  currentStatus: 'الحالة',
  currentSpeaker: 'المتحدث الحالي',
  darkMode: 'الوضع الليلي',

  // Statistics
  speakersCount: 'عدد المتحدثين',
  wordsCount: 'عدد الكلمات',
  phrasesCount: 'عدد العبارات',
  lastUpdate: 'آخر تحديث',
  connection: 'حالة الاتصال',
  speechService: 'خدمة التوثيق الصوتي',

  // Statuses
  statusIdle: 'جاهز',
  statusStarting: 'جارٍ البدء…',
  statusActive: 'التوثيق جارٍ',
  statusPaused: 'إيقاف مؤقت',
  statusStopping: 'جارٍ الإيقاف…',
  statusError: 'انقطاع',
  connected: 'متصل',
  disconnected: 'غير متصل',
  reconnecting: 'إعادة الاتصال…',

  // Export
  exportPdf: 'تصدير PDF',
  exportDocx: 'تصدير Word',
  exportTxt: 'تصدير نصّي',

  // Empty / prompts
  waitingForSpeech: 'في انتظار الكلام… سيظهر النص العربي هنا فور بدء المتحدثين.',
  noSearchResults: 'لا توجد نتائج مطابقة لبحثك.',
  searchPlaceholder: 'ابحث في النص…',
  noBookmarks: 'لا توجد علامات بعد. استخدم «إضافة علامة» لتوثيق لحظة مهمة.',
  bookmarkLabelPlaceholder: 'وصف العلامة (مثال: بداية الدعوى)',
} as const;

export type StringKey = keyof typeof AR;
