import { toast } from "sonner@2.0.3";

let hasShownBackendWarning = false;

/**
 * Show a one-time warning that backend is not connected
 */
export function showBackendWarning() {
  if (!hasShownBackendWarning) {
    toast.info("Backend Not Connected", {
      description: "Currently using fallback features. Connect Python backend for full Bhashini API integration.",
      duration: 5000,
    });
    hasShownBackendWarning = true;
  }
}

/**
 * Show success notification
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

/**
 * Show error notification
 */
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show info notification
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 3000,
  });
}
