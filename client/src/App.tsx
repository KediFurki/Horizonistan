import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MatchDetail from "./pages/MatchDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminPredictions from "./pages/AdminPredictions";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import ProfileSettings from "./pages/ProfileSettings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/match/:id" component={MatchDetail} />
      <Route path={"/leaderboard"} component={Leaderboard} />
       <Route path="/user/:userId" component={UserProfile} />
      <Route path="/profile/settings" component={ProfileSettings} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"admin"} component={Admin} />
      <Route path={"admin/users"} component={AdminUsers} />
      <Route path={"/admin/predictions"} component={AdminPredictions} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
