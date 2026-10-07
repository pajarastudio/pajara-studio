self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Pajara Studio",
      message: event.data ? event.data.text() : "Ada pembaruan baru.",
    };
  }

  const title = data.title || "Pajara Studio";
  const options = {
    body: data.message || "Ada pembaruan baru.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: data.url || "/dashboard",
    },
    vibrate: [200, 100, 200],
    tag: data.tag || "pajara-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
