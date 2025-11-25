import { useEffect } from 'react';
import { seoConfig } from '@/config/seo';

interface StructuredDataProps {
  type?: 'organization' | 'localBusiness' | 'service' | 'breadcrumb';
  data?: Record<string, any>;
}

/**
 * Structured Data Component
 * Adds JSON-LD structured data for Google Rich Results
 */
export function StructuredData({ type = 'organization', data = {} }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type}`;
    
    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    let structuredData: Record<string, any> = {};

    switch (type) {
      case 'organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": seoConfig.organization.name,
          "legalName": seoConfig.organization.legalName,
          "url": seoConfig.organization.url,
          "logo": `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
          "foundingDate": seoConfig.organization.foundingDate,
          "description": seoConfig.organization.description,
          "contactPoint": {
            "@type": "ContactPoint",
            "email": seoConfig.organization.contactEmail,
            "telephone": seoConfig.organization.contactPhone,
            "contactType": "customer service"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": seoConfig.organization.address.streetAddress,
            "addressLocality": seoConfig.organization.address.addressLocality,
            "addressRegion": seoConfig.organization.address.addressRegion,
            "postalCode": seoConfig.organization.address.postalCode,
            "addressCountry": seoConfig.organization.address.addressCountry
          },
          "sameAs": [
            // Add social media URLs here
          ],
          ...data
        };
        break;

      case 'localBusiness':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": seoConfig.organization.name,
          "image": `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
          "description": seoConfig.organization.description,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": seoConfig.organization.address.streetAddress,
            "addressLocality": seoConfig.organization.address.addressLocality,
            "addressRegion": seoConfig.organization.address.addressRegion,
            "postalCode": seoConfig.organization.address.postalCode,
            "addressCountry": seoConfig.organization.address.addressCountry
          },
          "telephone": seoConfig.organization.contactPhone,
          "email": seoConfig.organization.contactEmail,
          "url": seoConfig.organization.url,
          "priceRange": "$$",
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "09:00",
            "closes": "18:00"
          },
          ...data
        };
        break;

      case 'service':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Field Service Management",
          "provider": {
            "@type": "Organization",
            "name": seoConfig.organization.name,
            "url": seoConfig.organization.url
          },
          "areaServed": {
            "@type": "Country",
            "name": "United Kingdom"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Field Service Solutions",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Dispatch Management",
                  "description": "Real-time field engineer dispatch and job assignment"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Engineer Tracking",
                  "description": "Live location tracking and status updates for field engineers"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Job Management",
                  "description": "Complete job lifecycle management from request to completion"
                }
              }
            ]
          },
          ...data
        };
        break;

      case 'breadcrumb':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items || []
        };
        break;
    }

    // Create and inject script tag
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

