/**
 * Accessibility utilities for keyboard navigation and ARIA support
 */

import { KeyboardEvent } from "react";

/**
 * Handle keyboard navigation for interactive elements
 */
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  onActivate: () => void,
  options?: {
    stopPropagation?: boolean;
    preventDefault?: boolean;
  }
) {
  const { key } = event;

  if (key === "Enter" || key === " ") {
    if (options?.preventDefault) {
      event.preventDefault();
    }
    if (options?.stopPropagation) {
      event.stopPropagation();
    }
    onActivate();
  }
}

/**
 * Create props for making an element keyboard accessible
 */
export function getAccessibleButtonProps(
  onClick: () => void,
  label: string,
  options?: {
    role?: string;
    disabled?: boolean;
  }
) {
  return {
    role: options?.role || "button",
    tabIndex: options?.disabled ? -1 : 0,
    "aria-label": label,
    "aria-disabled": options?.disabled,
    onClick: options?.disabled ? undefined : onClick,
    onKeyDown: options?.disabled
      ? undefined
      : (event: KeyboardEvent) => {
          handleKeyboardNavigation(event, onClick, { preventDefault: true });
        },
  };
}

/**
 * Create skip link props for accessibility
 */
export function getSkipLinkProps(targetId: string) {
  return {
    href: `#${targetId}`,
    className:
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-800 focus:text-zinc-100 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400",
    children: "Skip to main content",
  };
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.setAttribute("class", "sr-only");
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modals and dialogs
 */
export function createFocusTrap(containerRef: HTMLElement | null) {
  if (!containerRef) return { activate: () => {}, deactivate: () => {} };

  const focusableElements = containerRef.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(event: globalThis.KeyboardEvent) {
    if (event.key !== "Tab") return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  return {
    activate: () => {
      document.addEventListener("keydown", handleKeyDown);
      firstElement?.focus();
    },
    deactivate: () => {
      document.removeEventListener("keydown", handleKeyDown);
    },
  };
}

/**
 * Get appropriate ARIA attributes for loading states
 */
export function getLoadingAriaProps(isLoading: boolean, loadingText?: string) {
  return {
    "aria-busy": isLoading,
    "aria-live": isLoading ? ("polite" as const) : undefined,
    "aria-label": isLoading ? loadingText || "Loading..." : undefined,
  };
}

/**
 * Get ARIA attributes for form fields
 */
export function getFormFieldAriaProps(
  fieldId: string,
  options?: {
    required?: boolean;
    invalid?: boolean;
    errorId?: string;
    describedBy?: string;
  }
) {
  const describedBy = [options?.describedBy, options?.errorId]
    .filter(Boolean)
    .join(" ");

  return {
    id: fieldId,
    "aria-required": options?.required,
    "aria-invalid": options?.invalid,
    "aria-describedby": describedBy || undefined,
  };
}
