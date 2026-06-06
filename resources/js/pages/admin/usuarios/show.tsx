import AdminShell from '@/components/admin/AdminShell';
import ModalSancion from '@/components/admin/ModalSancion';
import { storageUrl } from '@/lib/storage';
import { Head, Link, router } from '@inertiajs/react';
import { ShieldBan, Undo2 } from 'lucide-react';
import { useState } from 'react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;
    status: string;
    created_at: string;
    perfil_usuario?: { nombre: string; apellido: string; foto_perfil?: string | null } | null;
    equipo?: { id: number; nombre_equipo: string; estado_equipo: string; jugadores?: unknown[] } | null;
    eventos?: { id: number; nombre_evento: string; estado_evento: string; fecha_inicio: string | null }[];
    sanciones?: {
        id: number;
        tipo: string;
        motivo: string;
        duracion_dias: number | null;
        comentarios: string | null;
        fecha_inicio: string;
        fecha_fin: string | null;
        admin?: { name: string } | null;
    }[];
};

type Props = {
    usuario: Usuario;
};

export default function DetalleUsuario({ usuario }: Props) {
    const [modal, setModal] = useState<'suspender' | 'banear' | null>(null);

    function reactivar() {
        router.post(`/admin/usuarios/${usuario.id}/reactivar`, {}, { preserveScroll: true });
    }

    return (
        <AdminShell title="Detalle de usuario" subtitle={usuario.name}>
            <Head title={`Usuario ${usuario.name}`} />

            <div className="space-y-6">
                <section className="app-card">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                            <Avatar usuario={usuario} />
                            <div>
                                <StatusBadge value={usuario.status} />
                                <h1 className="mt-3 text-3xl font-bold text-gray-900">{usuario.name}</h1>
                                <p className="mt-1 text-gray-500">{usuario.email}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => setModal('suspender')} className="btn-secondary">
                                Suspender usuario
                            </button>
                            <button type="button" onClick={() => setModal('banear')} className="btn-danger">
                                <ShieldBan className="h-5 w-5" />
                                Banear usuario
                            </button>
                            <button type="button" onClick={reactivar} className="btn-blue">
                                <Undo2 className="h-5 w-5" />
                                Reactivar usuario
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <InfoCard title="Información personal">
                        <InfoRow label="Teléfono" value={usuario.phone ?? 'Sin teléfono'} />
                        <InfoRow label="Fecha de nacimiento" value={usuario.birth_date ? formatDate(usuario.birth_date) : 'Sin fecha'} />
                        <InfoRow label="Registro" value={formatDate(usuario.created_at)} />
                        <InfoRow
                            label="Perfil"
                            value={usuario.perfil_usuario ? `${usuario.perfil_usuario.nombre} ${usuario.perfil_usuario.apellido}` : 'Sin perfil'}
                        />
                    </InfoCard>

                    <InfoCard title="Equipo asociado">
                        {usuario.equipo ? (
                            <>
                                <InfoRow label="Equipo" value={usuario.equipo.nombre_equipo} />
                                <InfoRow label="Estado" value={usuario.equipo.estado_equipo} />
                                <InfoRow label="Jugadores" value={String(usuario.equipo.jugadores?.length ?? 0)} />
                                <Link href={`/admin/equipos/${usuario.equipo.id}`} className="btn-secondary mt-4">
                                    Ver equipo
                                </Link>
                            </>
                        ) : (
                            <p className="text-gray-500">Este usuario todavía no tiene equipo.</p>
                        )}
                    </InfoCard>
                </div>

                <section className="app-card">
                    <h2 className="section-title">Historial de torneos</h2>
                    <div className="mt-6 overflow-x-auto">
                        <table className="app-table">
                            <tbody>
                                {(usuario.eventos ?? []).map((evento) => (
                                    <tr key={evento.id}>
                                        <td className="px-5 py-4 font-semibold text-gray-900">{evento.nombre_evento}</td>
                                        <td className="px-5 py-4">{evento.estado_evento}</td>
                                        <td className="px-5 py-4">{evento.fecha_inicio ? formatDate(evento.fecha_inicio) : 'Sin fecha'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(usuario.eventos ?? []).length === 0 ? <Empty text="No registra torneos creados." /> : null}
                    </div>
                </section>

                <section className="app-card">
                    <h2 className="section-title">Historial de sanciones</h2>
                    <div className="mt-6 overflow-x-auto">
                        <table className="app-table">
                            <tbody>
                                {(usuario.sanciones ?? []).map((sancion) => (
                                    <tr key={sancion.id}>
                                        <td className="px-5 py-4 font-semibold text-gray-900">{sancion.tipo}</td>
                                        <td className="px-5 py-4">{sancion.motivo}</td>
                                        <td className="px-5 py-4">{sancion.duracion_dias ? `${sancion.duracion_dias} días` : 'Indefinida'}</td>
                                        <td className="px-5 py-4">{sancion.admin?.name ?? 'Admin eliminado'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(usuario.sanciones ?? []).length === 0 ? <Empty text="No hay sanciones registradas." /> : null}
                    </div>
                </section>
            </div>

            {modal ? (
                <ModalSancion
                    open
                    userId={usuario.id}
                    userName={usuario.name}
                    tipo={modal}
                    onClose={() => setModal(null)}
                />
            ) : null}
        </AdminShell>
    );
}

function Avatar({ usuario }: { usuario: Usuario }) {
    const foto = usuario.perfil_usuario?.foto_perfil;

    return (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-emerald-100 text-3xl font-bold text-emerald-700">
            {foto ? <img src={storageUrl(foto) ?? ''} alt={usuario.name} className="h-full w-full object-cover" /> : usuario.name.charAt(0)}
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="app-card">
            <h2 className="section-title">{title}</h2>
            <div className="mt-6 space-y-3">{children}</div>
        </section>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
            <p className="mt-2 font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function Empty({ text }: { text: string }) {
    return <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">{text}</div>;
}

function StatusBadge({ value }: { value: string }) {
    const classes: Record<string, string> = {
        activo: 'bg-emerald-100 text-emerald-700',
        suspendido: 'bg-amber-100 text-amber-700',
        bloqueado: 'bg-red-100 text-red-700',
        eliminado: 'bg-slate-200 text-slate-700',
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[value] ?? classes.eliminado}`}>{value}</span>;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
