import { Resend } from 'resend'

// Lazy initialization to avoid requiring API key at build time
let resend: Resend | null = null

function getResendClient() {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not set in environment variables')
        }
        resend = new Resend(apiKey)
    }
    return resend
}

export async function sendEmail(to: string[], subject: string, html: string) {
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const client = getResendClient()

    try {
        // Resend doesn't have a sendMultiple method, so we'll send individual emails
        // For better performance with many recipients, consider using batch API
        const promises = to.map(email =>
            client.emails.send({
                from,
                to: email,
                subject,
                html,
            })
        )

        const results = await Promise.allSettled(promises)

        // Count successful sends
        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failedCount = results.filter(r => r.status === 'rejected').length

        if (failedCount > 0) {
            console.warn(`${failedCount} emails failed to send`)
        }

        return { success: true, count: successCount }
    } catch (error) {
        console.error('Resend error:', error)
        throw error
    }
}

export { getResendClient as default }
