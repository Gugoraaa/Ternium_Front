import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
      
        <AuthProvider>
        <section className="flex h-screen">
          <Sidebar />
          <div className="w-full h-full overflow-y-auto">
            {children}
          </div>
        </section>
        </AuthProvider>
      
    </>
  );
}