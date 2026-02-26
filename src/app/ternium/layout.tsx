import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <div className="w-full h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}