import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type AppShellProps = {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
};

export default function AppShell({
    children,
    title = 'Matchday',
    subtitle = 'Gestión de torneos amateur.',
}: AppShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
                    {children}
                </main>
            </div>
        </div>
    );
}
