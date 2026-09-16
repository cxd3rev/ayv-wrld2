/**
 * Turns technical errors into short messages users can understand.
 * Never send raw database or provider errors to the UI.
 */
export function toUserError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: string }).message).toLowerCase();

    if (message.includes("invalid login")) {
      return "Email or password is incorrect.";
    }
    if (message.includes("already registered") || message.includes("already been registered")) {
      return "An account with this email already exists.";
    }
    if (message.includes("password")) {
      return "Please choose a stronger password (at least 8 characters).";
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.includes("network") || message.includes("fetch")) {
      return "Could not connect. Check your internet connection and try again.";
    }
  }

  return fallback;
}
