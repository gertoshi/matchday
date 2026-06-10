import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import TeamBadge from '@/components/equipos/TeamBadge';

type EstadoEvento = 'abierto' | 'en_curso' | 'finalizado';

type Inscripcion = {
    id: number;
    estado_inscripcion: string;
    cuota_inscripcion?: string | null;
    cuota_pagada: boolean;
    fecha_inscripcion: string;
    fecha_pago?: string | null;
    metodo_pago?: string | null;
    mercadopago_status?: string | null;
    observaciones?: string | null;
    evento?: {
        id: number;
        nombre_evento: string;
        estado_evento: EstadoEvento;
    } | null;
    equipo?: {
        nombre_equipo: string;
        escudo_equipo?: string | null;
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
    const estadoEventoClasses: Record<string, string> = {
        abierto: 'bg-emerald-100 text-emerald-700',
        en_curso: 'bg-blue-100 text-blue-700',
        finalizado: 'bg-slate-200 text-slate-700',
    };
    const pagoClasses: Record<string, string> = {
        aprobado: 'bg-emerald-100 text-emerald-700',
        pendiente: 'bg-amber-100 text-amber-700',
        rechazado: 'bg-red-100 text-red-700',
        gratis: 'bg-blue-100 text-blue-700',
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
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <TeamBadge equipo={inscripcion.equipo} />
                                            <p className="mt-2 text-sm text-gray-500">
                                                Torneo: {inscripcion.evento?.nombre_evento ?? 'Evento'}
                                            </p>
                                        </div>
                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${estadoClasses[inscripcion.estado_inscripcion] ?? 'bg-slate-200 text-slate-700'}`}
                                        >
                                            {inscripcion.estado_inscripcion}
                                        </span>
                                        {inscripcion.evento && (
                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${estadoEventoClasses[inscripcion.evento.estado_evento] ?? 'bg-slate-200 text-slate-700'}`}
                                            >
                                                {estadoEventoLabel(inscripcion.evento.estado_evento)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <span className="text-sm text-gray-500">
                                            Fecha: {inscripcion.fecha_inscripcion}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <PaymentInfo
                                            label="Estado inscripción"
                                            value={estadoInscripcionLabel(inscripcion.estado_inscripcion)}
                                        />
                                        <PaymentInfo
                                            label="Monto"
                                            value={hasCuota(inscripcion.cuota_inscripcion)
                                                ? formatMoney(inscripcion.cuota_inscripcion)
                                                : 'Gratis'}
                                        />
                                        <PaymentInfo
                                            label="Método"
                                            value={metodoPagoLabel(inscripcion.metodo_pago, inscripcion.cuota_inscripcion)}
                                        />
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500">
                                                Estado de pago
                                            </p>
                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pagoClasses[estadoPago(inscripcion)]}`}
                                            >
                                                {estadoPagoLabel(inscripcion)}
                                            </span>
                                        </div>
                                    </div>
                                    {inscripcion.fecha_pago && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Fecha de pago: {inscripcion.fecha_pago}
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

function hasCuota(value?: string | null) {
    return Number(value ?? 0) > 0;
}

function formatMoney(value?: string | null) {
    const amount = Number(value ?? 0);

    return `$${amount.toLocaleString('es-AR', {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

function PaymentInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function estadoPago(inscripcion: Inscripcion) {
    if (!hasCuota(inscripcion.cuota_inscripcion)) {
        return 'gratis';
    }

    if (inscripcion.cuota_pagada || inscripcion.mercadopago_status === 'approved') {
        return 'aprobado';
    }

    if (inscripcion.mercadopago_status === 'rejected') {
        return 'rechazado';
    }

    return 'pendiente';
}

function estadoPagoLabel(inscripcion: Inscripcion) {
    const estado = estadoPago(inscripcion);
    const labels: Record<string, string> = {
        aprobado: 'Pago aprobado',
        pendiente: 'Pago pendiente',
        rechazado: 'Pago rechazado',
        gratis: 'Gratis',
    };

    return labels[estado];
}

function metodoPagoLabel(metodo?: string | null, cuota?: string | null) {
    if (!hasCuota(cuota)) {
        return 'Gratis';
    }

    if (metodo === 'mercadopago') {
        return 'Mercado Pago';
    }

    return 'Pendiente';
}

function estadoInscripcionLabel(estado: string) {
    const estados: Record<string, string> = {
        pendiente: 'Pendiente',
        confirmada: 'Confirmada',
        rechazada: 'Rechazada',
        cancelada: 'Cancelada',
    };

    return estados[estado] ?? estado;
}

function estadoEventoLabel(estado: EstadoEvento) {
    const estados: Record<EstadoEvento, string> = {
        abierto: 'Abierto',
        en_curso: 'En curso',
        finalizado: 'Finalizado',
    };

    return estados[estado];
}

Index.layout = null;
