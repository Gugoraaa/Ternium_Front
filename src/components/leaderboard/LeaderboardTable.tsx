import type { LeaderboardEntry } from '@/hooks/leaderboard/useLeaderboardData';

const medalColors = [
  'bg-yellow-50 border-yellow-200 text-yellow-700',   // 1st
  'bg-slate-100 border-slate-200 text-slate-600',      // 2nd
  'bg-orange-50 border-orange-200 text-orange-700',    // 3rd
];

const medals = ['🥇', '🥈', '🥉'];

const rowHighlight = [
  'bg-yellow-50/60',
  'bg-slate-50/60',
  'bg-orange-50/40',
];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  mode: 'trabajadores' | 'gestores';
  emptyMessage?: string;
}

export default function LeaderboardTable({ entries, mode, emptyMessage }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        {emptyMessage ?? 'No hay datos para este periodo.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gradient-to-r from-slate-50 to-[#f8fafc] border-b border-slate-100">
          <tr className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            <th className="px-6 py-4 w-16">Pos.</th>
            <th className="px-6 py-4">Trabajador</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4 text-center">
              {mode === 'trabajadores' ? 'Asignaciones' : 'Revisadas'}
            </th>
            {mode === 'trabajadores' ? (
              <>
                <th className="px-6 py-4 text-center">Completadas</th>
                <th className="px-6 py-4 text-center">Reasignaciones</th>
              </>
            ) : (
              <>
                <th className="px-6 py-4 text-center">Aceptadas</th>
                <th className="px-6 py-4 text-center">Rechazadas</th>
              </>
            )}
            <th className="px-6 py-4 text-center">Tasa</th>
            <th className="px-6 py-4 text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rowBg = isTop3 ? rowHighlight[entry.rank - 1] : 'hover:bg-[#fff6f2]';

            const good = mode === 'trabajadores' ? entry.accepted : entry.accepted;
            const bad = mode === 'trabajadores' ? entry.reasignaciones : entry.rejected;
            const rate = entry.total > 0 ? Math.round((good / entry.total) * 100) : 0;

            return (
              <tr key={entry.userId} className={`transition-colors duration-150 ${rowBg}`}>
                {/* Posición */}
                <td className="px-6 py-4">
                  {isTop3 ? (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${medalColors[entry.rank - 1]}`}>
                      {medals[entry.rank - 1]}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-400 ml-2">#{entry.rank}</span>
                  )}
                </td>

                {/* Nombre */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4301]/80 to-[#e03200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{entry.name}</span>
                  </div>
                </td>

                {/* Rol */}
                <td className="px-6 py-4">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {entry.roleName}
                  </span>
                </td>

                {/* Total */}
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-slate-700">{entry.total}</span>
                </td>

                {/* Good (completed / accepted) */}
                <td className="px-6 py-4 text-center">
                  <span className="text-emerald-700 font-semibold">{good}</span>
                </td>

                {/* Bad (reasignaciones / rejected) */}
                <td className="px-6 py-4 text-center">
                  <span className={`font-semibold ${bad > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                    {bad}
                  </span>
                </td>

                {/* Tasa */}
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{rate}%</span>
                  </div>
                </td>

                {/* Score */}
                <td className="px-6 py-4 text-right">
                  <span className={`text-base font-extrabold ${isTop3 ? 'text-[#ff4301]' : 'text-slate-600'}`}>
                    {entry.compositeScore.toFixed(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
