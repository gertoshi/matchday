import InputError from '@/components/input-error';
import { useEffect, useMemo, useState } from 'react';

type DateSelectProps = {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
};

const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

function pad(value: number) {
    return String(value).padStart(2, '0');
}

export default function DateSelect({
    value = '',
    onChange,
    error,
}: DateSelectProps) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 76 }, (_, index) => currentYear - 5 - index);
    }, []);

    useEffect(() => {
        if (!value) {
            setDay('');
            setMonth('');
            setYear('');
            return;
        }

        const [parsedYear, parsedMonth, parsedDay] = value.split('-');
        setYear(parsedYear ?? '');
        setMonth(parsedMonth ? String(Number(parsedMonth)) : '');
        setDay(parsedDay ? String(Number(parsedDay)) : '');
    }, [value]);

    function updateDate(nextDay: string, nextMonth: string, nextYear: string) {
        if (!nextDay || !nextMonth || !nextYear) {
            onChange('');
            return;
        }

        onChange(`${nextYear}-${pad(Number(nextMonth))}-${pad(Number(nextDay))}`);
    }

    return (
        <div className="space-y-2">
            <div className="grid gap-4 md:grid-cols-3">
                <select
                    value={day}
                    onChange={(event) => {
                        const nextDay = event.target.value;
                        setDay(nextDay);
                        updateDate(nextDay, month, year);
                    }}
                    className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                >
                    <option value="">Día</option>
                    {Array.from({ length: 31 }, (_, index) => index + 1).map((optionDay) => (
                        <option key={optionDay} value={optionDay}>
                            {optionDay}
                        </option>
                    ))}
                </select>

                <select
                    value={month}
                    onChange={(event) => {
                        const nextMonth = event.target.value;
                        setMonth(nextMonth);
                        updateDate(day, nextMonth, year);
                    }}
                    className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                >
                    <option value="">Mes</option>
                    {months.map((optionMonth) => (
                        <option key={optionMonth.value} value={optionMonth.value}>
                            {optionMonth.label}
                        </option>
                    ))}
                </select>

                <select
                    value={year}
                    onChange={(event) => {
                        const nextYear = event.target.value;
                        setYear(nextYear);
                        updateDate(day, month, nextYear);
                    }}
                    className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                >
                    <option value="">Año</option>
                    {years.map((optionYear) => (
                        <option key={optionYear} value={optionYear}>
                            {optionYear}
                        </option>
                    ))}
                </select>
            </div>

            <InputError message={error} />
        </div>
    );
}
