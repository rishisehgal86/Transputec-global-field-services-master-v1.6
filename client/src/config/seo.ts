/**
 * SEO Configuration
 * Default meta tags and SEO settings for the application
 */

export const seoConfig = {
  // Default meta tags
  defaultTitle: "FieldPulse - On-Demand Field Service Dispatch Platform",
  titleTemplate: "%s | FieldPulse",
  defaultDescription: "Professional field service management and dispatch platform. Streamline job assignments, track engineers in real-time, and manage service delivery efficiently.",
  
  // Site information
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://field-pulse.io',
  siteName: "FieldPulse",
  
  // Default Open Graph image
  defaultOgImage: "/og-image.png",
  
  // Twitter
  twitterHandle: "@fieldpulse",
  twitterCardType: "summary_large_image" as const,
  
  // Organization info
  organization: {
    name: "FieldPulse",
    legalName: "FieldPulse Ltd",
    url: "https://field-pulse.io",
    logo: "/logo.png",
    foundingDate: "2024",
    description: "Professional field service management and dispatch platform for on-demand service delivery.",
    contactEmail: "admin@field-pulse.io",
    contactPhone: "+44-20-1234-5678",
    address: {
      streetAddress: "123 Tech Street",
      addressLocality: "London",
      addressRegion: "Greater London",
      postalCode: "SW1A 1AA",
      addressCountry: "GB"
    }
  },
  
  // Keywords
  defaultKeywords: [
    "field service management",
    "dispatch software",
    "engineer tracking",
    "service delivery",
    "job management",
    "field operations",
    "workforce management",
    "real-time tracking"
  ],
};

export type SEOConfig = typeof seoConfig;

