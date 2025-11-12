/**
 * Accessibility (a11y) Utilities
 * 
 * Provides helpers for ARIA attributes, keyboard navigation,
 * screen reader support, and WCAG 2.1 Level AA compliance.
 */

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

/**
 * ARIA live region announcer for screen readers
 * 
 * @param message - Message to announce
 * @param priority - Announcement priority
 * 
 * @example
 * announceToScreenReader('Check-in successful', 'assertive');
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Create ARIA live region announcer element
 */
function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'a11y-announcer';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Trap focus within a container (for modals, dialogs)
 * 
 * @param container - Container element
 * @returns Cleanup function
 * 
 * @example
 * const cleanup = trapFocus(dialogRef.current);
 * // Later: cleanup();
 */
export function trapFocus(container: HTMLElement | null): () => void {
  if (!container) return () => {};

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift+Tab: Move to last element if on first
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: Move to first element if on last
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Check if element is visible (not display:none or visibility:hidden)
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Keyboard navigation handler
 * 
 * @param event - Keyboard event
 * @param handlers - Map of key to handler function
 * 
 * @example
 * handleKeyboardNavigation(event, {
 *   'Enter': () => handleSubmit(),
 *   'Escape': () => handleClose(),
 *   'ArrowDown': () => focusNextItem(),
 * });
 */
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  handlers: Record<string, () => void>
): void {
  const handler = handlers[event.key];
  if (handler) {
    event.preventDefault();
    handler();
  }
}

/**
 * Generate ARIA label for date/time
 * 
 * @param date - Date object
 * @returns Human-readable date string
 */
export function getAccessibleDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Generate ARIA label for GPS coordinates
 * 
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Human-readable location string
 */
export function getAccessibleLocation(latitude: number, longitude: number): string {
  const latDirection = latitude >= 0 ? 'North' : 'South';
  const lonDirection = longitude >= 0 ? 'East' : 'West';
  
  return `Location: ${Math.abs(latitude).toFixed(4)} degrees ${latDirection}, ${Math.abs(longitude).toFixed(4)} degrees ${lonDirection}`;
}

/**
 * Get ARIA props for interactive elements
 * 
 * @param options - Configuration options
 * @returns ARIA attributes object
 * 
 * @example
 * <button {...getAriaProps({ label: 'Close', pressed: true })}>
 */
export function getAriaProps(options: {
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  pressed?: boolean;
  selected?: boolean;
  disabled?: boolean;
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}): Record<string, string | boolean | undefined> {
  const props: Record<string, any> = {};

  if (options.label) props['aria-label'] = options.label;
  if (options.describedBy) props['aria-describedby'] = options.describedBy;
  if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
  if (options.pressed !== undefined) props['aria-pressed'] = options.pressed;
  if (options.selected !== undefined) props['aria-selected'] = options.selected;
  if (options.disabled !== undefined) props['aria-disabled'] = options.disabled;
  if (options.current !== undefined) props['aria-current'] = options.current;

  return props;
}

/**
 * Check color contrast ratio (WCAG 2.1 Level AA)
 * 
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Contrast ratio
 * 
 * Minimum contrast ratios:
 * - Normal text: 4.5:1
 * - Large text (18pt+): 3:1
 * - UI components: 3:1
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance for color
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    const channel = val / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

/**
 * Skip to main content link (for keyboard navigation)
 * 
 * @returns Skip link component props
 */
export function getSkipLinkProps() {
  return {
    href: '#main-content',
    className: 'skip-link',
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    },
  };
}

/**
 * Reduce motion preference check
 * 
 * @returns True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode check
 * 
 * @returns True if high contrast mode is active
 */
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Focus visible utility (show outline only for keyboard navigation)
 * 
 * Usage in CSS:
 * .focus-visible:focus { outline: 2px solid blue; }
 */
export function initFocusVisible(): void {
  if (typeof document === 'undefined') return;

  let hadKeyboardEvent = false;

  const handlePointerDown = () => {
    hadKeyboardEvent = false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      hadKeyboardEvent = true;
    }
  };

  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (hadKeyboardEvent) {
      target.classList.add('focus-visible');
    }
  };

  const handleBlur = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('focus-visible');
  };

  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
}

/**
 * Accessible form validation messages
 * 
 * @param fieldId - Form field ID
 * @param errorMessage - Error message
 * @returns ARIA attributes for field
 */
export function getFormFieldA11yProps(
  fieldId: string,
  errorMessage?: string
): Record<string, string | boolean> {
  const errorId = `${fieldId}-error`;
  
  return {
    id: fieldId,
    'aria-invalid': !!errorMessage,
    'aria-describedby': errorMessage ? errorId : undefined,
  };
}

/**
 * Loading state announcer
 * 
 * @param isLoading - Loading state
 * @param message - Custom loading message
 */
export function announceLoadingState(isLoading: boolean, message?: string): void {
  if (isLoading) {
    announceToScreenReader(message || 'Loading', 'polite');
  } else {
    announceToScreenReader(message || 'Finished loading', 'polite');
  }
}

/**
 * Check if element is in viewport (for lazy loading accessibility)
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * ARIA roles for common components
 */
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  banner: 'banner',
  contentinfo: 'contentinfo',
  search: 'search',
  form: 'form',
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
  menu: 'menu',
  menuitem: 'menuitem',
  tab: 'tab',
  tabpanel: 'tabpanel',
  tablist: 'tablist',
} as const;

/**
 * Landmark roles map
 */
export const LANDMARKS = {
  header: 'banner',
  nav: 'navigation',
  main: 'main',
  aside: 'complementary',
  footer: 'contentinfo',
} as const;
