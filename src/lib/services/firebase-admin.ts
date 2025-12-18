import * as admin from 'firebase-admin'

// Guarded Firebase Admin SDK initialization to avoid throwing during build
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY

const hasFirebaseCreds =
    typeof firebaseProjectId === 'string' && firebaseProjectId &&
    typeof firebaseClientEmail === 'string' && firebaseClientEmail &&
    typeof firebasePrivateKey === 'string' && firebasePrivateKey

if (hasFirebaseCreds && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firebaseProjectId,
                clientEmail: firebaseClientEmail,
                privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
            }),
        })
    } catch (error) {
        console.error('Firebase admin initialization error:', error)
    }
} else if (!hasFirebaseCreds) {
    console.warn('Firebase Admin not initialized: missing service account environment variables')
}

export async function sendPushNotification(tokens: string[], title: string, body: string) {
    if (!tokens || tokens.length === 0) {
        return { success: false, count: 0, error: 'No tokens provided' }
    }

    const message = {
        notification: {
            title,
            body,
        },
        tokens,
    }

    try {
        const response = await admin.messaging().sendEachForMulticast(message)
        return {
            success: true,
            count: response.successCount,
            failureCount: response.failureCount,
        }
    } catch (error) {
        console.error('FCM error:', error)
        throw error
    }
}

export default admin
