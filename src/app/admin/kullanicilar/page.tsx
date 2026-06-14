import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Kullanıcılar</h1>
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-posta</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Kayıt</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm">{u.name ?? "—"}</TableCell>
                <TableCell className="text-sm text-[var(--muted)]">{formatDate(u.createdAt)}</TableCell>
                <TableCell>
                  <UserRoleSelect userId={u.id} role={u.role} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
