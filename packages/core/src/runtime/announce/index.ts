/**
 * @a13y/core - Announcements
 * @module runtime/announce
 */

export type { AnnounceOptions, PolitenessLevel } from './announcer';
export {
  AnnouncementQueue,
  announce,
  announceAssertive,
  announcePolite,
  clearAnnouncements,
  createAnnouncer,
  destroyAnnouncer,
  initAnnouncer,
} from './announcer';
