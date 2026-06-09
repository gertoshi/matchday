import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';
import TeamBadge, { type TeamBadgeEquipo } from '@/components/equipos/TeamBadge';

type Equipo = {
    id: number;
    nombre_equipo: string;
    escudo_equipo?: string | null;
};

type Partido = {
    id: number;
    fase?: string | null;
    fecha_hora?: string | null;
    goles_local?: number | null;
    goles_visitante?: number | null;
    estado_partido: 'pendiente' | 'jugado';
    evento?: {
        id: number;
        nombre_evento: string;
    } | null;
    equipo_local?: Equipo | null;
    equipo_visitante?: Equipo | null;
    grupo?: {
        id: number;
        nombre_grupo: string;
    } | null;
};

type Props = {
    equipo: Equipo | null;
    partidosPendientes: Partido[];
    partidosJugados: Partido[];
};

const resultadoClasses = {
    gane: 'bg-emerald-100 text-emerald-700',
    perdi: 'bg-red-100 text-red-700',
    empate: 'bg-amber-100 text-amber-700',
    porJugar: 'bg-blue-100 text-blue-700',
};

const estadoClasses: Record<Partido['estado_partido'], string> = {
    pendiente: 'bg-amber-100 text-amber-700',
    jugado: 'bg-emerald-100 text-emerald-700',
};

export default function Index({
    equipo,
    partidosPendientes,
    partidosJugados,
}: Props) {
    return (
        <AppShell
            title="Partidos"
            subtitle="Consultá tus próximos partidos y tu historial de encuentros."
        >
            <Head title="Partidos" />

            <div className="space-y-6">
                {!equipo ? (
                    <section className="app-card border-dashed p-10 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Todavía no creaste un equipo.
                        </h2>
                        <Link href="/equipos/create" className="btn-primary mt-6">
                            Crear equipo
                        </Link>
                    </section>
                ) : (
                    <>
                        <PartidosSection
                            title="Próximos partidos"
                            emptyText="No tenés partidos pendientes."
                            equipo={equipo}
                            partidos={partidosPendientes}
                        />

                        <PartidosSection
                            title="Historial de partidos"
                            emptyText="Todavía no jugaste partidos."
                            equipo={equipo}
                            partidos={partidosJugados}
                        />
                    </>
                )}
            </div>
        </AppShell>
    );
}

function PartidosSection({
    title,
    emptyText,
    equipo,
    partidos,
}: {
    title: string;
    emptyText: string;
    equipo: Equipo;
    partidos: Partido[];
}) {
    return (
        <section className="app-card">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <div className="mt-2">
                        <TeamBadge equipo={equipo} size="sm" />
                    </div>
                </div>
            </div>

            {partidos.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                    {emptyText}
                </p>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-[860px] w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <TableHead>Torneo</TableHead>
                                    <TableHead>Rival</TableHead>
                                    <TableHead>Fase</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Marcador</TableHead>
                                    <TableHead>Resultado</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead></TableHead>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {partidos.map((partido) => (
                                    <PartidoRow
                                        key={partido.id}
                                        equipo={equipo}
                                        partido={partido}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}

function PartidoRow({ equipo, partido }: { equipo: Equipo; partido: Partido }) {
    const marcador = marcadorDesdeMiEquipo(partido, equipo.id);
    const resultado = resultadoDesdeMiEquipo(partido, equipo.id);
    const rival = rivalDesdeMiEquipo(partido, equipo.id);

    return (
        <tr className="transition-colors hover:bg-gray-50">
            <TableCell>
                <p className="font-semibold text-gray-900">
                    {partido.evento?.nombre_evento ?? 'Torneo sin nombre'}
                </p>
                {partido.grupo ? (
                    <p className="mt-1 text-xs text-gray-500">
                        {partido.grupo.nombre_grupo}
                    </p>
                ) : null}
            </TableCell>
            <TableCell>
                <TeamBadge equipo={rival} size="sm" />
            </TableCell>
            <TableCell>
                <span className="capitalize text-gray-700">
                    {faseLabel(partido.fase)}
                </span>
            </TableCell>
            <TableCell>{formatDate(partido.fecha_hora)}</TableCell>
            <TableCell>
                <span className="font-semibold text-gray-900">{marcador}</span>
            </TableCell>
            <TableCell>
                <ResultadoBadge resultado={resultado} />
            </TableCell>
            <TableCell>
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${estadoClasses[partido.estado_partido]}`}
                >
                    {partido.estado_partido}
                </span>
            </TableCell>
            <TableCell>
                {partido.evento ? (
                    <Link
                        href={`/eventos/${partido.evento.id}/fixture`}
                        className="btn-secondary whitespace-nowrap px-3 py-2 text-sm"
                    >
                        Ver torneo
                    </Link>
                ) : null}
            </TableCell>
        </tr>
    );
}

function TableHead({ children }: { children?: ReactNode }) {
    return (
        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {children}
        </th>
    );
}

function TableCell({ children }: { children: ReactNode }) {
    return <td className="px-4 py-4 align-middle text-sm text-gray-600">{children}</td>;
}

function ResultadoBadge({ resultado }: { resultado: string }) {
    if (resultado === 'Gané') {
        return (
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${resultadoClasses.gane}`}>
                Gané
            </span>
        );
    }

    if (resultado === 'Perdí') {
        return (
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${resultadoClasses.perdi}`}>
                Perdí
            </span>
        );
    }

    if (resultado === 'Empaté') {
        return (
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${resultadoClasses.empate}`}>
                Empaté
            </span>
        );
    }

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${resultadoClasses.porJugar}`}>
            Por jugar
        </span>
    );
}

function rivalDesdeMiEquipo(partido: Partido, equipoId: number): TeamBadgeEquipo {
    if (partido.equipo_local?.id === equipoId) {
        return partido.equipo_visitante;
    }

    return partido.equipo_local;
}

function marcadorDesdeMiEquipo(partido: Partido, equipoId: number) {
    if (
        partido.estado_partido !== 'jugado' ||
        partido.goles_local === null ||
        partido.goles_local === undefined ||
        partido.goles_visitante === null ||
        partido.goles_visitante === undefined
    ) {
        return '-';
    }

    const esLocal = partido.equipo_local?.id === equipoId;
    const misGoles = esLocal ? partido.goles_local : partido.goles_visitante;
    const golesRival = esLocal ? partido.goles_visitante : partido.goles_local;

    return `${misGoles} - ${golesRival}`;
}

function resultadoDesdeMiEquipo(partido: Partido, equipoId: number) {
    if (
        partido.estado_partido !== 'jugado' ||
        partido.goles_local === null ||
        partido.goles_local === undefined ||
        partido.goles_visitante === null ||
        partido.goles_visitante === undefined
    ) {
        return 'Por jugar';
    }

    const esLocal = partido.equipo_local?.id === equipoId;
    const misGoles = esLocal ? partido.goles_local : partido.goles_visitante;
    const golesRival = esLocal ? partido.goles_visitante : partido.goles_local;

    if (misGoles > golesRival) {
        return 'Gané';
    }

    if (misGoles < golesRival) {
        return 'Perdí';
    }

    return 'Empaté';
}

function faseLabel(fase?: string | null) {
    if (!fase) {
        return 'Sin fase';
    }

    return fase.replace('_', ' ');
}

function formatDate(value?: string | null) {
    if (!value) {
        return 'Sin fecha';
    }

    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
        return value;
    }

    return `${day}/${month}/${year}`;
}

Index.layout = null;
