import { Form, Head } from '@inertiajs/react';
import AuthCard from '@/components/auth/auth-card';
import AuthLogo from '@/components/auth/auth-logo';
import FormField from '@/components/auth/form-field';
import DateSelect from '@/components/forms/DateSelect';
import PasswordField from '@/components/auth/password-field';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [birthDate, setBirthDate] = useState('');

    return (
        <>
            <Head title="Registrarse" />

            <AuthCard>
                <AuthLogo />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* NOMBRE DE USUARIO */}

                            <FormField
                                id="name"
                                name="name"
                                label="Nombre de usuario"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                placeholder="Ej: juanperez"
                                error={errors.name}
                            />

                            {/* EMAIL */}

                            <FormField
                                id="email"
                                name="email"
                                label="Correo electrónico"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                placeholder="correo@ejemplo.com"
                                error={errors.email}
                            />

                            {/* TELEFONO */}

                            <FormField
                                id="phone"
                                name="phone"
                                label="Teléfono"
                                type="text"
                                required
                                tabIndex={3}
                                placeholder="Ej: 3704 123456"
                                error={errors.phone}
                            />

                            {/* FECHA NACIMIENTO */}

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="birth_date"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Fecha de nacimiento
                                    <span className="ml-1 text-red-600">*</span>
                                </Label>
                                <input
                                    id="birth_date"
                                    name="birth_date"
                                    type="hidden"
                                    value={birthDate}
                                />
                                <DateSelect
                                    value={birthDate}
                                    onChange={setBirthDate}
                                    error={errors.birth_date}
                                />
                            </div>

                            {/* PASSWORD */}

                            <PasswordField
                                id="password"
                                name="password"
                                label="Contraseña"
                                required
                                tabIndex={5}
                                autoComplete="new-password"
                                placeholder="Contraseña"
                                error={errors.password}
                            />

                            {/* CONFIRM PASSWORD */}

                            <PasswordField
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Confirmar contraseña"
                                required
                                tabIndex={6}
                                autoComplete="new-password"
                                placeholder="Confirmar contraseña"
                                error={errors.password_confirmation}
                            />

                            {/* BOTON */}

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-[#10b981] text-white hover:bg-[#059669]"
                                tabIndex={7}
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>

                            <div className="text-center text-sm text-gray-500">
                                ¿Ya tenés una cuenta?{' '}
                                <TextLink
                                    href={login()}
                                    tabIndex={8}
                                    className="font-medium text-[#10b981]"
                                >
                                    Iniciar sesión
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </AuthCard>
        </>
    );
}

Register.layout = null;
