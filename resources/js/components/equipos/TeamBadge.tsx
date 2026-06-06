import { storageUrl } from '@/lib/storage';
import { Shield } from 'lucide-react';

export type TeamBadgeEquipo = {
    nombre_equipo?: string | null;
    escudo_equipo?: string | null;
} | null;

type Props = {
    equipo: TeamBadgeEquipo;
    size?: 'sm' | 'md' | 'lg';
    align?: 'left' | 'right';
    showName?: boolean;
};

const sizes = {
    sm: {
        wrapper: 'gap-2',
        icon: 'h-8 w-8 rounded-xl',
        shield: 'h-4 w-4',
        text: 'text-sm',
    },
    md: {
        wrapper: 'gap-3',
        icon: 'h-10 w-10 rounded-2xl',
        shield: 'h-5 w-5',
        text: 'text-sm',
    },
    lg: {
        wrapper: 'gap-4',
        icon: 'h-14 w-14 rounded-2xl',
        shield: 'h-7 w-7',
        text: 'text-base',
    },
};

export default function TeamBadge({
    equipo,
    size = 'md',
    align = 'left',
    showName = true,
}: Props) {
    const classes = sizes[size];
    const escudo = storageUrl(equipo?.escudo_equipo);
    const nombre = equipo?.nombre_equipo || 'Equipo sin nombre';

    return (
        <div
            className={`flex min-w-0 items-center ${classes.wrapper} ${
                align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
            }`}
        >
            {align === 'right' && showName ? (
                <p className={`min-w-0 truncate font-semibold text-gray-900 ${classes.text}`}>
                    {nombre}
                </p>
            ) : null}

            <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-emerald-100 text-emerald-800 ${classes.icon}`}>
                {escudo ? (
                    <img
                        src={escudo}
                        alt={nombre}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <Shield className={classes.shield} />
                )}
            </div>

            {align === 'left' && showName ? (
                <p className={`min-w-0 truncate font-semibold text-gray-900 ${classes.text}`}>
                    {nombre}
                </p>
            ) : null}
        </div>
    );
}
