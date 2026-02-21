import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  CreditCard,
  Zap,
  TrendingUp,
  Package,
  Crown,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Switch, Badge, Separator, Progress } from "@/components/ui";
import {
  accountService,
  type AccountInfo,
  type BillingInfo,
  type UserPreferences,
  DEFAULT_PREFERENCES,
} from "@/api";
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
import { useSearchParams } from "react-router-dom";

const defaultPreferences: UserPreferences = DEFAULT_PREFERENCES;

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
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "account";

  const [preferences, setPreferences] = React.useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Account & Billing state
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo | null>(null);
  const [billingInfo, setBillingInfo] = React.useState<BillingInfo | null>(null);
  const [accountLoading, setAccountLoading] = React.useState(true);
  const [accountError, setAccountError] = React.useState<string | null>(null);

  // Load preferences from backend (with localStorage fallback)
  React.useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) {
        // Fall back to localStorage if no user
        const saved = localStorage.getItem("userPreferences");
        if (saved) {
          try {
            setPreferences(JSON.parse(saved));
          } catch {
            // Invalid JSON, use defaults
          }
        }
        return;
      }

      try {
        const prefs = await accountService.getPreferences(user.id);
        setPreferences(prefs);
        // Also save to localStorage as cache
        localStorage.setItem("userPreferences", JSON.stringify(prefs));
      } catch {
        // Fall back to localStorage
        const saved = localStorage.getItem("userPreferences");
        if (saved) {
          try {
            setPreferences(JSON.parse(saved));
          } catch {
            // Invalid JSON, use defaults
          }
        }
      }
    }

    loadPreferences();
  }, [user?.id]);

  // Load account and billing info
  React.useEffect(() => {
    async function loadAccountData() {
      if (!user?.id) {
        return;
      }

      setAccountLoading(true);
      setAccountError(null);

      try {
        const [account, billing] = await Promise.all([
          accountService.getAccountInfo(user.id),
          accountService.getBillingInfo(user.id),
        ]);
        setAccountInfo(account);
        setBillingInfo(billing);
      } catch (err) {
        setAccountError(err instanceof Error ? err.message : "Failed to load account info");
      } finally {
        setAccountLoading(false);
      }
    }

    loadAccountData();
  }, [user?.id]);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Always save to localStorage as cache
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // Save to backend if user is logged in
      if (user?.id) {
        await accountService.updatePreferences(user.id, preferences);
      }

      setHasChanges(false);
      toast.success("Settings saved successfully");
    } catch (err) {
      // Still mark as saved if localStorage worked
      setHasChanges(false);
      toast.error(
        err instanceof Error && err.message.includes("backend")
          ? "Settings saved locally (backend unavailable)"
          : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
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

        <Tabs
          defaultValue={defaultTab}
          className="animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <TabsList className="glass-strong mb-6 grid w-full grid-cols-5 lg:flex lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="account" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
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

          {/* Account & Billing Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {accountLoading ? (
                <div className="glass-strong flex items-center justify-center rounded-2xl border border-border/50 p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : accountError ? (
                <div className="glass-strong rounded-2xl border border-border/50 p-6">
                  <div className="flex items-center gap-3 text-yellow-500">
                    <AlertCircle className="h-5 w-5" />
                    <p>{accountError}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Account features will be available when the backend is connected.
                  </p>
                </div>
              ) : (
                <>
                  {/* Credits Overview Card */}
                  <div className="glass-strong rounded-2xl border border-border/50 p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/20 p-3">
                          <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Video Credits</h3>
                          <p className="text-sm text-muted-foreground">
                            {accountInfo?.planName || "Free Trial"}
                          </p>
                        </div>
                      </div>
                      {accountInfo?.isBetaUser && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Crown className="mr-1 h-3 w-3" />
                          Beta Tester
                        </Badge>
                      )}
                    </div>

                    {/* Videos Remaining - User-friendly display */}
                    <div className="mb-4 text-center">
                      <div className="text-5xl font-bold text-primary">
                        {accountInfo?.videos.remaining ?? 0}
                      </div>
                      <p className="text-muted-foreground">videos remaining</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {accountInfo?.videos.used ?? 0} used
                        </span>
                        <span className="text-muted-foreground">
                          {accountInfo?.videos.total ?? 0} total
                        </span>
                      </div>
                      <Progress
                        value={
                          accountInfo
                            ? (accountInfo.videos.used / accountInfo.videos.total) * 100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>

                    {/* Period Info */}
                    {accountInfo?.limits && (
                      <p className="text-center text-xs text-muted-foreground">
                        {accountInfo.limits.maxVideosPerPeriod} videos per{" "}
                        {accountInfo.limits.periodDays} day period
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="glass rounded-xl border border-border/50 p-4 text-center">
                      <TrendingUp className="mx-auto mb-2 h-5 w-5 text-green-400" />
                      <div className="text-2xl font-bold">{accountInfo?.videos.used ?? 0}</div>
                      <p className="text-xs text-muted-foreground">Videos Created</p>
                    </div>
                    <div className="glass rounded-xl border border-border/50 p-4 text-center">
                      <Zap className="mx-auto mb-2 h-5 w-5 text-yellow-400" />
                      <div className="text-2xl font-bold">{accountInfo?.credits.used ?? 0}</div>
                      <p className="text-xs text-muted-foreground">Credits Used</p>
                    </div>
                    <div className="glass rounded-xl border border-border/50 p-4 text-center">
                      <Package className="mx-auto mb-2 h-5 w-5 text-blue-400" />
                      <div className="text-2xl font-bold">
                        {accountInfo?.credits.remaining ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Credits Left</p>
                    </div>
                  </div>

                  {/* Subscription Plans */}
                  <div className="glass-strong rounded-2xl border border-border/50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Subscription Plans</h3>
                      {billingInfo?.isBetaMode && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Coming Soon
                        </Badge>
                      )}
                    </div>

                    {billingInfo?.betaMessage && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        {billingInfo.betaMessage}
                      </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {billingInfo?.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`relative rounded-xl border p-4 transition-all ${
                            plan.isCurrent
                              ? "border-green-500/50 bg-green-500/5"
                              : plan.popular
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/50"
                          } ${billingInfo.isBetaMode && !plan.isCurrent ? "opacity-60" : ""}`}
                        >
                          {plan.isCurrent && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500">
                              Current
                            </Badge>
                          )}
                          {plan.popular && !plan.isCurrent && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                              Popular
                            </Badge>
                          )}
                          <h4 className="mb-1 font-semibold">{plan.name}</h4>
                          <div className="mb-2">
                            <span className="text-2xl font-bold">
                              {plan.price === 0 ? "Free" : `$${plan.priceMonthly}`}
                            </span>
                            {plan.priceMonthly > 0 && (
                              <span className="text-sm text-muted-foreground">/mo</span>
                            )}
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {plan.videosIncluded} videos/month
                          </p>
                          <Button
                            variant={
                              plan.isCurrent ? "secondary" : plan.popular ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full"
                            disabled={billingInfo.isBetaMode || plan.isCurrent}
                          >
                            {plan.isCurrent ? "Current Plan" : "Upgrade"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Packages */}
                  <div className="glass-strong rounded-2xl border border-border/50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Buy More Credits</h3>
                      {billingInfo?.isBetaMode && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Coming Soon
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {billingInfo?.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`relative rounded-xl border p-4 transition-all ${
                            pkg.popular
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-primary/50"
                          } ${billingInfo.isBetaMode ? "opacity-60" : ""}`}
                        >
                          {pkg.popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                              Best Value
                            </Badge>
                          )}
                          <h4 className="mb-1 font-semibold">{pkg.name}</h4>
                          <div className="mb-1">
                            <span className="text-xl font-bold">${pkg.price}</span>
                          </div>
                          <p className="mb-1 text-sm text-muted-foreground">{pkg.videos} videos</p>
                          <p className="mb-2 text-xs text-green-400">
                            ${pkg.pricePerVideo.toFixed(2)}/video
                          </p>
                          {pkg.savings > 0 && (
                            <Badge variant="secondary" className="mb-3">
                              Save {pkg.savings}%
                            </Badge>
                          )}
                          <Button
                            variant={pkg.popular ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            disabled={billingInfo.isBetaMode}
                          >
                            Buy
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

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
