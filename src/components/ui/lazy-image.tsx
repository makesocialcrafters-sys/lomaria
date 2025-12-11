import * as React from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

/**
 * Lazy loading image with skeleton placeholder
 * Circular by default for profile images
 */
const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ className, fallbackClassName, src, alt, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setIsLoaded(false);
      setHasError(false);
    }, [src]);

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Skeleton placeholder */}
        {!isLoaded && !hasError && (
          <div
            className={cn(
              "absolute inset-0 bg-skeleton animate-pulse",
              fallbackClassName,
            )}
          />
        )}
        
        {/* Error state */}
        {hasError && (
          <div
            className={cn(
              "absolute inset-0 bg-skeleton flex items-center justify-center",
              fallbackClassName,
            )}
          >
            <span className="text-foreground/40 text-xs">!</span>
          </div>
        )}

        {/* Actual image */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          {...props}
        />
      </div>
    );
  },
);
LazyImage.displayName = "LazyImage";

export { LazyImage };