import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type EventoOption = {
    id: number;
    nombre_evento: string;
    ubicacion_evento: string;
    fecha_inicio: string;
    fecha_fin: string;
    cupo_evento: number;
};

type Props = {
    eventoSeleccionado: EventoOption | null;
    eventos: EventoOption[];
};

export default function Create({ eventoSeleccionado, eventos }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        evento_id: eventoSeleccionado?.id ? String(eventoSeleccionado.id) : '',
        cuota_inscripcion: '',
        observaciones: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/inscripciones');
    }

    return (
        <AppShell
            title="Inscripciones"
            subtitle="Confirmá la participación de tu equipo en un torneo."
        >
            <Head title="Nueva inscripción" />

            <div className="max-w-4xl space-y-6">
                {eventoSeleccionado ? (
                    <section className="app-card">
                        <p className="text-sm font-medium text-emerald-600">Torneo seleccionado</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            {eventoSeleccionado.nombre_evento}
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <InfoRow label="Ubicación" value={eventoSeleccionado.ubicacion_evento} />
                            <InfoRow label="Inicio" value={eventoSeleccionado.fecha_inicio} />
                            <InfoRow label="Fin" value={eventoSeleccionado.fecha_fin} />
                            <InfoRow label="Cupo" value={String(eventoSeleccionado.cupo_evento)} />
                        </div>
                    </section>
                ) : null}

                <section className="app-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!eventoSeleccionado && (
                            <div>
                                <label className="field-label">
                                    Torneo
                                </label>
                                <select
                                    value={data.evento_id}
                                    onChange={(e) => setData('evento_id', e.target.value)}
                                    className="app-select mt-2 w-full"
                                >
                                    <option value="">Seleccioná un torneo abierto</option>
                                    {eventos.map((evento) => (
                                        <option key={evento.id} value={evento.id}>
                                            {evento.nombre_evento} · {evento.ubicacion_evento}
                                        </option>
                                    ))}
                                </select>
                                {errors.evento_id && (
                                    <p className="mt-2 text-sm text-red-500">{errors.evento_id}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="field-label">
                                Cuota de inscripción (opcional)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.cuota_inscripcion}
                                onChange={(e) => setData('cuota_inscripcion', e.target.value)}
                                placeholder="Ej: 5000"
                                className="app-input mt-2 w-full"
                            />
                            {errors.cuota_inscripcion && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.cuota_inscripcion}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="field-label">
                                Observaciones
                            </label>
                            <textarea
                                value={data.observaciones}
                                onChange={(e) => setData('observaciones', e.target.value)}
                                className="app-textarea mt-2 min-h-32 w-full"
                            />
                            {errors.observaciones && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.observaciones}
                                </p>
                            )}
                        </div>

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
                                Confirmar inscripción
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppShell>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-2 font-semibold text-gray-900">{value}</p>
        </div>
    );
}

Create.layout = null;
