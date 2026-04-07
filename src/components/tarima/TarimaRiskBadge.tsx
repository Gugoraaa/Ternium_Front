import { getRiskColors } from '@/lib/tarima/validations';
import type { RiskLevel, ValidationViolation } from '@/lib/tarima/types';

interface TarimaRiskBadgeProps {
  riskLevel: RiskLevel;
  violations: ValidationViolation[];
  warnings: ValidationViolation[];
  className?: string;
}

export default function TarimaRiskBadge({
  riskLevel,
  violations,
  warnings,
  className = '',
}: TarimaRiskBadgeProps) {
  const colors = getRiskColors(riskLevel);
  const allMessages = [...violations, ...warnings];

  return (
    <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
        <span className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>
          {colors.label}
        </span>
      </div>

      {allMessages.length > 0 && (
        <ul className="space-y-1 mt-2">
          {allMessages.map((v, i) => (
            <li key={i} className={`text-[11px] font-medium leading-tight ${colors.text}`}>
              • {v.message}{' '}
              <span className="opacity-70">({v.percentage.toFixed(0)}%)</span>
            </li>
          ))}
        </ul>
      )}

      {allMessages.length === 0 && (
        <p className={`text-[11px] ${colors.text} opacity-80`}>
          Configuración dentro de todos los límites operativos.
        </p>
      )}
    </div>
  );
}
