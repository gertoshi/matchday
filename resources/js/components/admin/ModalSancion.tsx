import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type ModalSancionProps = {
    open: boolean;
    userId: number;
    userName: string;
    tipo: 'suspender' | 'banear';
    onClose: () => void;
};

export default function ModalSancion({
    open,
    userId,
    userName,
    tipo,
    onClose,
}: ModalSancionProps) {
    const [motivo, setMotivo] = useState('');
    const [duracionDias, setDuracionDias] = useState('7');
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!open) {
        return null;
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProcessing(true);

        router.post(
            `/admin/usuarios/${userId}/${tipo}`,
            {
                motivo,
                duracion_dias: tipo === 'suspender' ? Number(duracionDias) : null,
                comentarios,
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {tipo === 'suspender' ? 'Suspender usuario' : 'Banear usuario'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{userName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <label className="block">
                        <span className="field-label">Motivo</span>
                        <input
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            className="app-input"
                            required
                        />
                    </label>

                    {tipo === 'suspender' ? (
                        <label className="block">
                            <span className="field-label">Duración en días</span>
                            <input
                                type="number"
                                min="1"
                                max="3650"
                                value={duracionDias}
                                onChange={(event) => setDuracionDias(event.target.value)}
                                className="app-input"
                                required
                            />
                        </label>
                    ) : null}

                    <label className="block">
                        <span className="field-label">Comentarios</span>
                        <textarea
                            value={comentarios}
                            onChange={(event) => setComentarios(event.target.value)}
                            className="app-textarea"
                        />
                    </label>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={tipo === 'banear' ? 'btn-danger' : 'btn-primary'}
                        >
                            {processing ? 'Guardando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
