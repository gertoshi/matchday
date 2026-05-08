import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    Dumbbell,
    Flag,
    Goal,
    LayoutDashboard,
    ListChecks,
    ShieldCheck,
    Trophy,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type CardItem = {
    title: string;
    description: string;
    icon: LucideIcon;
};

type TeamMember = {
    name: string;
    role: string;
    description: string;
    initials: string;
    photo?: string;
};

const objectives: CardItem[] = [
    {
        title: 'Digitalizar la gestión de torneos',
        description:
            'Reemplazá planillas dispersas por una plataforma clara para administrar cada instancia.',
        icon: LayoutDashboard,
    },
    {
        title: 'Facilitar la inscripción de equipos',
        description:
            'Ordená solicitudes, datos de equipos y participación en torneos desde un mismo lugar.',
        icon: ClipboardCheck,
    },
    {
        title: 'Organizar jugadores y plantillas',
        description:
            'Mantené actualizada la información deportiva de cada equipo y sus integrantes.',
        icon: Users,
    },
    {
        title: 'Centralizar información deportiva',
        description:
            'Concentrá torneos, partidos e inscripciones para que todos consulten datos confiables.',
        icon: ShieldCheck,
    },
];

const features: CardItem[] = [
    {
        title: 'Crear y administrar mi equipo',
        description:
            'Gestioná datos principales, responsables y estructura del equipo.',
        icon: Flag,
    },
    {
        title: 'Cargar jugadores',
        description:
            'Registrá planteles completos con información ordenada y editable.',
        icon: UserPlus,
    },
    {
        title: 'Ver torneos disponibles',
        description:
            'Consultá competencias abiertas y oportunidades de participación.',
        icon: Trophy,
    },
    {
        title: 'Crear torneos',
        description:
            'Armá torneos amateur con datos claros para organizadores y equipos.',
        icon: CalendarDays,
    },
    {
        title: 'Inscribir equipos',
        description:
            'Simplificá el alta de equipos participantes en cada competencia.',
        icon: ListChecks,
    },
    {
        title: 'Gestionar partidos',
        description:
            'Ordená encuentros, fechas y seguimiento deportivo del torneo.',
        icon: Goal,
    },
];

const audiences = [
    'Profesores de educación física',
    'Organizadores de torneos',
    'Equipos barriales',
    'Clubes amateur',
    'Escuelas deportivas',
];

const team: TeamMember[] = [
    {
        name: 'Renzo Delturco',
        role: 'Analista de Requerimientos',
        description:
            'Encargado del relevamiento, análisis funcional y definición de necesidades del sistema.',
        initials: 'RD',
        photo: '/images/user-renzo.jpeg',
    },
    {
        name: 'Germán Nuñez',
        role: 'Desarrollador Backend',
        description:
            'Responsable de la lógica del sistema, controladores, validaciones y conexión con la base de datos.',
        initials: 'GN',
    },
    {
        name: 'Imanol Silvera',
        role: 'Diseñador de Base de Datos',
        description:
            'Responsable del modelado de datos, relaciones entre entidades y estructura de la base de datos.',
        initials: 'IS',
        photo: '/images/user-imanol.jpeg',
    },
    {
        name: 'Bruno Pablo',
        role: 'Implementador de Base de Datos y Diseñador UI',
        description:
            'Encargado de la implementación de la base de datos y apoyo en el diseño visual de la interfaz.',
        initials: 'BP',
    },
];

const heroStats = ['Equipos', 'Torneos', 'Inscripciones', 'Partidos'];
const currentYear = new Date().getFullYear();

function PublicHeader() {
    const navItems = [
        { label: 'Inicio', href: '#inicio' },
        { label: 'Funcionalidades', href: '#funcionalidades' },
        { label: 'Objetivos', href: '#objetivos' },
        { label: 'Equipo', href: '#equipo' },
    ];

    return (
        <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <a href="#inicio" className="flex items-center gap-3">
                    <img
                        src="/images/matchday-logo.jpeg"
                        alt="Matchday"
                        className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                    />
                    <span className="text-lg font-bold text-[#1f2937]">
                        Matchday
                    </span>
                </a>

                <nav className="hidden items-center gap-7 text-sm font-medium text-[#6b7280] md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="transition-colors hover:text-[#047857]"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-3xl px-4 py-2 text-sm font-semibold text-[#047857] transition-colors hover:bg-[#ecfdf5]"
                    >
                        Iniciar sesión
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-3xl bg-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-md"
                    >
                        Registrarse
                    </Link>
                </div>
            </div>
        </header>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-bold tracking-wide text-[#2563eb] uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#1f2937] sm:text-4xl">
                {title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6b7280]">
                {description}
            </p>
        </div>
    );
}

function InfoCard({ item }: { item: CardItem }) {
    const Icon = item.icon;

    return (
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d1fae5] text-[#047857]">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2937]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                {item.description}
            </p>
        </article>
    );
}

function TeamCard({ member }: { member: TeamMember }) {
    return (
        <article className="h-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-[#e5e7eb] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            {member.photo ? (
                <img
                    src={member.photo}
                    alt={member.name}
                    className="mx-auto mb-4 h-40 w-40 rounded-2xl object-cover shadow-sm"
                />
            ) : (
                <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-2xl bg-emerald-100 text-3xl font-bold text-emerald-700">
                    {member.initials ? (
                        <span>{member.initials}</span>
                    ) : (
                        <User className="h-9 w-9" />
                    )}
                </div>
            )}
            <h3 className="mt-5 text-lg font-bold text-[#1f2937]">
                {member.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#2563eb]">
                {member.role}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                {member.description}
            </p>
        </article>
    );
}

export default function Landing() {
    return (
        <>
            <Head title="Matchday" />

            <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#1f2937]">
                <PublicHeader />

                <main>
                    <section
                        id="inicio"
                        className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8"
                    >
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-2 text-sm font-semibold text-[#047857] shadow-sm ring-1 ring-[#e5e7eb]">
                                <Dumbbell className="h-4 w-4" />
                                Torneos de fútbol amateur
                            </div>
                            <h1 className="max-w-3xl text-4xl leading-tight font-bold text-[#1f2937] sm:text-5xl lg:text-6xl">
                                Gestioná torneos de fútbol amateur de forma
                                simple
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6b7280]">
                                Matchday permite organizar equipos, jugadores,
                                torneos e inscripciones desde una plataforma
                                moderna, clara y fácil de usar.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center rounded-3xl bg-[#059669] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-md"
                                >
                                    Comenzar ahora
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-bold text-[#047857] shadow-sm ring-1 ring-[#d1d5db] transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb] lg:p-8">
                            <img
                                src="/images/matchday-logo.jpeg"
                                alt="Logo Matchday"
                                className="mx-auto h-32 w-full max-w-xs object-contain"
                            />
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {heroStats.map((stat) => (
                                    <div
                                        key={stat}
                                        className="rounded-3xl bg-[#f5f5f5] p-5 text-center transition-all hover:-translate-y-1 hover:bg-[#ecfdf5]"
                                    >
                                        <p className="text-2xl font-bold text-[#047857]">
                                            {stat.slice(0, 1)}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-[#1f2937]">
                                            {stat}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-3xl bg-[#eff6ff] p-5 text-sm leading-6 text-[#2563eb]">
                                Una vista simple para organizar la información
                                clave de cada competencia.
                            </div>
                        </div>
                    </section>

                    <section
                        id="objetivos"
                        className="px-4 py-14 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <SectionHeader
                                eyebrow="Objetivos"
                                title="Una base ordenada para cada torneo"
                                description="Matchday está pensado para reducir tareas manuales, mejorar la organización y hacer más accesible la información deportiva."
                            />
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {objectives.map((item) => (
                                    <InfoCard key={item.title} item={item} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="funcionalidades"
                        className="bg-white px-4 py-14 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <SectionHeader
                                eyebrow="Funcionalidades"
                                title="Herramientas para organizar de punta a punta"
                                description="Desde la creación del equipo hasta la gestión de partidos, el sistema acompaña el flujo principal de un torneo amateur."
                            />
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((item) => (
                                    <InfoCard key={item.title} item={item} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="px-4 py-14 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb] sm:p-8 lg:p-10">
                            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                                <div>
                                    <p className="text-sm font-bold tracking-wide text-[#2563eb] uppercase">
                                        Para quién
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold text-[#1f2937] sm:text-4xl">
                                        Pensado para quienes sostienen el fútbol
                                        amateur
                                    </h2>
                                    <p className="mt-4 text-base leading-7 text-[#6b7280]">
                                        Matchday ayuda a equipos e instituciones
                                        que necesitan organizar torneos con
                                        información simple, visible y
                                        consistente.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {audiences.map((audience) => (
                                        <div
                                            key={audience}
                                            className="flex items-center gap-3 rounded-3xl bg-[#f5f5f5] px-5 py-4 text-sm font-semibold text-[#1f2937]"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d1fae5] text-[#047857]">
                                                <Users className="h-4 w-4" />
                                            </span>
                                            {audience}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="equipo" className="px-4 py-14 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeader
                                eyebrow="Equipo desarrollador"
                                title="Personas detrás de Matchday"
                                description="Nuestro humilde trabajo..."
                            />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                                {team.map((member, index) => (
                                    <TeamCard
                                        key={`${member.name}-${index}`}
                                        member={member}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="px-4 py-14 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-5xl rounded-3xl bg-[#047857] px-6 py-12 text-center shadow-sm sm:px-10">
                            <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                Empezá a organizar tus torneos con Matchday
                            </h2>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-bold text-[#047857] transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    Crear cuenta
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-3xl border border-white/70 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[#e5e7eb] bg-white px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#6b7280] md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/matchday-logo.jpeg"
                                alt="Matchday"
                                className="h-10 w-10 rounded-2xl object-cover"
                            />
                            <div>
                                <p className="font-bold text-[#1f2937]">
                                    Matchday
                                </p>
                                <p>
                                    Sistema de Gestión de Torneos de Fútbol
                                    Amateur
                                </p>
                            </div>
                        </div>
                        <p>{currentYear} · Equipo desarrollador</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

Landing.layout = null;
