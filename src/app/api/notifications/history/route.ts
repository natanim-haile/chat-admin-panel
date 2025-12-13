import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch notification history (last 10)
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(10)

        if (error) {
            throw error
        }

        return NextResponse.json({ notifications: notifications || [] })
    } catch (error) {
        console.error('Notification history error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notification history' },
            { status: 500 }
        )
    }
}
