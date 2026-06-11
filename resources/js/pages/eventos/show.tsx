import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import TeamBadge from '@/components/equipos/TeamBadge';

type EventoUser = {
    id: number;
    name: string;
} | null;

type Inscripcion = {
    id: number;
    estado_inscripcion: string;
    cuota_pagada: boolean;
    mercadopago_status?: string | null;
    equipo: {
        id: number;
        nombre_equipo: string;
        escudo_equipo?: string | null;
    } | null;
};

type Evento = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    cupo_evento: number;
    estado_evento: 'abierto' | 'en_curso' | 'finalizado';
    fecha_inicio: string;
    fecha_fin: string;
    descripcion_evento?: string | null;
    formato_evento: string;
    tipo_inscripcion: 'gratis' | 'pago';
    monto_inscripcion?: string | null;
    inscripciones_actuales: number;
    fixture_generado: boolean;
    can_generate_fixture: boolean;
    user: EventoUser;
    inscripciones: Inscripcion[];
    can_manage: boolean;
};

type Props = {
    evento: Evento;
    hasEquipo: boolean;
};

const estadoEventoClasses: Record<Evento['estado_evento'], string> = {
    abierto: 'bg-emerald-100 text-emerald-700',
    en_curso: 'bg-blue-100 text-blue-700',
    finalizado: 'bg-slate-200 text-slate-700',
};

export default function Show({ evento, hasEquipo }: Props) {
    const puedeInscribirse = hasEquipo && evento.estado_evento === 'abierto';

    function cambiarEstadoInscripcion(
        inscripcionId: number,
        accion: 'aceptar' | 'rechazar',
    ) {
        router.post(
            `/inscripciones/${inscripcionId}/${accion}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['evento'] });
                },
            },
        );
    }

    return (
        <AppShell
            title="Torneos"
            subtitle="Consultá el detalle del torneo y sus inscripciones."
        >
            <Head title={evento.nombre_evento} />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">
                                Torneo publicado
                            </p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {evento.nombre_evento}
                            </p>
                            <p className="mt-2 text-gray-500">
                                {evento.ubicacion_evento}
                            </p>
                        </div>

                        <span className={`rounded-full px-4 py-2 text-sm font-medium ${estadoEventoClasses[evento.estado_evento]}`}>
                            {estadoEventoLabel(evento.estado_evento)}
                        </span>
                        <InscripcionBadge
                            tipo={evento.tipo_inscripcion}
                            monto={evento.monto_inscripcion}
                        />
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <InfoRow label="Inicio" value={evento.fecha_inicio} />
                        <InfoRow label="Fin" value={evento.fecha_fin} />
                        <InfoRow
                            label="Cupo"
                            value={String(evento.cupo_evento)}
                        />
                        <InfoRow
                            label="Formato"
                            value={formatoLabel(evento.formato_evento)}
                        />
                        <InfoRow
                            label="Inscripción"
                            value={inscripcionLabel(
                                evento.tipo_inscripcion,
                                evento.monto_inscripcion,
                            )}
                        />
                        <InfoRow
                            label="Organizador"
                            value={evento.user?.name ?? 'Sin organizador'}
                        />
                        <InfoRow
                            label="Inscripciones"
                            value={`${evento.inscripciones_actuales} / ${evento.cupo_evento}`}
                        />
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-5">
                        <p className="text-sm font-medium text-gray-700">
                            Descripción
                        </p>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {evento.descripcion_evento ||
                                'Sin descripción adicional.'}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link href="/eventos" className="btn-secondary">
                            Volver a torneos
                        </Link>

                        {puedeInscribirse && (
                            <Link
                                href={`/inscripciones/create?evento_id=${evento.id}`}
                                className="btn-primary"
                            >
                                Inscribir mi equipo
                            </Link>
                        )}

                        <Link
                            href={`/eventos/${evento.id}/fixture`}
                            className="btn-blue"
                        >
                            Ver información
                        </Link>

                        {evento.can_manage && (
                            <Link
                                href={`/eventos/${evento.id}/edit`}
                                className="btn-secondary"
                            >
                                Editar torneo
                            </Link>
                        )}

                        {evento.can_generate_fixture && (
                            <Link
                                href={`/eventos/${evento.id}/fixture`}
                                className="btn-primary"
                            >
                                Generar Fixture
                            </Link>
                        )}
                    </div>
                </section>

                <section className="app-card">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Equipos inscriptos
                            </h2>
                            <p className="mt-2 text-gray-500">
                                Equipos anotados actualmente en el torneo.
                            </p>
                        </div>
                        <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                            {evento.inscripciones.length} equipos
                        </span>
                    </div>

                    {evento.inscripciones.length === 0 ? (
                        <p className="mt-6 rounded-3xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                            Todavía no hay inscripciones registradas.
                        </p>
                    ) : (
                        <div className="mt-6 grid gap-3 lg:grid-cols-2">
                            {evento.inscripciones.map((inscripcion) => (
                                <div
                                    key={inscripcion.id}
                                    className="rounded-3xl border border-gray-200 bg-white p-4 transition-all duration-200 ease-in-out hover:border-emerald-100 hover:shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <TeamBadge
                                            equipo={inscripcion.equipo}
                                            size="lg"
                                        />
                                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            {evento.tipo_inscripcion ===
                                            'pago' ? (
                                                <EstadoPagoBadge
                                                    inscripcion={inscripcion}
                                                />
                                            ) : (
                                                <EstadoInscripcionBadge
                                                    estado={
                                                        inscripcion.estado_inscripcion
                                                    }
                                                />
                                            )}
                                            {evento.tipo_inscripcion ===
                                                'gratis' &&
                                            evento.can_manage &&
                                            inscripcion.estado_inscripcion ===
                                                'pendiente' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cambiarEstadoInscripcion(
                                                                inscripcion.id,
                                                                'aceptar',
                                                            )
                                                        }
                                                        className="btn-primary py-2 text-sm"
                                                    >
                                                        Aceptar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cambiarEstadoInscripcion(
                                                                inscripcion.id,
                                                                'rechazar',
                                                            )
                                                        }
                                                        className="btn-secondary py-2 text-sm"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}

function EstadoPagoBadge({ inscripcion }: { inscripcion: Inscripcion }) {
    if (
        inscripcion.cuota_pagada &&
        inscripcion.estado_inscripcion === 'confirmada'
    ) {
        return (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Confirmada / Pago aprobado
            </span>
        );
    }

    if (inscripcion.mercadopago_status === 'rejected') {
        return (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Pago rechazado
            </span>
        );
    }

    if (inscripcion.mercadopago_status === 'cancelled') {
        return (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                Pago cancelado
            </span>
        );
    }

    return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Pago pendiente
        </span>
    );
}

function EstadoInscripcionBadge({ estado }: { estado: string }) {
    const estadoClasses: Record<string, string> = {
        pendiente: 'bg-amber-100 text-amber-700',
        confirmada: 'bg-emerald-100 text-emerald-700',
        rechazada: 'bg-red-100 text-red-700',
        cancelada: 'bg-slate-200 text-slate-700',
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${estadoClasses[estado] ?? 'bg-slate-200 text-slate-700'}`}
        >
            {estado}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                {label}
            </p>
            <p className="mt-2 font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function InscripcionBadge({
    tipo,
    monto,
}: {
    tipo: Evento['tipo_inscripcion'];
    monto?: string | null;
}) {
    if (tipo === 'pago') {
        return (
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                Pago: {formatMoney(monto)}
            </span>
        );
    }

    return (
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            Gratis / A beneficio
        </span>
    );
}

function inscripcionLabel(
    tipo: Evento['tipo_inscripcion'],
    monto?: string | null,
) {
    return tipo === 'pago' ? `${formatMoney(monto)} por equipo` : 'Gratis';
}

function formatoLabel(formato: string) {
    const formatos: Record<string, string> = {
        futbol_5: 'Fútbol 5',
        futbol_7: 'Fútbol 7',
    };

    return formatos[formato] ?? formato;
}

function estadoEventoLabel(estado: Evento['estado_evento']) {
    const estados: Record<Evento['estado_evento'], string> = {
        abierto: 'Abierto',
        en_curso: 'En curso',
        finalizado: 'Finalizado',
    };

    return estados[estado];
}

function formatMoney(value?: string | null) {
    const amount = Number(value ?? 0);

    return `$${amount.toLocaleString('es-AR', {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

Show.layout = null;
