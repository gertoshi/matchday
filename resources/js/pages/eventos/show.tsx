import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type EventoUser = {
    id: number;
    name: string;
} | null;

type Inscripcion = {
    id: number;
    estado_inscripcion: string;
    equipo: {
        id: number;
        nombre_equipo: string;
    } | null;
};

type Partido = {
    id: number;
    fecha_hora: string;
    ubicacion_partido: string;
    categoria_partido: string;
};

type Evento = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    cupo_evento: number;
    estado_evento: 'abierto' | 'cerrado' | 'finalizado';
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
    partidos: Partido[];
    can_manage: boolean;
};

type Props = {
    evento: Evento;
    hasEquipo: boolean;
};

export default function Show({ evento, hasEquipo }: Props) {
    const puedeInscribirse = hasEquipo && evento.estado_evento === 'abierto';

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
                            <p className="mt-2 text-gray-500">{evento.ubicacion_evento}</p>
                        </div>

                        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                            {evento.estado_evento}
                        </span>
                        <InscripcionBadge
                            tipo={evento.tipo_inscripcion}
                            monto={evento.monto_inscripcion}
                        />
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <InfoRow label="Inicio" value={evento.fecha_inicio} />
                        <InfoRow label="Fin" value={evento.fecha_fin} />
                        <InfoRow label="Cupo" value={String(evento.cupo_evento)} />
                        <InfoRow label="Formato" value={formatoLabel(evento.formato_evento)} />
                        <InfoRow
                            label="Inscripción"
                            value={inscripcionLabel(evento.tipo_inscripcion, evento.monto_inscripcion)}
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
                        <p className="text-sm font-medium text-gray-700">Descripción</p>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {evento.descripcion_evento || 'Sin descripción adicional.'}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/eventos"
                            className="btn-secondary"
                        >
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

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="app-card">
                        <h2 className="text-2xl font-bold text-gray-900">Inscripciones</h2>
                        <p className="mt-2 text-gray-500">
                            Equipos anotados actualmente en el torneo.
                        </p>

                        {evento.inscripciones.length === 0 ? (
                            <p className="mt-6 text-sm text-gray-500">
                                Todavía no hay inscripciones registradas.
                            </p>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {evento.inscripciones.map((inscripcion) => (
                                    <div
                                        key={inscripcion.id}
                                        className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                    >
                                        <p className="font-semibold text-gray-900">
                                            {inscripcion.equipo?.nombre_equipo ?? 'Equipo sin nombre'}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Estado: {inscripcion.estado_inscripcion}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="app-card">
                        <h2 className="text-2xl font-bold text-gray-900">Partidos</h2>
                        <p className="mt-2 text-gray-500">
                            Programación actual del torneo.
                        </p>

                        {evento.partidos.length === 0 ? (
                            <p className="mt-6 text-sm text-gray-500">
                                Todavía no hay partidos programados.
                            </p>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {evento.partidos.map((partido) => (
                                    <div
                                        key={partido.id}
                                        className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                    >
                                        <p className="font-semibold text-gray-900">
                                            {partido.categoria_partido}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {partido.ubicacion_partido}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {partido.fecha_hora}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppShell>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
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

function inscripcionLabel(tipo: Evento['tipo_inscripcion'], monto?: string | null) {
    return tipo === 'pago' ? `${formatMoney(monto)} por equipo` : 'Gratis';
}

function formatoLabel(formato: string) {
    const formatos: Record<string, string> = {
        futbol_5: 'Fútbol 5',
        futbol_7: 'Fútbol 7',
    };

    return formatos[formato] ?? formato;
}

function formatMoney(value?: string | null) {
    const amount = Number(value ?? 0);

    return `$${amount.toLocaleString('es-AR', {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

Show.layout = null;
