import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre_evento: '',
        ubicacion_evento: '',
        cupo_evento: 4,
        fecha_inicio: '',
        fecha_fin: '',
        formato_evento: 'futbol_5',
        tipo_inscripcion: 'gratis',
        monto_inscripcion: '',
        descripcion_evento: '',
    });

    const esPago = data.tipo_inscripcion === 'pago';

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
                                    <select
                                        value={data.cupo_evento}
                                        onChange={(e) => setData('cupo_evento', Number(e.target.value))}
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value={4}>4 equipos (2 grupos de 2)</option>
                                        <option value={8}>8 equipos (2 grupos de 4)</option>
                                    </select>
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
                                <select
                                    value={data.formato_evento}
                                    onChange={(e) => setData('formato_evento', e.target.value)}
                                    className="app-select mt-2 w-full"
                                >
                                    <option value="futbol_5">Fútbol 5</option>
                                    <option value="futbol_7">Fútbol 7</option>
                                </select>
                            }
                        />

                        <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Tipo de inscripción
                            </h2>
                            <div className="mt-4 grid gap-6 md:grid-cols-2">
                                <Field
                                    label="Tipo"
                                    error={errors.tipo_inscripcion}
                                    input={
                                        <select
                                            value={data.tipo_inscripcion}
                                            onChange={(e) => {
                                                const value = e.target.value as 'gratis' | 'pago';
                                                setData('tipo_inscripcion', value);
                                                if (value === 'gratis') {
                                                    setData('monto_inscripcion', '');
                                                }
                                            }}
                                            className="app-select mt-2 w-full"
                                        >
                                            <option value="gratis">Gratis / a beneficio</option>
                                            <option value="pago">De pago</option>
                                        </select>
                                    }
                                />

                                {esPago && (
                                    <Field
                                        label="Monto de inscripción por equipo"
                                        error={errors.monto_inscripcion}
                                        input={
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                value={data.monto_inscripcion}
                                                onChange={(e) => setData('monto_inscripcion', e.target.value)}
                                                placeholder="Ej: 5000"
                                                className="app-input mt-2 w-full"
                                            />
                                        }
                                    />
                                )}
                            </div>
                        </section>

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
