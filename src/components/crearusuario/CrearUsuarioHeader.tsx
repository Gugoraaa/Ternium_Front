/**
 * Buena practica:
 * Este componente solo presenta UI estática (sin estado ni efectos).
 * Mantenerlo "tonto" lo hace fácil de reutilizar y probar.
 */
export default function CrearUsuarioHeader() {
  return (
    <div className="p-8 pb-4 flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-black text-[#1a2b49] tracking-tight">Crear Nuevo Usuario</h1>
        <p className="text-gray-400 mt-2 font-medium">
          Registre nuevos empleados o clientes externos en el ecosistema digital de Ternium.
        </p>
      </div>
    </div>
  );
}
