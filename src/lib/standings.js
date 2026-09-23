export function calculateStandingsByGroup(matches, tournamentTeams, groupNames) {

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
}
