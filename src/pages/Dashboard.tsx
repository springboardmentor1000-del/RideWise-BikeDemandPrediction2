import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Activity,
  BarChart3,
  Target,
  Lightbulb,
  ThermometerSun,
  Timer,
  Award
} from "lucide-react";

const DashboardHome = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section with animated gradient */}
        <div className="slide-up relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -top-5 left-20 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-pulse delay-150" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3 gradient-text">Welcome to RideWise</h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Make smarter predictions for your bike rental operations with AI-powered insights.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Prediction Card */}
          <Link to="/dashboard/daily" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Daily Prediction</h3>
                <p className="text-muted-foreground mb-4">
                  Forecast total bike rentals for an entire day based on weather and seasonal factors.
                </p>
                <div className="flex items-center text-primary font-semibold">
                  <span className="group-hover:underline">Start Predicting</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Hourly Prediction Card */}
          <Link to="/dashboard/hourly" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-accent/10 text-accent w-fit mb-4 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300 group-hover:scale-110">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">Hourly Prediction</h3>
                <p className="text-muted-foreground mb-4">
                  Get precise hour-by-hour predictions including peak hour detection.
                </p>
                <div className="flex items-center text-accent font-semibold">
                  <span className="group-hover:underline">Start Predicting</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Preview with enhanced styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Avg. Accuracy</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">87.5%</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>+2.3% this week</span>
            </div>
          </div>
          
          <div className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Daily Predictions</span>
            </div>
            <p className="text-3xl font-bold">24</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Last 7 days</span>
            </div>
          </div>
          
          <div className="group rounded-2xl bg-card border border-border p-6 hover:border-accent/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Timer className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Hourly Predictions</span>
            </div>
            <p className="text-3xl font-bold">156</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Last 7 days</span>
            </div>
          </div>
          
          <div className="group rounded-2xl bg-card border border-border p-6 hover:border-success/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <Zap className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Peak Hour</span>
            </div>
            <p className="text-3xl font-bold">5-7 PM</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <Award className="h-3 w-3" />
              <span>High demand</span>
            </div>
          </div>
        </div>

        {/* Tips Section with enhanced styling */}
        <div className="rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              Pro Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
                <ThermometerSun className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Temperature and weather conditions have the highest impact on rental predictions.</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-colors">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Use hourly predictions for peak hours (typically 5-7 PM) to optimize inventory.</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-success/30 transition-colors">
                <Sparkles className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">The comfort index auto-calculates based on temperature and humidity inputs.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
