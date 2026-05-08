import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
    id: string;
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    autoFocus?: boolean;
    tabIndex?: number;
    autoComplete?: string;
};

export default function FormField({
    id,
    name,
    label,
    type = 'text',
    placeholder,
    error,
    required = false,
    autoFocus = false,
    tabIndex,
    autoComplete,
}: FormFieldProps) {
    return (
        <div className="grid gap-2">
            <Label
                htmlFor={id}
                className="text-sm font-medium text-gray-700"
            >
                {label}
            </Label>

            <Input
                id={id}
                type={type}
                name={name}
                required={required}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="h-12 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />

            <InputError message={error} />
        </div>
    );
}