import { supabase } from "@/lib/supabase"
import { UsersTable } from "@/components/dashboard/users-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const revalidate = 0

export default async function UsersPage() {
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false })

    const mappedUsers = users?.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        lastActive: u.last_active,
        avatar: u.avatar
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <Link href="/users/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
            </div>
            <UsersTable users={mappedUsers} />
        </div>
    )
}
