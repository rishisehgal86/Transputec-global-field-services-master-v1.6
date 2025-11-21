export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/fieldpulse-go-logo-universal.png";

// Generate login URL - redirect to local login page
export const getLoginUrl = () => {
  return "/login";
};