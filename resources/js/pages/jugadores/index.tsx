import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Jugador = {
    id: number;
    nombre_jugador: string;
    apellido_jugador: string;
    contacto_jugador?: string | null;
    posicion_jugador: string;
    numero_jugador: number;
    sexo_jugador: string;
};

type Props = {
    jugadores: Jugador[];
    equipo: {
        id: number;
        nombre_equipo: string;
    };
};

export default function Index({ jugadores, equipo }: Props) {
    const { delete: destroy, processing } = useForm({});
    const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);

    function handleDelete(jugadorId: number) {
        destroy(`/jugadores/${jugadorId}`);
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle={`Administrá la plantilla de ${equipo.nombre_equipo}.`}
        >
            <Head title="Jugadores" />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="mb-6 flex items-center justify-end">
                        <Link
                            href="/jugadores/create"
                            className="btn-primary"
                        >
                            <Plus className="h-5 w-5" />
                            Agregar jugador
                        </Link>
                    </div>
                    {jugadores.length === 0 ? (
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800">
                                +
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                Todavía no cargaste jugadores
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-gray-500">
                                Empezá a completar la plantilla para poder organizar tu equipo.
                            </p>
                            <Link
                                href="/jugadores/create"
                                className="btn-primary mt-6"
                            >
                                <Plus className="h-5 w-5" />
                                Agregar primer jugador
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jugadores.map((jugador) => (
                                <div
                                    key={jugador.id}
                                    className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            #{jugador.numero_jugador} {jugador.nombre_jugador} {jugador.apellido_jugador}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {jugador.posicion_jugador} · {jugador.sexo_jugador}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Contacto: {jugador.contacto_jugador || 'Sin contacto'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedJugador(jugador)}
                                            className="btn-blue px-4 py-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Ver
                                        </button>

                                        <Link
                                            href={`/jugadores/${jugador.id}/edit`}
                                            className="btn-secondary px-4 py-2"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Link>

                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => handleDelete(jugador.id)}
                                            className="btn-danger px-4 py-2 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {selectedJugador && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">
                                    Detalle del jugador
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                    {selectedJugador.nombre_jugador} {selectedJugador.apellido_jugador}
                                </h2>
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
                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Número
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    #{selectedJugador.numero_jugador}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Nombre
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {selectedJugador.nombre_jugador}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Apellido
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {selectedJugador.apellido_jugador}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contacto
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {selectedJugador.contacto_jugador || 'Sin contacto'}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Posición
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {selectedJugador.posicion_jugador}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Sexo
                                </p>
                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                    {selectedJugador.sexo_jugador}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

Index.layout = null;
