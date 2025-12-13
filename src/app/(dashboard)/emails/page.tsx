"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Plus } from "lucide-react"
import { useState, useEffect } from "react"

export default function EmailsPage() {
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Fetch email history
    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/emails/history')
            const data = await res.json()
            setHistory(data.emails || [])
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const subject = formData.get('subject') as string
        const content = formData.get('content') as string

        try {
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message })
                e.currentTarget.reset()
                fetchHistory() // Refresh history
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send email' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Compose Email</CardTitle>
                        <CardDescription>Send an email to all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {message && (
                                <div className={`p-3 rounded-md text-sm ${message.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input name="subject" placeholder="Welcome to our platform" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Content (HTML)</Label>
                                <Textarea
                                    name="content"
                                    className="min-h-[200px]"
                                    placeholder="<h1>Welcome!</h1><p>Thank you for joining...</p>"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={isLoading}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Sending...' : 'Send Email'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Emails</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No emails sent yet.</p>
                            ) : (
                                history.map((email) => (
                                    <div key={email.id} className="p-3 bg-muted/50 rounded-lg border">
                                        <p className="font-medium text-sm">{email.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(email.sent_at).toLocaleDateString()} • {email.recipient_count} recipients
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
