import { Trophy, MapPin, Calendar, Users, DollarSign, CheckCircle } from 'lucide-react';

interface Torneo {
  id: number;
  nombre: string;
  ubicacion: string;
  fechaInicio: string;
  fechaFin: string;
  equipos: number;
  maxEquipos: number;
  formato: '4-equipos' | '8-equipos';
  deporte: string;
  costoInscripcion: number;
}

interface TorneosProps {
  onVerDetalle: (torneoId: number) => void;
}

const FORMATO_LABELS: Record<string, string> = {
  '4-equipos': '4 equipos · 2 grupos de 2',
  '8-equipos': '8 equipos · 2 grupos de 4',
};

export function Torneos({ onVerDetalle }: TorneosProps) {
  const torneos: Torneo[] = [
    {
      id: 1,
      nombre: 'Torneo Apertura 2026',
      ubicacion: 'Complejo Deportivo Central',
      fechaInicio: '2026-05-15',
      fechaFin: '2026-07-15',
      equipos: 8,
      maxEquipos: 8,
      formato: '8-equipos',
      deporte: 'Fútbol 11',
      costoInscripcion: 5000,
    },
    {
      id: 2,
      nombre: 'Copa de Verano',
      ubicacion: 'Estadio Municipal',
      fechaInicio: '2026-06-01',
      fechaFin: '2026-06-30',
      equipos: 5,
      maxEquipos: 8,
      formato: '8-equipos',
      deporte: 'Fútbol 7',
      costoInscripcion: 3500,
    },
    {
      id: 3,
      nombre: 'Liga Amateur',
      ubicacion: 'Polideportivo Norte',
      fechaInicio: '2026-05-20',
      fechaFin: '2026-08-20',
      equipos: 3,
      maxEquipos: 4,
      formato: '4-equipos',
      deporte: 'Fútbol 5',
      costoInscripcion: 2500,
    },
    {
      id: 4,
      nombre: 'Torneo Relámpago',
      ubicacion: 'Complejo La Cancha',
      fechaInicio: '2026-05-10',
      fechaFin: '2026-05-11',
      equipos: 4,
      maxEquipos: 4,
      formato: '4-equipos',
      deporte: 'Fútbol 7',
      costoInscripcion: 2000,
    },
    {
      id: 5,
      nombre: 'Copa Primavera',
      ubicacion: 'Estadio La Montaña',
      fechaInicio: '2026-09-01',
      fechaFin: '2026-10-15',
      equipos: 2,
      maxEquipos: 8,
      formato: '8-equipos',
      deporte: 'Fútbol 11',
      costoInscripcion: 4500,
    },
    {
      id: 6,
      nombre: 'Torneo Nocturno',
      ubicacion: 'Complejo Deportivo Sur',
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-31',
      equipos: 1,
      maxEquipos: 4,
      formato: '4-equipos',
      deporte: 'Fútbol 5',
      costoInscripcion: 1500,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1>Torneos Disponibles</h1>
          <p className="text-muted-foreground">Explora y únete a torneos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {torneos.map((torneo) => {
          const cuposDisponibles = torneo.maxEquipos - torneo.equipos;
          const porcentajeLleno = (torneo.equipos / torneo.maxEquipos) * 100;
          const completo = cuposDisponibles === 0;

          return (
            <div
              key={torneo.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white relative">
                {completo && (
                  <div className="absolute top-3 right-3 bg-white/20 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Completo
                  </div>
                )}
                <div className="flex items-start mb-2 pr-16">
                  <h3 className="text-white">{torneo.nombre}</h3>
                </div>
                <span className="px-2 py-1 bg-white/20 rounded text-xs">{torneo.deporte}</span>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{torneo.ubicacion}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(torneo.fechaInicio).toLocaleDateString('es-ES')}</span>
                  <span>→</span>
                  <span>{new Date(torneo.fechaFin).toLocaleDateString('es-ES')}</span>
                </div>

                {/* Formato */}
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-primary">{FORMATO_LABELS[torneo.formato]}</span>
                </div>

                {/* Progreso inscripciones */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Inscripciones</span>
                    <span className="text-foreground">{torneo.equipos}/{torneo.maxEquipos}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${completo ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${porcentajeLleno}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${completo ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {completo ? 'Sin cupos — ver fixture disponible' : `${cuposDisponibles} cupos disponibles`}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-lg text-foreground">${torneo.costoInscripcion.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">por equipo</span>
                </div>

                <button
                  onClick={() => onVerDetalle(torneo.id)}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ver Detalle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
