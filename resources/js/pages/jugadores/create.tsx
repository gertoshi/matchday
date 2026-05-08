import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { Plus } from 'lucide-react';

type Props = {
    equipo: {
        id: number;
        nombre_equipo: string;
    };
};

export default function Create({ equipo }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nombre_jugador: '',
        apellido_jugador: '',
        contacto_jugador: '',
        posicion_jugador: 'arquero',
        numero_jugador: 1,
        sexo_jugador: 'masculino',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post('/jugadores');
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle={`Sumá un jugador a ${equipo.nombre_equipo}.`}
        >
            <Head title="Agregar jugador" />

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
                                    placeholder="Ej: Juan"
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
                                    placeholder="Ej: Pérez"
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
                                placeholder="Ej: 3511234567"
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

                            <input
                                type="number"
                                min={1}
                                max={99}
                                value={data.numero_jugador}
                                onChange={(e) => setData('numero_jugador', Number(e.target.value))}
                                className="app-input mt-2 w-full"
                            />

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
                                href="/equipos"
                                className="btn-secondary"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary disabled:opacity-50"
                            >
                                <Plus className="h-5 w-5" />
                                Guardar jugador
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppShell>
    );
}

Create.layout = null;
