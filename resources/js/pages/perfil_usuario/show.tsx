import { Head, Link, usePage } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { storageUrl } from '@/lib/storage';

type Perfil = {
    nombre: string;
    apellido: string;
    foto_perfil?: string | null;
} | null;

type AuthUser = {
    name: string;
    email: string;
    phone: string;
    birth_date: string;
} | null;

type Props = {
    perfil: Perfil;
};

export default function Show({ perfil }: Props) {
    const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
    const user = auth.user;

    return (
        <AppShell
            title="Perfil"
            subtitle="Completá y mantené actualizada tu información personal."
        >
            <Head title="Perfil" />

            <div className="space-y-6">
                {!perfil && (
                    <section className="app-card border-dashed">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                            Completá tu perfil para continuar usando la
                            plataforma.
                        </p>
                        <p className="mt-2 text-[var(--muted-foreground)]">
                            Todavía no cargaste tu nombre, apellido ni foto de
                            perfil.
                        </p>
                        <Link
                            href="/perfil/create"
                            className="btn-primary mt-6"
                        >
                            Completar perfil
                        </Link>
                    </section>
                )}

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="app-card">
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">
                            Datos de la cuenta
                        </h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <InfoRow
                                label="Usuario"
                                value={user?.name ?? '-'}
                            />
                            <InfoRow label="Email" value={user?.email ?? '-'} />
                            <InfoRow
                                label="Teléfono"
                                value={user?.phone ?? '-'}
                            />
                            <InfoRow
                                label="Fecha de nacimiento"
                                value={formatDate(user?.birth_date)}
                            />
                        </div>
                    </div>

                    <div className="app-card">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">
                                Perfil público
                            </h2>
                            {perfil ? (
                                <Link
                                    href="/perfil/edit"
                                    className="btn-secondary"
                                >
                                    Editar
                                </Link>
                            ) : null}
                        </div>

                        {perfil ? (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    {perfil.foto_perfil ? (
                                        <div className="h-20 w-20 overflow-hidden rounded-3xl border border-gray-200">
                                            <img
                                                src={
                                                    storageUrl(
                                                        perfil.foto_perfil,
                                                    ) ?? ''
                                                }
                                                alt={`${perfil.nombre} ${perfil.apellido}`}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent)] text-2xl font-bold text-[var(--accent-foreground)]">
                                            {perfil.nombre.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xl font-semibold text-[var(--foreground)]">
                                            {perfil.nombre} {perfil.apellido}
                                        </p>
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            Perfil completo del usuario
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-6 text-[var(--muted-foreground)]">
                                Aún no completaste tu perfil.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </AppShell>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
                {label}
            </p>
            <p className="mt-2 font-semibold text-[var(--foreground)]">
                {value}
            </p>
        </div>
    );
}

Show.layout = null;

function formatDate(date?: string | null) {
    if (!date) {
        return 'No cargada';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'No cargada';
    }

    const day = String(parsedDate.getUTCDate()).padStart(2, '0');
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const year = parsedDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
}
