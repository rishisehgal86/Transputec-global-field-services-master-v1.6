import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequestService from "./pages/RequestService";
import TenantRequestForm from "./pages/TenantRequestForm";
import AdminDashboard from "./pages/AdminDashboard";
import CreateJob from "./pages/CreateJob";
import JobDetail from "./pages/JobDetail";
import EngineerView from "./pages/EngineerView";
import ClientTracker from "./pages/ClientTracker";
import UserManagement from "./pages/UserManagement";
import Projects from "./pages/Projects";
import ProjectRequest from "./pages/ProjectRequest";

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
      <Route path="/projects" component={Projects} />
      <Route path="/admin/job/:id" component={JobDetail} />
      <Route path="/engineer/:token" component={EngineerView} />
      <Route path="/track/:token" component={ClientTracker} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
