"use client";

import { RoleKey, UserStatus } from "@prisma/client";
import { Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  roles: RoleKey[];
  createdAt: string;
};

type RoleOption = {
  key: RoleKey;
  name: string;
};

type UserDraft = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  roles: RoleKey[];
};

const emptyDraft = (): UserDraft => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  status: UserStatus.INVITED,
  roles: [RoleKey.STAFF]
});

const roleDescriptions: Record<RoleKey, string> = {
  [RoleKey.ADMIN]: "Legacy admin role retained only for migration compatibility.",
  [RoleKey.STAFF]: "Can sell, complete checkout, and manage their own recent orders.",
  [RoleKey.FULL_ADMIN]: "Full access to users, catalog, orders, templates, and country settings.",
  [RoleKey.CATALOG_ADMIN]: "Admin access limited to catalog management.",
  [RoleKey.FINANCE]: "Can access the admin area and view all orders, but cannot modify operational settings.",
  [RoleKey.OPERATIONS]: "Can manage catalog, email templates, country settings, and order support."
};

export function UsersManager({
  users,
  roles
}: {
  users: UserRow[];
  roles: RoleOption[];
}) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<UserDraft | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResendingInvite, setIsResendingInvite] = useState(false);
  const [error, setError] = useState("");

  const sortedRoles = useMemo(() => roles.slice().sort((a, b) => a.name.localeCompare(b.name)), [roles]);

  async function saveUser() {
    if (!editingUser) {
      return;
    }

    setIsSaving(true);
    setError("");

    const url = isCreating ? "/api/admin/users" : `/api/admin/users/${editingUser.id}`;
    const method = isCreating ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        password: editingUser.password,
        status: editingUser.status,
        roles: editingUser.roles
      })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to save user.");
      setIsSaving(false);
      return;
    }

    setEditingUser(null);
    setIsCreating(false);
    setIsSaving(false);
    router.refresh();
  }

  async function deleteUser() {
    if (!editingUser?.id || isCreating) {
      return;
    }

    const confirmed = globalThis.confirm(`Delete ${editingUser.firstName} ${editingUser.lastName}? This is intended for test cleanup only.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    const response = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: "DELETE"
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to delete user.");
      setIsDeleting(false);
      return;
    }

    setEditingUser(null);
    setIsCreating(false);
    setIsDeleting(false);
    router.refresh();
  }

  async function resendInvite() {
    if (!editingUser?.id || isCreating || editingUser.status !== UserStatus.INVITED) {
      return;
    }

    setIsResendingInvite(true);
    setError("");

    const response = await fetch(`/api/admin/users/${editingUser.id}/invite`, {
      method: "POST"
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to resend invite.");
      setIsResendingInvite(false);
      return;
    }

    setIsResendingInvite(false);
  }

  return (
    <>
      <Card className="overflow-hidden bg-white/96 p-0">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone">Users</p>
            <p className="mt-2 text-sm text-stone">Manage local access, roles, and account status.</p>
          </div>
          <Button
            onClick={() => {
              setEditingUser(emptyDraft());
              setIsCreating(true);
              setError("");
            }}
            variant="success"
          >
            <Plus className="mr-2 size-4" />
            Add user
          </Button>
        </div>
        <div className="hidden grid-cols-[1.2fr_1fr_140px_160px_80px] gap-4 border-b border-black/5 px-6 py-4 text-xs uppercase tracking-[0.24em] text-stone xl:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Roles</span>
          <span>Status</span>
          <span></span>
        </div>
        {users.map((user) => (
          <div key={user.id} className="border-t border-black/5 first:border-t-0 xl:border-t-0">
            <div className="space-y-4 px-5 py-5 xl:hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-ink">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="mt-2 text-sm break-all text-stone">{user.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
                  onClick={() => {
                    setEditingUser({
                      id: user.id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      password: "",
                      status: user.status,
                      roles: user.roles
                    });
                    setIsCreating(false);
                    setError("");
                  }}
                  type="button"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">Roles</p>
                  <p className="mt-2 font-semibold text-ink">{user.roles.join(", ")}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">Status</p>
                  <p className={`mt-2 font-semibold ${user.status === UserStatus.ACTIVE ? "text-success" : "text-stone"}`}>{user.status}</p>
                </div>
              </div>
            </div>

            <div className="hidden grid-cols-[1.2fr_1fr_140px_160px_80px] gap-4 px-6 py-5 text-sm xl:grid">
              <div>
                <p className="font-medium text-ink">{`${user.firstName} ${user.lastName}`}</p>
                <p className="mt-1 text-xs text-stone">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-ink">{user.email}</span>
              <span className="text-stone">{user.roles.join(", ")}</span>
              <span className={user.status === UserStatus.ACTIVE ? "text-success" : "text-stone"}>{user.status}</span>
              <button
                className="flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
                onClick={() => {
                  setEditingUser({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: "",
                    status: user.status,
                    roles: user.roles
                  });
                  setIsCreating(false);
                  setError("");
                }}
                type="button"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </Card>

      {editingUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            setEditingUser(null);
            setIsCreating(false);
          }}
        >
          <Card className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white p-0" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label="Close user editor"
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              onClick={() => {
                setEditingUser(null);
                setIsCreating(false);
              }}
              type="button"
            >
              <X className="size-4" />
            </button>
            <div className="grid gap-0 xl:grid-cols-[1fr_0.92fr]">
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{isCreating ? "Create user" : "Edit user"}</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">
                  {isCreating ? "New local account" : `${editingUser.firstName} ${editingUser.lastName}`}
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">First name</label>
                    <Input value={editingUser.firstName} onChange={(event) => setEditingUser({ ...editingUser, firstName: event.target.value })} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">Last name</label>
                    <Input value={editingUser.lastName} onChange={(event) => setEditingUser({ ...editingUser, lastName: event.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">Email</label>
                    <Input type="email" value={editingUser.email} onChange={(event) => setEditingUser({ ...editingUser, email: event.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">
                      {isCreating
                        ? editingUser.status === UserStatus.INVITED
                          ? "Password (optional while invited)"
                          : "Password"
                        : "New password (optional)"}
                    </label>
                    <Input type="password" value={editingUser.password} onChange={(event) => setEditingUser({ ...editingUser, password: event.target.value })} />
                    {isCreating && editingUser.status === UserStatus.INVITED ? (
                      <p className="mt-2 text-sm text-stone">
                        Leaving this blank sends a one-time setup email so the user can create their own password.
                      </p>
                    ) : null}
                  </div>
                </div>
                {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
              </div>
              <div className="bg-ink p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Access</p>
                <div className="mt-6">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">Status</label>
                  <select
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none"
                    value={editingUser.status}
                    onChange={(event) => setEditingUser({ ...editingUser, status: event.target.value as UserStatus })}
                  >
                    <option value={UserStatus.ACTIVE}>ACTIVE</option>
                    <option value={UserStatus.INVITED}>INVITED</option>
                    <option value={UserStatus.DISABLED}>DISABLED</option>
                  </select>
                  <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <p>
                      <span className="font-semibold text-white">ACTIVE</span>: user can sign in and use the app normally.
                    </p>
                    <p>
                      <span className="font-semibold text-white">INVITED</span>: account is blocked until the user completes setup from the invite email.
                    </p>
                    <p>
                      <span className="font-semibold text-white">DISABLED</span>: sign-in should be blocked and access is removed.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Roles</p>
                  <div className="mt-3 space-y-3">
                    {sortedRoles.map((role) => {
                      const active = editingUser.roles.includes(role.key);
                      return (
                        <label key={role.key} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                          <input
                            checked={active}
                            className="size-5 rounded"
                            onChange={(event) =>
                              setEditingUser({
                                ...editingUser,
                                roles: event.target.checked
                                  ? [...editingUser.roles, role.key]
                                  : editingUser.roles.filter((entry) => entry !== role.key)
                              })
                            }
                            type="checkbox"
                          />
                          <span>{role.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                    {sortedRoles.map((role) => (
                      <p key={role.key}>
                        <span className="font-semibold text-white">{role.name}</span>: {roleDescriptions[role.key]}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={isSaving} onClick={saveUser} type="button" variant="success">
                      {isSaving ? "Saving..." : isCreating ? "Create user" : "Save changes"}
                    </Button>
                    {!isCreating ? (
                      editingUser.status === UserStatus.INVITED ? (
                        <Button disabled={isResendingInvite} onClick={resendInvite} type="button" variant="secondary">
                          {isResendingInvite ? "Resending invite..." : "Resend invite"}
                        </Button>
                      ) : null
                    ) : null}
                    {!isCreating ? (
                      <Button disabled={isDeleting} onClick={deleteUser} type="button" variant="danger">
                        {isDeleting ? "Deleting..." : "Delete user"}
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => {
                        setEditingUser(null);
                        setIsCreating(false);
                      }}
                      type="button"
                      variant="danger"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
