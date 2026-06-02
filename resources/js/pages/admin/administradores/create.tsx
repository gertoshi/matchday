import AdminShell from '@/components/admin/AdminShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

export default function CrearAdministrador() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/admin/administradores');
    }

    return (
        <AdminShell title="Crear administrador" subtitle="Alta de usuario con permisos administrativos.">
            <Head title="Crear administrador" />

            <section className="app-card max-w-3xl">
                <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                    <Field label="Nombre" error={errors.name}>
                        <input value={data.name} onChange={(event) => setData('name', event.target.value)} className="app-input" required />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="app-input" required />
                    </Field>
                    <Field label="Teléfono" error={errors.phone}>
                        <input value={data.phone} onChange={(event) => setData('phone', event.target.value)} className="app-input" required />
                    </Field>
                    <Field label="Fecha de nacimiento" error={errors.birth_date}>
                        <input type="date" value={data.birth_date} onChange={(event) => setData('birth_date', event.target.value)} className="app-input" required />
                    </Field>
                    <Field label="Contraseña" error={errors.password}>
                        <input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="app-input" required />
                    </Field>
                    <Field label="Confirmar contraseña" error={errors.password_confirmation}>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            className="app-input"
                            required
                        />
                    </Field>
                    <div className="flex flex-col gap-3 pt-2 md:col-span-2 sm:flex-row">
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Creando...' : 'Crear administrador'}
                        </button>
                        <Link href="/admin/administradores" className="btn-secondary">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </section>
        </AdminShell>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="field-label">{label}</span>
            {children}
            {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
        </label>
    );
}
