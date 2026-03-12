import { createGist } from "./github";
import { buildSearchDocuments } from "./search";
import { getRequiredToken } from "./preferences";
import { loadCache, saveCache } from "./storage";
import { CreateGistInput, GistRecord } from "./types";

export async function appendCreatedGistToCache(
  input: CreateGistInput,
): Promise<GistRecord> {
  const token = getRequiredToken();
  const gist = await createGist(token, input);
  const existing = await loadCache();

  if (existing) {
    const gists = [
      gist,
      ...existing.gists.filter((item) => item.id !== gist.id),
    ];
    await saveCache({
      gists,
      documents: buildSearchDocuments(gists),
      metadata: {
        ...existing.metadata,
        gistCount: gists.length,
      },
    });
  }

  return gist;
}
