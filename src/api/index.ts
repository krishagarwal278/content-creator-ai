/**
 * API Module Barrel Export
 * Provides centralized access to all API services and Supabase client
 */

// Supabase Client
export * from "./client";
export * from "./types";

// Services
export * from "./project-service";
export * from "./storage-service";
export * from "./video-generation-service";
export * from "./account-service";
export * from "./interest-service";
export * from "./fal-video-service";
export * from "./voice-service";
export * from "./slideshow-service";
