import { useTheme } from "@/contexts/ThemeContext";
import { APP_LOGO } from "@/const";

interface LogoImageProps {
  className?: string;
  alt?: string;
}

/**
 * Theme-aware logo component that switches between light and dark mode logos
 */
export function LogoImage({ className = "h-10", alt = "FieldPulse Go" }: LogoImageProps) {
  const { theme } = useTheme();
  
  // Determine which logo to use based on theme
  const logoSrc = theme === "dark" 
    ? "/fieldpulse-go-logo-dark.png"
    : APP_LOGO || "/fieldpulse-go-logo.png";
  
  return <img src={logoSrc} alt={alt} className={className} />;
}

