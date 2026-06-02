import AdminShell from '@/components/admin/AdminShell';
import ModalSancion from '@/components/admin/ModalSancion';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search, ShieldBan, Trash2, Undo2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Usuario = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    is_admin: boolean;
    created_at: string;
    perfil_usuario?: { foto_perfil?: string | null } | null;
    equipo?: { nombre_equipo: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    usuarios: Paginated<Usuario>;
    filters: { search: string; status: string };
};

export default function GestionUsuarios({ usuarios, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [modal, setModal] = useState<{ user: Usuario; tipo: 'suspender' | 'banear' } | null>(null);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/usuarios', { search, status }, { preserveState: true, preserveScroll: true });
    }

    function reactivar(usuario: Usuario) {
        router.post(`/admin/usuarios/${usuario.id}/reactivar`, {}, { preserveScroll: true });
    }

    function eliminar(usuario: Usuario) {
        if (window.confirm(`¿Marcar como eliminado a ${usuario.name}?`)) {
            router.delete(`/admin/usuarios/${usuario.id}`, { preserveScroll: true });
        }
    }

    return (
        <AdminShell title="Usuarios" subtitle="Gestión de usuarios, estados y sanciones.">
            <Head title="Usuarios admin" />

            <div className="space-y-6">
                <section className="app-card">
                    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
                        <label className="block">
                            <span className="field-label">Buscar</span>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="app-input pl-12"
                                    placeholder="Nombre o email"
                                />
                            </div>
                        </label>
                        <label className="block">
                            <span className="field-label">Estado</span>
                            <select value={status} onChange={(event) => setStatus(event.target.value)} className="app-select">
                                <option value="">Todos</option>
                                <option value="activo">Activo</option>
                                <option value="suspendido">Suspendido</option>
                                <option value="bloqueado">Bloqueado</option>
                                <option value="eliminado">Eliminado</option>
                            </select>
                        </label>
                        <button type="submit" className="btn-primary">
                            Filtrar
                        </button>
                    </form>
                </section>

                <section className="app-card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="app-table">
                            <thead>
                                <tr>
                                    <th className="px-5 py-4">Foto</th>
                                    <th className="px-5 py-4">Usuario</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Teléfono</th>
                                    <th className="px-5 py-4">Estado</th>
                                    <th className="px-5 py-4">Equipo</th>
                                    <th className="px-5 py-4">Fecha de registro</th>
                                    <th className="px-5 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.data.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td className="px-5 py-4">
                                            <Avatar usuario={usuario} />
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-gray-900">{usuario.name}</td>
                                        <td className="px-5 py-4">{usuario.email}</td>
                                        <td className="px-5 py-4">{usuario.phone ?? 'Sin teléfono'}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge value={usuario.status} />
                                        </td>
                                        <td className="px-5 py-4">{usuario.equipo?.nombre_equipo ?? 'Sin equipo'}</td>
                                        <td className="px-5 py-4">{formatDate(usuario.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Link href={`/admin/usuarios/${usuario.id}`} className="btn-secondary px-3 py-2">
                                                    <Eye className="h-4 w-4" />
                                                    Ver
                                                </Link>
                                                <button type="button" onClick={() => setModal({ user: usuario, tipo: 'suspender' })} className="btn-secondary px-3 py-2">
                                                    Suspender
                                                </button>
                                                <button type="button" onClick={() => setModal({ user: usuario, tipo: 'banear' })} className="btn-danger px-3 py-2">
                                                    <ShieldBan className="h-4 w-4" />
                                                    Banear
                                                </button>
                                                <button type="button" onClick={() => reactivar(usuario)} className="btn-blue px-3 py-2">
                                                    <Undo2 className="h-4 w-4" />
                                                    Reactivar
                                                </button>
                                                <button type="button" onClick={() => eliminar(usuario)} className="btn-danger px-3 py-2">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <Pagination links={usuarios.links} />
            </div>

            {modal ? (
                <ModalSancion
                    open
                    userId={modal.user.id}
                    userName={modal.user.name}
                    tipo={modal.tipo}
                    onClose={() => setModal(null)}
                />
            ) : null}
        </AdminShell>
    );
}

function Avatar({ usuario }: { usuario: Usuario }) {
    const foto = usuario.perfil_usuario?.foto_perfil;

    return (
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 font-bold text-emerald-700">
            {foto ? <img src={`/storage/${foto}`} alt={usuario.name} className="h-full w-full object-cover" /> : usuario.name.charAt(0)}
        </div>
    );
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

function Pagination({ links }: { links: Paginated<Usuario>['links'] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Link
                    key={`${link.label}-${index}`}
                    href={link.url ?? '#'}
                    preserveScroll
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                        link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}
