import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="w-full h-full overflow-y-auto">
            {children}
          </div>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}