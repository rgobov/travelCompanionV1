import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Home from "@/pages/home";
import TourCreator from "@/pages/tour-creator";
import TourList from "@/pages/tour-list";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={TourCreator} />
        <Route path="/tours" component={TourList} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
