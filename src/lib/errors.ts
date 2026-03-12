export class MissingTokenError extends Error {
  constructor() {
    super(
      "Missing GitHub token. Add a Personal Access Token with gist scope in Raycast preferences.",
    );
    this.name = "MissingTokenError";
  }
}

export class AuthenticationError extends Error {
  constructor(
    message = "GitHub authentication failed. Check your token and gist scope.",
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message = "GitHub rate limit reached. Try again in a few minutes.",
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GitHubRequestError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "GitHubRequestError";
    this.statusCode = statusCode;
  }
}
