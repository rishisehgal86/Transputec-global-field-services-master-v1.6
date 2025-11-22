import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import { AccountStatusWrapper } from "./components/AccountStatusWrapper";

// Lazy load all page components to reduce initial bundle size
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TenantRequestForm = lazy(() => import("./pages/TenantRequestForm"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const EngineerView = lazy(() => import("./pages/EngineerView"));
const ClientTracker = lazy(() => import("./pages/ClientTracker"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const TenantManagement = lazy(() => import("./pages/TenantManagement"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectRequest = lazy(() => import("./pages/ProjectRequest"));
const DebugSites = lazy(() => import("./pages/DebugSites"));
const BillingPortal = lazy(() => import("./pages/BillingPortal"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/request/:orgSlug" component={TenantRequestForm} />
      <Route path="/project-request/:projectId" component={ProjectRequest} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/create" component={CreateJob} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/tenants" component={TenantManagement} />
      <Route path="/projects" component={Projects} />
      <Route path="/admin/billing" component={BillingPortal} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/admin/job/:id" component={JobDetail} />
      <Route path="/engineer/:token" component={EngineerView} />
      <Route path="/track/:token" component={ClientTracker} />
      <Route path="/debug-sites" component={DebugSites} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <AccountStatusWrapper>
              <Router />
            </AccountStatusWrapper>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
