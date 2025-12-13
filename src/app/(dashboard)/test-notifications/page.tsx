'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase-config'

export default function TestNotificationsPage() {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastMessage, setLastMessage] = useState<any>(null)
    const [sendingTest, setSendingTest] = useState(false)

    useEffect(() => {
        // Listen for foreground messages
        const setupListener = async () => {
            try {
                await onMessageListener((payload) => {
                    console.log('Received foreground message:', payload)
                    setLastMessage(payload)
                })
            } catch (err) {
                console.error('Error setting up message listener:', err)
            }
        }
        setupListener()
    }, [])

    const handleEnableNotifications = async () => {
        setLoading(true)
        setError(null)

        try {
            const fcmToken = await requestNotificationPermission()
            setToken(fcmToken)

            // Optionally save token to database for testing
            await fetch('/api/test-notification/save-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: fcmToken }),
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enable notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleSendTestNotification = async () => {
        if (!token) return

        setSendingTest(true)
        try {
            const response = await fetch('/api/test-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    title: 'Test Notification',
                    body: 'This is a test notification from your admin panel!',
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send notification')
            }

            alert('Test notification sent! Check your browser notifications.')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to send test notification')
        } finally {
            setSendingTest(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Test Push Notifications</h1>
                <p className="text-muted-foreground">
                    Test Firebase Cloud Messaging functionality without the chat app
                </p>
            </div>

            <div className="grid gap-6">
                {/* Enable Notifications Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Step 1: Enable Notifications
                        </CardTitle>
                        <CardDescription>
                            Request browser permission and get your FCM token
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!token ? (
                            <Button
                                onClick={handleEnableNotifications}
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Requesting Permission...
                                    </>
                                ) : (
                                    <>
                                        <Bell className="mr-2 h-4 w-4" />
                                        Enable Notifications
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-900 dark:text-green-100">
                                        Notifications Enabled
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        Your FCM token has been registered
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {token && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your FCM Token:</label>
                                <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                                    {token}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(token)
                                        alert('Token copied to clipboard!')
                                    }}
                                >
                                    Copy Token
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Send Test Notification Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Send Test Notification</CardTitle>
                        <CardDescription>
                            Send a test notification to this device
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleSendTestNotification}
                            disabled={!token || sendingTest}
                            className="w-full sm:w-auto"
                        >
                            {sendingTest ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Test Notification'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Last Message Card */}
                {lastMessage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Last Received Message</CardTitle>
                            <CardDescription>
                                Most recent notification received while page is open
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-lg">
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(lastMessage, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Testing Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <strong>1. Enable notifications</strong>
                            <p className="text-muted-foreground">
                                Click the button above and grant permission when prompted
                            </p>
                        </div>
                        <div>
                            <strong>2. Send a test notification</strong>
                            <p className="text-muted-foreground">
                                Use the "Send Test Notification" button to verify it works
                            </p>
                        </div>
                        <div>
                            <strong>3. Test from the main notifications page</strong>
                            <p className="text-muted-foreground">
                                Go to the Notifications page and send to all users (your token will be included)
                            </p>
                        </div>
                        <div>
                            <strong>4. Test background notifications</strong>
                            <p className="text-muted-foreground">
                                Minimize or switch tabs, then send a notification to see it appear
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
