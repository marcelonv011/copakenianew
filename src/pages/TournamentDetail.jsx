import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getTournamentById,
  updateTournament,
} from '@/services/tournamentService';

import {
  getMatchesByTournament,
  createMatch,
  updateMatch,
  deleteMatch as deleteMatchById,
} from '@/services/matchService';

import { getTeams } from '@/services/teamService';
import { useAuth } from '@/lib/AuthContext';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Trophy,
  Calendar,
  Users,
  Settings,
} from 'lucide-react';

import ReclasificacionTab from '@/components/tournament/ReclasificacionTab';
import PlayoffsTab from '@/components/tournament/PlayoffsTab';

export default function TournamentDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const queryClient = useQueryClient();

  const [matchDialog, setMatchDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  const [groupDialog, setGroupDialog] = useState(false);
  const [groupCount, setGroupCount] = useState(1);

  const [matchForm, setMatchForm] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    time: '',
    venue: '',
    phase: 'grupos',
    group_name: '',
    matchday: 1,
    home_score: '',
    away_score: '',
    status: 'programado',
  });

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => getTournamentById(id),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => getMatchesByTournament(id),
    initialData: [],
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    initialData: [],
  });

  const tournamentTeams = useMemo(() => {
    if (!tournament?.team_ids) return [];
    return allTeams.filter((t) => tournament.team_ids.includes(t.id));
  }, [tournament, allTeams]);

  const teamsMap = useMemo(() => {
    const map = {};
    allTeams.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [allTeams]);

  const groupNames = useMemo(() => {
    if (tournament?.group_config?.groupNames?.length) {
      return tournament.group_config.groupNames;
    }

    return ['Zona A'];
  }, [tournament]);

  const saveGroups = useMutation({
    mutationFn: async () => {
      const count = Math.max(1, Number(groupCount) || 1);

      const names = Array.from({ length: count }, (_, i) => {
        return `Zona ${String.fromCharCode(65 + i)}`;
      });

      return updateTournament(id, {
        group_config: {
          groupCount: count,
          groupNames: names,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      setGroupDialog(false);
    },
  });

  const saveMatch = useMutation({
    mutationFn: (data) => {
      const homeTeam = teamsMap[data.home_team_id];
      const awayTeam = teamsMap[data.away_team_id];

      const payload = {
        ...data,
        tournament_id: id,
        group_name:
          data.phase === 'grupos'
            ? data.group_name || groupNames[0] || 'Zona A'
            : '',
        home_team_name: homeTeam?.name || '',
        away_team_name: awayTeam?.name || '',
        home_team_logo: homeTeam?.logo_url || '',
        away_team_logo: awayTeam?.logo_url || '',
        home_score: data.home_score !== '' ? Number(data.home_score) : null,
        away_score: data.away_score !== '' ? Number(data.away_score) : null,
        matchday: Number(data.matchday),
      };

      return editingMatch
        ? updateMatch(editingMatch.id, payload)
        : createMatch(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
      setMatchDialog(false);
      setEditingMatch(null);
      resetMatchForm();
    },
  });

  const deleteMatch = useMutation({
    mutationFn: (mid) => deleteMatchById(mid),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['matches', id] }),
  });

  const addTeam = useMutation({
    mutationFn: async (teamId) => {
      const ids = [...(tournament?.team_ids || []), teamId];
      return updateTournament(id, { team_ids: ids });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tournament', id] }),
  });

  const removeTeam = useMutation({
    mutationFn: async (teamId) => {
      const ids = (tournament?.team_ids || []).filter((tid) => tid !== teamId);
      return updateTournament(id, { team_ids: ids });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tournament', id] }),
  });

  const resetMatchForm = () =>
    setMatchForm({
      home_team_id: '',
      away_team_id: '',
      date: '',
      time: '',
      venue: '',
      phase: 'grupos',
      group_name: groupNames[0] || 'Zona A',
      matchday: 1,
      home_score: '',
      away_score: '',
      status: 'programado',
    });

  const handleNewMatch = () => {
    setEditingMatch(null);
    setMatchForm({
      home_team_id: '',
      away_team_id: '',
      date: '',
      time: '',
      venue: '',
      phase: 'grupos',
      group_name: groupNames[0] || 'Zona A',
      matchday: 1,
      home_score: '',
      away_score: '',
      status: 'programado',
    });
    setMatchDialog(true);
  };

  const handleEditMatch = (m) => {
    setEditingMatch(m);
    setMatchForm({
      home_team_id: m.home_team_id || '',
      away_team_id: m.away_team_id || '',
      date: m.date || '',
      time: m.time || '',
      venue: m.venue || '',
      phase: m.phase || 'grupos',
      group_name: m.group_name || groupNames[0] || 'Zona A',
      matchday: m.matchday || 1,
      home_score: m.home_score ?? '',
      away_score: m.away_score ?? '',
      status: m.status || 'programado',
    });
    setMatchDialog(true);
  };

  const standingsByGroup = useMemo(() => {
    const groups = {};

    groupNames.forEach((name) => {
      groups[name] = [];
    });

    tournamentTeams.forEach((team) => {
      const teamGroup =
        matches.find(
          (m) =>
            m.phase === 'grupos' &&
            m.group_name &&
            (m.home_team_id === team.id || m.away_team_id === team.id)
        )?.group_name || null;

      if (!teamGroup) return;

      if (!groups[teamGroup]) groups[teamGroup] = [];
      if (!groups[teamGroup].some((t) => t.id === team.id)) {
        groups[teamGroup].push(team);
      }
    });

    const calculateGroupStandings = (teams, groupName) => {
      const table = {};

      teams.forEach((t) => {
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
            m.phase === 'grupos' &&
            m.group_name === groupName &&
            m.status === 'finalizado' &&
            m.home_score != null &&
            table[m.home_team_id] &&
            table[m.away_team_id]
        )
        .forEach((m) => {
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

        // Equipos empatados en la misma zona con los mismos puntos
        const tiedTeams = standings.filter((t) => t.pts === a.pts);

        // 2) Si son solo 2 empatados: gana el que le ganó al otro
        if (tiedTeams.length === 2) {
          const directMatch = matches.find(
            (m) =>
              m.phase === 'grupos' &&
              m.group_name === groupName &&
              m.status === 'finalizado' &&
              m.home_score != null &&
              m.away_score != null &&
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

        // 3) Si son 3 o más empatados: diferencia GF - GC
        if (b.diff !== a.diff) return b.diff - a.diff;

        // 4) Si sigue empate: goles/puntos a favor
        if (b.pf !== a.pf) return b.pf - a.pf;

        return a.name.localeCompare(b.name);
      });
    };

    return Object.entries(groups).map(([groupName, teams]) => ({
      groupName,
      standings: calculateGroupStandings(teams, groupName),
    }));
  }, [matches, tournamentTeams, groupNames]);

  const sortMatches = (a, b) => {
    const matchdayA = Number(a.matchday || 999);
    const matchdayB = Number(b.matchday || 999);

    if (matchdayA !== matchdayB) {
      return matchdayA - matchdayB;
    }

    const dateA = a.date || '9999-12-31';
    const dateB = b.date || '9999-12-31';

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    const timeA = a.time || '99:99';
    const timeB = b.time || '99:99';

    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }

    const createdA = a.created_date || '';
    const createdB = b.created_date || '';

    return createdA.localeCompare(createdB);
  };

  const scheduledMatches = matches
    .filter((m) => m.status === 'programado')
    .sort(sortMatches);

  const finishedMatches = matches
    .filter((m) => m.status === 'finalizado')
    .sort(sortMatches);

  const playoffMatches = matches
    .filter((m) => m.phase && m.phase !== 'grupos')
    .sort(sortMatches);

  const availableTeamsToAdd = allTeams.filter(
    (t) => !tournament?.team_ids?.includes(t.id)
  );
  const removeTeamFromGroup = useMutation({
    mutationFn: async ({ teamId, groupName }) => {
      const groupMatches = matches.filter(
        (m) =>
          m.phase === 'grupos' &&
          m.group_name === groupName &&
          (m.home_team_id === teamId || m.away_team_id === teamId)
      );

      await Promise.all(
        groupMatches.map((m) =>
          updateMatch(m.id, {
            group_name: '',
          })
        )
      );

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className='text-center py-20 text-muted-foreground'>
        Torneo no encontrado
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 pt-24 md:pt-28 pb-12'>
      <div className='mb-6 rounded-2xl border border-white/10 bg-card/80 p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]'>
        <Badge variant='outline' className='mb-3'>
          {tournament.status === 'activo'
            ? '🔴 Activo'
            : tournament.status === 'finalizado'
              ? 'Finalizado'
              : 'Próximo'}
        </Badge>

        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
          <div>
            <h1 className='font-display text-3xl md:text-5xl font-bold leading-tight'>
              {tournament.name}
            </h1>

            <p className='text-muted-foreground mt-1 text-sm md:text-base'>
              {tournament.category && `Categoría ${tournament.category}`}
              {tournament.year && ` · ${tournament.year}`}
            </p>
          </div>

          {isAdmin && (
            <Button
              variant='outline'
              className='border-primary/30 text-primary hover:bg-primary/10'
              onClick={() => {
                setGroupCount(tournament?.group_config?.groupCount || 1);
                setGroupDialog(true);
              }}
            >
              <Settings className='w-4 h-4 mr-2' />
              Configurar zonas
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue='fixture' className='space-y-6'>
        <div className='overflow-x-auto pb-2 -mx-4 px-4'>
          <TabsList className='bg-card border border-border min-w-max'>
            <TabsTrigger value='fixture'>Fixture</TabsTrigger>
            <TabsTrigger value='resultados'>Resultados</TabsTrigger>
            <TabsTrigger value='posiciones'>Posiciones</TabsTrigger>
            <TabsTrigger value='playoffs'>Playoffs</TabsTrigger>
            <TabsTrigger value='reclasificacion'>Reclasificación</TabsTrigger>
            <TabsTrigger value='equipos'>Equipos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='fixture'>
          {isAdmin && (
            <Button className='mb-4 bg-primary' onClick={handleNewMatch}>
              <Plus className='w-4 h-4 mr-2' /> Nuevo partido
            </Button>
          )}

          {scheduledMatches.length === 0 ? (
            <EmptyState icon={Calendar} text='No hay partidos programados' />
          ) : (
            <div className='grid gap-3 md:grid-cols-2'>
              {scheduledMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  isAdmin={isAdmin}
                  onEdit={handleEditMatch}
                  onDelete={(mid) => deleteMatch.mutate(mid)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='resultados'>
          {finishedMatches.length === 0 ? (
            <EmptyState icon={Trophy} text='No hay resultados aún' />
          ) : (
            <div className='grid gap-3 md:grid-cols-2'>
              {finishedMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  showScore
                  isAdmin={isAdmin}
                  onEdit={handleEditMatch}
                  onDelete={(mid) => deleteMatch.mutate(mid)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='posiciones'>
          {standingsByGroup.length === 0 ? (
            <EmptyState text='No hay datos de posiciones' />
          ) : (
            <div className='space-y-8'>
              {standingsByGroup.map((group) => (
                <div
                  key={group.groupName}
                  className='rounded-xl border border-border overflow-hidden bg-card'
                >
                  <div className='bg-muted/50 px-4 py-3 border-b border-border'>
                    <h3 className='font-display text-lg font-bold text-primary uppercase tracking-widest'>
                      {group.groupName}
                    </h3>
                  </div>

                  <div className='overflow-x-auto'>
                    <Table className='min-w-[720px]'>
                      <TableHeader>
                        <TableRow className='bg-muted/40'>
                          <TableHead className='w-8'>#</TableHead>
                          <TableHead>Equipo</TableHead>
                          <TableHead className='text-center'>PJ</TableHead>
                          <TableHead className='text-center'>PG</TableHead>
                          <TableHead className='text-center'>PP</TableHead>
                          <TableHead className='text-center'>GF</TableHead>
                          <TableHead className='text-center'>GC</TableHead>
                          <TableHead className='text-center'>DIF</TableHead>
                          <TableHead className='text-center font-bold text-primary'>
                            PTS
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {group.standings.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className='text-center text-muted-foreground py-6'
                            >
                              Sin equipos asignados
                            </TableCell>
                          </TableRow>
                        ) : (
                          group.standings.map((s, i) => (
                            <TableRow key={s.id}>
                              <TableCell className='font-bold'>
                                {i + 1}
                              </TableCell>

                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  {s.logo && (
                                    <img
                                      src={s.logo}
                                      alt=''
                                      className='w-7 h-7 rounded-full object-cover'
                                    />
                                  )}

                                  <div className='flex items-center gap-2'>
                                    <span className='font-medium text-sm whitespace-nowrap'>
                                      {s.name}
                                    </span>

                                    {isAdmin && (
                                      <button
                                        type='button'
                                        onClick={() =>
                                          removeTeamFromGroup.mutate({
                                            teamId: s.id,
                                            groupName: group.groupName,
                                          })
                                        }
                                        className='text-[10px] rounded-full border border-destructive/30 text-destructive px-2 py-0.5 hover:bg-destructive/10 transition-colors'
                                        title='Quitar equipo de esta zona'
                                      >
                                        Quitar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className='text-center'>
                                {s.pj}
                              </TableCell>
                              <TableCell className='text-center'>
                                {s.pg}
                              </TableCell>
                              <TableCell className='text-center'>
                                {s.pp}
                              </TableCell>
                              <TableCell className='text-center'>
                                {s.pf}
                              </TableCell>
                              <TableCell className='text-center'>
                                {s.pc}
                              </TableCell>
                              <TableCell className='text-center'>
                                {s.diff > 0 ? `+${s.diff}` : s.diff}
                              </TableCell>
                              <TableCell className='text-center font-bold text-primary'>
                                {s.pts}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='playoffs'>
          <PlayoffsTab
            tournamentId={id}
            matches={playoffMatches}
            tournamentTeams={tournamentTeams}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value='reclasificacion'>
          <ReclasificacionTab
            tournament={tournament}
            matches={matches}
            allTeams={allTeams}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value='equipos'>
          {isAdmin && availableTeamsToAdd.length > 0 && (
            <div className='mb-4 flex items-center gap-3 flex-wrap'>
              <span className='text-sm text-muted-foreground'>
                Agregar equipo:
              </span>

              {availableTeamsToAdd.slice(0, 10).map((t) => (
                <Button
                  key={t.id}
                  size='sm'
                  variant='outline'
                  onClick={() => addTeam.mutate(t.id)}
                >
                  <Plus className='w-3 h-3 mr-1' /> {t.name}
                </Button>
              ))}
            </div>
          )}

          {tournamentTeams.length === 0 ? (
            <EmptyState icon={Users} text='No hay equipos en este torneo' />
          ) : (
            <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {tournamentTeams.map((t) => (
                <div
                  key={t.id}
                  className='rounded-xl border border-border bg-card p-4 flex items-center gap-3'
                >
                  {t.logo_url ? (
                    <img
                      src={t.logo_url}
                      alt=''
                      className='w-12 h-12 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center font-display text-lg font-bold text-primary'>
                      {t.name?.[0]}
                    </div>
                  )}

                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm truncate'>{t.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {t.club_name || t.city || ''}
                    </p>
                  </div>

                  {isAdmin && (
                    <Button
                      size='icon'
                      variant='ghost'
                      className='text-destructive h-8 w-8'
                      onClick={() => removeTeam.mutate(t.id)}
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
        <DialogContent className='bg-card border-border max-w-sm'>
          <DialogHeader>
            <DialogTitle className='font-display'>
              Configurar zonas de grupos
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label>Cantidad de zonas</Label>
              <Input
                type='number'
                min='1'
                max='12'
                value={groupCount}
                onChange={(e) => setGroupCount(e.target.value)}
                className='bg-background'
              />
            </div>

            <div className='rounded-lg border border-border bg-background/40 p-3'>
              <p className='text-xs text-muted-foreground mb-2'>
                Se crearán estas zonas:
              </p>

              <div className='flex flex-wrap gap-2'>
                {Array.from(
                  { length: Math.max(1, Number(groupCount) || 1) },
                  (_, i) => (
                    <span
                      key={i}
                      className='text-xs rounded-full bg-primary/10 text-primary px-2 py-1'
                    >
                      Zona {String.fromCharCode(65 + i)}
                    </span>
                  )
                )}
              </div>
            </div>

            <Button
              className='w-full bg-primary'
              onClick={() => saveGroups.mutate()}
              disabled={saveGroups.isPending}
            >
              {saveGroups.isPending && (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              )}
              Guardar zonas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={matchDialog}
        onOpenChange={(v) => {
          setMatchDialog(v);
          if (!v) {
            setEditingMatch(null);
            resetMatchForm();
          }
        }}
      >
        <DialogContent className='bg-card border-border max-w-md max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-display'>
              {editingMatch ? 'Editar partido' : 'Nuevo partido'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMatch.mutate(matchForm);
            }}
            className='space-y-4'
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <Label>Equipo Local</Label>
                <Select
                  value={matchForm.home_team_id}
                  onValueChange={(v) =>
                    setMatchForm({ ...matchForm, home_team_id: v })
                  }
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue placeholder='Seleccionar' />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Equipo Visitante</Label>
                <Select
                  value={matchForm.away_team_id}
                  onValueChange={(v) =>
                    setMatchForm({ ...matchForm, away_team_id: v })
                  }
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue placeholder='Seleccionar' />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <Label>Fecha</Label>
                <Input
                  type='date'
                  value={matchForm.date}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, date: e.target.value })
                  }
                  className='bg-background'
                />
              </div>

              <div>
                <Label>Hora</Label>
                <Input
                  value={matchForm.time}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, time: e.target.value })
                  }
                  placeholder='18:00'
                  className='bg-background'
                />
              </div>

              <div>
                <Label>Fecha Nº</Label>
                <Input
                  type='number'
                  value={matchForm.matchday}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, matchday: e.target.value })
                  }
                  className='bg-background'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <Label>Fase</Label>
                <Select
                  value={matchForm.phase}
                  onValueChange={(v) =>
                    setMatchForm({
                      ...matchForm,
                      phase: v,
                      group_name:
                        v === 'grupos'
                          ? matchForm.group_name || groupNames[0] || 'Zona A'
                          : '',
                    })
                  }
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value='grupos'>Grupos</SelectItem>
                    <SelectItem value='cuartos'>Cuartos</SelectItem>
                    <SelectItem value='semifinal'>Semifinal</SelectItem>
                    <SelectItem value='final'>Final</SelectItem>
                    <SelectItem value='3er_puesto'>3er Puesto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={matchForm.status}
                  onValueChange={(v) =>
                    setMatchForm({ ...matchForm, status: v })
                  }
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value='programado'>Programado</SelectItem>
                    <SelectItem value='en_curso'>En curso</SelectItem>
                    <SelectItem value='finalizado'>Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {matchForm.phase === 'grupos' && (
              <div>
                <Label>Zona / Grupo</Label>
                <Select
                  value={matchForm.group_name}
                  onValueChange={(v) =>
                    setMatchForm({ ...matchForm, group_name: v })
                  }
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue placeholder='Seleccionar zona' />
                  </SelectTrigger>

                  <SelectContent>
                    {groupNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <Label>Puntos Local</Label>
                <Input
                  type='number'
                  value={matchForm.home_score}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, home_score: e.target.value })
                  }
                  className='bg-background'
                />
              </div>

              <div>
                <Label>Puntos Visitante</Label>
                <Input
                  type='number'
                  value={matchForm.away_score}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, away_score: e.target.value })
                  }
                  className='bg-background'
                />
              </div>
            </div>

            <div>
              <Label>Sede</Label>
              <Input
                value={matchForm.venue}
                onChange={(e) =>
                  setMatchForm({ ...matchForm, venue: e.target.value })
                }
                className='bg-background'
              />
            </div>

            <Button
              type='submit'
              className='w-full bg-primary'
              disabled={saveMatch.isPending}
            >
              {saveMatch.isPending && (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              )}
              {editingMatch ? 'Guardar' : 'Crear partido'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className='text-center py-12 border border-dashed border-border rounded-xl'>
      {Icon && (
        <Icon className='w-10 h-10 text-muted-foreground mx-auto mb-2' />
      )}
      <p className='text-muted-foreground'>{text}</p>
    </div>
  );
}

function MatchCard({ match, showScore, isAdmin, onEdit, onDelete }) {
  return (
    <div className='rounded-xl border border-border bg-card p-4 md:p-5'>
      <div className='flex items-center justify-between mb-3'>
        <div>
          <span className='text-xs text-primary font-medium uppercase tracking-wider'>
            {match.phase || 'Grupos'}
            {match.matchday ? ` · Fecha ${match.matchday}` : ''}
          </span>

          {match.group_name && match.phase === 'grupos' && (
            <p className='text-[10px] text-muted-foreground uppercase tracking-widest'>
              {match.group_name}
            </p>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {match.date && (
            <span className='text-xs text-muted-foreground'>{match.date}</span>
          )}

          {showScore && (
            <Badge variant='outline' className='text-[10px]'>
              FINAL
            </Badge>
          )}
        </div>
      </div>

      <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
        <TeamBox
          logo={match.home_team_logo}
          name={match.home_team_name || 'Local'}
        />

        <div className='px-2 text-center'>
          {showScore && match.home_score != null ? (
            <p className='font-display text-2xl font-bold whitespace-nowrap'>
              {match.home_score} - {match.away_score}
            </p>
          ) : (
            <p className='text-xs text-muted-foreground whitespace-nowrap'>
              {match.time || 'VS'}
            </p>
          )}
        </div>

        <TeamBox
          logo={match.away_team_logo}
          name={match.away_team_name || 'Visitante'}
        />
      </div>

      {match.venue && (
        <p className='text-xs text-muted-foreground text-center mt-3'>
          {match.venue}
        </p>
      )}

      {isAdmin && (
        <div className='flex gap-2 mt-3 pt-3 border-t border-border'>
          <Button
            size='sm'
            variant='ghost'
            className='flex-1 text-xs h-7'
            onClick={() => onEdit(match)}
          >
            <Edit className='w-3 h-3 mr-1' /> Editar
          </Button>

          <Button
            size='sm'
            variant='ghost'
            className='text-destructive text-xs h-7'
            onClick={() => onDelete(match.id)}
          >
            <Trash2 className='w-3 h-3' />
          </Button>
        </div>
      )}
    </div>
  );
}

function TeamBox({ logo, name }) {
  return (
    <div className='text-center min-w-0'>
      {logo ? (
        <img
          src={logo}
          alt=''
          className='w-10 h-10 rounded-full mx-auto mb-1 object-cover'
        />
      ) : (
        <div className='w-10 h-10 rounded-full mx-auto mb-1 bg-muted flex items-center justify-center text-primary font-bold'>
          {name?.[0]}
        </div>
      )}

      <p className='text-xs md:text-sm font-medium truncate'>{name}</p>
    </div>
  );
}
