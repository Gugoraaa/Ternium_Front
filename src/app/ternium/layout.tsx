import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/context/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProtectedRoute>
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
      </ProtectedRoute>
    </>
  );
} 