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
 * Submit interest form to join the waitlist
 */
export async function submitInterestForm(data: InterestFormData): Promise<InterestSubmission> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/interest/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        earlyAccessPriority: data.earlyAccessPriority,
        videoTopics: data.videoTopics,
        useCase: data.useCase,
        aiExperience: data.aiExperience,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message || json.message || "Failed to submit interest form");
    }

    const submission = json.data?.submission || json.submission;
    return {
      id: submission.id,
      fullName: submission.fullName || submission.full_name,
      email: submission.email,
      role: submission.role,
      earlyAccessPriority: submission.earlyAccessPriority || submission.early_access_priority,
      videoTopics: submission.videoTopics || submission.video_topics,
      useCase: submission.useCase || submission.use_case,
      aiExperience: submission.aiExperience || submission.ai_experience,
      createdAt: submission.createdAt || submission.created_at,
      status: submission.status,
      isBetaUser: submission.isBetaUser || submission.is_beta_user,
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
