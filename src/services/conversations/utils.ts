export function getShareToken(): string | null {
  const pathParts = window.location.pathname.split('/');
  const sharedIndex = pathParts.indexOf('shared');
  if (sharedIndex !== -1 && pathParts[sharedIndex + 1]) {
    return pathParts[sharedIndex + 1];
  }
  return null;
}