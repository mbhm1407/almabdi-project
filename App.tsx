import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationsProvider } from "@/lib/notifications";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import BeneficiaryPage from "@/pages/beneficiary";
import EmployeePage from "@/pages/employee";
import ManagerPage from "@/pages/manager";

import PresentationPage from "@/pages/presentation";
import FAQPage from "@/pages/faq";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import FeaturesPage from "@/pages/features";
import SessionsLabPage from "@/pages/sessions-lab";

function AnimatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <Component />
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/"><AnimatedRoute component={HomePage} /></Route>
        <Route path="/beneficiary"><AnimatedRoute component={BeneficiaryPage} /></Route>
        <Route path="/employee"><AnimatedRoute component={EmployeePage} /></Route>
        <Route path="/manager"><AnimatedRoute component={ManagerPage} /></Route>
        <Route path="/presentation"><AnimatedRoute component={PresentationPage} /></Route>
        <Route path="/faq"><AnimatedRoute component={FAQPage} /></Route>
        <Route path="/about"><AnimatedRoute component={AboutPage} /></Route>
        <Route path="/contact"><AnimatedRoute component={ContactPage} /></Route>
        <Route path="/features"><AnimatedRoute component={FeaturesPage} /></Route>
        <Route path="/sessions-lab"><AnimatedRoute component={SessionsLabPage} /></Route>
        <Route><AnimatedRoute component={NotFound} /></Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <NotificationsProvider>
            <Toaster />
            <Router />
          </NotificationsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
