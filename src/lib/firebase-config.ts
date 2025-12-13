import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Get messaging instance (only in browser)
export const getMessagingInstance = async () => {
    const supported = await isSupported()
    if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser')
        return null
    }
    return getMessaging(app)
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
    try {
        const messaging = await getMessagingInstance()
        if (!messaging) {
            throw new Error('Messaging not supported')
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            throw new Error('Notification permission denied')
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw')
            console.log('Service Worker registered:', registration)
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        if (!vapidKey) {
            throw new Error('VAPID key not configured')
        }

        const token = await getToken(messaging, { vapidKey })
        return token
    } catch (error) {
        console.error('Error getting notification permission:', error)
        throw error
    }
}

// Listen for foreground messages
export const onMessageListener = async (callback: (payload: any) => void) => {
    const messaging = await getMessagingInstance()
    if (!messaging) return

    return onMessage(messaging, callback)
}

export default app
