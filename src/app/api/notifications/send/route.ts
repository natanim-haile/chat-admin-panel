import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendPushNotification } from '@/lib/services/firebase-admin'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get request body
        const { title, body } = await request.json()

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
        }

        // Fetch all FCM tokens
        const { data: tokens, error: tokensError } = await supabase
            .from('user_tokens')
            .select('token')

        if (tokensError) {
            throw tokensError
        }

        const fcmTokens = tokens?.map(t => t.token) || []

        if (fcmTokens.length === 0) {
            return NextResponse.json({ error: 'No device tokens found' }, { status: 404 })
        }

        // Send push notifications
        const result = await sendPushNotification(fcmTokens, title, body)

        // Log to database
        await supabase.from('notifications').insert({
            title,
            body,
            recipient_count: result.count,
            created_by: user.id,
        })

        return NextResponse.json({
            success: true,
            message: `Notification sent to ${result.count} devices`,
            count: result.count,
            failureCount: result.failureCount || 0,
        })
    } catch (error) {
        console.error('Notification send error:', error)
        return NextResponse.json(
            { error: 'Failed to send notification', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
