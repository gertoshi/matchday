import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

type EventoUser = {
    id: number;
    name: string;
} | null;

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
    inscripciones_count: number;
    user: EventoUser;
    can_manage: boolean;
};

type Props = {
    eventos: Evento[];
};

const estadoClasses: Record<Evento['estado_evento'], string> = {
    abierto: 'bg-emerald-100 text-emerald-700',
    cerrado: 'bg-amber-100 text-amber-700',
    finalizado: 'bg-slate-200 text-slate-700',
};

export default function Index({ eventos }: Props) {
    function handleDelete(eventoId: number) {
        if (!window.confirm('¿Querés eliminar este torneo?')) {
            return;
        }

        router.delete(`/eventos/${eventoId}`);
    }

    return (
        <AppShell
            title="Torneos"
            subtitle="Explorá torneos disponibles o creá uno nuevo."
        >
            <Head title="Torneos" />

            <div className="space-y-6">
                {eventos.length === 0 ? (
                    <section className="app-card border-dashed p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                            +
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Todavía no hay torneos publicados
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-gray-500">
                            Creá el primer torneo para empezar a organizar la competencia.
                        </p>
                        <Link
                            href="/eventos/create"
                            className="btn-primary mt-6"
                        >
                            <Plus className="h-5 w-5" />
                            Crear torneo
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-end">
                            <Link
                                href="/eventos/create"
                                className="btn-primary"
                            >
                                <Plus className="h-5 w-5" />
                                Crear torneo
                            </Link>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                        {eventos.map((evento) => (
                            <section
                                key={evento.id}
                                className="app-card"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${estadoClasses[evento.estado_evento]}`}
                                        >
                                            {evento.estado_evento}
                                        </span>
                                        <InscripcionBadge
                                            tipo={evento.tipo_inscripcion}
                                            monto={evento.monto_inscripcion}
                                        />
                                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                            {evento.nombre_evento}
                                        </h2>
                                        <p className="mt-2 text-gray-500">
                                            {evento.ubicacion_evento}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                            Cupo
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-emerald-800">
                                            {evento.cupo_evento}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <InfoRow label="Inicio" value={evento.fecha_inicio} />
                                    <InfoRow label="Fin" value={evento.fecha_fin} />
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
                                        value={String(evento.inscripciones_count)}
                                    />
                                </div>

                                {evento.descripcion_evento && (
                                    <p className="mt-6 text-sm leading-6 text-gray-500">
                                        {evento.descripcion_evento}
                                    </p>
                                )}

                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <Link
                                        href={`/eventos/${evento.id}`}
                                        className="btn-primary"
                                    >
                                        <Eye className="h-5 w-5" />
                                        Ver detalle
                                    </Link>

                                    {evento.can_manage && (
                                        <>
                                            <Link
                                                href={`/eventos/${evento.id}/edit`}
                                                className="btn-secondary"
                                            >
                                                <Pencil className="h-5 w-5" />
                                                Editar
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(evento.id)}
                                                className="btn-danger"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </section>
                        ))}
                        </div>
                    </div>
                )}
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
            <span className="ml-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Pago: {formatMoney(monto)}
            </span>
        );
    }

    return (
        <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
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

Index.layout = null;
