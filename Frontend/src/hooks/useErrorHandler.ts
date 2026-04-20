import { useState, useCallback } from "react";

interface ErrorState {
  isOpen: boolean;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function getUserFriendlyMessage(error: unknown, code?: number, isRegister = false): string {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as any;
    const status = code || errObj.response?.status || errObj.status;
    const backendMessage = errObj.response?.data?.message || errObj.message || '';

    // Map by HTTP status code
    switch (status) {
      case 500:
        return "Network error, try again in a few minutes";
      case 404:
        if (backendMessage.toLowerCase().includes('user') || backendMessage.toLowerCase().includes('account')) {
          return "Account not found. Try signing up first!";
        }
        return backendMessage.toLowerCase().includes('not found') ? `${backendMessage}. Please check and try again.` : "Item not found";
      case 401:
        return "Wrong password or email. Please try again.";
      case 422:
        if (isRegister) {
          return "You already have an account. Try logging in instead.";
        }
      default:
        break;
    }

    // Map by backend message keywords (case-insensitive)
    const msgLower = backendMessage.toLowerCase();
    if (msgLower.includes('invalid credentials') || msgLower.includes('wrong password') || msgLower.includes('authentication')) {
      return "Wrong password. Please check and try again.";
    }
    if (msgLower.includes('failed to') || msgLower.includes('network') || msgLower.includes('service')) {
      return "Network error, try again in a few minutes";
    }
    if (msgLower.includes('not found') || msgLower.includes('does not exist')) {
      if (msgLower.includes('user') || msgLower.includes('account')) {
        return "Account not found. Try signing up at /auth!";
      }
      return "Item not found. Please refresh and try again.";
    }
    if (msgLower.includes('token') || msgLower.includes('expired')) {
      return "Session expired. Please log in again.";
    }
  }

  return "Something went wrong. Please try again later.";
};

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showError = useCallback((
    errorOrMessage: unknown,
    title: string = "Error",
    onRetry?: () => void,
    statusCode?: number
  ) => {
    const friendlyMsg = getUserFriendlyMessage(errorOrMessage, statusCode);
    setError({
      isOpen: true,
      title,
      message: friendlyMsg,
      onRetry,
    });
  }, []);

  const hideError = useCallback(() => {
    setError(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleError = useCallback((
    error: unknown,
    fallbackTitle?: string,
    onRetry?: () => void
  ) => {
    const status = (error as any)?.response?.status;
    showError(error, fallbackTitle || "Error", onRetry, status);
  }, [showError]);

  return {
    error,
    showError,
    hideError,
    handleError,
  };
};
