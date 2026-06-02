import AdminShell from '@/components/admin/AdminShell';
import ModalSancion from '@/components/admin/ModalSancion';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Eye, ShieldBan } from 'lucide-react';
import { useState } from 'react';

type Reporte = {
    id: number;
    motivo: string;
    descripcion: string | null;
    estado: string;
    created_at: string;
    usuario_reportado?: { id: number; name: string; email: string; status: string } | null;
    usuario_reportante?: { name: string; email: string } | null;
};

type Props = {
    reportes: {
        data: Reporte[];
    };
};

export default function Reportes({ reportes }: Props) {
    const [modal, setModal] = useState<{ id: number; name: string } | null>(null);

    function resolver(reporte: Reporte) {
        router.post(`/admin/reportes/${reporte.id}/resolver`, {}, { preserveScroll: true });
    }

    return (
        <AdminShell title="Reportes" subtitle="Quejas y reclamos cargados en el sistema.">
            <Head title="Reportes admin" />

            <section className="app-card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th className="px-5 py-4">Usuario reportado</th>
                                <th className="px-5 py-4">Motivo</th>
                                <th className="px-5 py-4">Fecha</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.data.map((reporte) => (
                                <tr key={reporte.id}>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">{reporte.usuario_reportado?.name ?? 'Usuario eliminado'}</p>
                                        <p className="text-xs text-gray-500">{reporte.usuario_reportado?.email ?? ''}</p>
                                    </td>
                                    <td className="px-5 py-4">{reporte.motivo}</td>
                                    <td className="px-5 py-4">{formatDate(reporte.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <StatusBadge value={reporte.estado} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Link href={`/admin/reportes/${reporte.id}`} className="btn-secondary px-3 py-2">
                                                <Eye className="h-4 w-4" />
                                                Ver detalle
                                            </Link>
                                            <button type="button" onClick={() => resolver(reporte)} className="btn-blue px-3 py-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Resolver
                                            </button>
                                            {reporte.usuario_reportado ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setModal({ id: reporte.usuario_reportado!.id, name: reporte.usuario_reportado!.name })}
                                                    className="btn-danger px-3 py-2"
                                                >
                                                    <ShieldBan className="h-4 w-4" />
                                                    Aplicar sanción
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reportes.data.length === 0 ? (
                    <div className="m-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                        Todavía no hay reportes cargados.
                    </div>
                ) : null}
            </section>

            {modal ? (
                <ModalSancion
                    open
                    userId={modal.id}
                    userName={modal.name}
                    tipo="suspender"
                    onClose={() => setModal(null)}
                />
            ) : null}
        </AdminShell>
    );
}

function StatusBadge({ value }: { value: string }) {
    const classes: Record<string, string> = {
        pendiente: 'bg-amber-100 text-amber-700',
        revisado: 'bg-blue-100 text-blue-700',
        resuelto: 'bg-emerald-100 text-emerald-700',
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[value] ?? 'bg-slate-200 text-slate-700'}`}>{value}</span>;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
