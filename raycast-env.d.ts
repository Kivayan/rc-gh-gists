/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Fetch Full Truncated File Content - When enabled, the indexer fetches full raw content for truncated gist files */
  "fetchFullTruncatedContent": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-gists` command */
  export type SearchGists = ExtensionPreferences & {}
  /** Preferences accessible in the `create-gist` command */
  export type CreateGist = ExtensionPreferences & {}
  /** Preferences accessible in the `refresh-gists` command */
  export type RefreshGists = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-gists` command */
  export type SearchGists = {}
  /** Arguments passed to the `create-gist` command */
  export type CreateGist = {}
  /** Arguments passed to the `refresh-gists` command */
  export type RefreshGists = {}
}

