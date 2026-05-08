import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Evento = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    cupo_evento: number;
    estado_evento: 'abierto' | 'cerrado' | 'finalizado';
    fecha_inicio: string;
    fecha_fin: string;
    descripcion_evento?: string | null;
    formato_evento: string;
};

type Props = {
    evento: Evento;
};

export default function Edit({ evento }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre_evento: evento.nombre_evento,
        ubicacion_evento: evento.ubicacion_evento,
        cupo_evento: evento.cupo_evento,
        estado_evento: evento.estado_evento,
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin,
        formato_evento: evento.formato_evento,
        descripcion_evento: evento.descripcion_evento ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/eventos/${evento.id}`);
    }

    return (
        <AppShell
            title="Torneos"
            subtitle="Actualizá la información del torneo."
        >
            <Head title="Editar torneo" />

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

                        <div className="grid gap-6 md:grid-cols-4">
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
                                label="Estado"
                                error={errors.estado_evento}
                                input={
                                    <select
                                        value={data.estado_evento}
                                        onChange={(e) => setData('estado_evento', e.target.value as Evento['estado_evento'])}
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value="abierto">Abierto</option>
                                        <option value="cerrado">Cerrado</option>
                                        <option value="finalizado">Finalizado</option>
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
                                <input
                                    type="text"
                                    value={data.formato_evento}
                                    onChange={(e) => setData('formato_evento', e.target.value)}
                                    className="app-input mt-2 w-full"
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
                                href={`/eventos/${evento.id}`}
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

Edit.layout = null;
