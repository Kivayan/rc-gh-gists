import { getPreferenceValues } from "@raycast/api";
import { MissingTokenError } from "./errors";

type Preferences = {
  githubToken: string;
  fetchFullTruncatedContent?: boolean;
};

export function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

export function getRequiredToken(): string {
  const { githubToken } = getPreferences();
  if (!githubToken || !githubToken.trim()) {
    throw new MissingTokenError();
  }
  return githubToken.trim();
}

export function shouldFetchFullTruncatedContent(): boolean {
  const { fetchFullTruncatedContent } = getPreferences();
  return fetchFullTruncatedContent !== false;
}
