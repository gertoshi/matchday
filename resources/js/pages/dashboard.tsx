import { Head, Link } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { ClipboardList, Plus, Trophy, Users } from 'lucide-react';

type EquipoResumen = {
    id: number;
    nombre_equipo: string;
    jugadores_count: number;
} | null;

type EventoResumen = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    fecha_inicio: string | null;
    estado_evento: string;
};

type InscripcionResumen = {
    id: number;
    estado_inscripcion: string;
    fecha_inscripcion: string | null;
    evento: {
        id: number;
        nombre_evento: string;
        fecha_inicio: string | null;
        estado_evento: string;
    } | null;
};

type Props = {
    equipo: EquipoResumen;
    eventos_disponibles_count: number;
    ultimos_eventos: EventoResumen[];
    inscripciones_count: number;
    ultimas_inscripciones: InscripcionResumen[];
};

const estadoEventoClasses: Record<string, string> = {
    abierto: 'bg-emerald-100 text-emerald-700',
    cerrado: 'bg-amber-100 text-amber-700',
    finalizado: 'bg-slate-200 text-slate-700',
};

const estadoInscripcionClasses: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-emerald-100 text-emerald-700',
    rechazada: 'bg-red-100 text-red-700',
    cancelada: 'bg-slate-200 text-slate-700',
};

export default function Dashboard({
    equipo,
    eventos_disponibles_count,
    ultimos_eventos,
    inscripciones_count,
    ultimas_inscripciones,
}: Props) {
    return (
        <AppShell
            title="Inicio"
            subtitle="Resumen general de tu actividad en Matchday."
        >
            <Head title="Dashboard" />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <section className="app-card flex h-full flex-col">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-500">
                                Mi equipo
                            </p>
                            <h2 className="mt-2 break-words text-2xl font-bold text-gray-900">
                                {equipo?.nombre_equipo ?? 'Todavía no creaste tu equipo'}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {equipo
                                    ? `${equipo.jugadores_count} jugadores cargados en la plantilla.`
                                    : 'Creá tu equipo para empezar a cargar jugadores e inscribirte en torneos.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        {equipo ? (
                            <div className="rounded-2xl bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-800">
                                    Plantilla actual
                                </p>
                                <p className="mt-2 text-3xl font-bold text-emerald-900">
                                    {equipo.jugadores_count}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-auto pt-6">
                        <Link
                            href={equipo ? '/equipos' : '/equipos/create'}
                            className="btn-primary w-full"
                        >
                            {equipo ? 'Ver mi equipo' : 'Crear equipo'}
                        </Link>
                    </div>
                </section>

                <section className="app-card flex h-full flex-col">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-500">
                                Torneos disponibles
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                {eventos_disponibles_count} torneos
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Explorá los torneos más recientes o publicá uno nuevo.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {ultimos_eventos.length > 0 ? (
                            ultimos_eventos.map((evento) => (
                                <div
                                    key={evento.id}
                                    className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-gray-900">
                                            {evento.nombre_evento}
                                        </p>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoEventoClasses[evento.estado_evento] ?? 'bg-slate-200 text-slate-700'}`}
                                        >
                                            {evento.estado_evento}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {evento.ubicacion_evento}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Inicio: {evento.fecha_inicio ?? 'Sin fecha'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                Todavía no hay torneos cargados.
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
                        <Link href="/eventos" className="btn-blue">
                            Ver torneos
                        </Link>
                        <Link href="/eventos/create" className="btn-secondary">
                            <Plus className="h-5 w-5" />
                            Crear torneo
                        </Link>
                    </div>
                </section>

                <section className="app-card flex h-full flex-col">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-500">
                                Mis inscripciones
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                {equipo
                                    ? `${inscripciones_count} inscripciones`
                                    : 'Necesitás crear un equipo para inscribirte'}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {equipo
                                    ? 'Seguí el estado de participación de tu equipo.'
                                    : 'Una vez creado tu equipo vas a poder sumarte a torneos abiertos.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {equipo ? (
                            ultimas_inscripciones.length > 0 ? (
                                ultimas_inscripciones.map((inscripcion) => (
                                    <div
                                        key={inscripcion.id}
                                        className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-gray-900">
                                                {inscripcion.evento?.nombre_evento ?? 'Evento sin nombre'}
                                            </p>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoInscripcionClasses[inscripcion.estado_inscripcion] ?? 'bg-slate-200 text-slate-700'}`}
                                            >
                                                {inscripcion.estado_inscripcion}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Inscripción: {inscripcion.fecha_inscripcion ?? 'Sin fecha'}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Inicio del torneo:{' '}
                                            {inscripcion.evento?.fecha_inicio ?? 'Sin fecha'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                    Tu equipo todavía no tiene inscripciones registradas.
                                </div>
                            )
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                Creá tu equipo para poder inscribirte a los torneos disponibles.
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6">
                        <Link
                            href={equipo ? '/inscripciones' : '/equipos/create'}
                            className="btn-primary w-full"
                        >
                            {equipo ? 'Ver inscripciones' : 'Crear equipo'}
                        </Link>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
