import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Bell, Shield, Save } from "lucide-react";
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
        <div className="slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Info */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{profileData.name}</p>
              <p className="text-muted-foreground">{profileData.email}</p>
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
