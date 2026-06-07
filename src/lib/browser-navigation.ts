export function navigateToUrl(url: string): void {
  window.location.assign(url);
}

export function replaceCurrentUrl(url: string): void {
  window.location.replace(url);
}
