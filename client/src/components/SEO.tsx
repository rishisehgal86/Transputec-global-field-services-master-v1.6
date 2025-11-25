import { useEffect } from 'react';
import { seoConfig } from '@/config/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * SEO Component
 * Manages meta tags, Open Graph tags, and Twitter Card tags
 */
export function SEO({
  title,
  description = seoConfig.defaultDescription,
  keywords = seoConfig.defaultKeywords,
  ogImage = seoConfig.defaultOgImage,
  ogType = 'website',
  canonical,
  noindex = false,
  nofollow = false,
}: SEOProps) {
  useEffect(() => {
    // Set document title
    const fullTitle = title 
      ? seoConfig.titleTemplate.replace('%s', title)
      : seoConfig.defaultTitle;
    document.title = fullTitle;

    // Helper to set or update meta tag
    const setMetaTag = (selector: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, selector.replace(`[${attribute}="`, '').replace('"]', ''));
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Helper to set or update link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Basic meta tags
    setMetaTag('[name="description"]', description);
    setMetaTag('[name="keywords"]', keywords.join(', '));
    
    // Robots meta tag
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length > 0) {
      setMetaTag('[name="robots"]', robotsContent.join(', '));
    }

    // Open Graph tags
    setMetaTag('[property="og:title"]', fullTitle, 'property');
    setMetaTag('[property="og:description"]', description, 'property');
    setMetaTag('[property="og:type"]', ogType, 'property');
    setMetaTag('[property="og:url"]', canonical || window.location.href, 'property');
    setMetaTag('[property="og:site_name"]', seoConfig.siteName, 'property');
    
    // Set OG image with full URL
    const fullOgImageUrl = ogImage.startsWith('http') 
      ? ogImage 
      : `${seoConfig.siteUrl}${ogImage}`;
    setMetaTag('[property="og:image"]', fullOgImageUrl, 'property');
    setMetaTag('[property="og:image:width"]', '1200', 'property');
    setMetaTag('[property="og:image:height"]', '630', 'property');

    // Twitter Card tags
    setMetaTag('[name="twitter:card"]', seoConfig.twitterCardType);
    setMetaTag('[name="twitter:site"]', seoConfig.twitterHandle);
    setMetaTag('[name="twitter:title"]', fullTitle);
    setMetaTag('[name="twitter:description"]', description);
    setMetaTag('[name="twitter:image"]', fullOgImageUrl);

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    } else {
      setLinkTag('canonical', window.location.href);
    }

    // Additional SEO tags
    setMetaTag('[name="author"]', seoConfig.organization.name);
    setMetaTag('[name="viewport"]', 'width=device-width, initial-scale=1.0');
    setMetaTag('[name="theme-color"]', '#f97316'); // Orange theme color

  }, [title, description, keywords, ogImage, ogType, canonical, noindex, nofollow]);

  return null; // This component doesn't render anything
}

