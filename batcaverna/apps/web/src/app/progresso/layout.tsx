import AppShell from "@/components/AppShell";

export default function ProgressoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
