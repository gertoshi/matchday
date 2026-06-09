import AdminShell from '@/components/admin/AdminShell';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ClipboardList, ShieldAlert, Trophy, Users } from 'lucide-react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
};

type Torneo = {
    id: number;
    nombre_evento: string;
    estado_evento: string;
    fecha_inicio: string | null;
    user?: { name: string } | null;
};

type Reporte = {
    id: number;
    motivo: string;
    estado: string;
    created_at: string;
    usuario_reportado?: { name: string } | null;
    usuario_reportante?: { name: string } | null;
};

type Props = {
    totalUsuarios: number;
    equiposActivos: number;
    torneosActivos: number;
    usuariosSuspendidos: number;
    reportesPendientes: number;
    usuariosRecientes: Usuario[];
    torneosRecientes: Torneo[];
    reportesRecientes: Reporte[];
};

export default function DashboardAdmin({
    totalUsuarios,
    equiposActivos,
    torneosActivos,
    usuariosSuspendidos,
    reportesPendientes,
    usuariosRecientes,
    torneosRecientes,
    reportesRecientes,
}: Props) {
    const stats = [
        { label: 'Usuarios registrados', value: totalUsuarios, icon: Users, color: 'emerald' },
        { label: 'Equipos activos', value: equiposActivos, icon: Trophy, color: 'blue' },
        { label: 'Torneos activos', value: torneosActivos, icon: ClipboardList, color: 'emerald' },
        { label: 'Usuarios suspendidos', value: usuariosSuspendidos, icon: ShieldAlert, color: 'amber' },
        { label: 'Reportes pendientes', value: reportesPendientes, icon: AlertTriangle, color: 'red' },
    ];
    const maxStat = Math.max(...stats.map((stat) => stat.value), 1);

    return (
        <AdminShell title="Dashboard admin" subtitle="Métricas generales y actividad reciente.">
            <Head title="Admin" />

            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const colorClass =
                            stat.color === 'blue'
                                ? 'bg-blue-100 text-blue-700'
                                : stat.color === 'amber'
                                  ? 'bg-amber-100 text-amber-700'
                                  : stat.color === 'red'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-emerald-100 text-emerald-700';

                        return (
                            <section key={stat.label} className="app-card p-5 md:p-6">
                                <div className={`inline-flex rounded-2xl p-3 ${colorClass}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <p className="mt-5 text-sm font-semibold text-gray-500">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                            </section>
                        );
                    })}
                </div>

                <section className="app-card">
                    <h2 className="section-title">Resumen visual</h2>
                    <div className="mt-6 space-y-4">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-700">{stat.label}</span>
                                    <span className="text-gray-500">{stat.value}</span>
                                </div>
                                <div className="h-3 rounded-full bg-gray-100">
                                    <div
                                        className="h-3 rounded-full bg-emerald-600"
                                        style={{ width: `${Math.max((stat.value / maxStat) * 100, stat.value ? 8 : 0)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-3">
                    <RecentTable title="Usuarios recientes" href="/admin/usuarios">
                        {usuariosRecientes.map((usuario) => (
                            <tr key={usuario.id}>
                                <td className="px-5 py-4 font-semibold text-gray-900">{usuario.name}</td>
                                <td className="px-5 py-4">{usuario.email}</td>
                                <td className="px-5 py-4">
                                    <StatusBadge value={usuario.status} />
                                </td>
                            </tr>
                        ))}
                    </RecentTable>

                    <RecentTable title="Torneos recientes" href="/eventos">
                        {torneosRecientes.map((torneo) => (
                            <tr key={torneo.id}>
                                <td className="px-5 py-4 font-semibold text-gray-900">{torneo.nombre_evento}</td>
                                <td className="px-5 py-4">{torneo.user?.name ?? 'Sin organizador'}</td>
                                <td className="px-5 py-4">
                                    <StatusBadge value={torneo.estado_evento} />
                                </td>
                            </tr>
                        ))}
                    </RecentTable>

                    <RecentTable title="Reportes recientes" href="/admin/reportes">
                        {reportesRecientes.map((reporte) => (
                            <tr key={reporte.id}>
                                <td className="px-5 py-4 font-semibold text-gray-900">
                                    {reporte.usuario_reportado?.name ?? 'Usuario eliminado'}
                                </td>
                                <td className="px-5 py-4">{reporte.motivo}</td>
                                <td className="px-5 py-4">
                                    <StatusBadge value={reporte.estado} />
                                </td>
                            </tr>
                        ))}
                    </RecentTable>
                </div>
            </div>
        </AdminShell>
    );
}

function RecentTable({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <section className="app-card overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 p-6">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <Link href={href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Ver todo
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="app-table">
                    <tbody>{children}</tbody>
                </table>
            </div>
        </section>
    );
}

function StatusBadge({ value }: { value: string }) {
    const classes: Record<string, string> = {
        activo: 'bg-emerald-100 text-emerald-700',
        abierto: 'bg-emerald-100 text-emerald-700',
        en_curso: 'bg-blue-100 text-blue-700',
        pendiente: 'bg-amber-100 text-amber-700',
        suspendido: 'bg-amber-100 text-amber-700',
        bloqueado: 'bg-red-100 text-red-700',
        resuelto: 'bg-blue-100 text-blue-700',
    };

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[value] ?? 'bg-slate-200 text-slate-700'}`}>
            {statusLabel(value)}
        </span>
    );
}

function statusLabel(value: string) {
    const labels: Record<string, string> = {
        abierto: 'Abierto',
        en_curso: 'En curso',
        finalizado: 'Finalizado',
    };

    return labels[value] ?? value;
}
