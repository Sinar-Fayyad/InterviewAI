import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingDots = ({ className, size = "md" }: LoadingDotsProps) => {
  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          dotSize[size]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          dotSize[size]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn(
          "rounded-full bg-current animate-bounce",
          dotSize[size]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
};
