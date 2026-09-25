import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CUPS, planPlacementMatches, planPlayoffs } from '@/lib/playoffs';
import { addPlacementMatches, generatePlayoffs } from '@/services/playoffService';
import { Button } from '@/components/ui/button';
import PlayoffImage from './PlayoffImage';

export default function CupPlayoffs({ tournament, matches, teams, onEdit, onScore }) {
  const client = useQueryClient();
  const [notice, setNotice] = useState('');
  const generated = matches.filter((m) => m.playoff_slot);
  const missingPlacements = generated.length ? planPlacementMatches(tournament, generated) : [];
  let reason = '';
  if (!generated.length) {
    try { planPlayoffs(tournament, matches, teams); } catch (error) { reason = error.message; }
  }
  const generate = useMutation({
    mutationFn: () => generatePlayoffs(tournament.id),
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ['matches', tournament.id] }), client.invalidateQueries({ queryKey: ['tournament', tournament.id] })]);
      setNotice('Cruces generados. Ya podés descargar la imagen y asignar horarios.');
    },
  });
  const addPlacements = useMutation({
    mutationFn: () => addPlacementMatches(tournament.id),
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ['matches', tournament.id] }), client.invalidateQueries({ queryKey: ['tournament', tournament.id] })]);
      setNotice('Partidos por el 3.º y 4.º puesto agregados a Copa Oro y Copa Plata.');
    },
  });
  return <div className='space-y-6'>
    {!generated.length && <div className='rounded-xl border border-border p-5 space-y-3'>
      <h2 className='font-bold text-xl'>Generar cruces de oro, plata y bronce</h2>
      <p>{tournament.category?.toLowerCase().includes('13') ? 'Finales: 1.º vs 2.º, 3.º vs 4.º y 5.º vs 6.º. El 7.º termina su participación.' : 'Oro: 1.º A vs 2.º B y 1.º B vs 2.º A. Plata: 3.º A vs 4.º B y 3.º B vs 4.º A. Bronce: 5.º A vs 5.º B.'}</p>
      <p className='text-sm text-muted-foreground'>Usa las posiciones finales de grupos. No cambia los partidos ya jugados. Los ganadores de semifinales avanzan a la final y los perdedores al partido por el 3.º y 4.º puesto.</p>
      {reason && <p role='status'>{reason}</p>}
      <Button disabled={!!reason || generate.isPending || !!tournament.playoff_match_ids?.length} onClick={() => generate.mutate()}>{generate.isPending ? 'Generando…' : 'Generar cruces'}</Button>
    </div>}
    {(generate.isError || notice) && <p role={generate.isError ? 'alert' : 'status'}>{generate.error?.message || notice}</p>}
    {generated.length > 0 && <>
      {missingPlacements.length > 0 && <div className='rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2'>
        <p>Este cuadro fue generado antes de incorporar los partidos por el 3.º y 4.º puesto.</p>
        <Button disabled={addPlacements.isPending} onClick={() => addPlacements.mutate()}>{addPlacements.isPending ? 'Agregando…' : 'Agregar 3.º y 4.º puesto'}</Button>
        {addPlacements.isError && <p role='alert'>{addPlacements.error?.message}</p>}
      </div>}
      <PlayoffImage tournament={tournament} matches={generated} />
      {CUPS.map((cup) => <section key={cup} className='space-y-3'><h3 className='text-xl font-bold uppercase'>Copa {cup}</h3><div className='grid gap-3 md:grid-cols-2'>
        {generated.filter((m) => m.cup === cup).sort((a, b) => a.playoff_slot.localeCompare(b.playoff_slot)).map((match) => <article key={match.id} className='border border-border rounded-xl p-4 space-y-3'>
          <p className='uppercase text-primary'>{match.phase === 'tercer_puesto' ? '3.º y 4.º puesto' : match.phase} {match.phase === 'semifinal' ? match.playoff_slot.slice(-1) : ''}</p>
          <p className='font-bold'>{match.home_team_name} vs {match.away_team_name}</p>
          <p>{match.status === 'finalizado' ? `${match.home_score} – ${match.away_score}` : `${match.date || 'Fecha a confirmar'} · ${match.time || 'Hora a confirmar'}`}</p>
          <p>{match.venue || 'Sede a confirmar'}</p>
          <div className='flex gap-2 flex-wrap'><Button variant='outline' onClick={() => onEdit(match)}>Editar horario / partido</Button><Button disabled={!match.home_team_id || !match.away_team_id} onClick={() => onScore(match)}>Cargar resultado</Button></div>
        </article>)}
      </div></section>)}
    </>}
  </div>;
}
