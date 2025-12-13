import { NextRequest, NextResponse } from 'next/server'
import { sendPushNotification } from '@/lib/services/firebase-admin'

export async function POST(request: NextRequest) {
    try {
        const { token, title, body } = await request.json()

        if (!token || !title || !body) {
            return NextResponse.json(
                { error: 'Token, title, and body are required' },
                { status: 400 }
            )
        }

        // Send notification to the single token
        const result = await sendPushNotification([token], title, body)

        return NextResponse.json({
            success: true,
            message: 'Test notification sent',
            result,
        })
    } catch (error) {
        console.error('Test notification error:', error)
        return NextResponse.json(
            { error: 'Failed to send test notification', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
