import { Head, Link, router, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { CalendarDays, Medal, Pencil, Shuffle, Swords, Table2, Trophy, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Evento = {
    id: number;
    nombre_evento: string;
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

type Tab = 'informacion' | 'fixture' | 'partidos' | 'tabla';

const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'informacion', label: 'Información' },
    { id: 'fixture', label: 'Fixture' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'tabla', label: 'Tabla' },
];

export default function Fixture({ evento, grupos, partidos }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('fixture');
    const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);

    function generarFixture() {
        router.post(`/eventos/${evento.id}/fixture/generar`, {}, {
            preserveScroll: true,
        });
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
                            <p className="text-sm font-semibold text-emerald-600">Torneo</p>
                            <h1 className="mt-1 break-words text-3xl font-bold text-gray-900">
                                {evento.nombre_evento}
                            </h1>
                            <p className="mt-2 text-gray-500">
                                {evento.ubicacion_evento} · Organiza {evento.user?.name ?? 'Matchday'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href={`/eventos/${evento.id}`} className="btn-secondary">
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
                        <Metric label="Estado" value={evento.estado_evento} icon={<Trophy className="h-5 w-5" />} />
                        <Metric label="Cupo" value={`${evento.cupo_evento} equipos`} icon={<Users className="h-5 w-5" />} />
                        <Metric label="Inscripciones" value={`${evento.inscripciones_actuales} / ${evento.cupo_evento}`} icon={<Medal className="h-5 w-5" />} />
                        <Metric label="Inicio" value={evento.fecha_inicio} icon={<CalendarDays className="h-5 w-5" />} />
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
                            El fixture estará disponible cuando se complete el cupo.
                        </h2>
                        <p className="mt-3 text-gray-500">
                            Inscripciones actuales: {evento.inscripciones_actuales} / {evento.cupo_evento}
                        </p>
                    </section>
                ) : (
                    <>
                        {activeTab === 'informacion' && <Informacion evento={evento} grupos={grupos} partidos={partidos} />}
                        {activeTab === 'fixture' && <FixtureTab evento={evento} grupos={grupos} />}
                        {activeTab === 'partidos' && (
                            <PartidosTab
                                partidos={partidos}
                                canManage={evento.can_manage}
                                onEdit={setSelectedPartido}
                            />
                        )}
                        {activeTab === 'tabla' && <TablaTab grupos={grupos} />}
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

function Informacion({ evento, grupos, partidos }: { evento: Evento; grupos: Grupo[]; partidos: Partido[] }) {
    return (
        <section className="app-card">
            <h2 className="section-title">Resumen del fixture</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoBox label="Formato" value={evento.cupo_evento === 8 ? '2 grupos de 4' : '2 grupos de 2'} />
                <InfoBox label="Grupos generados" value={String(grupos.length)} />
                <InfoBox label="Partidos de grupo" value={String(partidos.length)} />
            </div>
        </section>
    );
}

function FixtureTab({ evento, grupos }: { evento: Evento; grupos: Grupo[] }) {
    if (!evento.fixture_generado) {
        return (
            <section className="app-card text-center">
                <h2 className="text-2xl font-bold text-gray-900">Fixture listo para generar</h2>
                <p className="mt-3 text-gray-500">
                    El torneo completó el cupo. El organizador puede distribuir los equipos en grupos.
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
                            <h2 className="text-2xl font-bold text-gray-900">{grupo.nombre_grupo}</h2>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                {grupo.equipos.length} equipos
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {grupo.equipos.map((grupoEquipo) => (
                                <EquipoRow key={grupoEquipo.id} grupoEquipo={grupoEquipo} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <Eliminatorias cupo={evento.cupo_evento} />
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
                <p className="text-gray-500">Todavía no hay partidos generados.</p>
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
                    <article key={partido.id} className="rounded-3xl border border-gray-200 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                                {partido.grupo?.nombre_grupo ?? partido.fase}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                partido.estado_partido === 'jugado'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {partido.estado_partido}
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <TeamName name={partido.equipo_local?.nombre_equipo ?? 'Pendiente'} align="right" />
                            <div className="rounded-2xl bg-gray-100 px-4 py-2 text-center text-sm font-bold text-gray-700">
                                {partido.marcador_partido ?? 'vs'}
                            </div>
                            <TeamName name={partido.equipo_visitante?.nombre_equipo ?? 'Pendiente'} align="left" />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                Ganador: {partido.ganador_partido ?? 'Sin definir'}
                            </p>
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => onEdit(partido)}
                                    className="btn-secondary py-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Editar resultado
                                </button>
                            )}
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
                <p className="text-gray-500">La tabla aparecerá cuando se genere el fixture.</p>
            </section>
        );
    }

    return (
        <div className="space-y-6">
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
                                                {grupoEquipo.equipo?.nombre_equipo ?? 'Equipo'}
                                            </td>
                                            <td className="px-5 py-4">{grupoEquipo.partidos_jugados}</td>
                                            <td className="px-5 py-4">{grupoEquipo.ganados}</td>
                                            <td className="px-5 py-4">{grupoEquipo.empatados}</td>
                                            <td className="px-5 py-4">{grupoEquipo.perdidos}</td>
                                            <td className="px-5 py-4">{grupoEquipo.goles_favor}</td>
                                            <td className="px-5 py-4">{grupoEquipo.goles_contra}</td>
                                            <td className="px-5 py-4">{grupoEquipo.diferencia_goles}</td>
                                            <td className="px-5 py-4 font-bold text-emerald-700">{grupoEquipo.puntos}</td>
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

function Eliminatorias({ cupo }: { cupo: number }) {
    const semifinales = cupo === 8
        ? ['1A vs 2B', '1B vs 2A']
        : ['No aplica para cupo 4'];

    return (
        <section className="app-card">
            <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-emerald-600" />
                <h2 className="section-title">Eliminatorias</h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <BracketColumn title="Semifinales" items={semifinales} />
                <BracketColumn title="Final" items={cupo === 4 ? ['Ganador Grupo A vs Ganador Grupo B'] : ['Ganador SF 1 vs Ganador SF 2']} />
                <BracketColumn title="Campeón" items={['Pendiente de resultados']} />
            </div>
        </section>
    );
}

function ResultadoModal({ partido, onClose }: { partido: Partido; onClose: () => void }) {
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
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900">Cargar resultado</h2>
                <p className="mt-2 text-sm text-gray-500">
                    {partido.equipo_local?.nombre_equipo ?? 'Local'} vs {partido.equipo_visitante?.nombre_equipo ?? 'Visitante'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="field-label">Goles local</label>
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={data.goles_local}
                            onChange={(event) => setData('goles_local', Number(event.target.value))}
                            className="app-input"
                        />
                        {errors.goles_local && <p className="mt-2 text-sm text-red-500">{errors.goles_local}</p>}
                    </div>
                    <div>
                        <label className="field-label">Goles visitante</label>
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={data.goles_visitante}
                            onChange={(event) => setData('goles_visitante', Number(event.target.value))}
                            className="app-input"
                        />
                        {errors.goles_visitante && <p className="mt-2 text-sm text-red-500">{errors.goles_visitante}</p>}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary disabled:opacity-50">
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
                    equipo?.nombre_equipo.charAt(0) ?? '?'
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

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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

function BracketColumn({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <p className="mb-3 text-center text-sm font-bold uppercase text-gray-500">{title}</p>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamName({ name, align }: { name: string; align: 'left' | 'right' }) {
    return (
        <p className={`min-w-0 truncate font-semibold text-gray-900 ${align === 'right' ? 'text-right' : 'text-left'}`}>
            {name}
        </p>
    );
}

Fixture.layout = null;
