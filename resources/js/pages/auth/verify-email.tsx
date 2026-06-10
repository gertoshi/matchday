import { Form, Head } from '@inertiajs/react';
import AuthCard from '@/components/auth/auth-card';
import AuthLogo from '@/components/auth/auth-logo';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verificar correo electrónico" />

            <AuthCard>
                <AuthLogo description="" />

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Verificá tu correo electrónico
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Te enviamos un enlace de verificación a tu correo.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-5 rounded-xl bg-[#d1fae5] px-4 py-3 text-sm font-medium text-[#065f46]">
                        Se envió un nuevo enlace de verificación a tu correo electrónico.
                    </div>
                )}

                <Form {...send.form()} className="space-y-5 text-center">
                    {({ processing }) => (
                        <>
                            <Button
                                disabled={processing}
                                className="h-12 w-full rounded-xl bg-[#10b981] text-white hover:bg-[#059669]"
                            >
                                {processing && <Spinner />}
                                Reenviar correo de verificación
                            </Button>

                            <TextLink
                                href={logout()}
                                className="mx-auto block text-sm font-medium text-[#10b981]"
                            >
                                Cerrar sesión
                            </TextLink>
                        </>
                    )}
                </Form>
            </AuthCard>
        </>
    );
}

VerifyEmail.layout = null;
