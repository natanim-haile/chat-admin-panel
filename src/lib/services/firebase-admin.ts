import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        })
    } catch (error) {
        console.error('Firebase admin initialization error:', error)
    }
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
