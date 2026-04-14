import { AppShell } from "@/components/layout/app-shell";
import { RoleKey } from "@prisma/client";
import { PageIntro } from "@/components/layout/page-intro";
import { UsersManager } from "@/components/admin/users-manager";
import { USER_MANAGEMENT_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function AdminUsersPage() {
  await requireAnyRole(USER_MANAGEMENT_ROLES);

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" }
      ],
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    }),
    prisma.role.findMany({
      orderBy: {
        name: "asc"
      }
    })
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="Users"
          title="Manage local access"
          description="Create invited or active users, assign roles, block access, delete test accounts, and manage password setup from the app."
        />
        <UsersManager
          roles={roles
            .filter((role) => role.key !== RoleKey.ADMIN)
            .map((role) => ({
              key: role.key,
              name: role.name
            }))}
          users={users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            status: user.status,
            roles: user.roles.map((entry) => (entry.role.key === RoleKey.ADMIN ? RoleKey.FULL_ADMIN : entry.role.key)),
            createdAt: user.createdAt.toISOString()
          }))}
        />
      </div>
    </AppShell>
  );
}
