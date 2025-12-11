import { StatsCards } from "@/components/dashboard/stats-cards";
import { UsersTable } from "@/components/dashboard/users-table";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: users } = await supabase.from('users').select('*');
  const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.status === 'Active').length || 0;

  // Mocking "new signups" logic based on created_at if available, otherwise 0
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const newSignups = users?.filter(u => new Date(u.created_at) > oneMonthAgo).length || 0;

  const mappedUsers = users?.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastActive: u.last_active,
    avatar: u.avatar
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <StatsCards
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          newSignups={newSignups}
          messagesSent={messagesCount || 0}
        />
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
          <div className="col-span-7">
            <div className="flex items-center justify-between py-4">
              <h3 className="text-xl font-semibold tracking-tight">Latest Users</h3>
            </div>
            <UsersTable users={mappedUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}
