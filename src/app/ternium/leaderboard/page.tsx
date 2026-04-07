'use client';

import { useState } from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useLeaderboardData, type Period } from '@/hooks/leaderboard/useLeaderboardData';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaTrophy } from 'react-icons/fa';

function getPeriodDateRange(period: Period): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  if (period === 'all') return 'Todo el historial';
  const days = period === 'week' ? 7 : 30;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return `${fmt(start)} — ${fmt(now)}`;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Últimos 7 días' },
  { value: 'month', label: 'Últimos 30 días' },
  { value: 'all', label: 'Histórico' },
];

type Tab = 'trabajadores' | 'gestores';

export default function LeaderboardPage() {
  useRoleGuard('/ternium/leaderboard');
  const [period, setPeriod] = useState<Period>('month');
  const [tab, setTab] = useState<Tab>('trabajadores');

  const { trabajadores, gestores, loading } = useLeaderboardData(period);

  const activeEntries = tab === 'trabajadores' ? trabajadores : gestores;
  const top3 = activeEntries.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#edf0f7] p-6 lg:p-10 font-sans text-slate-700">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#ff4301]/10 text-[#ff4301] text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-[#ff4301]/20">
            <span className="w-1.5 h-1.5 bg-[#ff4301] rounded-full" />
            LEADERBOARD
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ranking de empleados</h1>
          <p className="text-slate-500 mt-1.5 max-w-2xl">
            Clasificación interna basada en volumen de trabajo y tasa de éxito.
          </p>
        </header>

        {/* Period filter */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p.value
                  ? 'bg-gradient-to-r from-[#ff4301] to-[#e63d01] text-white shadow-[0_4px_12px_rgba(255,67,1,0.3)]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#ff4301]/30 hover:text-[#ff4301]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 font-medium mb-6">
          Mostrando: {getPeriodDateRange(period)}
        </p>

        {loading ? (
          <LoadingSpinner size="large" message="Calculando rankings..." fullScreen />
        ) : (
          <>
            {/* Podio top 3 */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
                  if (!entry) return <div key={visualIdx} />;
                  const isCentro = visualIdx === 1; // posición visual del centro es el 1er lugar
                  const podiumHeight = isCentro ? 'h-32' : 'h-20';
                  const medals = ['🥈', '🥇', '🥉'];
                  const ringColors = [
                    'ring-slate-300',
                    'ring-yellow-400 ring-2',
                    'ring-orange-300',
                  ];
                  return (
                    <div key={entry.userId} className={`flex flex-col items-center gap-2 ${isCentro ? '-mt-4' : 'mt-4'}`}>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff4301]/80 to-[#e03200] flex items-center justify-center text-white text-xl font-bold ring-2 ${ringColors[visualIdx]}`}>
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{entry.name}</p>
                        <p className="text-[10px] text-slate-400">{entry.roleName}</p>
                      </div>
                      <div className={`w-full ${podiumHeight} rounded-t-xl flex flex-col items-center justify-center gap-1 ${
                        isCentro
                          ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200'
                          : 'bg-white border border-slate-200'
                      }`}>
                        <span className="text-2xl">{medals[visualIdx]}</span>
                        <span className={`text-lg font-extrabold ${isCentro ? 'text-[#ff4301]' : 'text-slate-600'}`}>
                          {entry.compositeScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">puntos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.08)] overflow-hidden">
              {/* Tab header */}
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setTab('trabajadores')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    tab === 'trabajadores'
                      ? 'border-[#ff4301] text-[#ff4301]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FaTrophy size={14} />
                  Trabajadores de Planta
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tab === 'trabajadores' ? 'bg-[#ff4301]/10 text-[#ff4301]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {trabajadores.length}
                  </span>
                </button>
                <button
                  onClick={() => setTab('gestores')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    tab === 'gestores'
                      ? 'border-[#ff4301] text-[#ff4301]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FaTrophy size={14} />
                  Gestores de Órdenes
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tab === 'gestores' ? 'bg-[#ff4301]/10 text-[#ff4301]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {gestores.length}
                  </span>
                </button>

                {/* Score explanation */}
                <div className="ml-auto flex items-center px-6">
                  <p className="text-[10px] text-slate-400">
                    {tab === 'trabajadores'
                      ? 'Score = asignaciones + (1 − tasa reasignación) × 10'
                      : 'Score = revisiones + tasa aceptación × 5'
                    }
                  </p>
                </div>
              </div>

              <LeaderboardTable
                entries={activeEntries}
                mode={tab}
                emptyMessage={`Sin actividad de ${tab === 'trabajadores' ? 'asignaciones' : 'órdenes revisadas'} entre ${getPeriodDateRange(period)}. El ranking aparecerá automáticamente cuando haya registros en ese rango.`}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}
