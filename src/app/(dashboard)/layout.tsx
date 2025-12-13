import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar className="hidden w-64 md:block" />
            <div className="flex-1">
                <Header user={user} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
