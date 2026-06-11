import { Head, useForm } from '@inertiajs/react';
import AppShell from '@/components/layout/AppShell';

type Configuracion = {
    configurado: boolean;
    public_key_masked?: string | null;
    tiene_public_key: boolean;
    modo: 'test' | 'produccion';
    activo: boolean;
};

type Props = {
    configuracion: Configuracion;
};

export default function Edit({ configuracion }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        modo: configuracion.modo,
        public_key: '',
        access_token: '',
        activo: configuracion.activo,
    });

    const existeConfiguracion = configuracion.configurado;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (existeConfiguracion) {
            put('/configuracion-pago', {
                preserveScroll: true,
                onSuccess: () => reset('access_token'),
            });
            return;
        }

        post('/configuracion-pago', {
            preserveScroll: true,
            onSuccess: () => reset('access_token'),
        });
    }

    return (
        <AppShell
            title="Configuración de pago"
            subtitle="Configurá tu cuenta de Mercado Pago para cobrar inscripciones de tus torneos."
        >
            <Head title="Configuración de pago" />

            <div className="mx-auto max-w-5xl space-y-6">
                <section className="app-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            Tus credenciales se usan únicamente para crear pagos
                            de tus torneos. No se muestran públicamente.
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field
                                label="Modo"
                                error={errors.modo}
                                input={
                                    <select
                                        value={data.modo}
                                        onChange={(event) =>
                                            setData('modo', event.target.value as Configuracion['modo'])
                                        }
                                        className="app-select mt-2 w-full"
                                    >
                                        <option value="test">Test</option>
                                        <option value="produccion">
                                            Producción
                                        </option>
                                    </select>
                                }
                            />

                            <div>
                                <label className="field-label">
                                    Estado activo
                                </label>
                                <label className="mt-3 flex w-fit items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.activo}
                                        onChange={(event) =>
                                            setData('activo', event.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Recibir pagos con Mercado Pago
                                </label>
                                {errors.activo && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.activo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Field
                            label="Public Key"
                            error={errors.public_key}
                            input={
                                <>
                                    {configuracion.public_key_masked && (
                                        <p className="mt-2 text-sm font-medium text-gray-500">
                                            Public Key actual:{' '}
                                            {configuracion.public_key_masked}
                                        </p>
                                    )}
                                    <input
                                        type="text"
                                        value={data.public_key}
                                        onChange={(event) =>
                                            setData('public_key', event.target.value)
                                        }
                                        className="app-input mt-2 w-full"
                                        placeholder={
                                            configuracion.tiene_public_key
                                                ? 'Cargá una nueva Public Key para reemplazarla'
                                                : 'APP_USR...'
                                        }
                                    />
                                </>
                            }
                        />

                        <Field
                            label="Access Token"
                            error={errors.access_token}
                            input={
                                <>
                                    {existeConfiguracion && (
                                        <p className="mt-2 text-sm font-medium text-emerald-700">
                                            Access Token configurado
                                        </p>
                                    )}
                                    <input
                                        type="password"
                                        value={data.access_token}
                                        onChange={(event) =>
                                            setData('access_token', event.target.value)
                                        }
                                        className="app-input mt-2 w-full"
                                        placeholder={
                                            existeConfiguracion
                                                ? 'Cargá un nuevo token para reemplazarlo'
                                                : 'APP_USR...'
                                        }
                                    />
                                </>
                            }
                        />

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary disabled:opacity-50"
                            >
                                {existeConfiguracion
                                    ? 'Actualizar configuración'
                                    : 'Guardar configuración'}
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
