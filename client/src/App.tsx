import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import CyclePage from "./pages/CyclePage";
import AskRedtentPage from "./pages/AskRedtentPage";
import FoodPage from "./pages/FoodPage";
import GuidancePage from "./pages/GuidancePage";
import Home from "./pages/Home";
import JournalPage from "./pages/JournalPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import PatternsPage from "./pages/PatternsPage";
import WellnessPage from "./pages/WellnessPage";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/cycle" component={CyclePage} />
        <Route path="/food" component={FoodPage} />
        <Route path="/ask" component={AskRedtentPage} />
        <Route path="/patterns" component={PatternsPage} />
        <Route path="/wellness" component={WellnessPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/guidance" component={GuidancePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
