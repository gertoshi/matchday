import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Home,
    X,
    UserCircle2,
    Trophy,
    Users,
} from 'lucide-react';

const items = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Mi equipo', href: '/equipos', icon: Users },
    { label: 'Torneos', href: '/eventos', icon: Trophy },
    { label: 'Inscripciones', href: '/inscripciones', icon: ClipboardList },
    { label: 'Partidos', href: '/partidos', icon: CalendarDays },
    { label: 'Perfil', href: '/perfil', icon: UserCircle2 },
];

type SidebarProps = {
    mobileOpen?: boolean;
    onClose?: () => void;
};

function SidebarContent({
    url,
    onNavigate,
}: {
    url: string;
    onNavigate?: () => void;
}) {
    return (
        <>
            <div className="mb-8 rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <img
                    src="/images/matchday-logo.jpeg"
                    alt="Matchday"
                    className="h-24 w-full object-contain sm:h-28"
                />
                <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
                    Gestión de torneos
                </p>
            </div>

            <nav className="space-y-2">
                {items.map((item) => {
                    const active =
                        url === item.href || url.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            preserveScroll={false}
                            onClick={onNavigate}
                            className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-lg font-semibold transition-all duration-200 ease-in-out ${
                                active
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                    : 'text-gray-700 hover:translate-x-1 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                        >
                            <Icon className="h-6 w-6 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const { url } = usePage();

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[var(--border)] bg-white px-6 py-8 lg:block">
                <SidebarContent url={url} />
            </aside>

            <div
                className={`fixed inset-0 z-50 bg-black/45 transition-opacity duration-200 ease-in-out lg:hidden ${
                    mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-[var(--border)] bg-white px-5 py-6 transition-transform duration-200 ease-in-out lg:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-hidden={!mobileOpen}
            >
                <div className="mb-4 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition-all duration-200 ease-in-out hover:bg-gray-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <SidebarContent url={url} onNavigate={onClose} />
            </aside>
        </>
    );
}
