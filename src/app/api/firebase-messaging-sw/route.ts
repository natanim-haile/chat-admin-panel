import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const serviceWorkerContent = `
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}',
    authDomain: '${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}',
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
`

    return new NextResponse(serviceWorkerContent, {
        headers: {
            'Content-Type': 'application/javascript',
            'Service-Worker-Allowed': '/',
        },
    })
}
