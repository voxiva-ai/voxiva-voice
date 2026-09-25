import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { AppMetadata } from "@/types/app";
import type { AppSettings } from "@/types/settings";
import type { UsageStats } from "@/types/stats";

export interface WhisperAssetsStatus {
  dir: string;
  cliPresent: boolean;
  modelPresent: boolean;
  ready: boolean;
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  notes: string;
  downloadUrl: string;
  downloadsPage: string;
}

export async function getAppMetadata(): Promise<AppMetadata> {
  return invoke<AppMetadata>("get_app_metadata");
}

export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke<void>("save_settings", { settings });
}

export async function getWhisperAssetsStatus(): Promise<WhisperAssetsStatus> {
  return invoke<WhisperAssetsStatus>("get_whisper_assets_status");
}

export async function downloadWhisperAssets(): Promise<WhisperAssetsStatus> {
  return invoke<WhisperAssetsStatus>("download_whisper_assets");
}

export async function getUsageStats(): Promise<UsageStats> {
  return invoke<UsageStats>("get_usage_stats");
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  return invoke<UpdateCheckResult>("check_for_updates");
}

export async function openExternalUrl(url: string): Promise<void> {
  await openUrl(url);
}

export interface PhonePairInfo {
  url: string;
  token: string;
  qrSvg: string;
  running: boolean;
}

export async function getPhonePairInfo(): Promise<PhonePairInfo> {
  return invoke<PhonePairInfo>("get_phone_pair_info");
}
