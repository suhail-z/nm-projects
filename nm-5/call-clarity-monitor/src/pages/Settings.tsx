
import { useState } from "react";
import { Check, Bell, Sun, Moon } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    complianceAlerts: true,
    dailySummary: false,
    desktopNotifications: true
  });
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    
    toast({
      title: `${newMode ? "Dark" : "Light"} mode activated`,
      duration: 2000,
    });
  };
  
  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast({
      title: `Notification setting updated`,
      description: `${setting} is now ${notificationSettings[setting] ? "disabled" : "enabled"}`,
      duration: 2000,
    });
  };
  
  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
      duration: 2000,
    });
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl">JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="mt-4">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Jane" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="jane.doe@company.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Compliance Manager" disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges}>Update Password</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose when and how you would like to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                    <p className="text-muted-foreground text-sm">Receive email updates for important events</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="complianceAlerts" className="font-medium">Compliance Alerts</Label>
                    <p className="text-muted-foreground text-sm">Get notified immediately when compliance issues are detected</p>
                  </div>
                  <Switch
                    id="complianceAlerts"
                    checked={notificationSettings.complianceAlerts}
                    onCheckedChange={() => handleNotificationChange("complianceAlerts")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dailySummary" className="font-medium">Daily Summary</Label>
                    <p className="text-muted-foreground text-sm">Receive a daily summary of all analyzed calls</p>
                  </div>
                  <Switch
                    id="dailySummary"
                    checked={notificationSettings.dailySummary}
                    onCheckedChange={() => handleNotificationChange("dailySummary")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="desktopNotifications" className="font-medium">Desktop Notifications</Label>
                    <p className="text-muted-foreground text-sm">Show browser notifications when you're online</p>
                  </div>
                  <Switch
                    id="desktopNotifications"
                    checked={notificationSettings.desktopNotifications}
                    onCheckedChange={() => handleNotificationChange("desktopNotifications")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto" onClick={handleSaveChanges}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode" className="font-medium">Theme</Label>
                  <p className="text-muted-foreground text-sm">Toggle between light and dark mode</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <Switch
                    id="darkMode"
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="font-medium mb-2 block">Text Size</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="secondary" size="sm">Medium</Button>
                  <Button variant="outline" size="sm">Large</Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="font-medium mb-2 block">Accent Color</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600">
                    <Check className="h-4 w-4 text-white" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-teal-500 hover:bg-teal-600" />
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-purple-500 hover:bg-purple-600" />
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-rose-500 hover:bg-rose-600" />
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-amber-500 hover:bg-amber-600" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto" onClick={handleSaveChanges}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Rules</CardTitle>
              <CardDescription>
                Configure compliance detection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium mb-2 block">Compliance Sensitivity</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">Relaxed</Button>
                  <Button variant="secondary" size="sm">Standard</Button>
                  <Button variant="outline" size="sm">Strict</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Adjusts how strictly the system flags potential compliance issues
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Detect Personal Data Collection</Label>
                    <p className="text-muted-foreground text-sm">Flag when agents collect unnecessary personal information</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Script Adherence</Label>
                    <p className="text-muted-foreground text-sm">Check if agents follow required scripts and disclosures</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Detect Misleading Information</Label>
                    <p className="text-muted-foreground text-sm">Flag potentially incorrect or misleading statements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Sentiment Analysis</Label>
                    <p className="text-muted-foreground text-sm">Monitor tone and emotional content of conversations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="font-medium mb-3 block">Industry-Specific Rules</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm">Financial Services</Button>
                  <Button variant="outline" size="sm">Healthcare</Button>
                  <Button variant="outline" size="sm">Insurance</Button>
                  <Button variant="outline" size="sm">Telecommunications</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SettingsPage;
