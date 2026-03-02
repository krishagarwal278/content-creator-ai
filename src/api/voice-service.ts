/**
 * Voice / TTS Service
 * Calls backend API which proxies to OpenAI TTS (API keys server-side only).
 * Same pattern as fal-video-service: frontend → backend → OpenAI.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export interface SynthesizeSpeechRequest {
  /** Text to convert to speech */
  text: string;
  /** Voice ID from DEFAULT_AI_VOICES (e.g. professional-m). Backend maps to OpenAI voice. */
  voiceId: string;
  userId?: string;
  /** Optional: tts-1, tts-1-hd, or gpt-4o-mini-tts */
  model?: string;
}

export interface SynthesizeSpeechResponse {
  success: boolean;
  /** Public URL of generated audio (backend uploads to storage) */
  audioUrl?: string;
  /** Alternative: base64 audio data if backend doesn't return URL */
  audioBase64?: string;
  error?: string;
}

export interface VoiceListResponse {
  success: boolean;
  voices?: Array<{
    id: string;
    name: string;
    description?: string;
    language?: string;
  }>;
  error?: string;
}

/**
 * Synthesize speech from text using backend (OpenAI TTS proxy).
 * Use for preview in VoiceoverSelector or for per-scene narration in video generation.
 */
export async function synthesizeSpeech(
  request: SynthesizeSpeechRequest,
): Promise<SynthesizeSpeechResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/voice/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: request.text,
        voiceId: request.voiceId,
        userId: request.userId,
        model: request.model ?? "tts-1-hd",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to synthesize speech" }));
      return {
        success: false,
        error: error.message || `HTTP ${response.status}: Failed to synthesize speech`,
      };
    }

    const result = await response.json();
    const data = result.data ?? result;

    return {
      success: data.success ?? true,
      audioUrl: data.audioUrl,
      audioBase64: data.audioBase64,
      error: data.error,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        success: false,
        error: `Cannot connect to backend at ${BACKEND_URL}. Make sure your backend server is running.`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch available voices from backend (optional).
 * If backend does not implement GET /api/v1/voice/list, use DEFAULT_AI_VOICES from video-generation-service.
 */
export async function getVoices(userId?: string): Promise<VoiceListResponse> {
  try {
    const url = userId
      ? `${BACKEND_URL}/api/v1/voice/list?userId=${encodeURIComponent(userId)}`
      : `${BACKEND_URL}/api/v1/voice/list`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Voice list not implemented" };
      }
      const err = await response.json().catch(() => ({ message: "Failed to fetch voices" }));
      return { success: false, error: err.message };
    }

    const result = await response.json();
    const data = result.data ?? result;
    return {
      success: true,
      voices: data.voices ?? result.voices,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const voiceService = {
  synthesizeSpeech,
  getVoices,
};
