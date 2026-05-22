self.addEventListener("push", (event) => {
  let payload = {};
  try {
    const parsed = event.data ? event.data.json() : {};
    payload =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === "string" ? payload.title : "Ritora";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "",
    icon: safeAssetPath(payload.icon, "/brand/ritora-icon-192.png"),
    badge: safeAssetPath(payload.badge, "/brand/ritora-icon-192.png"),
    tag:
      typeof payload.tag === "string"
        ? payload.tag
        : "ritora-notification",
    data:
      payload.data && typeof payload.data === "object"
        ? payload.data
        : { deepLink: "/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

function safeAssetPath(value, fallback) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawDeepLink =
    typeof event.notification.data?.deepLink === "string"
      ? event.notification.data.deepLink
      : "/notifications";
  const deepLink =
    rawDeepLink.startsWith("/") && !rawDeepLink.startsWith("//")
      ? rawDeepLink
      : "/notifications";
  const targetUrl = new URL(deepLink, self.location.origin).toString();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((client) => {
          try {
            return new URL(client.url).origin === self.location.origin;
          } catch {
            return false;
          }
        });

        if (existingClient) {
          existingClient.focus();
          return existingClient.navigate(targetUrl);
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
