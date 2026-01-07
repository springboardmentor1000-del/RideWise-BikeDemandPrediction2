import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { Calendar, Clock, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHome = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="slide-up">
          <h1 className="text-3xl font-bold mb-2">Welcome to RideWise</h1>
          <p className="text-muted-foreground">
            Make smarter predictions for your bike rental operations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Prediction Card */}
          <Link to="/dashboard/daily" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Daily Prediction</h3>
                <p className="text-muted-foreground mb-4">
                  Forecast total bike rentals for an entire day based on weather and seasonal factors.
                </p>
                <div className="flex items-center text-primary font-medium">
                  Start Predicting
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Hourly Prediction Card */}
          <Link to="/dashboard/hourly" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-accent/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="p-3 rounded-xl bg-accent/10 text-accent w-fit mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hourly Prediction</h3>
                <p className="text-muted-foreground mb-4">
                  Get precise hour-by-hour predictions including peak hour detection.
                </p>
                <div className="flex items-center text-accent font-medium">
                  Start Predicting
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Avg. Accuracy</span>
            </div>
            <p className="text-2xl font-bold">87.5%</p>
          </div>
          
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Daily Predictions</span>
            </div>
            <p className="text-2xl font-bold">24</p>
          </div>
          
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Hourly Predictions</span>
            </div>
            <p className="text-2xl font-bold">156</p>
          </div>
          
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Peak Hour Detected</span>
            </div>
            <p className="text-2xl font-bold">5-7 PM</p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="rounded-2xl bg-secondary/50 border border-border p-6">
          <h3 className="font-semibold mb-4">💡 Pro Tips</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Temperature and weather conditions have the highest impact on rental predictions.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use hourly predictions for peak hours (typically 5-7 PM) to optimize inventory.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              The comfort index auto-calculates based on temperature and humidity inputs.
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
