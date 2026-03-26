// frontend/public/sw.js

self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.head || "MedAssist Alert";
    const body = data.body || "You have a new reminder.";
    const speechText = data.speech_text;

    const options = {
        body: body,
        icon: '/logo.png', // Ensure you have this or use a generic one
        badge: '/badge.png',
        data: {
            url: data.url || '/',
            speechText: speechText
        },
        actions: [
            { action: 'open', title: 'View Details' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options).then(() => {
            return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SPEAK_REMINDER',
                        text: speechText
                    });
                });
            });
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
