import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Jugador = {
    id: number;
    nombre_jugador: string;
    apellido_jugador: string;
    contacto_jugador: string | null;
    posicion_jugador: string;
    numero_jugador: number;
    sexo_jugador: string;
};

type Equipo = {
    id: number;
    nombre_equipo: string;
    escudo_equipo?: string | null;
    plantilla: number;
    jugadores?: Jugador[];
};

type Props = {
    equipos: Equipo[];
};

export default function Index({ equipos }: Props) {
    const equipo = equipos?.[0] ?? null;
    const jugadoresCount = equipo?.jugadores?.length ?? 0;
    const plantillaCompleta = jugadoresCount >= 10;
    const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);
    const [editingJugador, setEditingJugador] = useState<Jugador | null>(null);
    const [editData, setEditData] = useState({
        nombre_jugador: '',
        apellido_jugador: '',
        contacto_jugador: '',
        posicion_jugador: 'arquero',
        numero_jugador: 1,
        sexo_jugador: 'masculino',
    });
    const [isSaving, setIsSaving] = useState(false);

    function openEditModal(jugador: Jugador) {
        setEditingJugador(jugador);
        setEditData({
            nombre_jugador: jugador.nombre_jugador,
            apellido_jugador: jugador.apellido_jugador,
            contacto_jugador: jugador.contacto_jugador ?? '',
            posicion_jugador: jugador.posicion_jugador,
            numero_jugador: jugador.numero_jugador,
            sexo_jugador: jugador.sexo_jugador,
        });
    }

    function handleDelete(jugadorId: number) {
        if (!window.confirm('¿Querés eliminar este jugador de la plantilla?')) {
            return;
        }

        router.delete(`/jugadores/${jugadorId}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['equipos'] });
            },
        });
    }

    function handleUpdate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingJugador) {
            return;
        }

        setIsSaving(true);

        router.put(`/jugadores/${editingJugador.id}`, editData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingJugador(null);
                router.reload({ only: ['equipos'] });
            },
            onFinish: () => {
                setIsSaving(false);
            },
        });
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle="Administrá tu equipo, jugadores y datos principales."
        >
            <Head title="Mi equipo" />

            <div className="space-y-6">
                {!equipo ? (
                    <section className="app-card border-dashed p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1fae5] text-2xl font-bold text-[#065f46]">
                            +
                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Todavía no tenés un equipo
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-gray-500">
                            Creá tu equipo para agregar jugadores e inscribirte en torneos disponibles.
                        </p>

                        <Link
                            href="/equipos/create"
                            className="btn-primary mt-6"
                        >
                            <Plus className="h-5 w-5" />
                            Crear mi equipo
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-6">
                        <section className="app-card">
                            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#d1fae5] text-3xl font-bold text-[#065f46]">
                                    {equipo.escudo_equipo ? (
                                        <img
                                            src={`/storage/${equipo.escudo_equipo}`}
                                            alt={equipo.nombre_equipo}
                                            className="h-full w-full rounded-3xl object-cover"
                                        />
                                    ) : (
                                        equipo.nombre_equipo.charAt(0)
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[#10b981]">
                                        Equipo registrado
                                    </p>
                                    <p className="mt-1 break-words text-3xl font-bold text-gray-900">
                                        {equipo.nombre_equipo}
                                    </p>

                                    <p className="mt-2 text-gray-500">
                                        Plantilla actual: {jugadoresCount} jugadores
                                    </p>
                                    {plantillaCompleta && (
                                        <p className="mt-2 text-sm font-medium text-emerald-700">
                                            Plantilla completa: máximo 10 jugadores
                                        </p>
                                    )}
                                </div>

                                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
                                    {plantillaCompleta ? (
                                        <span className="cursor-not-allowed rounded-xl bg-emerald-200 px-5 py-3 text-sm font-medium text-emerald-700">
                                            Plantilla completa
                                        </span>
                                    ) : (
                                        <Link
                                            href="/jugadores/create"
                                            className="btn-primary"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Agregar jugador
                                        </Link>
                                    )}

                                    <Link
                                        href={`/equipos/${equipo.id}/edit`}
                                        className="btn-secondary"
                                    >
                                        <Pencil className="h-5 w-5" />
                                        Editar equipo
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="app-card">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Jugadores del equipo
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        Resumen rápido de la plantilla actual.
                                    </p>
                                </div>
                                {!plantillaCompleta && (
                                    <Link
                                        href="/jugadores/create"
                                        className="btn-primary"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Agregar jugador
                                    </Link>
                                )}
                            </div>

                            {!equipo.jugadores || equipo.jugadores.length === 0 ? (
                                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                                    <p className="text-gray-500">
                                        Todavía no agregaste jugadores a este equipo.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
                                    <div className="overflow-x-auto">
                                        <table className="app-table min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-5 py-4">Número</th>
                                                    <th className="px-5 py-4">Nombre</th>
                                                    <th className="px-5 py-4">Apellido</th>
                                                    <th className="px-5 py-4">Contacto</th>
                                                    <th className="px-5 py-4">Sexo</th>
                                                    <th className="px-5 py-4">Posición</th>
                                                    <th className="px-5 py-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {equipo.jugadores.map((jugador) => (
                                                    <tr key={jugador.id} className="text-sm text-gray-700">
                                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                                            #{jugador.numero_jugador}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {jugador.nombre_jugador}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {jugador.apellido_jugador}
                                                        </td>
                                                        <td className="px-5 py-4 text-gray-500">
                                                            {jugador.contacto_jugador || 'Sin contacto'}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {jugador.sexo_jugador}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="badge-position">
                                                                {jugador.posicion_jugador}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedJugador(jugador)}
                                                                    className="btn-blue px-3 py-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Ver
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(jugador)}
                                                                    className="btn-primary px-3 py-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(jugador.id)}
                                                                    className="btn-danger px-3 py-2"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {selectedJugador && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
                    <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">
                                    Detalle del jugador
                                </p>
                                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                    {selectedJugador.nombre_jugador} {selectedJugador.apellido_jugador}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedJugador(null)}
                                className="btn-secondary px-4 py-2"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <InfoCard label="Número" value={`#${selectedJugador.numero_jugador}`} />
                            <InfoCard label="Nombre" value={selectedJugador.nombre_jugador} />
                            <InfoCard label="Apellido" value={selectedJugador.apellido_jugador} />
                            <InfoCard
                                label="Contacto"
                                value={selectedJugador.contacto_jugador || 'Sin contacto'}
                            />
                            <InfoCard label="Posición" value={selectedJugador.posicion_jugador} />
                            <InfoCard label="Sexo" value={selectedJugador.sexo_jugador} />
                        </div>
                    </div>
                </div>
            )}

            {editingJugador && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
                    <div className="w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">
                                    Editar jugador
                                </p>
                                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                    #{editingJugador.numero_jugador} {editingJugador.nombre_jugador} {editingJugador.apellido_jugador}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingJugador(null)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cerrar
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="mt-8 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.nombre_jugador}
                                        onChange={(e) =>
                                            setEditData((current) => ({
                                                ...current,
                                                nombre_jugador: e.target.value,
                                            }))
                                        }
                                        className="app-input mt-2 w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.apellido_jugador}
                                        onChange={(e) =>
                                            setEditData((current) => ({
                                                ...current,
                                                apellido_jugador: e.target.value,
                                            }))
                                        }
                                        className="app-input mt-2 w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contacto
                                </label>
                                <input
                                    type="text"
                                    value={editData.contacto_jugador}
                                    onChange={(e) =>
                                        setEditData((current) => ({
                                            ...current,
                                            contacto_jugador: e.target.value,
                                        }))
                                    }
                                    className="app-input mt-2 w-full"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Posición
                                    </label>
                                    <select
                                        value={editData.posicion_jugador}
                                        onChange={(e) =>
                                            setEditData((current) => ({
                                                ...current,
                                                posicion_jugador: e.target.value,
                                            }))
                                        }
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value="arquero">Arquero</option>
                                        <option value="defensor">Defensor</option>
                                        <option value="mediocampista">Mediocampista</option>
                                        <option value="delantero">Delantero</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Número
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={editData.numero_jugador}
                                        onChange={(e) =>
                                            setEditData((current) => ({
                                                ...current,
                                                numero_jugador: Number(e.target.value),
                                            }))
                                        }
                                        className="app-input mt-2 w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sexo
                                    </label>
                                    <select
                                        value={editData.sexo_jugador}
                                        onChange={(e) =>
                                            setEditData((current) => ({
                                                ...current,
                                                sexo_jugador: e.target.value,
                                            }))
                                        }
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingJugador(null)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

Index.layout = null;

type InfoCardProps = {
    label: string;
    value: string;
};

function InfoCard({ label, value }: InfoCardProps) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );
}
