export function formatVisibility(isPublic: boolean): string {
  return isPublic ? "Public" : "Secret";
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
