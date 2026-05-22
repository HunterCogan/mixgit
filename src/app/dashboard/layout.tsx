import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ShellLayout from "@/components/ShellLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellLayout header={<Header />} navbar={<Navbar />}>
      {children}
    </ShellLayout>
  );
}
