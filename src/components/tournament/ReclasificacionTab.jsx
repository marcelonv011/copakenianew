import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Settings, Trophy } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTournament } from '@/services/tournamentService';

const COPA_PRESETS = [
  { id: 'oro', nombre: 'COPA ORO', color: 'gold' },
  { id: 'plata', nombre: 'COPA PLATA', color: 'silver' },
  { id: 'bronce', nombre: 'COPA BRONCE', color: 'bronze' },
  { id: 'estimulo', nombre: 'COPA ESTÍMULO', color: 'green' },
  { id: 'consuelo', nombre: 'COPA CONSUELO', color: 'purple' },
];

const COLOR_STYLES = {
  gold: {
    border: 'border-yellow-500/50',
    header: 'bg-yellow-900/40',
    title: 'text-yellow-400',
    tableBg: 'bg-yellow-950/30',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  },
  silver: {
    border: 'border-slate-400/50',
    header: 'bg-slate-700/40',
    title: 'text-slate-300',
    tableBg: 'bg-slate-900/30',
    badge: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
  },
  bronze: {
    border: 'border-amber-700/50',
    header: 'bg-amber-900/40',
    title: 'text-amber-600',
    tableBg: 'bg-amber-950/30',
    badge: 'bg-amber-700/20 text-amber-500 border-amber-700/40',
  },
  green: {
    border: 'border-green-600/50',
    header: 'bg-green-900/40',
    title: 'text-green-400',
    tableBg: 'bg-green-950/30',
    badge: 'bg-green-600/20 text-green-300 border-green-600/40',
  },
  purple: {
    border: 'border-purple-500/50',
    header: 'bg-purple-900/40',
    title: 'text-purple-300',
    tableBg: 'bg-purple-950/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  blue: {
    border: 'border-blue-500/50',
    header: 'bg-blue-900/40',
    title: 'text-blue-300',
    tableBg: 'bg-blue-950/30',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
};

const TROPHY_COLORS = {
  gold: '🏆',
  silver: '🥈',
  bronze: '🥉',
  green: '⭐',
  purple: '🏅',
  blue: '🏆',
};

function StandingsTable({ copa, grupo, matches, allTeams, teamStartNumber }) {
  const teamsInGroup =
    grupo.team_ids
      ?.map((tid) => allTeams.find((t) => t.id === tid))
      .filter(Boolean) || [];

  const stats = useMemo(() => {
    const table = {};
    teamsInGroup.forEach((t) => {
      table[t.id] = {
        id: t.id,
        name: t.name,
        logo: t.logo_url,
        pj: 0,
        pg: 0,
        pp: 0,
        pf: 0,
        pc: 0,
        diff: 0,
        pts: 0,
      };
    });
    matches
      .filter(
        (m) =>
          m.status === 'finalizado' &&
          m.home_score != null &&
          grupo.team_ids?.includes(m.home_team_id) &&
          grupo.team_ids?.includes(m.away_team_id)
      )
      .forEach((m) => {
        if (!table[m.home_team_id] || !table[m.away_team_id]) return;
        table[m.home_team_id].pj++;
        table[m.away_team_id].pj++;
        table[m.home_team_id].pf += m.home_score;
        table[m.home_team_id].pc += m.away_score;
        table[m.away_team_id].pf += m.away_score;
        table[m.away_team_id].pc += m.home_score;
        if (m.home_score > m.away_score) {
          table[m.home_team_id].pg++;
          table[m.home_team_id].pts += 2;
          table[m.away_team_id].pp++;
          table[m.away_team_id].pts += 1;
        } else {
          table[m.away_team_id].pg++;
          table[m.away_team_id].pts += 2;
          table[m.home_team_id].pp++;
          table[m.home_team_id].pts += 1;
        }
      });
    const standings = Object.values(table).map((t) => ({
      ...t,
      diff: t.pf - t.pc,
    }));

    return standings.sort((a, b) => {
      // 1) Primero puntos
      if (b.pts !== a.pts) return b.pts - a.pts;

      // Equipos empatados con los mismos puntos dentro de este grupo
      const tiedTeams = standings.filter((t) => t.pts === a.pts);

      // 2) Si empatan solo 2 equipos: queda arriba quien ganó entre ellos
      if (tiedTeams.length === 2) {
        const directMatch = matches.find(
          (m) =>
            m.status === 'finalizado' &&
            m.home_score != null &&
            m.away_score != null &&
            grupo.team_ids?.includes(m.home_team_id) &&
            grupo.team_ids?.includes(m.away_team_id) &&
            ((m.home_team_id === a.id && m.away_team_id === b.id) ||
              (m.home_team_id === b.id && m.away_team_id === a.id))
        );

        if (directMatch) {
          const winner =
            directMatch.home_score > directMatch.away_score
              ? directMatch.home_team_id
              : directMatch.away_team_id;

          if (winner === a.id) return -1;
          if (winner === b.id) return 1;
        }
      }

      // 3) Si empatan 3 o más: diferencia de goles/puntos
      if (b.diff !== a.diff) return b.diff - a.diff;

      // 4) Si sigue igual: goles/puntos a favor
      if (b.pf !== a.pf) return b.pf - a.pf;

      return a.name.localeCompare(b.name);
    });
  }, [matches, grupo.team_ids]);

  const cs = COLOR_STYLES[copa.color] || COLOR_STYLES.gold;

  return (
    <div className='overflow-x-auto'>
      <div
        className={`rounded-lg text-xs ${cs.badge} border px-3 py-1 inline-block mb-2 font-bold tracking-widest uppercase text-center w-full`}
      >
        {grupo.nombre}
      </div>
      <table className='w-full text-xs'>
        <thead>
          <tr className={`${cs.tableBg} text-muted-foreground`}>
            <th className='px-2 py-1.5 text-left w-6'>#</th>
            <th className='px-2 py-1.5 text-left'>EQUIPO</th>
            <th className='px-1 py-1.5 text-center'>PTS</th>
            <th className='px-1 py-1.5 text-center'>PJ</th>
            <th className='px-1 py-1.5 text-center'>PG</th>
            <th className='px-1 py-1.5 text-center'>PP</th>
            <th className='px-1 py-1.5 text-center'>GF</th>
            <th className='px-1 py-1.5 text-center'>GC</th>
            <th className='px-1 py-1.5 text-center'>DIF</th>
          </tr>
        </thead>
        <tbody>
          {teamsInGroup.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className='text-center text-muted-foreground py-3 italic text-xs'
              >
                Sin equipos asignados
              </td>
            </tr>
          ) : (
            stats.map((s, i) => (
              <tr
                key={s.id}
                className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
              >
                <td className='px-2 py-1.5 font-bold text-muted-foreground'>
                  {teamStartNumber + i}
                </td>
                <td className='px-2 py-1.5'>
                  <div className='flex items-center gap-1.5'>
                    {s.logo ? (
                      <img
                        src={s.logo}
                        alt=''
                        className='w-4 h-4 rounded-full object-cover'
                      />
                    ) : null}
                    <span className='font-medium truncate max-w-[120px]'>
                      {s.name}
                    </span>
                  </div>
                </td>
                <td className='px-1 py-1.5 text-center font-bold'>{s.pts}</td>
                <td className='px-1 py-1.5 text-center'>{s.pj}</td>
                <td className='px-1 py-1.5 text-center'>{s.pg}</td>
                <td className='px-1 py-1.5 text-center'>{s.pp}</td>
                <td className='px-1 py-1.5 text-center'>{s.pf}</td>
                <td className='px-1 py-1.5 text-center'>{s.pc}</td>
                <td className='px-1 py-1.5 text-center'>
                  {s.diff > 0 ? `+${s.diff}` : s.diff}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CopaCard({
  copa,
  matches,
  allTeams,
  teamNumberOffset,
  isAdmin,
  onEdit,
  onDelete,
}) {
  const cs = COLOR_STYLES[copa.color] || COLOR_STYLES.gold;
  let offset = teamNumberOffset;

  return (
    <div
      className={`rounded-xl border-2 ${cs.border} bg-card overflow-hidden`}
      style={{
        background:
          'linear-gradient(135deg, hsl(220 18% 10%) 0%, hsl(220 20% 7%) 100%)',
      }}
    >
      {/* Header */}
      <div
        className={`${cs.header} px-5 py-4 flex items-center justify-between`}
      >
        <div className='flex items-center gap-3'>
          <span className='text-2xl'>{TROPHY_COLORS[copa.color]}</span>
          <h3
            className={`font-display text-xl font-bold ${cs.title} tracking-wider`}
          >
            {copa.nombre}
          </h3>
        </div>
        {isAdmin && (
          <div className='flex gap-1'>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              onClick={() => onEdit(copa)}
            >
              <Edit className='w-3.5 h-3.5' />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7 text-destructive/70 hover:text-destructive'
              onClick={() => onDelete(copa.id)}
            >
              <Trash2 className='w-3.5 h-3.5' />
            </Button>
          </div>
        )}
      </div>

      {/* Rules */}
      {copa.reglas && (
        <div
          className={`mx-4 mt-3 rounded-lg border ${cs.border} bg-white/[0.03] px-3 py-2`}
        >
          <p className='text-xs text-muted-foreground leading-relaxed'>
            {copa.reglas}
          </p>
        </div>
      )}

      {/* Groups */}
      <div className='p-4 space-y-5'>
        {(copa.grupos || []).map((grupo, gi) => {
          const currentOffset = offset;
          offset += grupo.team_ids?.length || 0;
          return (
            <StandingsTable
              key={gi}
              copa={copa}
              grupo={grupo}
              matches={matches}
              allTeams={allTeams}
              teamStartNumber={currentOffset + 1}
            />
          );
        })}
        {(!copa.grupos || copa.grupos.length === 0) && (
          <p className='text-xs text-muted-foreground text-center py-4 italic'>
            Sin grupos configurados
          </p>
        )}
      </div>
    </div>
  );
}

// ---- Config Editor ----
function ReclasificacionEditor({ tournament, allTeams, onClose }) {
  const queryClient = useQueryClient();
  const initialConfig = tournament.reclasificacion_config || {
    active: true,
    copas: [],
  };
  const [config, setConfig] = useState(
    JSON.parse(JSON.stringify(initialConfig))
  );
  const [copaDialog, setCopaDialog] = useState(false);
  const [editingCopa, setEditingCopa] = useState(null);
  const [copaForm, setCopaForm] = useState({
    nombre: '',
    color: 'gold',
    reglas: '',
  });
  const [groupDialogCopa, setGroupDialogCopa] = useState(null);
  const [groupForm, setGroupForm] = useState({ nombre: 'GRUPO ÚNICO' });
  const [editingGroupName, setEditingGroupName] = useState(null); // { copaIdx, groupIdx }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateTournament(tournament.id, {
        reclasificacion_config: config,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tournament', tournament.id],
      });
      onClose();
    },
  });

  const addCopa = () => {
    if (editingCopa !== null) {
      const copas = [...config.copas];
      copas[editingCopa] = {
        ...copas[editingCopa],
        nombre: copaForm.nombre,
        color: copaForm.color,
        reglas: copaForm.reglas,
      };
      setConfig({ ...config, copas });
    } else {
      const newCopa = {
        id: Date.now().toString(),
        nombre: copaForm.nombre,
        color: copaForm.color,
        reglas: copaForm.reglas,
        grupos: [{ nombre: 'GRUPO ÚNICO', team_ids: [] }],
      };
      setConfig({ ...config, copas: [...config.copas, newCopa] });
    }
    setCopaDialog(false);
    setEditingCopa(null);
  };

  const updateGroupName = (copaIdx, groupIdx, nombre) => {
    const copas = JSON.parse(JSON.stringify(config.copas));
    copas[copaIdx].grupos[groupIdx].nombre = nombre;
    setConfig({ ...config, copas });
  };

  const removeCopa = (idx) => {
    const copas = config.copas.filter((_, i) => i !== idx);
    setConfig({ ...config, copas });
  };

  const addGroup = (copaIdx) => {
    const copas = [...config.copas];
    copas[copaIdx].grupos = [
      ...(copas[copaIdx].grupos || []),
      { nombre: groupForm.nombre, team_ids: [] },
    ];
    setConfig({ ...config, copas });
    setGroupDialogCopa(null);
  };

  const removeGroup = (copaIdx, groupIdx) => {
    const copas = [...config.copas];
    copas[copaIdx].grupos = copas[copaIdx].grupos.filter(
      (_, i) => i !== groupIdx
    );
    setConfig({ ...config, copas });
  };

  const toggleTeamInGroup = (copaIdx, groupIdx, teamId) => {
    const copas = JSON.parse(JSON.stringify(config.copas));
    const group = copas[copaIdx].grupos[groupIdx];
    if (!group.team_ids) group.team_ids = [];
    if (group.team_ids.includes(teamId)) {
      group.team_ids = group.team_ids.filter((id) => id !== teamId);
    } else {
      group.team_ids.push(teamId);
    }
    setConfig({ ...config, copas });
  };

  const tournamentTeams = allTeams.filter((t) =>
    tournament.team_ids?.includes(t.id)
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h3 className='font-display text-lg font-bold'>Configurar Copas</h3>
        <div className='flex gap-2 flex-wrap'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              const copas = COPA_PRESETS.slice(0, 4).map((p) => ({
                id: p.id,
                nombre: p.nombre,
                color: p.color,
                grupos: [{ nombre: 'GRUPO ÚNICO', team_ids: [] }],
              }));
              setConfig({ ...config, copas });
            }}
          >
            Preset U15
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              const copas = COPA_PRESETS.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                color: p.color,
                grupos: [{ nombre: 'GRUPO ÚNICO', team_ids: [] }],
              }));
              setConfig({ ...config, copas });
            }}
          >
            Preset U17
          </Button>
        </div>
      </div>

      {/* Add copa */}
      <Button
        size='sm'
        className='bg-primary w-full'
        onClick={() => {
          setCopaForm({ nombre: '', color: 'gold' });
          setEditingCopa(null);
          setCopaDialog(true);
        }}
      >
        <Plus className='w-3 h-3 mr-1' /> Agregar Copa
      </Button>

      {/* Copas list */}
      <div className='space-y-4 max-h-[50vh] overflow-y-auto pr-1'>
        {config.copas.map((copa, ci) => {
          const cs = COLOR_STYLES[copa.color] || COLOR_STYLES.gold;
          return (
            <div
              key={copa.id || ci}
              className={`rounded-lg border ${cs.border} p-4 space-y-3`}
            >
              <div className='flex items-center justify-between'>
                <span className={`font-display font-bold ${cs.title}`}>
                  {copa.nombre}
                </span>
                <div className='flex gap-1'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7'
                    onClick={() => {
                      setCopaForm({
                        nombre: copa.nombre,
                        color: copa.color,
                        reglas: copa.reglas || '',
                      });
                      setEditingCopa(ci);
                      setCopaDialog(true);
                    }}
                  >
                    <Edit className='w-3 h-3' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7 text-destructive'
                    onClick={() => removeCopa(ci)}
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              </div>

              {/* Groups */}
              {(copa.grupos || []).map((grupo, gi) => (
                <div
                  key={gi}
                  className='bg-background/40 rounded-lg p-3 space-y-2'
                >
                  <div className='flex items-center justify-between gap-2'>
                    {editingGroupName?.copaIdx === ci &&
                    editingGroupName?.groupIdx === gi ? (
                      <Input
                        autoFocus
                        value={grupo.nombre}
                        onChange={(e) =>
                          updateGroupName(ci, gi, e.target.value)
                        }
                        onBlur={() => setEditingGroupName(null)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && setEditingGroupName(null)
                        }
                        className='h-6 text-xs bg-background px-2 py-0 flex-1'
                      />
                    ) : (
                      <button
                        className='text-xs font-bold text-muted-foreground uppercase hover:text-foreground transition-colors flex items-center gap-1'
                        onClick={() =>
                          setEditingGroupName({ copaIdx: ci, groupIdx: gi })
                        }
                        title='Clic para editar nombre'
                      >
                        {grupo.nombre}{' '}
                        <Edit className='w-2.5 h-2.5 opacity-50' />
                      </button>
                    )}
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-5 w-5 text-destructive shrink-0'
                      onClick={() => removeGroup(ci, gi)}
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {tournamentTeams.map((t) => {
                      const selected = grupo.team_ids?.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleTeamInGroup(ci, gi, t.id)}
                          className={`px-2 py-0.5 rounded text-xs border transition-colors ${selected ? `${cs.badge} border-current` : 'border-border text-muted-foreground hover:border-primary/40'}`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                size='sm'
                variant='outline'
                className='w-full text-xs h-7'
                onClick={() => {
                  setGroupForm({ nombre: 'GRUPO ÚNICO' });
                  setGroupDialogCopa(ci);
                }}
              >
                <Plus className='w-3 h-3 mr-1' /> Agregar Grupo
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        className='w-full bg-primary'
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        Guardar configuración
      </Button>

      {/* Copa form dialog */}
      <Dialog open={copaDialog} onOpenChange={setCopaDialog}>
        <DialogContent className='bg-card border-border max-w-sm'>
          <DialogHeader>
            <DialogTitle className='font-display'>
              {editingCopa !== null ? 'Editar Copa' : 'Nueva Copa'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>Nombre de la copa</Label>
              <Input
                value={copaForm.nombre}
                onChange={(e) =>
                  setCopaForm({ ...copaForm, nombre: e.target.value })
                }
                className='bg-background'
                placeholder='Ej: COPA ORO, ZONA CAMPEONATO...'
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className='flex gap-2 mt-1 flex-wrap'>
                {Object.keys(COLOR_STYLES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCopaForm({ ...copaForm, color: c })}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${copaForm.color === c ? COLOR_STYLES[c].badge : 'border-border text-muted-foreground'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>
                Reglas / Descripción{' '}
                <span className='text-muted-foreground font-normal'>
                  (opcional)
                </span>
              </Label>
              <textarea
                value={copaForm.reglas}
                onChange={(e) =>
                  setCopaForm({ ...copaForm, reglas: e.target.value })
                }
                className='w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none'
                rows={3}
                placeholder='Ej: Los 2 primeros de cada grupo avanzan a semifinales. Se juega todos contra todos.'
              />
            </div>
            <Button
              className='w-full bg-primary'
              onClick={addCopa}
              disabled={!copaForm.nombre.trim()}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group name dialog */}
      <Dialog
        open={groupDialogCopa !== null}
        onOpenChange={(v) => {
          if (!v) setGroupDialogCopa(null);
        }}
      >
        <DialogContent className='bg-card border-border max-w-sm'>
          <DialogHeader>
            <DialogTitle className='font-display'>Nuevo Grupo</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>Nombre del grupo</Label>
              <Input
                value={groupForm.nombre}
                onChange={(e) => setGroupForm({ nombre: e.target.value })}
                className='bg-background'
              />
            </div>
            <Button
              className='w-full bg-primary'
              onClick={() => addGroup(groupDialogCopa)}
            >
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Main Component ----
export default function ReclasificacionTab({
  tournament,
  matches,
  allTeams,
  isAdmin,
}) {
  const [configOpen, setConfigOpen] = useState(false);
  const config = tournament?.reclasificacion_config;
  const copas = config?.copas || [];

  // Calculate cumulative team offsets per copa
  let globalOffset = 0;

  return (
    <div>
      {/* Header */}
      <div
        className='rounded-xl p-6 mb-6 text-center relative overflow-hidden'
        style={{
          background:
            'linear-gradient(135deg, hsl(220 20% 8%) 0%, hsl(220 25% 12%) 100%)',
        }}
      >
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse at left, rgba(234,121,21,0.12) 0%, transparent 60%), radial-gradient(ellipse at right, rgba(0,122,255,0.12) 0%, transparent 60%)',
          }}
        />
        <p className='font-display text-xs tracking-[0.3em] text-muted-foreground uppercase mb-1'>
          Fase de
        </p>
        <h2 className='font-display text-4xl md:text-5xl font-bold text-foreground tracking-widest'>
          RECLASIFICACIÓN
        </h2>
        <div className='flex items-center justify-center gap-3 mt-2'>
          <div className='h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary' />
          <span className='font-display text-xl text-primary font-bold tracking-widest'>
            {tournament?.category}
          </span>
          <div className='h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary' />
        </div>
        {copas.length > 0 && (
          <p className='text-xs text-muted-foreground mt-3 tracking-widest uppercase'>
            {copas.map((c) => c.nombre).join(' • ')}
          </p>
        )}
      </div>

      {isAdmin && (
        <div className='mb-4 flex justify-end'>
          <Button
            variant='outline'
            className='border-primary/30 text-primary hover:bg-primary/10'
            onClick={() => setConfigOpen(true)}
          >
            <Settings className='w-4 h-4 mr-2' /> Configurar Reclasificación
          </Button>
        </div>
      )}

      {copas.length === 0 ? (
        <div className='text-center py-16 rounded-xl border border-dashed border-border'>
          <Trophy className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
          <p className='text-muted-foreground font-medium'>
            La reclasificación aún no está configurada
          </p>
          {isAdmin && (
            <Button
              className='mt-4 bg-primary'
              onClick={() => setConfigOpen(true)}
            >
              <Settings className='w-4 h-4 mr-2' /> Configurar ahora
            </Button>
          )}
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2'>
          {copas.map((copa, ci) => {
            const currentOffset = globalOffset;
            globalOffset += (copa.grupos || []).reduce(
              (sum, g) => sum + (g.team_ids?.length || 0),
              0
            );
            return (
              <CopaCard
                key={copa.id || ci}
                copa={copa}
                matches={matches}
                allTeams={allTeams}
                teamNumberOffset={currentOffset}
                isAdmin={false}
                onEdit={() => setConfigOpen(true)}
                onDelete={() => {}}
              />
            );
          })}
        </div>
      )}

      {/* Footer banner */}
      {copas.length > 0 && (
        <div className='mt-8 rounded-xl border border-primary/20 bg-card/50 py-3 px-6 flex items-center justify-center gap-3'>
          <Trophy className='w-5 h-5 text-primary' />
          <span className='font-display text-sm tracking-widest uppercase text-foreground'>
            RECLASIFICACIÓN · TODO O NADA
          </span>
          <Trophy className='w-5 h-5 text-primary' />
        </div>
      )}

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className='bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-display'>
              Configurar Reclasificación
            </DialogTitle>
          </DialogHeader>
          <ReclasificacionEditor
            tournament={tournament}
            allTeams={allTeams}
            onClose={() => setConfigOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
