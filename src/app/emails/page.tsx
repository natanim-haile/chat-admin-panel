"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Plus } from "lucide-react"

export default function EmailsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Compose Email</CardTitle>
                        <CardDescription>Send an email to user segments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>To</Label>
                                    <Input placeholder="All Users" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Template</Label>
                                    <Input placeholder="Select template..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input placeholder="Welcome to our platform" />
                            </div>
                            <div className="space-y-2">
                                <Label>Content (Rich Text)</Label>
                                <Textarea className="min-h-[200px]" placeholder="Write your message here..." />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline">Save Draft</Button>
                                <Button>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {['Welcome Email', 'Password Reset', 'Weekly Digest'].map((template) => (
                                <div key={template} className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted border transition-colors">
                                    <p className="font-medium text-sm">{template}</p>
                                    <p className="text-xs text-muted-foreground">Modified 2d ago</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
