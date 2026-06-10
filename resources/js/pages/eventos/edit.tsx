import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Evento = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    cupo_evento: number;
    estado_evento: 'abierto' | 'en_curso' | 'finalizado';
    fecha_inicio: string;
    fecha_fin: string;
    descripcion_evento?: string | null;
    formato_evento: string;
    tipo_inscripcion: 'gratis' | 'pago';
    monto_inscripcion?: string | null;
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
        tipo_inscripcion: evento.tipo_inscripcion,
        monto_inscripcion: evento.monto_inscripcion ?? '',
        descripcion_evento: evento.descripcion_evento ?? '',
    });

    const esPago = data.tipo_inscripcion === 'pago';
    const fechaFinAnterior =
        data.fecha_inicio !== '' &&
        data.fecha_fin !== '' &&
        data.fecha_fin < data.fecha_inicio;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (fechaFinAnterior) {
            return;
        }

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
                                    <select
                                        value={data.cupo_evento}
                                        onChange={(e) => setData('cupo_evento', Number(e.target.value))}
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value={8}>8 equipos (2 grupos de 4)</option>
                                        <option value={16}>16 equipos (4 grupos de 4)</option>
                                    </select>
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
                                        <option value="en_curso">En curso</option>
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
                                        onChange={(e) => {
                                            const fechaInicio = e.target.value;
                                            setData('fecha_inicio', fechaInicio);
                                            if (data.fecha_fin && data.fecha_fin < fechaInicio) {
                                                setData('fecha_fin', fechaInicio);
                                            }
                                        }}
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
                                        min={data.fecha_inicio}
                                        onChange={(e) => setData('fecha_fin', e.target.value)}
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                        </div>
                        {fechaFinAnterior && (
                            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                La fecha de fin no puede ser anterior a la fecha de inicio.
                            </p>
                        )}

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
                                                const value = e.target.value as Evento['tipo_inscripcion'];
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
                                href={`/eventos/${evento.id}`}
                                className="btn-secondary"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || fechaFinAnterior}
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
