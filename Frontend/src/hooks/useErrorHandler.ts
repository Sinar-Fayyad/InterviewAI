import { useState, useCallback } from "react";

interface ErrorState {
  isOpen: boolean;
  title: string;
  message: string;
  onRetry?: () => void;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showError = useCallback((
    message: string,
    title: string = "An error occurred",
    onRetry?: () => void
  ) => {
    setError({
      isOpen: true,
      title,
      message,
      onRetry,
    });
  }, []);

  const hideError = useCallback(() => {
    setError(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleError = useCallback((
    error: unknown,
    fallbackMessage: string = "Something went wrong. Please try again.",
    onRetry?: () => void
  ) => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    showError(message, "Error", onRetry);
  }, [showError]);

  return {
    error,
    showError,
    hideError,
    handleError,
  };
};
