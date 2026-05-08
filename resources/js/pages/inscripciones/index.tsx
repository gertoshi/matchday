import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Inscripcion = {
    id: number;
    estado_inscripcion: string;
    cuota_inscripcion?: string | null;
    cuota_pagada: boolean;
    fecha_inscripcion: string;
    observaciones?: string | null;
    evento?: {
        id: number;
        nombre_evento: string;
    } | null;
    equipo?: {
        nombre_equipo: string;
    } | null;
};

type Props = {
    inscripciones: Inscripcion[];
};

export default function Index({ inscripciones }: Props) {
    const estadoClasses: Record<string, string> = {
        pendiente: 'bg-amber-100 text-amber-700',
        confirmada: 'bg-emerald-100 text-emerald-700',
        rechazada: 'bg-red-100 text-red-700',
        cancelada: 'bg-slate-200 text-slate-700',
    };

    return (
        <AppShell
            title="Inscripciones"
            subtitle="Seguí el estado de las inscripciones de tu equipo."
        >
            <Head title="Mis inscripciones" />

            <div className="space-y-6">
                <section className="app-card">
                    {inscripciones.length === 0 ? (
                        <div className="text-center">
                            <p className="text-gray-500">Todavía no hay inscripciones registradas.</p>
                            <Link
                                href="/eventos"
                                className="btn-primary mt-6"
                            >
                                Ver torneos
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {inscripciones.map((inscripcion) => (
                                <div
                                    key={inscripcion.id}
                                    className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                >
                                    <p className="font-semibold text-gray-900">
                                        {inscripcion.equipo?.nombre_equipo ?? 'Equipo'} en{' '}
                                        {inscripcion.evento?.nombre_evento ?? 'evento'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${estadoClasses[inscripcion.estado_inscripcion] ?? 'bg-slate-200 text-slate-700'}`}
                                        >
                                            {inscripcion.estado_inscripcion}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Fecha: {inscripcion.fecha_inscripcion}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Pago: {inscripcion.cuota_pagada ? 'Pagada' : 'Pendiente'}
                                        </span>
                                    </div>
                                    {inscripcion.cuota_inscripcion && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Cuota: ${inscripcion.cuota_inscripcion}
                                        </p>
                                    )}
                                    {inscripcion.observaciones && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Observaciones: {inscripcion.observaciones}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}

Index.layout = null;
