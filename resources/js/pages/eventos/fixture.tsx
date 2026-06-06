import { Head, Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import {
    CalendarDays,
    Medal,
    Pencil,
    Shuffle,
    Swords,
    Table2,
    Trophy,
    Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Evento = {
    id: number;
    nombre_evento: string;
    descripcion_evento?: string | null;
    ubicacion_evento: string;
    cupo_evento: number;
    estado_evento: 'abierto' | 'cerrado' | 'finalizado';
    fecha_inicio: string;
    fecha_fin: string;
    formato_evento: string;
    inscripciones_actuales: number;
    fixture_generado: boolean;
    fixture_disponible: boolean;
    can_manage: boolean;
    can_generate: boolean;
    user: {
        id: number;
        name: string;
    } | null;
};

type Equipo = {
    id: number;
    nombre_equipo: string;
    escudo_equipo?: string | null;
    responsable?: string | null;
};

type GrupoEquipo = {
    id: number;
    posicion: number | null;
    puntos: number;
    partidos_jugados: number;
    ganados: number;
    empatados: number;
    perdidos: number;
    goles_favor: number;
    goles_contra: number;
    diferencia_goles: number;
    equipo: Equipo | null;
};

type Grupo = {
    id: number;
    nombre_grupo: string;
    equipos: GrupoEquipo[];
};

type Partido = {
    id: number;
    fase: 'grupo' | 'semifinal' | 'final';
    grupo: {
        id: number;
        nombre_grupo: string;
    } | null;
    equipo_local: Equipo | null;
    equipo_visitante: Equipo | null;
    marcador_partido?: string | null;
    ganador_partido?: string | null;
    goles_local?: number | null;
    goles_visitante?: number | null;
    estado_partido: 'pendiente' | 'jugado';
};

type Props = {
    evento: Evento;
    grupos: Grupo[];
    partidos: Partido[];
};

type Tab =
    | 'informacion'
    | 'fase_grupos'
    | 'partidos'
    | 'tablas'
    | 'eliminatorias';

const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'informacion', label: 'Información' },
    { id: 'fase_grupos', label: 'Fase de Grupos' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'tablas', label: 'Tabla de posiciones' },
    { id: 'eliminatorias', label: 'Eliminatorias' },
];

export default function Fixture({ evento, grupos, partidos }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('fase_grupos');
    const [selectedPartido, setSelectedPartido] = useState<Partido | null>(
        null,
    );

    function generarFixture() {
        router.post(
            `/eventos/${evento.id}/fixture/generar`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AppShell
            title="Fixture"
            subtitle="Fase de grupos, partidos y tabla del torneo."
        >
            <Head title={`Fixture - ${evento.nombre_evento}`} />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-emerald-600">
                                Torneo
                            </p>
                            <h1 className="mt-1 text-3xl font-bold break-words text-gray-900">
                                {evento.nombre_evento}
                            </h1>
                            <p className="mt-2 text-gray-500">
                                {evento.ubicacion_evento} · Organiza{' '}
                                {evento.user?.name ?? 'Matchday'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/eventos/${evento.id}`}
                                className="btn-secondary"
                            >
                                Volver
                            </Link>
                            {evento.can_generate && (
                                <button
                                    type="button"
                                    onClick={generarFixture}
                                    className="btn-primary"
                                >
                                    <Shuffle className="h-5 w-5" />
                                    Generar Fixture
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            label="Estado"
                            value={evento.estado_evento}
                            icon={<Trophy className="h-5 w-5" />}
                        />
                        <Metric
                            label="Cupo"
                            value={`${evento.cupo_evento} equipos`}
                            icon={<Users className="h-5 w-5" />}
                        />
                        <Metric
                            label="Inscripciones"
                            value={`${evento.inscripciones_actuales} / ${evento.cupo_evento}`}
                            icon={<Medal className="h-5 w-5" />}
                        />
                        <Metric
                            label="Inicio"
                            value={evento.fecha_inicio}
                            icon={<CalendarDays className="h-5 w-5" />}
                        />
                    </div>
                </section>

                <nav className="flex gap-2 overflow-x-auto rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {!evento.fixture_generado && !evento.fixture_disponible ? (
                    <section className="app-card text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <h2 className="mt-5 text-2xl font-bold text-gray-900">
                            El fixture estará disponible cuando se complete el
                            cupo.
                        </h2>
                        <p className="mt-3 text-gray-500">
                            Inscripciones actuales:{' '}
                            {evento.inscripciones_actuales} /{' '}
                            {evento.cupo_evento}
                        </p>
                    </section>
                ) : (
                    <>
                        {activeTab === 'informacion' && (
                            <Informacion
                                evento={evento}
                                grupos={grupos}
                                partidos={partidos}
                            />
                        )}
                        {activeTab === 'fase_grupos' && (
                            <FixtureTab evento={evento} grupos={grupos} />
                        )}
                        {activeTab === 'partidos' && (
                            <PartidosTab
                                partidos={partidos}
                                canManage={evento.can_manage}
                                onEdit={setSelectedPartido}
                            />
                        )}
                        {activeTab === 'tablas' && <TablaTab grupos={grupos} />}
                        {activeTab === 'eliminatorias' && (
                            <Eliminatorias
                                cupo={evento.cupo_evento}
                                grupos={grupos}
                                partidos={partidos}
                                canManage={evento.can_manage}
                                onEdit={setSelectedPartido}
                            />
                        )}
                    </>
                )}
            </div>

            {selectedPartido && (
                <ResultadoModal
                    partido={selectedPartido}
                    onClose={() => setSelectedPartido(null)}
                />
            )}
        </AppShell>
    );
}

function Informacion({
    evento,
    grupos,
    partidos,
}: {
    evento: Evento;
    grupos: Grupo[];
    partidos: Partido[];
}) {
    const partidosGrupo = partidos.filter(
        (partido) => partido.fase === 'grupo',
    );
    const partidosEliminatorios = partidos.filter(
        (partido) => partido.fase !== 'grupo',
    );

    return (
        <div className="space-y-6">
            <section className="app-card">
                <h2 className="section-title">Descripción general</h2>
                <p className="mt-4 whitespace-pre-line text-gray-500">
                    {evento.descripcion_evento?.trim() ||
                        'Este torneo todavía no tiene una descripción cargada.'}
                </p>
            </section>

            <section className="app-card">
                <h2 className="section-title">Resumen del fixture</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <InfoBox
                        label="Formato"
                        value={
                            evento.cupo_evento === 8
                                ? '2 grupos de 4'
                                : '2 grupos de 2'
                        }
                    />
                    <InfoBox
                        label="Grupos generados"
                        value={String(grupos.length)}
                    />
                    <InfoBox
                        label="Partidos de grupo"
                        value={String(partidosGrupo.length)}
                    />
                    <InfoBox
                        label="Eliminatorias"
                        value={String(partidosEliminatorios.length)}
                    />
                </div>
            </section>
        </div>
    );
}

function FixtureTab({ evento, grupos }: { evento: Evento; grupos: Grupo[] }) {
    if (!evento.fixture_generado) {
        return (
            <section className="app-card text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Fixture listo para generar
                </h2>
                <p className="mt-3 text-gray-500">
                    El torneo completó el cupo. El organizador puede distribuir
                    los equipos en grupos.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {grupos.map((grupo) => (
                    <section key={grupo.id} className="app-card">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {grupo.nombre_grupo}
                            </h2>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                {grupo.equipos.length} equipos
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {grupo.equipos.map((grupoEquipo) => (
                                <EquipoRow
                                    key={grupoEquipo.id}
                                    grupoEquipo={grupoEquipo}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

function PartidosTab({
    partidos,
    canManage,
    onEdit,
}: {
    partidos: Partido[];
    canManage: boolean;
    onEdit: (partido: Partido) => void;
}) {
    if (partidos.length === 0) {
        return (
            <section className="app-card text-center">
                <p className="text-gray-500">
                    Todavía no hay partidos generados.
                </p>
            </section>
        );
    }

    return (
        <section className="app-card">
            <div className="flex items-center gap-3">
                <Swords className="h-6 w-6 text-blue-600" />
                <h2 className="section-title">Partidos</h2>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {partidos.map((partido) => (
                    <article
                        key={partido.id}
                        className="rounded-3xl border border-gray-200 bg-white p-5"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase">
                                {partido.grupo?.nombre_grupo ?? partido.fase}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    partido.estado_partido === 'jugado'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {partido.estado_partido}
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <TeamName
                                name={
                                    partido.equipo_local?.nombre_equipo ??
                                    'Pendiente'
                                }
                                align="right"
                            />
                            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-center text-sm font-bold text-gray-700">
                                {partido.marcador_partido ?? 'vs'}
                            </div>
                            <TeamName
                                name={
                                    partido.equipo_visitante?.nombre_equipo ??
                                    'Pendiente'
                                }
                                align="left"
                            />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                Ganador:{' '}
                                {partido.ganador_partido ?? 'Sin definir'}
                            </p>
                            {partido.estado_partido === 'jugado' ? (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Resultado cargado
                                </span>
                            ) : canManage ? (
                                <button
                                    type="button"
                                    onClick={() => onEdit(partido)}
                                    className="btn-secondary py-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Cargar resultado
                                </button>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function TablaTab({ grupos }: { grupos: Grupo[] }) {
    if (grupos.length === 0) {
        return (
            <section className="app-card text-center">
                <p className="text-gray-500">
                    La tabla aparecerá cuando se genere el fixture.
                </p>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <section className="app-card">
                <div className="flex items-center gap-3">
                    <Table2 className="h-6 w-6 text-emerald-600" />
                    <h2 className="section-title">Tabla de posiciones</h2>
                </div>
            </section>

            {grupos.map((grupo) => (
                <section key={grupo.id} className="app-card">
                    <div className="mb-5 flex items-center gap-3">
                        <Table2 className="h-6 w-6 text-emerald-600" />
                        <h2 className="section-title">{grupo.nombre_grupo}</h2>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="app-table">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-4">Equipo</th>
                                        <th className="px-5 py-4">PJ</th>
                                        <th className="px-5 py-4">G</th>
                                        <th className="px-5 py-4">E</th>
                                        <th className="px-5 py-4">P</th>
                                        <th className="px-5 py-4">GF</th>
                                        <th className="px-5 py-4">GC</th>
                                        <th className="px-5 py-4">DG</th>
                                        <th className="px-5 py-4">PTS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupo.equipos.map((grupoEquipo) => (
                                        <tr key={grupoEquipo.id}>
                                            <td className="px-5 py-4 font-semibold text-gray-900">
                                                {grupoEquipo.equipo
                                                    ?.nombre_equipo ?? 'Equipo'}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.partidos_jugados}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.ganados}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.empatados}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.perdidos}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.goles_favor}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.goles_contra}
                                            </td>
                                            <td className="px-5 py-4">
                                                {grupoEquipo.diferencia_goles}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-emerald-700">
                                                {grupoEquipo.puntos}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}

function Eliminatorias({
    cupo,
    grupos,
    partidos,
    canManage,
    onEdit,
}: {
    cupo: number;
    grupos: Grupo[];
    partidos: Partido[];
    canManage: boolean;
    onEdit: (partido: Partido) => void;
}) {
    const semifinales = partidos.filter(
        (partido) => partido.fase === 'semifinal',
    );
    const finales = partidos.filter((partido) => partido.fase === 'final');
    const final = finales[0] ?? null;
    const campeon =
        final?.estado_partido === 'jugado' ? final.ganador_partido : null;
    const partidosGrupoPendientes = partidos.some(
        (partido) =>
            partido.fase === 'grupo' && partido.estado_partido !== 'jugado',
    );
    const gruposCompletos = grupos.length >= 2 && !partidosGrupoPendientes;
    const tablaA =
        grupos.find((grupo) => grupo.nombre_grupo === 'Grupo A')?.equipos ?? [];
    const tablaB =
        grupos.find((grupo) => grupo.nombre_grupo === 'Grupo B')?.equipos ?? [];
    const equipo = (
        grupoEquipo: GrupoEquipo | undefined,
        placeholder: string,
    ): string =>
        gruposCompletos && grupoEquipo?.equipo?.nombre_equipo
            ? grupoEquipo.equipo.nombre_equipo
            : placeholder;
    const semifinalCards =
        cupo === 8
            ? [
                  semifinales[0]
                      ? matchFromPartido(
                            'Semifinal 1',
                            '1° Grupo A vs 2° Grupo B',
                            semifinales[0],
                        )
                      : matchFromPlaceholder(
                            'Semifinal 1',
                            '1° Grupo A vs 2° Grupo B',
                            equipo(tablaA[0], '1° Grupo A'),
                            equipo(tablaB[1], '2° Grupo B'),
                        ),
                  semifinales[1]
                      ? matchFromPartido(
                            'Semifinal 2',
                            '2° Grupo A vs 1° Grupo B',
                            semifinales[1],
                        )
                      : matchFromPlaceholder(
                            'Semifinal 2',
                            '2° Grupo A vs 1° Grupo B',
                            equipo(tablaA[1], '2° Grupo A'),
                            equipo(tablaB[0], '1° Grupo B'),
                        ),
              ]
            : [];
    const finalCards = [
        final
            ? matchFromPartido(
                  'Final',
                  cupo === 4
                      ? '1° Grupo A vs 1° Grupo B'
                      : 'Ganadores de semifinales',
                  final,
              )
            : cupo === 4
              ? matchFromPlaceholder(
                    'Final',
                    '1° Grupo A vs 1° Grupo B',
                    equipo(tablaA[0], '1° Grupo A'),
                    equipo(tablaB[0], '1° Grupo B'),
                )
              : matchFromPlaceholder(
                    'Final',
                    'Ganadores de semifinales',
                    'Ganador Semifinal 1',
                    'Ganador Semifinal 2',
                ),
    ];

    return (
        <section className="app-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                    <h2 className="section-title">Eliminatorias</h2>
                </div>
                <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {gruposCompletos
                        ? 'Cruces definidos por tabla'
                        : 'Pendiente de fase de grupos'}
                </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <BracketColumn
                    title="Semifinales"
                    emptyText="Final directa para torneos de 4 equipos"
                    matches={semifinalCards}
                    canManage={canManage}
                    onEdit={onEdit}
                />
                <BracketColumn
                    title="Final"
                    emptyText="Pendiente"
                    matches={finalCards}
                    canManage={canManage}
                    onEdit={onEdit}
                />
                <div>
                    <p className="mb-3 text-center text-sm font-bold text-gray-500 uppercase">
                        Campeón
                    </p>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Campeón
                        </span>
                        <p className="mt-4 text-lg font-bold text-gray-900">
                            {campeon ?? 'Pendiente'}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            {campeon
                                ? 'Torneo finalizado'
                                : 'Se define al cargar el resultado de la final.'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ResultadoModal({
    partido,
    onClose,
}: {
    partido: Partido;
    onClose: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        goles_local: partido.goles_local ?? 0,
        goles_visitante: partido.goles_visitante ?? 0,
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put(`/partidos/${partido.id}/resultado`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            >
                <h2 className="text-2xl font-bold text-gray-900">
                    Cargar resultado
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    {partido.equipo_local?.nombre_equipo ?? 'Local'} vs{' '}
                    {partido.equipo_visitante?.nombre_equipo ?? 'Visitante'}
                </p>
                {(errors as Record<string, string>).resultado && (
                    <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {(errors as Record<string, string>).resultado}
                    </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="field-label">Goles local</label>
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={data.goles_local}
                            onChange={(event) =>
                                setData(
                                    'goles_local',
                                    Number(event.target.value),
                                )
                            }
                            className="app-input"
                        />
                        {errors.goles_local && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.goles_local}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="field-label">Goles visitante</label>
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={data.goles_visitante}
                            onChange={(event) =>
                                setData(
                                    'goles_visitante',
                                    Number(event.target.value),
                                )
                            }
                            className="app-input"
                        />
                        {errors.goles_visitante && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.goles_visitante}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}

function EquipoRow({ grupoEquipo }: { grupoEquipo: GrupoEquipo }) {
    const equipo = grupoEquipo.equipo;

    return (
        <div className="flex items-center gap-4 rounded-3xl border border-gray-200 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
                {equipo?.escudo_equipo ? (
                    <img
                        src={`/storage/${equipo.escudo_equipo}`}
                        alt={equipo.nombre_equipo}
                        className="h-full w-full rounded-2xl object-cover"
                    />
                ) : (
                    (equipo?.nombre_equipo.charAt(0) ?? '?')
                )}
            </div>
            <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                    {equipo?.nombre_equipo ?? 'Equipo sin nombre'}
                </p>
                <p className="truncate text-sm text-gray-500">
                    Responsable: {equipo?.responsable ?? 'Sin responsable'}
                </p>
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl bg-gray-50 p-5">
            <div className="flex items-center gap-3 text-emerald-700">
                {icon}
                <span className="text-sm font-semibold">{label}</span>
            </div>
            <p className="mt-3 text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function BracketColumn({
    title,
    emptyText,
    matches,
    canManage,
    onEdit,
}: {
    title: string;
    emptyText: string;
    matches: BracketMatch[];
    canManage: boolean;
    onEdit: (partido: Partido) => void;
}) {
    return (
        <div>
            <p className="mb-3 text-center text-sm font-bold text-gray-500 uppercase">
                {title}
            </p>
            <div className="space-y-3">
                {matches.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-sm font-semibold text-gray-500">
                        {emptyText}
                    </div>
                ) : (
                    matches.map((match) => (
                        <div
                            key={match.id}
                            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {match.title}
                                </span>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {match.badge}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3 text-sm font-semibold text-gray-800">
                                <BracketTeam name={match.local} />
                                <div className="rounded-2xl bg-gray-100 px-3 py-2 text-center text-gray-900">
                                    {match.partido?.marcador_partido ?? 'vs'}
                                </div>
                                <BracketTeam name={match.visitante} />
                            </div>

                            {match.partido?.estado_partido === 'jugado' ? (
                                <span className="mt-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Resultado cargado
                                </span>
                            ) : match.partido && canManage ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onEdit(match.partido as Partido)
                                    }
                                    className="btn-secondary mt-4 py-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Cargar resultado
                                </button>
                            ) : (
                                <p className="mt-4 text-sm text-gray-500">
                                    {match.partido
                                        ? 'Pendiente de resultado.'
                                        : 'Cruce previsto, pendiente de creación del partido.'}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

type BracketMatch = {
    id: string;
    title: string;
    badge: string;
    local: string;
    visitante: string;
    partido?: Partido;
};

function matchFromPartido(
    title: string,
    badge: string,
    partido: Partido,
): BracketMatch {
    return {
        id: String(partido.id),
        title,
        badge,
        local: partido.equipo_local?.nombre_equipo ?? 'Pendiente',
        visitante: partido.equipo_visitante?.nombre_equipo ?? 'Pendiente',
        partido,
    };
}

function matchFromPlaceholder(
    title: string,
    badge: string,
    local: string,
    visitante: string,
): BracketMatch {
    return {
        id: `${title}-${local}-${visitante}`,
        title,
        badge,
        local,
        visitante,
    };
}

function BracketTeam({ name }: { name: string }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
            <p className="truncate">{name}</p>
        </div>
    );
}

function TeamName({ name, align }: { name: string; align: 'left' | 'right' }) {
    return (
        <p
            className={`min-w-0 truncate font-semibold text-gray-900 ${align === 'right' ? 'text-right' : 'text-left'}`}
        >
            {name}
        </p>
    );
}

Fixture.layout = null;
