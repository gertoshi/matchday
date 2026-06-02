import AdminShell from '@/components/admin/AdminShell';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';

type Equipo = {
    id: number;
    nombre_equipo: string;
    plantilla: number;
    estado_equipo: string;
    jugadores_count: number;
    created_at: string;
    user?: { name: string; email: string; status: string } | null;
};

type Props = {
    equipos: {
        data: Equipo[];
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function GestionEquipos({ equipos }: Props) {
    function suspender(equipo: Equipo) {
        router.post(`/admin/equipos/${equipo.id}/suspender`, {}, { preserveScroll: true });
    }

    function eliminar(equipo: Equipo) {
        if (window.confirm(`¿Marcar como eliminado a ${equipo.nombre_equipo}?`)) {
            router.delete(`/admin/equipos/${equipo.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminShell title="Equipos" subtitle="Control de equipos, planteles y estados.">
            <Head title="Equipos admin" />

            <section className="app-card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th className="px-5 py-4">Equipo</th>
                                <th className="px-5 py-4">Responsable</th>
                                <th className="px-5 py-4">Jugadores</th>
                                <th className="px-5 py-4">Plantilla</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4">Creación</th>
                                <th className="px-5 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.data.map((equipo) => (
                                <tr key={equipo.id}>
                                    <td className="px-5 py-4 font-semibold text-gray-900">{equipo.nombre_equipo}</td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">{equipo.user?.name ?? 'Sin usuario'}</p>
                                        <p className="text-xs text-gray-500">{equipo.user?.email ?? ''}</p>
                                    </td>
                                    <td className="px-5 py-4">{equipo.jugadores_count}</td>
                                    <td className="px-5 py-4">{equipo.plantilla}</td>
                                    <td className="px-5 py-4">
                                        <StatusBadge value={equipo.estado_equipo} />
                                    </td>
                                    <td className="px-5 py-4">{formatDate(equipo.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Link href={`/admin/equipos/${equipo.id}`} className="btn-secondary px-3 py-2">
                                                <Eye className="h-4 w-4" />
                                                Ver
                                            </Link>
                                            <button type="button" onClick={() => suspender(equipo)} className="btn-secondary px-3 py-2">
                                                Suspender
                                            </button>
                                            <button type="button" onClick={() => eliminar(equipo)} className="btn-danger px-3 py-2">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {equipos.data.length === 0 ? <Empty text="Todavía no hay equipos registrados." /> : null}
            </section>
        </AdminShell>
    );
}

function StatusBadge({ value }: { value: string }) {
    const classes: Record<string, string> = {
        activo: 'bg-emerald-100 text-emerald-700',
        suspendido: 'bg-amber-100 text-amber-700',
        eliminado: 'bg-slate-200 text-slate-700',
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[value] ?? classes.eliminado}`}>{value}</span>;
}

function Empty({ text }: { text: string }) {
    return <div className="m-6 rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">{text}</div>;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
