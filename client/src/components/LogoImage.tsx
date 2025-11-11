interface LogoImageProps {
  className?: string;
  alt?: string;
}

/**
 * Universal logo component that works on both light and dark backgrounds
 * Uses outlined white text with dark strokes for visibility on all backgrounds
 */
export function LogoImage({ className = "h-10", alt = "FieldPulse Go" }: LogoImageProps) {
  // Use single universal logo that works on both light and dark backgrounds
  const logoSrc = "/fieldpulse-go-logo-universal.png";
  
  return <img src={logoSrc} alt={alt} className={className} />;
}

