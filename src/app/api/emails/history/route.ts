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

        // Fetch email history (last 10)
        const { data: emails, error } = await supabase
            .from('emails')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(10)

        if (error) {
            throw error
        }

        return NextResponse.json({ emails: emails || [] })
    } catch (error) {
        console.error('Email history error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch email history' },
            { status: 500 }
        )
    }
}
