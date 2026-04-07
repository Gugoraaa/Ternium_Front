export default function TarimaLoadingFallback() {
  return (
    <div className="w-full h-[360px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-xs text-slate-400 font-mono">Cargando visualizador 3D...</p>
    </div>
  );
}
