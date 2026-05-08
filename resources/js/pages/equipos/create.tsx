import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre_equipo: '',
        plantilla: 0,
        escudo_equipo: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post('/equipos', {
            forceFormData: true,
        });
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle="Registrá tu equipo para participar en torneos."
        >
            <Head title="Crear equipo" />

            <div className="max-w-3xl space-y-6">
                <section className="app-card">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        {/* Nombre del equipo */}

                        <div>
                            <label className="field-label">
                                Nombre del equipo
                            </label>

                            <input
                                type="text"
                                value={data.nombre_equipo}
                                onChange={(e) =>
                                    setData(
                                        'nombre_equipo',
                                        e.target.value
                                    )
                                }
                                className="app-input mt-2 w-full"
                                placeholder="Ej: Los Tigres"
                            />

                            {errors.nombre_equipo && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.nombre_equipo}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="field-label">
                                Plantilla
                            </label>

                            <input
                                type="number"
                                min={0}
                                max={50}
                                value={data.plantilla}
                                onChange={(e) =>
                                    setData(
                                        'plantilla',
                                        Number(e.target.value)
                                    )
                                }
                                className="app-input mt-2 w-full"
                                placeholder="0"
                            />

                            {errors.plantilla && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.plantilla}
                                </p>
                            )}
                        </div>

                        {/* Escudo */}

                        <div>
                            <label className="field-label">
                                Escudo del equipo
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData(
                                        'escudo_equipo',
                                        e.target.files
                                            ? e.target.files[0]
                                            : null
                                    )
                                }
                                className="app-input mt-2 w-full"
                            />

                            {errors.escudo_equipo && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.escudo_equipo}
                                </p>
                            )}
                        </div>

                        {/* Botones */}

                        <div className="flex justify-end gap-4 pt-4">
                            <a
                                href="/equipos"
                                className="btn-secondary"
                            >
                                Cancelar
                            </a>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary disabled:opacity-50"
                            >
                                Crear equipo
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppShell>
    );
}

Create.layout = null;
