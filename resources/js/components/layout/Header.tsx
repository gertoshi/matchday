import { router, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

type HeaderProps = {
    title: string;
    subtitle?: string;
    onOpenSidebar?: () => void;
};

type AuthUser = {
    name: string;
    email: string;
} | null;

export default function Header({ title, subtitle, onOpenSidebar }: HeaderProps) {
    const { auth } = usePage<{ auth: { user: AuthUser } }>().props;

    return (
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur">
            <div className="flex min-h-20 items-start justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-start gap-3">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition-all duration-200 ease-in-out hover:bg-gray-50 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
                        {title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                        {subtitle || 'Matchday'}
                    </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent)] px-3 py-2 text-right sm:px-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent-foreground)]">
                            Usuario
                        </p>
                        <p className="mt-1 max-w-32 truncate text-sm font-semibold text-[var(--foreground)] sm:max-w-40">
                            {auth.user?.name ?? 'Invitado'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="btn-blue px-3 py-2 text-sm sm:px-4 sm:py-2.5"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>
    );
}
