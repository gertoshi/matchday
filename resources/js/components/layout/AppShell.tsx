import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type AppShellProps = {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
};

type ActiveSanction = {
    tipo: 'suspension' | 'baneo';
    motivo: string;
    comentarios?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
} | null;

type SharedProps = {
    auth: {
        user: {
            status?: string | null;
        } | null;
        sancion_activa: ActiveSanction;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
};

export default function AppShell({
    children,
    title = 'Matchday',
    subtitle = 'Gestión de torneos amateur.',
}: AppShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { auth, flash } = usePage<SharedProps>().props;
    const suspension = auth.sancion_activa?.tipo === 'suspension'
        ? auth.sancion_activa
        : null;

    useEffect(() => {
        document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileSidebarOpen]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
            <Sidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="min-h-screen lg:pl-72">
                <Header
                    title={title}
                    subtitle={subtitle}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-6 space-y-3">
                        {suspension ? (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
                                <p className="font-semibold">
                                    Tu cuenta está suspendida.
                                </p>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>Motivo: {suspension.motivo}</p>
                                    <p>
                                        Inicio: {formatDate(suspension.fecha_inicio)}
                                    </p>
                                    {suspension.fecha_fin ? (
                                        <p>
                                            Hasta: {formatDate(suspension.fecha_fin)}
                                        </p>
                                    ) : null}
                                    {suspension.comentarios ? (
                                        <p>Comentarios: {suspension.comentarios}</p>
                                    ) : null}
                                    <p>
                                        Durante este período solo podés consultar información.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        <FlashMessage type="success" message={flash?.success} />
                        <FlashMessage type="error" message={flash?.error} />
                        <FlashMessage type="warning" message={flash?.warning} />
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}

function FlashMessage({
    type,
    message,
}: {
    type: 'success' | 'error' | 'warning';
    message?: string | null;
}) {
    if (!message) {
        return null;
    }

    const classes = {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        error: 'border-red-200 bg-red-50 text-red-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${classes[type]}`}>
            {message}
        </div>
    );
}

function formatDate(value?: string | null) {
    if (!value) {
        return 'Sin fecha';
    }

    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    return `${day}/${month}/${year}`;
}
