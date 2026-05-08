import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre_evento: '',
        ubicacion_evento: '',
        cupo_evento: 2,
        fecha_inicio: '',
        fecha_fin: '',
        formato_evento: '',
        descripcion_evento: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/eventos');
    }

    return (
        <AppShell
            title="Torneos"
            subtitle="Publicá un nuevo torneo para convocar equipos."
        >
            <Head title="Crear torneo" />

            <div className="max-w-4xl space-y-6">
                <section className="app-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Field
                                label="Nombre del torneo"
                                error={errors.nombre_evento}
                                input={
                                    <input
                                        type="text"
                                        value={data.nombre_evento}
                                        onChange={(e) => setData('nombre_evento', e.target.value)}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                            <Field
                                label="Ubicación"
                                error={errors.ubicacion_evento}
                                input={
                                    <input
                                        type="text"
                                        value={data.ubicacion_evento}
                                        onChange={(e) => setData('ubicacion_evento', e.target.value)}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Field
                                label="Cupo"
                                error={errors.cupo_evento}
                                input={
                                    <input
                                        type="number"
                                        min={2}
                                        max={100}
                                        value={data.cupo_evento}
                                        onChange={(e) => setData('cupo_evento', Number(e.target.value))}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                            <Field
                                label="Fecha de inicio"
                                error={errors.fecha_inicio}
                                input={
                                    <input
                                        type="date"
                                        value={data.fecha_inicio}
                                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                            <Field
                                label="Fecha de fin"
                                error={errors.fecha_fin}
                                input={
                                    <input
                                        type="date"
                                        value={data.fecha_fin}
                                        onChange={(e) => setData('fecha_fin', e.target.value)}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                        </div>

                        <Field
                            label="Formato"
                            error={errors.formato_evento}
                            input={
                                <input
                                    type="text"
                                    value={data.formato_evento}
                                    onChange={(e) => setData('formato_evento', e.target.value)}
                                    className="app-input mt-2 w-full"
                                    placeholder="Ej: Fútbol 5, todos contra todos"
                                />
                            }
                        />

                        <Field
                            label="Descripción"
                            error={errors.descripcion_evento}
                            input={
                                <textarea
                                    value={data.descripcion_evento}
                                    onChange={(e) => setData('descripcion_evento', e.target.value)}
                                    className="app-textarea mt-2 min-h-32 w-full"
                                />
                            }
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Link
                                href="/eventos"
                                className="btn-secondary"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary disabled:opacity-50"
                            >
                                Guardar torneo
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppShell>
    );
}

function Field({
    label,
    input,
    error,
}: {
    label: string;
    input: React.ReactNode;
    error?: string;
}) {
    return (
        <div>
            <label className="field-label">{label}</label>
            {input}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}

Create.layout = null;
