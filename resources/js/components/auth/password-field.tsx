import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import type { ReactNode } from 'react';

type PasswordFieldProps = {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    tabIndex?: number;
    autoComplete?: string;
    autoFocus?: boolean;
    action?: ReactNode;
};

export default function PasswordField({
    id,
    name,
    label,
    placeholder,
    error,
    required = false,
    tabIndex,
    autoComplete,
    autoFocus = false,
    action,
}: PasswordFieldProps) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center">
                <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-1 text-red-600">*</span>}
                </Label>

                {action}
            </div>

            <PasswordInput
                id={id}
                name={name}
                required={required}
                tabIndex={tabIndex}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                placeholder={placeholder}
                className="h-12 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />

            <InputError message={error} />
        </div>
    );
}
