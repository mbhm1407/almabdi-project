import { ApiClientError } from './apiClient';

export interface FriendlyError {
  title: string;
  message: string;
  /** Whether the clerk can retry the failed action. */
  recoverable: boolean;
}

/**
 * Maps low-level failures (API errors, speech/network faults) to friendly,
 * actionable Arabic messages shown in a Fluent dialog. Covers the categories the
 * clerk is most likely to hit: auth/permission, token expiry, network loss, and
 * Azure/speech unavailability.
 */
export function toFriendlyError(error: unknown): FriendlyError {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 401:
        return {
          title: 'انتهت صلاحية الجلسة',
          message:
            'انتهت صلاحية تسجيل الدخول. يرجى تحديث الصفحة لإعادة المصادقة عبر Microsoft Teams.',
          recoverable: true,
        };
      case 403:
        return {
          title: 'صلاحيات غير كافية',
          message: 'لا تملك الصلاحية اللازمة لتنفيذ هذا الإجراء. تواصل مع مسؤول النظام.',
          recoverable: false,
        };
      case 429:
        return {
          title: 'طلبات كثيرة',
          message:
            'تم تجاوز الحد المسموح من الطلبات مؤقتًا. يرجى الانتظار قليلًا ثم إعادة المحاولة.',
          recoverable: true,
        };
      case 502:
      case 503:
        return {
          title: 'خدمة النسخ غير متاحة',
          message: 'خدمة Azure للتعرف على الكلام غير متاحة حاليًا. يرجى إعادة المحاولة بعد قليل.',
          recoverable: true,
        };
      default:
        return {
          title: 'تعذّر إتمام العملية',
          message: error.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.',
          recoverable: true,
        };
    }
  }

  const raw = error instanceof Error ? error.message : String(error ?? '');
  const lowered = raw.toLowerCase();

  if (
    lowered.includes('permission') ||
    lowered.includes('notallowed') ||
    lowered.includes('denied') ||
    lowered.includes('microphone')
  ) {
    return {
      title: 'تعذّر الوصول إلى الميكروفون',
      message: 'يرجى السماح للتطبيق باستخدام الميكروفون من إعدادات المتصفح أو Microsoft Teams.',
      recoverable: true,
    };
  }

  if (
    lowered.includes('network') ||
    lowered.includes('failed to fetch') ||
    lowered.includes('offline')
  ) {
    return {
      title: 'انقطاع الاتصال بالشبكة',
      message: 'تحقق من اتصالك بالإنترنت. سيُحتفظ بالنص المُسجّل وستُعاد المحاولة تلقائيًا.',
      recoverable: true,
    };
  }

  if (
    lowered.includes('speech') ||
    lowered.includes('websocket') ||
    lowered.includes('1006') ||
    lowered.includes('token')
  ) {
    return {
      title: 'انقطع النسخ المباشر',
      message:
        'انقطع الاتصال بخدمة التعرّف على الكلام. أوقف النسخ ثم ابدأه من جديد لاستئناف التسجيل.',
      recoverable: true,
    };
  }

  return {
    title: 'حدث خطأ',
    message: raw || 'حدث خطأ غير متوقع. يرجى إعادة المحاولة.',
    recoverable: true,
  };
}
