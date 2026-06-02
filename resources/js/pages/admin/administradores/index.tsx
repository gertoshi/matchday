import AdminShell from '@/components/admin/AdminShell';
import { Head, Link } from '@inertiajs/react';
import { Plus, ShieldCheck } from 'lucide-react';

type Administrador = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

type Props = {
    administradores: {
        data: Administrador[];
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function GestionAdministradores({ administradores }: Props) {
    return (
        <AdminShell title="Administradores" subtitle="Usuarios con permisos de administración.">
            <Head title="Administradores" />

            <div className="space-y-6">
                <div className="flex justify-end">
                    <Link href="/admin/administradores/create" className="btn-primary">
                        <Plus className="h-5 w-5" />
                        Crear administrador
                    </Link>
                </div>

                <section className="app-card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="app-table">
                            <thead>
                                <tr>
                                    <th className="px-5 py-4">Nombre</th>
                                    <th className="px-5 py-4">Usuario</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Fecha de creación</th>
                                    <th className="px-5 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {administradores.data.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="px-5 py-4 font-semibold text-gray-900">{admin.name}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Admin
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">{admin.email}</td>
                                        <td className="px-5 py-4">{formatDate(admin.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <Link href={`/admin/usuarios/${admin.id}`} className="btn-secondary px-3 py-2">
                                                Ver usuario
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminShell>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
