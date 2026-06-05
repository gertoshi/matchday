import { useState } from 'react';
import { Trophy, Shuffle, Users, Swords } from 'lucide-react';

interface Equipo {
  id: number;
  nombre: string;
  capitan: string;
  jugadores: number;
}

interface Partido {
  equipoA: string;
  equipoB: string;
  goles?: [number, number];
  jugado: boolean;
}

interface Grupo {
  nombre: string;
  equipos: string[];
  partidos: Partido[];
}

interface Fixture {
  grupos: Grupo[];
  semifinales: Partido[];
  final: Partido;
}

interface FixtureViewProps {
  formato: '4-equipos' | '8-equipos';
  equiposInscritos: Equipo[];
  torneoCupo: boolean;
}

function generarPartidosGrupo(equipos: string[]): Partido[] {
  const partidos: Partido[] = [];
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({ equipoA: equipos[i], equipoB: equipos[j], jugado: false });
    }
  }
  return partidos;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FixtureView({ formato, equiposInscritos, torneoCupo }: FixtureViewProps) {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const maxEquipos = formato === '8-equipos' ? 8 : 4;
  const porGrupo = maxEquipos / 2;

  const handleGenerarFixture = () => {
    const nombres = equiposInscritos.slice(0, maxEquipos).map(e => e.nombre);
    const mezclados = shuffleArray(nombres);

    const grupoA = mezclados.slice(0, porGrupo);
    const grupoB = mezclados.slice(porGrupo, porGrupo * 2);

    const nuevoFixture: Fixture = {
      grupos: [
        { nombre: 'Grupo A', equipos: grupoA, partidos: generarPartidosGrupo(grupoA) },
        { nombre: 'Grupo B', equipos: grupoB, partidos: generarPartidosGrupo(grupoB) },
      ],
      semifinales: [
        { equipoA: '1° Grupo A', equipoB: '2° Grupo B', jugado: false },
        { equipoA: '1° Grupo B', equipoB: '2° Grupo A', jugado: false },
      ],
      final: { equipoA: 'Ganador SF 1', equipoB: 'Ganador SF 2', jugado: false },
    };

    setFixture(nuevoFixture);
  };

  if (!torneoCupo && !fixture) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 mb-1">El fixture se generará cuando el torneo esté completo</p>
          <p className="text-sm text-amber-600">Faltan equipos por inscribirse</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerarFixture}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Shuffle className="w-5 h-5" />
            Generar Fixture (Vista Previa)
          </button>
        </div>

        {fixture && <FixtureDiagram fixture={fixture} formato={formato} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-foreground">Fixture del Torneo</h3>
            <p className="text-sm text-muted-foreground">
              {formato === '8-equipos' ? '2 grupos de 4 equipos' : '2 grupos de 2 equipos'}
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerarFixture}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Generar Fixture
        </button>
      </div>

      {!fixture ? (
        <div className="bg-muted/40 border border-border rounded-lg p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Presiona "Generar Fixture" para distribuir los equipos aleatoriamente</p>
        </div>
      ) : (
        <FixtureDiagram fixture={fixture} formato={formato} />
      )}
    </div>
  );
}

function FixtureDiagram({ fixture, formato }: { fixture: Fixture; formato: string }) {
  const grupoBadgeColors = ['bg-primary', 'bg-secondary'];

  return (
    <div className="space-y-8">
      {/* Grupos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h4 className="text-foreground">Fase de Grupos</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fixture.grupos.map((grupo, gi) => (
            <div key={grupo.nombre} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className={`${grupoBadgeColors[gi]} px-5 py-3 flex items-center gap-2`}>
                <span className="text-white text-sm px-2 py-0.5 bg-white/20 rounded">{grupo.nombre}</span>
                <span className="text-white/80 text-sm ml-auto">{grupo.equipos.length} equipos</span>
              </div>

              {/* Equipos del grupo */}
              <div className="p-4 space-y-2 border-b border-border">
                {grupo.equipos.map((eq, idx) => (
                  <div key={eq} className="flex items-center gap-3 p-2 bg-accent/30 rounded-lg">
                    <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 ${grupoBadgeColors[gi]}`}>
                      {idx + 1}
                    </span>
                    <span className="text-foreground text-sm">{eq}</span>
                  </div>
                ))}
              </div>

              {/* Partidos del grupo */}
              <div className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Partidos</p>
                {grupo.partidos.map((partido, pi) => (
                  <div key={pi} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-right text-foreground truncate">{partido.equipoA}</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground text-xs flex-shrink-0">vs</span>
                    <span className="flex-1 text-left text-foreground truncate">{partido.equipoB}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fase Eliminatoria */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-5 h-5 text-secondary" />
          <h4 className="text-foreground">Fase Eliminatoria</h4>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">

            {/* Semifinales */}
            <div className="flex flex-col gap-4 w-full md:w-64">
              <p className="text-xs text-muted-foreground uppercase tracking-wide text-center mb-1">Semifinales</p>
              {fixture.semifinales.map((sf, idx) => (
                <div key={idx} className="bg-accent/40 border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary/10 px-3 py-1 text-xs text-secondary">
                    Semifinal {idx + 1}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px]">A</span>
                      </div>
                      <span className="text-sm text-foreground">{sf.equipoA}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px]">B</span>
                      </div>
                      <span className="text-sm text-foreground">{sf.equipoB}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conectores */}
            <div className="hidden md:flex flex-col items-center justify-center px-6 gap-2">
              <div className="w-12 h-0.5 bg-border" />
              <div className="w-0.5 h-20 bg-border" />
              <div className="w-12 h-0.5 bg-border" />
            </div>

            {/* Final */}
            <div className="w-full md:w-64">
              <p className="text-xs text-muted-foreground uppercase tracking-wide text-center mb-1 mt-2 md:mt-0">Final</p>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 rounded-xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-primary to-secondary px-4 py-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Gran Final</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-border">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px]">1</span>
                    </div>
                    <span className="text-sm text-foreground">{fixture.final.equipoA}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full">vs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-border">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px]">2</span>
                    </div>
                    <span className="text-sm text-foreground">{fixture.final.equipoB}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
