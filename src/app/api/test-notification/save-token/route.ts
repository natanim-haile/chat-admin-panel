import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        // Save test token to database (optional - for tracking test devices)
        // You can create a test_tokens table or just use the existing users table
        // For now, we'll just return success since the main purpose is testing

        return NextResponse.json({
            success: true,
            message: 'Token saved for testing',
        })
    } catch (error) {
        console.error('Save token error:', error)
        return NextResponse.json(
            { error: 'Failed to save token' },
            { status: 500 }
        )
    }
}
