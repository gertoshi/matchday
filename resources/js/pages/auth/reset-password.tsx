import { Form, Head } from '@inertiajs/react';
import AuthCard from '@/components/auth/auth-card';
import FormField from '@/components/auth/form-field';
import PasswordField from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Restablecer contraseña" />

            <AuthCard>
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d1fae5] text-2xl font-bold text-[#065f46]">
                        M
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Restablecer contraseña
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Ingresá una nueva contraseña para recuperar el acceso a tu cuenta.
                    </p>
                </div>

                <Form
                    {...update.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="grid gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="email"
                                name="email"
                                label="Correo electrónico"
                                type="email"
                                autoComplete="email"
                                placeholder="correo@ejemplo.com"
                                error={errors.email}
                            />

                            <PasswordField
                                id="password"
                                name="password"
                                label="Nueva contraseña"
                                autoComplete="new-password"
                                placeholder="Nueva contraseña"
                                autoFocus
                                error={errors.password}
                            />

                            <PasswordField
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Confirmar contraseña"
                                autoComplete="new-password"
                                placeholder="Confirmar contraseña"
                                error={errors.password_confirmation}
                            />

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-[#10b981] text-white hover:bg-[#059669]"
                                disabled={processing}
                                data-test="reset-password-button"
                            >
                                {processing && <Spinner />}
                                Restablecer contraseña
                            </Button>
                        </>
                    )}
                </Form>
            </AuthCard>
        </>
    );
}

ResetPassword.layout = null;