import { Head } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Partido = {
    id: number;
    fecha_hora: string;
    ubicacion_partido: string;
    categoria_partido: string;
    evento?: {
        nombre_evento: string;
    } | null;
};

type Props = {
    partidos: Partido[];
};

export default function Index({ partidos }: Props) {
    return (
        <AppShell
            title="Partidos"
            subtitle="Revisá la programación actual de los encuentros."
        >
            <Head title="Partidos" />

            <div className="space-y-6">
                <section className="app-card">
                    {partidos.length === 0 ? (
                        <p className="text-gray-500">Todavía no hay partidos registrados.</p>
                    ) : (
                        <div className="space-y-4">
                            {partidos.map((partido) => (
                                <div key={partido.id} className="rounded-2xl border border-gray-200 p-4 transition-all duration-200 ease-in-out hover:shadow-sm">
                                    <p className="font-semibold text-gray-900">
                                        {partido.evento?.nombre_evento ?? 'Evento sin nombre'}
                                    </p>
                                    <p className="text-sm text-gray-500">{partido.ubicacion_partido}</p>
                                    <p className="text-sm text-gray-500">
                                        {partido.categoria_partido} · {partido.fecha_hora}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}

Index.layout = null;
