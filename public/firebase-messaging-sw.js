importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: 'YOUR_API_KEY_PLACEHOLDER',
    authDomain: 'YOUR_AUTH_DOMAIN_PLACEHOLDER',
    projectId: 'YOUR_PROJECT_ID_PLACEHOLDER',
    storageBucket: 'YOUR_STORAGE_BUCKET_PLACEHOLDER',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID_PLACEHOLDER',
    appId: 'YOUR_APP_ID_PLACEHOLDER',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload)

    const notificationTitle = payload.notification?.title || 'New Notification'
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192x192.png',
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})
