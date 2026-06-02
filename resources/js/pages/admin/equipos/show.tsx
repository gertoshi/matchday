import AdminShell from '@/components/admin/AdminShell';
import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

type Equipo = {
    id: number;
    nombre_equipo: string;
    plantilla: number;
    estado_equipo: string;
    escudo_equipo?: string | null;
    user?: { name: string; email: string; phone: string | null; status: string } | null;
    jugadores?: { id: number; nombre_jugador: string; apellido_jugador: string; numero_jugador: number; posicion_jugador: string }[];
    inscripciones?: { id: number; estado_inscripcion: string; evento?: { nombre_evento: string } | null }[];
};

type Props = {
    equipo: Equipo;
};

export default function DetalleEquipo({ equipo }: Props) {
    function suspender() {
        router.post(`/admin/equipos/${equipo.id}/suspender`, {}, { preserveScroll: true });
    }

    function eliminar() {
        if (window.confirm(`¿Marcar como eliminado a ${equipo.nombre_equipo}?`)) {
            router.delete(`/admin/equipos/${equipo.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminShell title="Detalle de equipo" subtitle={equipo.nombre_equipo}>
            <Head title={`Equipo ${equipo.nombre_equipo}`} />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-emerald-100 text-3xl font-bold text-emerald-700">
                                {equipo.escudo_equipo ? (
                                    <img src={`/storage/${equipo.escudo_equipo}`} alt={equipo.nombre_equipo} className="h-full w-full object-cover" />
                                ) : (
                                    equipo.nombre_equipo.charAt(0)
                                )}
                            </div>
                            <div>
                                <StatusBadge value={equipo.estado_equipo} />
                                <h1 className="mt-3 text-3xl font-bold text-gray-900">{equipo.nombre_equipo}</h1>
                                <p className="mt-1 text-gray-500">{equipo.user?.name ?? 'Sin responsable'}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={suspender} className="btn-secondary">
                                Suspender
                            </button>
                            <button type="button" onClick={eliminar} className="btn-danger">
                                <Trash2 className="h-5 w-5" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="app-card">
                        <h2 className="section-title">Responsable</h2>
                        <div className="mt-6 space-y-3">
                            <InfoRow label="Nombre" value={equipo.user?.name ?? 'Sin usuario'} />
                            <InfoRow label="Email" value={equipo.user?.email ?? 'Sin email'} />
                            <InfoRow label="Teléfono" value={equipo.user?.phone ?? 'Sin teléfono'} />
                        </div>
                    </section>

                    <section className="app-card">
                        <h2 className="section-title">Resumen</h2>
                        <div className="mt-6 space-y-3">
                            <InfoRow label="Plantilla declarada" value={String(equipo.plantilla)} />
                            <InfoRow label="Jugadores cargados" value={String(equipo.jugadores?.length ?? 0)} />
                            <InfoRow label="Inscripciones" value={String(equipo.inscripciones?.length ?? 0)} />
                        </div>
                    </section>
                </div>

                <section className="app-card">
                    <h2 className="section-title">Jugadores</h2>
                    <div className="mt-6 overflow-x-auto">
                        <table className="app-table">
                            <tbody>
                                {(equipo.jugadores ?? []).map((jugador) => (
                                    <tr key={jugador.id}>
                                        <td className="px-5 py-4 font-semibold text-gray-900">#{jugador.numero_jugador}</td>
                                        <td className="px-5 py-4">{jugador.nombre_jugador} {jugador.apellido_jugador}</td>
                                        <td className="px-5 py-4">{jugador.posicion_jugador}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(equipo.jugadores ?? []).length === 0 ? <Empty text="No hay jugadores cargados." /> : null}
                    </div>
                </section>
            </div>
        </AdminShell>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
            <p className="mt-2 font-semibold text-gray-900">{value}</p>
        </div>
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
    return <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">{text}</div>;
}
