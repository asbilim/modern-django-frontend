import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-8">Admin</h1>
        <nav>
          {/* Navigation items will be dynamically generated here */}
          <p>Navigation</p>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
