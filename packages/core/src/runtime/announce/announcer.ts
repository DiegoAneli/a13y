/**
 * @a13y/core - Accessibility Announcer
 * Announces messages to screen readers using ARIA live regions
 */

import { assertBrowser, devWarn } from '../env/environment';
import { AnnouncementError } from '../errors/accessibility-errors';

/**
 * ARIA live region politeness level
 */
export type PolitenessLevel = 'polite' | 'assertive' | 'off';

/**
 * Announcement options
 */
export interface AnnounceOptions {
  /**
   * Politeness level for the announcement
   * @default 'polite'
   */
  politeness?: PolitenessLevel;

  /**
   * Delay before announcement in milliseconds
   * Useful to ensure the live region is ready
   * @default 100
   */
  delay?: number;

  /**
   * Clear previous announcement before new one
   * @default true
   */
  clearPrevious?: boolean;
}

/**
 * Live region manager
 * Manages ARIA live region elements for announcements
 */
class LiveRegionManager {
  private regions = new Map<PolitenessLevel, HTMLDivElement>();
  private isInitialized = false;

  /**
   * Initialize live regions
   * Creates hidden ARIA live region containers
   */
  init(): void {
    if (this.isInitialized) {
      return;
    }

    assertBrowser('LiveRegionManager.init');

    // Create polite region
    this.createRegion('polite');

    // Create assertive region
    this.createRegion('assertive');

    this.isInitialized = true;
  }

  /**
   * Get a live region by politeness level
   */
  getRegion(politeness: PolitenessLevel): HTMLDivElement {
    if (!this.isInitialized) {
      this.init();
    }

    if (politeness === 'off') {
      throw new AnnouncementError('Cannot get live region with politeness level "off"');
    }

    const region = this.regions.get(politeness);
    if (!region) {
      throw new AnnouncementError(`Live region for politeness "${politeness}" not found`);
    }

    return region;
  }

  /**
   * Announce a message
   */
  announce(message: string, politeness: PolitenessLevel = 'polite'): void {
    if (politeness === 'off') {
      devWarn(false, 'Cannot announce with politeness level "off"');
      return;
    }

    const region = this.getRegion(politeness);

    // Clear previous content
    region.textContent = '';

    // Small delay to ensure screen readers pick up the change
    setTimeout(() => {
      region.textContent = message;
    }, 10);
  }

  /**
   * Clear a live region
   */
  clear(politeness: PolitenessLevel): void {
    if (politeness === 'off') {
      return;
    }

    const region = this.getRegion(politeness);
    region.textContent = '';
  }

  /**
   * Clear all live regions
   */
  clearAll(): void {
    this.regions.forEach((region) => {
      region.textContent = '';
    });
  }

  /**
   * Destroy all live regions
   */
  destroy(): void {
    this.regions.forEach((region) => {
      if (region.parentNode) {
        region.parentNode.removeChild(region);
      }
    });

    this.regions.clear();
    this.isInitialized = false;
  }

  private createRegion(politeness: PolitenessLevel): void {
    const region = document.createElement('div');

    // Set ARIA attributes
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');

    // Visually hidden but accessible to screen readers
    Object.assign(region.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
    });

    // Add ID for debugging
    region.id = `a13y-live-region-${politeness}`;

    // Append to body
    document.body.appendChild(region);

    // Store reference
    this.regions.set(politeness, region);
  }
}

/**
 * Singleton live region manager
 */
const liveRegionManager = new LiveRegionManager();

/**
 * Announce a message to screen readers
 * @param message - Message to announce
 * @param options - Announcement options
 */
export const announce = (message: string, options: AnnounceOptions = {}): void => {
  assertBrowser('announce');

  if (!message || message.trim().length === 0) {
    devWarn(false, 'Cannot announce empty message');
    return;
  }

  const { politeness = 'polite', delay = 100, clearPrevious = true } = options;

  if (politeness === 'off') {
    return;
  }

  const doAnnounce = (): void => {
    if (clearPrevious) {
      liveRegionManager.clear(politeness);
    }

    liveRegionManager.announce(message, politeness);
  };

  if (delay > 0) {
    setTimeout(doAnnounce, delay);
  } else {
    doAnnounce();
  }
};

/**
 * Announce a message politely (default)
 * Waits for screen reader to finish current announcement
 */
export const announcePolite = (
  message: string,
  options?: Omit<AnnounceOptions, 'politeness'>
): void => {
  announce(message, { ...options, politeness: 'polite' });
};

/**
 * Announce a message assertively
 * Interrupts screen reader's current announcement
 */
export const announceAssertive = (
  message: string,
  options?: Omit<AnnounceOptions, 'politeness'>
): void => {
  announce(message, { ...options, politeness: 'assertive' });
};

/**
 * Clear all announcements
 */
export const clearAnnouncements = (): void => {
  assertBrowser('clearAnnouncements');
  liveRegionManager.clearAll();
};

/**
 * Announcement queue
 * Manages sequential announcements with delays
 */
export class AnnouncementQueue {
  private queue: Array<{ message: string; options: AnnounceOptions }> = [];
  private isProcessing = false;
  private defaultDelay = 1000; // 1 second between announcements

  /**
   * Add a message to the queue
   */
  enqueue(message: string, options: AnnounceOptions = {}): void {
    this.queue.push({ message, options });
    this.process();
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      announce(item.message, item.options);

      // Wait before next announcement
      await new Promise((resolve) => setTimeout(resolve, this.defaultDelay));
    }

    this.isProcessing = false;
  }
}

/**
 * Create a scoped announcer
 * Useful for components that need isolated announcement logic
 */
export const createAnnouncer = (
  defaultOptions: AnnounceOptions = {}
): {
  announce: (message: string, options?: AnnounceOptions) => void;
  clear: () => void;
} => {
  const queue = new AnnouncementQueue();

  return {
    announce: (message: string, options?: AnnounceOptions) => {
      queue.enqueue(message, { ...defaultOptions, ...options });
    },
    clear: () => {
      queue.clear();
    },
  };
};

/**
 * Initialize the announcer
 * Call this once at app startup
 */
export const initAnnouncer = (): void => {
  assertBrowser('initAnnouncer');
  liveRegionManager.init();
};

/**
 * Destroy the announcer
 * Removes all live regions from the DOM
 */
export const destroyAnnouncer = (): void => {
  if (!isBrowser()) {
    return;
  }
  liveRegionManager.destroy();
};

// Import isBrowser for destroyAnnouncer
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
