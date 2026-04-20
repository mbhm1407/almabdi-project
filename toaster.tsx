import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

const variantConfig = {
  default: {
    icon: CheckCircle2,
    color: "#187860",
    bg: "#e6f4ea",
    accent: "linear-gradient(180deg, #187860 0%, #075e4a 100%)",
  },
  success: {
    icon: CheckCircle2,
    color: "#187860",
    bg: "#e6f4ea",
    accent: "linear-gradient(180deg, #187860 0%, #075e4a 100%)",
  },
  info: {
    icon: Info,
    color: "#187860",
    bg: "#e6f4ea",
    accent: "linear-gradient(180deg, #187860 0%, #075e4a 100%)",
  },
  warning: {
    icon: AlertTriangle,
    color: "#ec9a18",
    bg: "#fef3e2",
    accent: "linear-gradient(180deg, #ec9a18 0%, #c97f0f 100%)",
  },
  destructive: {
    icon: AlertCircle,
    color: "#B42318",
    bg: "#fdecec",
    accent: "linear-gradient(180deg, #B42318 0%, #8a1a12 100%)",
  },
} as const

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const cfg = variantConfig[(variant ?? "default") as keyof typeof variantConfig] ?? variantConfig.default
        const Icon = cfg.icon
        return (
          <Toast key={id} variant={variant} dir="rtl" {...props}>
            <span
              aria-hidden
              className="absolute end-0 top-0 h-full w-1"
              style={{ background: cfg.accent }}
            />
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: cfg.bg }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: cfg.color }} />
            </div>
            <div className="grid gap-0.5 flex-1 min-w-0 pt-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
