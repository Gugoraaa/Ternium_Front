import { redirect } from 'next/navigation'
import { getAuthorizedServerUser } from '@/lib/server-auth'
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from '@/context/SidebarContext';

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authorizedUser = await getAuthorizedServerUser()

  if (!authorizedUser) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-slate-800 focus:px-3 focus:py-2 focus:rounded-lg focus:shadow-md focus:text-sm focus:font-bold"
      >
        Ir al contenido principal
      </a>
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
      <div className="flex h-screen">
        <Sidebar />
        <main id="main-content" className="w-full h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 
