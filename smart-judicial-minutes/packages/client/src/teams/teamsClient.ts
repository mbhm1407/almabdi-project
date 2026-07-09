import { app, authentication, pages, FrameContexts } from '@microsoft/teams-js';

export interface TeamsMeetingContext {
  meetingId: string;
  meetingTitle: string;
  userName: string;
  theme: string;
  /** true when running inside the Teams host; false during standalone dev. */
  inTeams: boolean;
}

let initialized = false;

/** Initializes the Teams JS SDK exactly once. */
export async function initTeams(): Promise<boolean> {
  if (initialized) return true;
  try {
    await app.initialize();
    initialized = true;
    return true;
  } catch {
    // Not hosted inside Teams (e.g. local browser dev).
    return false;
  }
}

/** Resolves the meeting/user context the app binds its session to. */
export async function getMeetingContext(): Promise<TeamsMeetingContext> {
  const inTeams = await initTeams();
  if (!inTeams) {
    return {
      meetingId: 'local-dev-meeting',
      meetingTitle: 'جلسة تطوير محلية',
      userName: 'Local Developer',
      theme: 'default',
      inTeams: false,
    };
  }

  const context = await app.getContext();
  const meetingId =
    context.meeting?.id ?? context.chat?.id ?? context.channel?.id ?? 'unknown-meeting';
  const meetingTitle =
    context.chat?.id && context.team?.displayName
      ? context.team.displayName
      : context.meeting?.id
        ? 'جلسة عبر Microsoft Teams'
        : 'جلسة';
  return {
    meetingId,
    meetingTitle,
    userName: context.user?.displayName ?? context.user?.userPrincipalName ?? 'Unknown',
    theme: context.app.theme,
    inTeams: true,
  };
}

/** Returns the Teams frame context (e.g. content, settings) or null outside Teams. */
export async function getFrameContext(): Promise<FrameContexts | null> {
  const inTeams = await initTeams();
  if (!inTeams) return null;
  const context = await app.getContext();
  return context.page.frameContext;
}

/**
 * Wires up the tab configuration screen shown when the app is added to a
 * meeting. Points the meeting side panel at the app root and marks the config
 * valid so the clerk can press "Save".
 */
export async function configureTab(contentUrl: string): Promise<void> {
  await initTeams();
  pages.config.registerOnSaveHandler((saveEvent) => {
    void pages.config
      .setConfig({
        entityId: 'smj-transcript',
        contentUrl,
        suggestedDisplayName: 'المحضر الذكي',
      })
      .then(() => saveEvent.notifySuccess())
      .catch(() => saveEvent.notifyFailure('setConfig failed'));
  });
  await pages.config.setValidityState(true);
}

/** Registers a callback fired when the Teams host theme changes. */
export function registerThemeChangeHandler(handler: (theme: string) => void): void {
  if (!initialized) return;
  app.registerOnThemeChangeHandler(handler);
}

/**
 * Acquires a Teams SSO access token for the current user. The token audience is
 * this app's Entra registration; the backend validates it. Throws if consent is
 * required or the user is not signed in.
 */
export async function getSsoToken(): Promise<string> {
  const inTeams = await initTeams();
  if (!inTeams) {
    throw new Error('SSO is only available inside Microsoft Teams');
  }
  return authentication.getAuthToken();
}
