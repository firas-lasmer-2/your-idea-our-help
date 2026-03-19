import { supabase } from "@/integrations/supabase/client";
import { ProductEventName } from "@/types/product";

const SESSION_STORAGE_KEY = "resume.session-id";
const ACQUISITION_STORAGE_KEY = "resume.acquisition-source";

type UsageField = "ai_requests_count" | "pdf_downloads_count" | "websites_published_count";

interface TrackOptions {
  userId?: string | null;
  data?: Record<string, any>;
  pagePath?: string;
  source?: string | null;
}

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

function getSessionId() {
  const currentWindow = getWindow();
  if (!currentWindow) return "server";

  const existing = currentWindow.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId = currentWindow.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  currentWindow.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function captureAcquisitionSource() {
  const currentWindow = getWindow();
  if (!currentWindow) return null;

  const searchParams = new URLSearchParams(currentWindow.location.search);
  const explicitSource =
    searchParams.get("utm_source") ||
    searchParams.get("source") ||
    searchParams.get("ref");

  if (explicitSource) {
    currentWindow.localStorage.setItem(ACQUISITION_STORAGE_KEY, explicitSource);
    return explicitSource;
  }

  const stored = currentWindow.localStorage.getItem(ACQUISITION_STORAGE_KEY);
  if (stored) return stored;

  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      const source = referrer.hostname.replace(/^www\./, "");
      currentWindow.localStorage.setItem(ACQUISITION_STORAGE_KEY, source);
      return source;
    } catch {
      return "direct";
    }
  }

  currentWindow.localStorage.setItem(ACQUISITION_STORAGE_KEY, "direct");
  return "direct";
}

export async function ensureGrowthProfile(
  userId: string,
  overrides?: Partial<{ persona: string; onboarding_status: string }>,
) {
  const acquisitionSource = captureAcquisitionSource();
  const now = new Date().toISOString();

  await Promise.allSettled([
    (supabase as any)
      .from("profiles")
      .update({
        acquisition_source: acquisitionSource,
        persona: overrides?.persona,
        onboarding_status: overrides?.onboarding_status,
        last_active_at: now,
      })
      .eq("id", userId),
    (supabase as any).from("entitlements").upsert({ user_id: userId }, { onConflict: "user_id" }),
    (supabase as any).from("usage_counters").upsert({ user_id: userId }, { onConflict: "user_id" }),
  ]);
}

export async function loadGrowthState(userId: string) {
  const [entitlementResult, usageResult] = await Promise.all([
    (supabase as any).from("entitlements").select("*").eq("user_id", userId).single(),
    (supabase as any).from("usage_counters").select("*").eq("user_id", userId).single(),
  ]);

  return {
    entitlement: entitlementResult.data || null,
    usage: usageResult.data || null,
  };
}

export async function incrementUsageCounter(field: UsageField, amount = 1, userId?: string | null) {
  const session = (await supabase.auth.getSession()).data.session;
  const resolvedUserId = userId ?? session?.user?.id ?? null;
  if (!resolvedUserId) return null;

  await ensureGrowthProfile(resolvedUserId);

  const { data: currentRow } = await (supabase as any)
    .from("usage_counters")
    .select(field)
    .eq("user_id", resolvedUserId)
    .single();

  const nextValue = Math.max((currentRow?.[field] || 0) + amount, 0);

  const { error } = await (supabase as any)
    .from("usage_counters")
    .update({
      [field]: nextValue,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", resolvedUserId);

  if (error) return null;
  return nextValue;
}

export async function trackProductEvent(eventName: ProductEventName, options: TrackOptions = {}) {
  const currentWindow = getWindow();
  const session = (await supabase.auth.getSession()).data.session;
  const resolvedUserId = options.userId ?? session?.user?.id ?? null;
  const source = options.source ?? captureAcquisitionSource();

  try {
    await (supabase as any).from("product_events").insert({
      user_id: resolvedUserId,
      session_id: getSessionId(),
      event_name: eventName,
      event_data: options.data || {},
      page_path: options.pagePath ?? currentWindow?.location.pathname ?? null,
      source,
    });
  } catch {
    return;
  }

  if (resolvedUserId) {
    await (supabase as any)
      .from("profiles")
      .update({
        last_active_at: new Date().toISOString(),
        acquisition_source: source,
      })
      .eq("id", resolvedUserId);
  }
}
