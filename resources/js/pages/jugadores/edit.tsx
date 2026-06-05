import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

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
    jugador: Jugador;
    numerosOcupados: number[];
};

const numerosCamiseta = Array.from({ length: 10 }, (_, index) => index + 1);

export default function Edit({ jugador, numerosOcupados }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre_jugador: jugador.nombre_jugador,
        apellido_jugador: jugador.apellido_jugador,
        contacto_jugador: jugador.contacto_jugador ?? '',
        posicion_jugador: jugador.posicion_jugador,
        numero_jugador: jugador.numero_jugador,
        sexo_jugador: jugador.sexo_jugador,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        put(`/jugadores/${jugador.id}`);
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle="Editá la información de la plantilla."
        >
            <Head title="Editar jugador" />

            <div className="max-w-5xl space-y-6">
                <section className="app-card">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="field-label">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    value={data.nombre_jugador}
                                    onChange={(e) => setData('nombre_jugador', e.target.value)}
                                    className="app-input mt-2 w-full"
                                />

                                {errors.nombre_jugador && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.nombre_jugador}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="field-label">
                                    Apellido
                                </label>

                                <input
                                    type="text"
                                    value={data.apellido_jugador}
                                    onChange={(e) => setData('apellido_jugador', e.target.value)}
                                    className="app-input mt-2 w-full"
                                />

                                {errors.apellido_jugador && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.apellido_jugador}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="field-label">
                                Contacto / teléfono
                            </label>

                            <input
                                type="text"
                                value={data.contacto_jugador}
                                onChange={(e) => setData('contacto_jugador', e.target.value)}
                                className="app-input mt-2 w-full"
                            />

                            {errors.contacto_jugador && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.contacto_jugador}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="field-label">
                                Posición
                            </label>

                            <select
                                value={data.posicion_jugador}
                                onChange={(e) => setData('posicion_jugador', e.target.value)}
                                className="app-select mt-2 w-full"
                            >
                                <option value="arquero">Arquero</option>
                                <option value="defensor">Defensor</option>
                                <option value="mediocampista">Mediocampista</option>
                                <option value="delantero">Delantero</option>
                            </select>

                            {errors.posicion_jugador && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.posicion_jugador}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="field-label">
                                Número de camiseta
                            </label>

                            <select
                                value={data.numero_jugador}
                                onChange={(e) => setData('numero_jugador', Number(e.target.value))}
                                className="app-select mt-2 w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                {numerosCamiseta.map((numero) => (
                                    <option
                                        key={numero}
                                        value={numero}
                                        disabled={numero !== jugador.numero_jugador && numerosOcupados.includes(numero)}
                                    >
                                        {numero}
                                    </option>
                                ))}
                            </select>

                            {errors.numero_jugador && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.numero_jugador}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="field-label">
                                Sexo
                            </label>

                            <select
                                value={data.sexo_jugador}
                                onChange={(e) => setData('sexo_jugador', e.target.value)}
                                className="app-select mt-2 w-full"
                            >
                                <option value="masculino">Masculino</option>
                                <option value="femenino">Femenino</option>
                            </select>

                            {errors.sexo_jugador && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.sexo_jugador}
                                </p>
                            )}
                        </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link
                                href="/jugadores"
                                className="btn-secondary"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary disabled:opacity-50"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppShell>
    );
}

Edit.layout = null;
