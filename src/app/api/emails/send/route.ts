import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/services/resend'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get request body
        const { subject, content } = await request.json()

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })
        }

        // Fetch all user emails
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('email')
            .not('email', 'is', null)

        if (usersError) {
            throw usersError
        }

        const emails = users?.map(u => u.email) || []

        if (emails.length === 0) {
            return NextResponse.json({ error: 'No users found' }, { status: 404 })
        }

        // Send emails
        const result = await sendEmail(emails, subject, content)

        // Log to database
        await supabase.from('emails').insert({
            subject,
            content,
            recipient_count: result.count,
            created_by: user.id,
        })

        return NextResponse.json({
            success: true,
            message: `Email sent to ${result.count} users`,
            count: result.count,
        })
    } catch (error) {
        console.error('Email send error:', error)
        return NextResponse.json(
            { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
