import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Equipo = {
    id: number;
    nombre_equipo: string;
    escudo_equipo?: string | null;
    plantilla: number;
};

type Props = {
    equipo: Equipo;
};

export default function Edit({ equipo }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nombre_equipo: equipo.nombre_equipo,
        plantilla: equipo.plantilla ?? 0,
        escudo_equipo: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post(`/equipos/${equipo.id}`, {
            forceFormData: true,
        });
    }

    return (
        <AppShell
            title="Mi equipo"
            subtitle="Actualizá los datos principales de tu equipo."
        >
            <Head title="Editar equipo" />

            <div className="max-w-3xl space-y-6">
                <section className="app-card">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        <div>
                            <label className="field-label">
                                Nombre del equipo
                            </label>

                            <input
                                type="text"
                                value={data.nombre_equipo}
                                onChange={(e) => setData('nombre_equipo', e.target.value)}
                                className="app-input mt-2 w-full"
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
                                onChange={(e) => setData('plantilla', Number(e.target.value))}
                                className="app-input mt-2 w-full"
                            />

                            {errors.plantilla && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.plantilla}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            {equipo.escudo_equipo && (
                                <img
                                    src={`/storage/${equipo.escudo_equipo}`}
                                    alt={equipo.nombre_equipo}
                                    className="h-24 w-24 rounded-2xl object-cover"
                                />
                            )}

                            <div>
                                <label className="field-label">
                                    Nuevo escudo
                                </label>

                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        setData(
                                            'escudo_equipo',
                                            e.target.files?.[0] ?? null
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
