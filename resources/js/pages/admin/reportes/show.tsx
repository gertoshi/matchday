import AdminShell from '@/components/admin/AdminShell';
import ModalSancion from '@/components/admin/ModalSancion';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ShieldBan } from 'lucide-react';
import { useState } from 'react';

type Reporte = {
    id: number;
    motivo: string;
    descripcion: string | null;
    estado: string;
    created_at: string;
    usuario_reportado?: { id: number; name: string; email: string; status: string; phone: string | null } | null;
    usuario_reportante?: { name: string; email: string } | null;
};

type Props = {
    reporte: Reporte;
};

export default function DetalleReporte({ reporte }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    function resolver() {
        router.post(`/admin/reportes/${reporte.id}/resolver`, {}, { preserveScroll: true });
    }

    return (
        <AdminShell title="Detalle de reporte" subtitle={reporte.motivo}>
            <Head title="Detalle reporte" />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <StatusBadge value={reporte.estado} />
                            <h1 className="mt-4 text-3xl font-bold text-gray-900">{reporte.motivo}</h1>
                            <p className="mt-2 text-gray-500">{formatDate(reporte.created_at)}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={resolver} className="btn-blue">
                                <CheckCircle2 className="h-5 w-5" />
                                Resolver reporte
                            </button>
                            {reporte.usuario_reportado ? (
                                <button type="button" onClick={() => setModalOpen(true)} className="btn-danger">
                                    <ShieldBan className="h-5 w-5" />
                                    Aplicar sanción
                                </button>
                            ) : null}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="app-card">
                        <h2 className="section-title">Usuario reportado</h2>
                        <div className="mt-6 space-y-3">
                            <InfoRow label="Nombre" value={reporte.usuario_reportado?.name ?? 'Usuario eliminado'} />
                            <InfoRow label="Email" value={reporte.usuario_reportado?.email ?? 'Sin email'} />
                            <InfoRow label="Estado" value={reporte.usuario_reportado?.status ?? 'Sin estado'} />
                        </div>
                    </section>

                    <section className="app-card">
                        <h2 className="section-title">Usuario reportante</h2>
                        <div className="mt-6 space-y-3">
                            <InfoRow label="Nombre" value={reporte.usuario_reportante?.name ?? 'Usuario eliminado'} />
                            <InfoRow label="Email" value={reporte.usuario_reportante?.email ?? 'Sin email'} />
                        </div>
                    </section>
                </div>

                <section className="app-card">
                    <h2 className="section-title">Descripción</h2>
                    <p className="mt-4 whitespace-pre-line text-gray-600">{reporte.descripcion ?? 'Sin descripción adicional.'}</p>
                </section>
            </div>

            {modalOpen && reporte.usuario_reportado ? (
                <ModalSancion
                    open
                    userId={reporte.usuario_reportado.id}
                    userName={reporte.usuario_reportado.name}
                    tipo="suspender"
                    onClose={() => setModalOpen(false)}
                />
            ) : null}
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
        pendiente: 'bg-amber-100 text-amber-700',
        revisado: 'bg-blue-100 text-blue-700',
        resuelto: 'bg-emerald-100 text-emerald-700',
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[value] ?? 'bg-slate-200 text-slate-700'}`}>{value}</span>;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
