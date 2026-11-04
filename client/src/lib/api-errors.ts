type ApiErrorPayload = {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
};

export async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
  let payload: ApiErrorPayload = {};
  try {
    payload = await response.json() as ApiErrorPayload;
  } catch {
    // Some upstream failures return an empty or non-JSON response.
  }

  for (const candidate of [payload.message, payload.detail, payload.error]) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  if (response.status === 401) return "Your session has expired. Sign in again to continue.";
  if (response.status === 403) return "You don't have permission to do that.";
  if (response.status === 404) return "The requested item could not be found.";
  if (response.status === 429) return "Too many requests. Wait a moment and try again.";
  if (response.status === 422) return "The request wasn't accepted. Check your message and try again.";
  if (response.status === 502) return "Oryn couldn't generate an answer right now. Please try again.";
  if (response.status === 504) return "Oryn took too long to respond. Please try again.";
  if (response.status === 503) return "The service is temporarily unavailable. Please try again shortly.";

  return fallback;
}
