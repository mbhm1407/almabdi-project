import { useLocation } from "wouter";
import { Home, UserCircle, Briefcase, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/beneficiary", icon: UserCircle, label: "مستفيد" },
  { path: "/employee", icon: Briefcase, label: "موظف" },
  { path: "/manager", icon: Crown, label: "مدير" },
];

export function BottomNav() {
  const [location, navigate] = useLocation();

  const isVisible = location !== "/";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur-sm"
          data-testid="bottom-nav"
        >
          <div className="flex items-center justify-around px-2 py-2 pb-safe">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
                  data-testid={`bottom-nav-${item.path.replace("/", "") || "home"}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={isActive ? { background: "#187860" } : {}}
                  >
                    <Icon
                      className="w-4 h-4 transition-all"
                      style={{ color: isActive ? "white" : undefined }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold transition-all"
                    style={{ color: isActive ? "#187860" : undefined }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
