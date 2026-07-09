import { sessionService } from '../sessions/sessionService.js';
import { bookmarkRepository } from './bookmarkRepository.js';
import type { AuthenticatedUser, Bookmark, CreateBookmarkInput } from '@smj/shared';

/**
 * Judicial bookmarks. Every operation resolves the parent session first, which
 * enforces tenant ownership before any bookmark is read or written.
 */
export const bookmarkService = {
  async add(
    user: AuthenticatedUser,
    sessionId: string,
    input: CreateBookmarkInput,
  ): Promise<Bookmark> {
    await sessionService.getOrThrow(user, sessionId);
    const bookmark: Bookmark = { ...input, sessionId };
    await bookmarkRepository.upsert(bookmark);
    return bookmark;
  },

  async list(user: AuthenticatedUser, sessionId: string): Promise<Bookmark[]> {
    await sessionService.getOrThrow(user, sessionId);
    return bookmarkRepository.listBySession(sessionId);
  },

  async remove(user: AuthenticatedUser, sessionId: string, bookmarkId: string): Promise<void> {
    await sessionService.getOrThrow(user, sessionId);
    await bookmarkRepository.remove(bookmarkId, sessionId);
  },
};
