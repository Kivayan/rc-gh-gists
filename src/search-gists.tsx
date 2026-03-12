import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Icon,
  LaunchProps,
  List,
  Toast,
  showToast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { getRequiredToken } from "./lib/preferences";
import {
  createSearchIndex,
  searchDocuments,
  sortRecentGists,
} from "./lib/search";
import { syncAllGists } from "./lib/sync";
import { loadCache } from "./lib/storage";
import { CachePayload, GistRecord } from "./lib/types";
import { formatDate, formatVisibility, pluralize } from "./lib/format";

function formatGistTitle(gist: GistRecord): string {
  const [firstFile] = gist.files;

  if (!firstFile) {
    return "(Untitled gist)";
  }

  const extraFileCount = gist.files.length - 1;
  if (extraFileCount <= 0) {
    return firstFile.filename;
  }

  return `${firstFile.filename} (+${extraFileCount} more)`;
}

function formatGistSubtitle(gist: GistRecord): string | undefined {
  const description = gist.description.trim();
  return description || undefined;
}

function buildPreviewMarkdown(gist: GistRecord): string {
  const sections = gist.files.map((file) => {
    const content = file.content?.trim();

    if (!content) {
      return "_No preview available_";
    }

    return ["```", content, "```"].join("\n\n");
  });

  return sections.join("\n\n---\n\n");
}

function buildPasteContent(gist: GistRecord): string {
  return gist.files
    .map((file) => file.content?.trim())
    .filter((content): content is string => Boolean(content))
    .join("\n\n");
}

async function pasteGistContent(gist: GistRecord) {
  const content = buildPasteContent(gist);

  if (!content) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No gist content available",
    });
    return;
  }

  await Clipboard.paste(content);
  await showToast({
    style: Toast.Style.Success,
    title: "Pasted gist content",
  });
}

function GistPreview({ gist }: { gist: GistRecord }) {
  return (
    <Detail
      navigationTitle=""
      markdown={buildPreviewMarkdown(gist)}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Filename"
            text={formatGistTitle(gist)}
          />
          <Detail.Metadata.Label
            title="Description"
            text={formatGistSubtitle(gist) ?? "No description"}
          />
          <Detail.Metadata.Label
            title="Visibility"
            text={formatVisibility(gist.public)}
          />
          <Detail.Metadata.Label
            title="Files"
            text={pluralize(gist.files.length, "file")}
          />
          <Detail.Metadata.Label
            title="Updated"
            text={formatDate(gist.updatedAt)}
          />
          <Detail.Metadata.Link
            title="GitHub"
            text="Open Gist"
            target={gist.htmlUrl}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title="Paste Gist Content"
            icon={Icon.Clipboard}
            onAction={() => pasteGistContent(gist)}
          />
          <Action.OpenInBrowser
            title="Show in GitHub"
            url={gist.htmlUrl}
            shortcut={{ modifiers: ["ctrl"], key: "enter" }}
          />
          <Action
            title="Copy Gist URL"
            onAction={() => Clipboard.copy(gist.htmlUrl)}
          />
        </ActionPanel>
      }
    />
  );
}

export default function SearchGists(_props: LaunchProps) {
  const [query, setQuery] = useState("");
  const [cache, setCache] = useState<CachePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        getRequiredToken();
        const loaded = await loadCache();
        if (!isMounted) {
          return;
        }

        setCache(loaded);
        setIsLoading(!loaded);
        setIsRefreshing(true);

        try {
          const { payload } = await syncAllGists();
          if (!isMounted) {
            return;
          }

          setCache(payload);
          setError(null);
        } catch (err) {
          if (!isMounted) {
            return;
          }

          if (!loaded) {
            setError(
              err instanceof Error ? err.message : "Failed to refresh gists.",
            );
          }
        } finally {
          if (isMounted) {
            setIsRefreshing(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load gists.",
          );
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const indexBundle = useMemo(() => {
    if (!cache) {
      return null;
    }
    return createSearchIndex(cache.documents, cache.gists);
  }, [cache]);

  const gists: GistRecord[] = useMemo(() => {
    if (!cache) {
      return [];
    }

    if (!query.trim()) {
      return sortRecentGists(cache.gists);
    }

    if (!indexBundle) {
      return [];
    }

    return searchDocuments(indexBundle, query)
      .map((result) => indexBundle.byGistId.get(String(result.gistId)))
      .filter((gist): gist is GistRecord => Boolean(gist));
  }, [cache, indexBundle, query]);

  async function copyGistUrl(url: string) {
    await Clipboard.copy(url);
    await showToast({ style: Toast.Style.Success, title: "Copied gist URL" });
  }

  if (error) {
    return (
      <List isLoading={false} searchBarPlaceholder="Search gists">
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Setup required"
          description={error}
        />
      </List>
    );
  }

  if (!cache) {
    return (
      <List
        isLoading={isLoading || isRefreshing}
        searchBarPlaceholder="Search gists"
        onSearchTextChange={setQuery}
      >
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No gist index yet"
          description="Run the Refresh Gists command to build your local gist index."
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading || isRefreshing}
      searchBarPlaceholder="Search gists"
      onSearchTextChange={setQuery}
      throttle
    >
      {gists.map((gist) => (
        <List.Item
          key={gist.id}
          title={formatGistTitle(gist)}
          subtitle={formatGistSubtitle(gist)}
          accessories={[
            { tag: formatVisibility(gist.public) },
            { text: pluralize(gist.files.length, "file") },
            { text: formatDate(gist.updatedAt) },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Preview Gist"
                icon={Icon.Eye}
                target={<GistPreview gist={gist} />}
              />
              <Action.OpenInBrowser
                title="Show in GitHub"
                url={gist.htmlUrl}
                shortcut={{ modifiers: ["ctrl"], key: "enter" }}
              />
              <Action
                title="Copy Gist URL"
                onAction={() => copyGistUrl(gist.htmlUrl)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
