import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';
import { storageUrl } from '@/lib/storage';

type Perfil = {
    nombre: string;
    apellido: string;
    foto_perfil?: string | null;
};

type Props = {
    perfil: Perfil;
};

export default function Edit({ perfil }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        foto_perfil: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/perfil', { forceFormData: true });
    }

    return (
        <AppShell
            title="Perfil"
            subtitle="Editá tu información personal y mantené tu cuenta actualizada."
        >
            <Head title="Editar perfil" />

            <div className="max-w-3xl">
                <section className="app-card">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        {perfil.foto_perfil ? (
                            <div className="h-24 w-24 overflow-hidden rounded-3xl border border-gray-200">
                                <img
                                    src={storageUrl(perfil.foto_perfil) ?? ''}
                                    alt={`${perfil.nombre} ${perfil.apellido}`}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        ) : null}

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field
                                label="Nombre"
                                error={errors.nombre}
                                input={
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                            <Field
                                label="Apellido"
                                error={errors.apellido}
                                input={
                                    <input
                                        type="text"
                                        value={data.apellido}
                                        onChange={(e) =>
                                            setData('apellido', e.target.value)
                                        }
                                        className="app-input mt-2 w-full"
                                    />
                                }
                            />
                        </div>

                        <Field
                            label="Nueva foto de perfil"
                            error={errors.foto_perfil}
                            input={
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        setData(
                                            'foto_perfil',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="app-input mt-2 w-full"
                                />
                            }
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/perfil" className="btn-secondary">
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
