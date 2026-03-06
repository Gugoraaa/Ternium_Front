import { FaRegSave } from 'react-icons/fa';

interface FormActionsProps {
  onCancel: () => void;
}

/**
 * Este componente no sabe de router ni hooks de negocio.
 * Solo recibe callbacks por props, así queda desacoplado del contenedor.
 */
export default function FormActions({ onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end items-center gap-8 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="text-gray-400 font-bold hover:text-gray-600 transition-colors tracking-tight"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="bg-[#ff3d00] hover:bg-[#e63600] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-[0_10px_20px_rgba(255,61,0,0.2)] transition-all hover:-translate-y-1 active:scale-95 text-sm"
      >
        <FaRegSave size={18} />
        GUARDAR Y CREAR CUENTA
      </button>
    </div>
  );
}
