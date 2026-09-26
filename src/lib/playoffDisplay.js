export const isThirdPlace = (match) => ['tercer_puesto', '3er_puesto'].includes(match?.phase);
export const phaseLabel = (match) => isThirdPlace(match) ? 'Tercer puesto' : ({ semifinal: 'Semifinal', final: 'Final', cuartos: 'Cuartos de final' }[match?.phase] || match?.phase?.replaceAll('_', ' ') || 'Playoffs');
export function cupBracket(matches, cup) {
  const games = matches.filter((match) => match.cup === cup);
  return {
    games,
    semis: games.filter((m) => m.phase === 'semifinal').sort((a, b) => String(a.playoff_slot || a.id).localeCompare(String(b.playoff_slot || b.id))),
    final: games.find((m) => m.phase === 'final'),
    third: games.find(isThirdPlace),
  };
}
export const CUP_COLORS = { oro: '#ffda74', plata: '#d8eeff', bronce: '#fbb589' };
