"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, UserPlus } from "lucide-react"

export interface StatsCardsProps {
    totalUsers: number;
    newSignups: number;
    messagesSent: number;
}

export function StatsCards({ totalUsers, newSignups, messagesSent }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Registered users
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{newSignups.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        In the last 30 days
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Messages Sent
                    </CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{messagesSent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Total messages
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
