import { StatsCards } from "@/components/dashboard/stats-cards";
import { UsersTable } from "@/components/dashboard/users-table";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: users } = await supabase.from('users').select('*');
  const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

  const totalUsers = users?.length || 0;

  // Calculate new signups (users created in the last month)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const newSignups = users?.filter(u => new Date(u.created_at) > oneMonthAgo).length || 0;

  const mappedUsers = users?.map(u => ({
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    profilePicture: u.profile_picture
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <StatsCards
          totalUsers={totalUsers}
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
