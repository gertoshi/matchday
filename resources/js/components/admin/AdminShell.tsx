import { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

type AdminShellProps = {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
};

export default function AdminShell({
    children,
    title = 'Admin',
    subtitle = 'Panel administrador de Matchday.',
}: AdminShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileSidebarOpen]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="min-h-screen lg:pl-72">
                <AdminHeader
                    title={title}
                    subtitle={subtitle}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                />

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
