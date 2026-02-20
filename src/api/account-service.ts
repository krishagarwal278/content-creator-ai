const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface AccountCredits {
  total: number;
  used: number;
  remaining: number;
}

export interface AccountVideos {
  total: number;
  used: number;
  remaining: number;
}

export interface AccountLimits {
  maxVideosPerPeriod: number;
  periodDays: number;
  creditsPerVideo: number;
}

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface AccountInfo {
  planName: string;
  planType: "free" | "starter" | "pro" | "enterprise" | "beta";
  isBetaUser: boolean;
  credits: AccountCredits;
  videos: AccountVideos;
  limits: AccountLimits;
  recentTransactions?: CreditTransaction[];
}

// Default account info when backend is unavailable or user has no credits yet
export const DEFAULT_ACCOUNT_INFO: AccountInfo = {
  planName: "Free Trial",
  planType: "free",
  isBetaUser: true,
  credits: { total: 40, used: 0, remaining: 40 },
  videos: { total: 4, used: 0, remaining: 4 },
  limits: { maxVideosPerPeriod: 4, periodDays: 14, creditsPerVideo: 10 },
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceMonthly: number;
  priceYearly: number;
  videosIncluded: number;
  credits: number;
  features: string[];
  limitations: string[];
  popular?: boolean;
  isCurrent?: boolean;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  videos: number;
  credits: number;
  pricePerVideo: number;
  savings: number;
  popular?: boolean;
}

export interface BillingInfo {
  currentPlan: {
    id: string;
    name: string;
    price: number;
  };
  credits: {
    total: number;
    remaining: number;
    videosRemaining: number;
  };
  plans: SubscriptionPlan[];
  packages: CreditPackage[];
  creditCosts: {
    video: number;
    screenplay: number;
  };
  isBetaMode: boolean;
  betaMessage?: string | null;
}

export interface UsageEntry {
  date: string;
  count: number;
}

export interface UsageStats {
  totalVideos: number;
  totalCreditsUsed: number;
  averagePerDay: number;
  history: UsageEntry[];
}

export async function getAccountInfo(userId: string): Promise<AccountInfo> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/account?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch account info");
    }
    const json = await response.json();
    // Backend wraps response in { success, data, meta } format
    return json.data?.account || json.account;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function getBillingInfo(userId: string): Promise<BillingInfo> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/billing?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch billing info");
    }
    const json = await response.json();
    // Backend wraps response in { success, data, meta } format
    return json.data?.billing || json.billing;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function getUsageStats(
  userId: string,
  period: "7d" | "30d" | "90d" = "30d",
): Promise<UsageStats> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/users/usage?userId=${userId}&period=${period}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch usage stats");
    }
    const json = await response.json();
    // Backend wraps response in { success, data, meta } format
    return json.data?.usage || json.usage;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  newBalance?: number;
}

export async function purchaseCredits(userId: string, packageId: string): Promise<PurchaseResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/billing/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packageId }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || json.error || "Purchase failed");
    }
    // Backend wraps response in { success, data, meta } format
    return json.data || json;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export async function subscribeToPlan(userId: string, planId: string): Promise<PurchaseResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/billing/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planId }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || json.error || "Subscription failed");
    }
    // Backend wraps response in { success, data, meta } format
    return json.data || json;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

// =============================================================================
// USER PREFERENCES API
// =============================================================================

export interface UserPreferences {
  defaultModel: string;
  defaultFormat: string;
  defaultDuration: number;
  voiceoverEnabled: boolean;
  captionsEnabled: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  generationAlerts: boolean;
  weeklyDigest: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultModel: "gpt-4o",
  defaultFormat: "reel",
  defaultDuration: 60,
  voiceoverEnabled: true,
  captionsEnabled: true,
  theme: "dark",
  language: "en",
  emailNotifications: true,
  generationAlerts: true,
  weeklyDigest: false,
};

export async function getPreferences(userId: string): Promise<UserPreferences> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/preferences?userId=${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return DEFAULT_PREFERENCES;
      }
      throw new Error("Failed to fetch preferences");
    }
    const data = await response.json();
    return data.data?.preferences || data.preferences || DEFAULT_PREFERENCES;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("Backend not available, using default preferences");
      return DEFAULT_PREFERENCES;
    }
    throw error;
  }
}

export async function updatePreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, preferences }),
    });
    if (!response.ok) {
      throw new Error("Failed to update preferences");
    }
    const data = await response.json();
    return data.data?.preferences || data.preferences;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export const accountService = {
  getAccountInfo,
  getBillingInfo,
  getUsageStats,
  purchaseCredits,
  subscribeToPlan,
  getPreferences,
  updatePreferences,
  DEFAULT_ACCOUNT_INFO,
  DEFAULT_PREFERENCES,
};
