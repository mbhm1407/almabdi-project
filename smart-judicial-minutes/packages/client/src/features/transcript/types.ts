import type { JudicialRole } from '@smj/shared';

/**
 * A hearing participant the clerk maps a diarized speaker to. `speakerId` is the
 * Azure diarization id (e.g. "Guest-1"); `name` is the real Teams display name;
 * `role` is the assigned judicial role.
 */
export interface Participant {
  /** Stable local id for the roster row. */
  id: string;
  name: string;
  role: JudicialRole;
}

/** Configuration captured on the opening screen before transcription starts. */
export interface SessionSetup {
  meetingTitle: string;
  caseNumber: string;
  circuitName: string;
  judgeName: string;
  participants: Participant[];
}
