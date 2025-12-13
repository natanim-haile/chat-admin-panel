import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const revalidate = 0

// Correctly typing params as a Promise for Next.js 15+ (if applicable) or standard prop
// Since package.json says "next": "16.0.7", async params are required.
export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data: user } = await supabase.from('users').select('*').eq('id', id).single()

    if (!user) {
        notFound()
    }

    async function updateUser(formData: FormData) {
        "use server"

        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const role = formData.get("role") as string
        const status = formData.get("status") as string

        await supabase.from('users').update({
            name,
            email,
            role,
            status
        }).eq('id', id)

        // In a real server action we would revalidatePath here, but sticking to simple structure for now
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            </div>

            <Card className="max-w-2xl">
                <CardContent className="pt-6">
                    <form action={updateUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={user.name} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={user.email} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" defaultValue={user.role || "User"}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Moderator">Moderator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={user.status || "Active"}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Offline">Offline</SelectItem>
                                    <SelectItem value="Blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
