import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#F8FAFC",
            color: "#171717",
            border: "1px solid #64748B",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
          }
        }} />
      <section className="flex h-screen">
        <Sidebar />
        <div className="w-full h-full overflow-y-auto">
          {children}
        </div>
      </section>
    </>
  );
} 