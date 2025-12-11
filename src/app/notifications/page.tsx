"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

export default function NotificationsPage() {
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
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input placeholder="New Update Available!" />
                            </div>
                            <div className="space-y-2">
                                <Label>Body</Label>
                                <Textarea placeholder="We have added exciting new features..." />
                            </div>
                            <Button className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Send to All Users
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
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">System Maintenance</p>
                                        <p className="text-sm text-muted-foreground">Scheduled for Sunday 2AM...</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">2 days ago</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
