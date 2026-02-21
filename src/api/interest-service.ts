/**
 * Interest Form Service
 * Calls backend API for waitlist/interest form submissions
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface InterestFormData {
  fullName: string;
  email: string;
  phone?: string;
}

export interface InterestSubmission {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
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
        phone: data.phone,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message || json.message || "Failed to submit interest form");
    }

    const submission = json.data?.submission || json.submission;
    return {
      id: submission.id,
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      createdAt: submission.createdAt,
      status: submission.status,
      isBetaUser: submission.isBetaUser,
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
