import { invoke } from "@tauri-apps/api/core";
import type { AppMetadata } from "@/types/app";
import type { AppSettings } from "@/types/settings";

export async function getAppMetadata(): Promise<AppMetadata> {
  return invoke<AppMetadata>("get_app_metadata");
}

export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke<void>("save_settings", { settings });
}
