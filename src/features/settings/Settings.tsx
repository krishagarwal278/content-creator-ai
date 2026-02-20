import * as React from "react";
import {
  User,
  Bell,
  Palette,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Save,
  Loader2,
  Check,
  Camera,
  Mail,
  Lock,
  Sparkles,
  Video,
  Volume2,
  Subtitles,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Switch, Badge, Separator } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/common/contexts";

interface UserPreferences {
  defaultModel: string;
  defaultFormat: string;
  defaultDuration: number;
  voiceoverEnabled: boolean;
  captionsEnabled: boolean;
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  generationAlerts: boolean;
  weeklyDigest: boolean;
  language: string;
}

const defaultPreferences: UserPreferences = {
  defaultModel: "gpt-4o",
  defaultFormat: "reel",
  defaultDuration: 60,
  voiceoverEnabled: true,
  captionsEnabled: true,
  theme: "dark",
  emailNotifications: true,
  generationAlerts: true,
  weeklyDigest: false,
  language: "en",
};

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <Label className="font-medium">{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = React.useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("userPreferences");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // In a real app, you'd also save to backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      setHasChanges(false);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const userInitials = user?.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "U";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-6">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-slow absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="animate-pulse-slow absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex animate-fade-in items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences.
            </p>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </header>

        <Tabs defaultValue="profile" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <TabsList className="glass-strong mb-6 grid w-full grid-cols-4 lg:flex lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generation</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="glass-strong space-y-6 rounded-2xl border border-border/50 p-6">
              <SettingsSection
                title="Profile Information"
                description="Manage your account details"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-xl text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Avatar
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" value={user?.email || ""} disabled className="glass flex-1" />
                    <Badge variant="outline" className="bg-green-500/20 text-green-400">
                      <Check className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    defaultValue={user?.user_metadata?.full_name || ""}
                    className="glass"
                  />
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Security">
                <SettingRow
                  icon={<Lock className="h-5 w-5" />}
                  label="Password"
                  description="Change your account password"
                >
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </SettingRow>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Account Actions">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="gap-2 text-red-400 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SettingsSection>
            </div>
          </TabsContent>

          {/* Generation Preferences Tab */}
          <TabsContent value="preferences">
            <div className="glass-strong space-y-6 rounded-2xl border border-border/50 p-6">
              <SettingsSection
                title="Default Generation Settings"
                description="Set your preferred defaults for new projects"
              >
                <SettingRow
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Default AI Model"
                  description="Screenplay generation model"
                >
                  <Select
                    value={preferences.defaultModel}
                    onValueChange={(v) => updatePreference("defaultModel", v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                      <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow
                  icon={<Video className="h-5 w-5" />}
                  label="Default Format"
                  description="Video format for new projects"
                >
                  <Select
                    value={preferences.defaultFormat}
                    onValueChange={(v) => updatePreference("defaultFormat", v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reel">Reel (Vertical)</SelectItem>
                      <SelectItem value="short_video">Short Video</SelectItem>
                      <SelectItem value="vfx_movie">VFX Movie</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow
                  icon={<Volume2 className="h-5 w-5" />}
                  label="AI Voiceover"
                  description="Enable by default for new projects"
                >
                  <Switch
                    checked={preferences.voiceoverEnabled}
                    onCheckedChange={(c) => updatePreference("voiceoverEnabled", c)}
                  />
                </SettingRow>

                <SettingRow
                  icon={<Subtitles className="h-5 w-5" />}
                  label="Auto Captions"
                  description="Enable by default for new projects"
                >
                  <Switch
                    checked={preferences.captionsEnabled}
                    onCheckedChange={(c) => updatePreference("captionsEnabled", c)}
                  />
                </SettingRow>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Default Duration">
                <div className="space-y-2">
                  <Label>Target video duration (seconds)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={15}
                      max={180}
                      value={preferences.defaultDuration}
                      onChange={(e) =>
                        updatePreference("defaultDuration", parseInt(e.target.value) || 60)
                      }
                      className="glass w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {preferences.defaultDuration} seconds
                    </span>
                  </div>
                </div>
              </SettingsSection>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="glass-strong space-y-6 rounded-2xl border border-border/50 p-6">
              <SettingsSection
                title="Email Notifications"
                description="Choose what updates you receive via email"
              >
                <SettingRow
                  icon={<Mail className="h-5 w-5" />}
                  label="Email Notifications"
                  description="Receive important updates via email"
                >
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(c) => updatePreference("emailNotifications", c)}
                  />
                </SettingRow>

                <SettingRow
                  icon={<Video className="h-5 w-5" />}
                  label="Generation Alerts"
                  description="Get notified when videos are ready"
                >
                  <Switch
                    checked={preferences.generationAlerts}
                    onCheckedChange={(c) => updatePreference("generationAlerts", c)}
                  />
                </SettingRow>

                <SettingRow
                  icon={<Bell className="h-5 w-5" />}
                  label="Weekly Digest"
                  description="Summary of your weekly activity"
                >
                  <Switch
                    checked={preferences.weeklyDigest}
                    onCheckedChange={(c) => updatePreference("weeklyDigest", c)}
                  />
                </SettingRow>
              </SettingsSection>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="glass-strong space-y-6 rounded-2xl border border-border/50 p-6">
              <SettingsSection title="Theme" description="Choose your preferred color scheme">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => updatePreference("theme", value as UserPreferences["theme"])}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        preferences.theme === value
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${preferences.theme === value ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-sm font-medium ${preferences.theme === value ? "text-primary" : ""}`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingsSection>

              <Separator />

              <SettingsSection title="Language" description="Select your preferred language">
                <SettingRow
                  icon={<Globe className="h-5 w-5" />}
                  label="Display Language"
                  description="Language for the interface"
                >
                  <Select
                    value={preferences.language}
                    onValueChange={(v) => updatePreference("language", v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SettingsSection>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
