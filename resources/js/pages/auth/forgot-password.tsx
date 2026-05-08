import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import AuthCard from '@/components/auth/auth-card';
import FormField from '@/components/auth/form-field';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Recuperar contraseña" />

            <AuthCard>
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d1fae5] text-2xl font-bold text-[#065f46]">
                        M
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Recuperar contraseña
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                {status && (
                    <div className="mb-5 rounded-xl bg-[#d1fae5] px-4 py-3 text-sm font-medium text-[#065f46]">
                        {status}
                    </div>
                )}

                <Form {...email.form()} className="space-y-5">
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="email"
                                name="email"
                                label="Correo electrónico"
                                type="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="correo@ejemplo.com"
                                error={errors.email}
                            />

                            <Button
                                className="h-12 w-full rounded-xl bg-[#10b981] text-white hover:bg-[#059669]"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Enviar enlace de recuperación
                            </Button>
                        </>
                    )}
                </Form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <span>¿Recordaste tu contraseña? </span>
                    <TextLink
                        href={login()}
                        className="font-medium text-[#10b981]"
                    >
                        Volver al login
                    </TextLink>
                </div>
            </AuthCard>
        </>
    );
}

ForgotPassword.layout = null;