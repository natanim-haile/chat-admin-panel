"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useState, useEffect } from "react"
import { useActionState } from "react"

export default function NotificationsPage() {
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Fetch notification history
    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/notifications/history')
            const data = await res.json()
            setHistory(data.notifications || [])
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const body = formData.get('body') as string

        try {
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message })
                e.currentTarget.reset()
                fetchHistory() // Refresh history
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send notification' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Send Broadcast</CardTitle>
                        <CardDescription>Send a push notification to all mobile users.</CardDescription>
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
                                <Label>Title</Label>
                                <Input name="title" placeholder="New Update Available!" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Body</Label>
                                <Textarea name="body" placeholder="We have added exciting new features..." required />
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                <Send className="mr-2 h-4 w-4" />
                                {isLoading ? 'Sending...' : 'Send to All Users'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent History</CardTitle>
                        <CardDescription>Last sent notifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">{item.body.substring(0, 50)}...</p>
                                            <p className="text-xs text-muted-foreground mt-1">Sent to {item.recipient_count} devices</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.sent_at).toLocaleDateString()}
                                        </span>
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
