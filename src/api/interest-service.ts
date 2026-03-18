/**
 * Interest Form Service
 * Calls backend API for waitlist/interest form submissions
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export type UserRole =
  | "student"
  | "self_learner"
  | "educator"
  | "content_creator"
  | "professional"
  | "developer"
  | "other";

export type EarlyAccessPriority = "very_interested" | "somewhat_interested" | "just_exploring";

export type UseCase =
  | "create_learning_videos"
  | "summarize_concepts"
  | "study_faster"
  | "build_courses"
  | "content_creation"
  | "experimenting";

export type AIExperience = "beginner" | "intermediate" | "advanced" | "power_user";

export interface InterestFormData {
  // Required fields
  fullName: string;
  email: string;
  role: string;
  earlyAccessPriority: string;
  // Optional fields
  videoTopics?: string[];
  useCase?: string;
  aiExperience?: string;
}

export interface InterestSubmission {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  earlyAccessPriority: EarlyAccessPriority;
  videoTopics?: string[];
  useCase?: UseCase;
  aiExperience?: AIExperience;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  isBetaUser: boolean;
}

export interface InterestStats {
  total: number;
  pending: number;
  approved: number;
  betaUsers: number;
}

/**
 * Build a user-facing message from API validation error payload (e.g. fieldErrors).
 * Backend may return which field failed so the UI can show a specific message.
 */
function formatValidationError(json: Record<string, unknown>): string | null {
  const fieldErrors = (json.error as Record<string, unknown>)?.fieldErrors ?? json.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
    const entries = Object.entries(fieldErrors);
    if (entries.length > 0) {
      const [field, messages] = entries[0];
      const msg = Array.isArray(messages) ? messages[0] : messages;
      if (typeof msg === "string" && msg.trim()) {
        const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
        return `${label}: ${msg}`;
      }
    }
  }
  return null;
}

/** Only these 3 values are sent for earlyAccessPriority – backend allowlist. */
const ALLOWED_EARLY_ACCESS_PRIORITIES: EarlyAccessPriority[] = [
  "very_interested",
  "somewhat_interested",
  "just_exploring",
];

/**
 * Submit interest form to join the waitlist.
 * Sends only allowed values; omits optional fields when empty to avoid backend validation errors.
 */
export async function submitInterestForm(data: InterestFormData): Promise<InterestSubmission> {
  try {
    const priority =
      data.earlyAccessPriority &&
      ALLOWED_EARLY_ACCESS_PRIORITIES.includes(data.earlyAccessPriority as EarlyAccessPriority)
        ? data.earlyAccessPriority
        : ALLOWED_EARLY_ACCESS_PRIORITIES[0];

    const body: Record<string, unknown> = {
      fullName: String(data.fullName ?? "").trim(),
      email: String(data.email ?? "").trim(),
      role: String(data.role ?? "").trim(),
      earlyAccessPriority: priority,
    };
    if (Array.isArray(data.videoTopics) && data.videoTopics.length > 0) {
      body.videoTopics = data.videoTopics;
    }
    if (data.useCase && String(data.useCase).trim()) {
      body.useCase = data.useCase.trim();
    }
    if (data.aiExperience && String(data.aiExperience).trim()) {
      body.aiExperience = data.aiExperience.trim();
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/interest/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let json: Record<string, unknown> = {};
    try {
      const parsed = await response.json();
      json = typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      // 500 or non-JSON response
    }

    if (!response.ok) {
      const msg =
        formatValidationError(json) ??
        (json.error as Record<string, unknown>)?.message ??
        json.message ??
        (json.error as string);
      throw new Error(typeof msg === "string" && msg ? msg : "Failed to submit. Please try again.");
    }

    const resData = json.data as Record<string, unknown> | undefined;
    const submission = (resData?.submission ?? json.submission) as
      | Record<string, unknown>
      | undefined;
    if (!submission || typeof submission !== "object") {
      throw new Error("Invalid response from server. Please try again.");
    }
    return {
      id: String(submission.id ?? ""),
      fullName: String(submission.fullName ?? submission.full_name ?? ""),
      email: String(submission.email ?? ""),
      role: String(submission.role ?? "") as UserRole,
      earlyAccessPriority: String(
        submission.earlyAccessPriority ?? submission.early_access_priority ?? "very_interested",
      ) as EarlyAccessPriority,
      videoTopics: (submission.videoTopics ?? submission.video_topics) as string[] | undefined,
      useCase: (submission.useCase ?? submission.use_case) as UseCase | undefined,
      aiExperience: (submission.aiExperience ?? submission.ai_experience) as
        | AIExperience
        | undefined,
      createdAt: String(submission.createdAt ?? submission.created_at ?? ""),
      status: String(submission.status ?? "pending") as "pending" | "approved" | "rejected",
      isBetaUser: Boolean(submission.isBetaUser ?? submission.is_beta_user),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get all interest submissions (admin only)
 */
export async function getInterestSubmissions(): Promise<InterestSubmission[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/interest`);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || "Failed to fetch submissions");
    }

    const json = await response.json();
    return json.data?.submissions || [];
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

/**
 * Get waitlist statistics
 */
export async function getInterestStats(): Promise<InterestStats> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/interest/stats`);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || "Failed to fetch stats");
    }

    const json = await response.json();
    return json.data?.stats || { total: 0, pending: 0, approved: 0, betaUsers: 0 };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      );
    }
    throw error;
  }
}

export const interestService = {
  submitInterestForm,
  getInterestSubmissions,
  getInterestStats,
};
