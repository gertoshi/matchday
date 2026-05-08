import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import AuthCard from '@/components/auth/auth-card';
import AuthLogo from '@/components/auth/auth-logo';
import FormField from '@/components/auth/form-field';
import PasswordField from '@/components/auth/password-field';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status, canResetPassword, canRegister }: Props) {
    return (
        <>
            <Head title="Iniciar sesión" />

            <AuthCard>
                <AuthLogo />

                    {status && (
                        <div className="mb-5 rounded-xl bg-[#d1fae5] px-4 py-3 text-sm font-medium text-[#065f46]">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <FormField
                                    id="email"
                                    name="email"
                                    label="Correo electrónico"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="correo@ejemplo.com"
                                    error={errors.email}
                                />

                                <PasswordField
                                    id="password"
                                    name="password"
                                    label="Contraseña"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Contraseña"
                                    error={errors.password}
                                    action={
                                        canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm text-[#10b981]"
                                                tabIndex={5}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )
                                    }
                                />

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm text-[#6b7280]"
                                    >
                                        Recordarme
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-[#10b981] text-white hover:bg-[#059669]"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Iniciar sesión
                                </Button>

                                {canRegister && (
                                    <div className="text-center text-sm text-[#6b7280]">
                                        ¿No tenés una cuenta?{' '}
                                        <TextLink
                                            href={register()}
                                            tabIndex={5}
                                            className="font-medium text-[#10b981]"
                                        >
                                            Registrate
                                        </TextLink>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
            </AuthCard>
        </>
    );
}

Login.layout = null;