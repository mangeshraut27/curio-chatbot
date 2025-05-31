import * as Sentry from "@sentry/react";

const SENTRY_DSN = "https://d6e330b20049f28c8edba708c48386dc@o4509416500887552.ingest.us.sentry.io/4509416501739520";

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [
      Sentry.browserTracingIntegration({
        // Set tracing origins to track performance for your application
        tracingOrigins: ["localhost", /^\//],
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Release Health
    autoSessionTracking: true,
    
    // Error filtering - don't send certain errors
    beforeSend(event, hint) {
      // Filter out common browser extensions errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && error.stack && error.stack.includes('chrome-extension://')) {
          return null;
        }
        if (error && error.stack && error.stack.includes('moz-extension://')) {
          return null;
        }
      }
      
      // Don't send errors from localhost in development
      if (process.env.NODE_ENV === "development" && window.location.hostname === "localhost") {
        console.warn("Sentry Error (Dev Mode):", event);
        return null; // Don't send to Sentry in development
      }
      
      return event;
    },
    
    // Additional configuration
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === "console" && breadcrumb.level !== "error") {
        return null;
      }
      return breadcrumb;
    },
    
    // Set user context
    initialScope: {
      tags: {
        component: "animal-rescue-chatbot",
        version: "1.0.0"
      }
    }
  });
};

// Custom error logging functions
export const logError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag("custom_error", true);
    scope.setContext("error_context", context);
    Sentry.captureException(error);
  });
};

export const logMessage = (message, level = "info", context = {}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setContext("message_context", context);
    Sentry.captureMessage(message);
  });
};

export const setUserContext = (user) => {
  Sentry.setUser(user);
};

export const addBreadcrumb = (message, category = "custom", level = "info", data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });
};

// Export Sentry for direct use if needed
export { Sentry }; 