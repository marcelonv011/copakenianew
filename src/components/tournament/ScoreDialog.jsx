import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMatch } from '@/services/matchService';
import { validateScore } from '@/lib/tournamentEntry';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ScoreDialog({ match, tournamentId, onClose, onSaved }) {
  const [home, setHome] = useState(match.home_score ?? '');
  const [away, setAway] = useState(match.away_score ?? '');
  const [error, setError] = useState('');
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () => updateMatch(match.id, { home_score: Number(home), away_score: Number(away), status: 'finalizado' }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['matches', tournamentId] });
      onSaved('Resultado guardado. Las posiciones se actualizaron.');
      onClose();
    },
  });
  const valid = !validateScore(home, away);
  return <Dialog open onOpenChange={(open) => { if (!open && !save.isPending) onClose(); }}>
    <DialogContent className='bg-card border-border max-w-md'>
      <DialogHeader><DialogTitle>{match.status === 'finalizado' ? 'Editar resultado' : 'Cargar resultado'}</DialogTitle><DialogDescription>{match.date} {match.time} {match.venue ? `· ${match.venue}` : ''}. Al guardar, el partido queda finalizado.</DialogDescription></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); if (save.isPending) return; const message = validateScore(home, away); setError(message); if (!message) save.mutate(); }}>
        <fieldset disabled={save.isPending} className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <label className='text-sm space-y-2'><span className='block break-words'>{match.home_team_name || 'Local'}</span><Input autoFocus type='number' min='0' step='1' inputMode='numeric' required value={home} onFocus={(e) => e.target.select()} onChange={(e) => setHome(e.target.value)} className='text-center text-2xl h-16' /></label>
            <label className='text-sm space-y-2'><span className='block break-words'>{match.away_team_name || 'Visitante'}</span><Input type='number' min='0' step='1' inputMode='numeric' required value={away} onFocus={(e) => e.target.select()} onChange={(e) => setAway(e.target.value)} className='text-center text-2xl h-16' /></label>
          </div>
          {valid && <p role='status' className='rounded-lg bg-primary/10 p-3 text-sm'>Ganador: <strong>{Number(home) > Number(away) ? match.home_team_name : match.away_team_name}</strong> · {home} – {away}</p>}
          {(error || save.isError) && <p role='alert' className='text-sm text-destructive'>{error || save.error?.message || 'No se pudo guardar. Los puntos siguen acá para volver a intentar.'}</p>}
          <div className='flex justify-end gap-2'><Button type='button' variant='outline' onClick={onClose}>Cancelar</Button><Button type='submit'>{save.isPending ? 'Guardando…' : 'Guardar resultado'}</Button></div>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>;
}
