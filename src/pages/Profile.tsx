import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Bell, Shield, Save, Settings, Palette, Lock, KeyRound, Smartphone, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "Demo User",
    email: "demo@ridewise.com",
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="slide-up relative">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl gradient-primary shadow-lg shadow-primary/20">
                <Settings className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>Manage your account</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Customize your account settings and notification preferences.
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h3 className="font-semibold flex items-center gap-2 relative">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Personal Information
          </h3>
          
          <div className="flex items-center gap-6 relative">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-xl">{profileData.name}</p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profileData.email}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Your email"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <Button variant="hero" className="w-full sm:w-auto">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive browser notifications</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Weekly Report</p>
                <p className="text-sm text-muted-foreground">Get a summary of predictions</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Security
          </h3>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Last password change: Never
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
