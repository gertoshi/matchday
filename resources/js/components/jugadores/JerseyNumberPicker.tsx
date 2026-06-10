import { Check, X } from 'lucide-react';

type Props = {
    value: number;
    onChange: (value: number) => void;
    numerosOcupados: number[];
    numeroActual?: number;
    error?: string;
};

const numerosCamiseta = Array.from({ length: 10 }, (_, index) => index + 1);

export default function JerseyNumberPicker({
    value,
    onChange,
    numerosOcupados,
    numeroActual,
    error,
}: Props) {
    function estaOcupado(numero: number) {
        return numero !== numeroActual && numerosOcupados.includes(numero);
    }

    return (
        <div>
            <label className="field-label">Número de camiseta</label>

            <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
                {numerosCamiseta.map((numero) => {
                    const ocupado = estaOcupado(numero);
                    const seleccionado = value === numero;

                    return (
                        <button
                            key={numero}
                            type="button"
                            disabled={ocupado}
                            onClick={() => onChange(numero)}
                            className={`flex aspect-square min-h-16 flex-col items-center justify-center rounded-xl border text-sm font-bold transition-all duration-200 ${
                                seleccionado
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                    : ocupado
                                      ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-500 opacity-80'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100'
                            }`}
                            aria-label={
                                ocupado
                                    ? `Número ${numero} ocupado`
                                    : `Seleccionar número ${numero}`
                            }
                        >
                            <span className="text-xl leading-none">
                                {numero}
                            </span>
                            <span className="mt-1 flex h-4 items-center gap-1 text-[10px] font-semibold uppercase leading-none">
                                {seleccionado ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        elegido
                                    </>
                                ) : ocupado ? (
                                    <>
                                        <X className="h-3 w-3" />
                                        ocupado
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-3 w-3" />
                                        libre
                                    </>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border border-emerald-200 bg-emerald-50" />
                    Disponible
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border border-red-200 bg-red-50" />
                    Ocupado
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    Seleccionado
                </span>
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
