import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTournamentTeams } from '@/services/tournamentService';
import { filterAvailableTeams } from '@/lib/tournamentEntry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeamEnrollment({ tournament, teams }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState('');
  const client = useQueryClient();
  const available = filterAvailableTeams(teams, tournament.team_ids, search);
  const eligible = selected.filter((id) => teams.some((t) => t.id === id) && !tournament.team_ids?.includes(id));
  const save = useMutation({
    mutationFn: (ids) => addTournamentTeams(tournament.id, ids),
    onSuccess: async (_, ids) => {
      setSelected([]);
      setNotice(`${ids.length} equipos agregados al torneo.`);
      await client.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    },
  });

  return <section className='mb-5 rounded-xl border border-border bg-card p-4 space-y-3'>
    <h3 className='font-semibold'>Agregar equipos al torneo</h3>
    <p className='text-sm text-muted-foreground'>Buscá por nombre, club o ciudad y seleccioná todos los que quieras agregar.</p>
    <fieldset disabled={save.isPending} className='space-y-3'>
      <Input aria-label='Buscar equipos para agregar' placeholder='Buscar equipo, club o ciudad…' value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className='flex flex-wrap gap-2'>
        <Button variant='outline' size='sm' disabled={!available.length} onClick={() => setSelected((prev) => [...new Set([...prev, ...available.map((t) => t.id)])])}>Seleccionar visibles ({available.length})</Button>
        <Button variant='ghost' size='sm' disabled={!selected.length} onClick={() => setSelected([])}>Limpiar selección</Button>
      </div>
      <div className='max-h-64 overflow-y-auto grid sm:grid-cols-2 gap-2'>
        {available.map((team) => <label key={team.id} className='flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer'>
          <input type='checkbox' checked={eligible.includes(team.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...new Set([...prev, team.id])] : prev.filter((id) => id !== team.id))} />
          <span className='min-w-0'><span className='block font-medium break-words'>{team.name}</span><span className='text-xs text-muted-foreground'>{team.club_name || team.city}</span></span>
        </label>)}
      </div>
      {!available.length && <p className='text-sm text-muted-foreground'>{search ? 'No hay equipos que coincidan con la búsqueda.' : 'Todos los equipos disponibles ya están inscritos.'}</p>}
      {eligible.length > 0 && <p className='text-sm'>Seleccionados: {teams.filter((t) => eligible.includes(t.id)).map((t) => t.name).join(', ')}</p>}
      <Button disabled={!eligible.length} onClick={() => { setNotice(''); save.mutate(eligible); }}>{save.isPending ? 'Agregando…' : `Agregar ${eligible.length} equipos`}</Button>
    </fieldset>
    <p className='text-sm text-muted-foreground'>¿Falta un equipo en el catálogo? <Link className='text-primary underline' to='/equipos'>Crear equipo</Link></p>
    {save.isError && <p role='alert' className='text-destructive text-sm'>No se pudieron agregar. Conservamos tu selección para volver a intentar.</p>}
    {notice && <p role='status' className='text-sm'>{notice}</p>}
  </section>;
}
