'use client';

import { useState } from 'react';
import { 
  FiSearch, FiGrid, FiUser, FiZap, FiSave, 
   FiCheckCircle 
} from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useUser } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CapturaOrden = () => {
  const { user } = useUser();
  const router = useRouter();
  

  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    producto: '',
    masterId: '',
    cliente: '',
    clienteId: ''
  });
  const [specData, setSpecData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [clienteSuggestions, setClienteSuggestions] = useState<any[]>([]);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [masterSuggestions, setMasterSuggestions] = useState<any[]>([]);
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const supabase = createClient();

  const calculateProgress = () => {
    let completed = 0;
    if (formData.producto && formData.masterId && formData.cliente) completed++;
    if (specData) completed++;
    if (isChecked) completed++;
    
    return Math.round((completed / 3) * 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'cliente') searchClientes(value);
    else if (field === 'producto') searchProductos(value);
    else if (field === 'masterId') searchMasters(value, formData.producto);
  };

  const searchClientes = async (query: string) => {
    if (query.length < 2) {
      setClienteSuggestions([]);
      setShowClienteDropdown(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setClienteSuggestions(data || []);
      setShowClienteDropdown(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    }
  };

  const selectCliente = (cliente: any) => {
    setFormData(prev => ({ ...prev, cliente: cliente.name, clienteId: cliente.id }));
    setShowClienteDropdown(false);
    setClienteSuggestions([]);
  };

  const searchProductos = async (query: string) => {
    try {
      let req = supabase.from('product').select('pt').limit(8);
      if (query.length > 0) req = req.ilike('pt', `%${query}%`);

      const { data, error } = await req;
      if (error) throw error;

      const unique = [...new Set((data || []).map((p: any) => p.pt))].map(pt => ({ pt }));
      setProductSuggestions(unique);
      setShowProductDropdown(unique.length > 0);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    }
  };

  const selectProducto = (pt: string) => {
    setFormData(prev => ({ ...prev, producto: pt, masterId: '' }));
    setShowProductDropdown(false);
    setProductSuggestions([]);
  };

  const searchMasters = async (query: string, currentPt?: string) => {
    try {
      let req = supabase.from('product').select('master').limit(8);
      if (query.length > 0) req = req.ilike('master', `%${query}%`);

      const pt = currentPt ?? formData.producto;
      if (pt) req = req.eq('pt', pt);

      const { data, error } = await req;
      if (error) throw error;

      const unique = [...new Set((data || []).map((p: any) => p.master))].map(m => ({ master: m }));
      setMasterSuggestions(unique);
      setShowMasterDropdown(unique.length > 0);
    } catch (error) {
      console.error('Error al buscar masters:', error);
    }
  };

  const selectMaster = (master: string) => {
    setFormData(prev => ({ ...prev, masterId: master }));
    setShowMasterDropdown(false);
    setMasterSuggestions([]);
  };

  const handleGenerateOrder = async () => {
    if (!isChecked) {
      toast.error('Por favor valida la especificación antes de generar la orden');
      return;
    }

    if (!productData || !specData || !formData.clienteId) {
      toast.error('Faltan datos para generar la orden');
      return;
    }

    setLoading(true);
    toast.loading('Generando orden...', { id: 'generateOrder' });

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          worker_id: user?.id,
          client_id: formData.clienteId,
          product_id: productData.id,
          specs_id: specData.id,
          reviewed_by: null
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      toast.success('Orden generada exitosamente', { id: 'generateOrder' });
      router.push(`/ternium/gestion`);
      
      // Limpiar formulario después de éxito
      setTimeout(() => {
        setFormData({
          producto: '',
          masterId: '',
          cliente: '',
          clienteId: ''
        });
        setSpecData(null);
        setProductData(null);
        setIsChecked(false);
      }, 2000);

    } catch (error: any) {
      console.error('Error al generar orden:', error);
      toast.error(error.message || 'Error al generar orden', { id: 'generateOrder' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSpec = async () => {
    if (!formData.producto || !formData.masterId || !formData.cliente) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    toast.loading('Generando especificación...', { id: 'generateSpec' });

    try {
      const { data: productDataResult, error: productError } = await supabase
        .from('product')
        .select('id')
        .eq('pt', formData.producto)
        .eq('master', formData.masterId)
        .single();

      if (productError || !productDataResult) {
        toast.error("Producto no encontrado");
        return;
      }

      setProductData(productDataResult);

      const { data: specsData, error: specsError } = await supabase
        .from('specs')
        .select('*')
        .eq('product_id', productDataResult.id)
        .limit(1)
        .single();

      if (specsError || !specsData) {
        toast.error("Especificaciones no encontradas para este producto");
        return;
      }

      setSpecData(specsData);
      toast.success('Especificación generada exitosamente', { id: 'generateSpec' });
    } catch (error: any) {
      console.error('Error al generar especificación:', error);
      toast.error(error.message || 'Error al generar especificación', { id: 'generateSpec' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* COLUMNA PRINCIPAL (IZQUIERDA) */}
        <div className="flex-1 space-y-6">
          
          {/* SECCIÓN 1: CAPTURA BASE */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <HiOutlineDocumentText className="text-[#ff4301] text-xl" />
              <h2 className="font-bold text-slate-800">Captura base de la orden</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Producto Terminado</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar código o nombre del producto..." 
                    value={formData.producto}
                    onChange={(e) => handleInputChange('producto', e.target.value)}
                    onFocus={() => searchProductos(formData.producto)}
                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                  {showProductDropdown && productSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {productSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectProducto(item.pt)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                        >
                          {item.pt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                  label="Master ID" 
                  placeholder="Ej. MST-2024-8821" 
                  icon={<FiGrid />}
                  value={formData.masterId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('masterId', e.target.value)}
                  onFocus={() => searchMasters(formData.masterId, formData.producto)}
                  onBlur={() => setTimeout(() => setShowMasterDropdown(false), 150)}
                  suggestions={masterSuggestions}
                  showDropdown={showMasterDropdown}
                  onSelect={(item: any) => selectMaster(item.master)}
                  getSuggestionLabel={(item: any) => item.master}
                />
                <InputGroup 
                  label="Cliente" 
                  placeholder="Buscar cliente..." 
                  icon={<FiUser />}
                  value={formData.cliente}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cliente', e.target.value)}
                  onFocus={() => searchClientes(formData.cliente)}
                  onBlur={() => setTimeout(() => setShowClienteDropdown(false), 150)}
                  suggestions={clienteSuggestions}
                  showDropdown={showClienteDropdown}
                  onSelect={selectCliente}
                  getSuggestionLabel={(item: any) => item.name}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleGenerateSpec}
                  disabled={loading}
                  className="bg-[#ff4301] hover:bg-[#e63d01] disabled:bg-gray-400 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-orange-100 disabled:shadow-none"
                >
                  <FiZap className="fill-current" /> 
                  {loading ? 'Generando...' : 'Generar Especificación'}
                </button>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: ESPECIFICACIÓN GENERADA */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-800">Especificación generada</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">🕒 24 Oct, 10:42 AM</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisplayField label="DIÁMETRO INTERNO" value={specData?.inner_diameter} unit="mm" />
                <DisplayField label="DIÁMETRO EXTERNO" value={specData?.outer_diameter} unit="mm" />
                <DisplayField label="PESOS (MÍN/MÁX)" value={`${specData?.minimum_shipping_weight || ''} - ${specData?.maximum_shipping_weight || ''}`} unit="ton" />
                <DisplayField label="PIEZAS POR PAQUETE" value={specData?.pieces_per_package} unit="pzs" />
                <DisplayField label="ANCHO TARIMA" value={specData?.maximum_pallet_width} unit="mm" />
                <DisplayField label="EMBALAJE" value={specData?.shipping_packaging} />
              </div>

              

              {/* Validación y Responsabilidad */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 accent-[#ff4301] cursor-pointer" 
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      Confirmo que he revisado y validado todos los parámetros generados para esta orden.
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      La validación implica conformidad operativa con los valores calculados por el modelo.
                    </p>
                  </div>
                  
                </div>

                <div className="bg-orange-50/50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                  <p className="text-[10px] font-black text-orange-600 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <FiCheckCircle /> Responsabilidad Operativa
                  </p>
                  <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                    Al confirmar esta especificación, el usuario asume validación operativa completa. Cualquier desviación en producción resultante de estos parámetros será trazable a esta confirmación digital.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR (DERECHA) */}
        <div className="w-full lg:w-[350px] space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* Cabecera del Sidebar */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-slate-800 text-lg tracking-tight">ORDEN #{formData.masterId || 'NUEVA'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Creado: Hoy, 09:30 AM</p>
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Borrador</span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all duration-300" style={{width: `${calculateProgress()}%`}}></div>
                </div>
                <p className="text-right text-[10px] font-bold text-orange-600 mt-1.5">{calculateProgress()}% Completado</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lista de Verificación</h4>
              <ul className="space-y-4">
                <CheckItem 
                  done={formData.producto && formData.masterId && formData.cliente}
                  title="Datos Base Capturados" 
                  sub="Cliente y producto definidos" 
                  formData={formData}
                  specData={specData}
                  isChecked={isChecked}
                />
                <CheckItem 
                  done={!!specData}
                  title="Especificación Generada" 
                  sub="Valores calculados por modelo" 
                  formData={formData}
                  specData={specData}
                  isChecked={isChecked}
                />
                <CheckItem 
                  done={isChecked}
                  title="Validación Final" 
                  sub="Pendiente de envío" 
                  formData={formData}
                  specData={specData}
                  isChecked={isChecked}
                />
              </ul>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button 
                onClick={handleGenerateOrder}
                disabled={loading || !isChecked}
                className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                  loading || !isChecked 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-none' 
                    : 'bg-[#ff4301] hover:bg-[#e63d01] text-white shadow-orange-100'
                }`}
              >
                <FiSave /> Generar Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const InputGroup = ({ label, placeholder, icon, value, onChange, onFocus, onBlur, suggestions, showDropdown, onSelect, getSuggestionLabel }: any) => (
  <div className="flex-1 relative">
    <label className="text-xs font-bold text-slate-500 block mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
      />
      {showDropdown && suggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {suggestions.map((item: any, idx: number) => (
            <button
              key={item.id ?? idx}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
            >
              {getSuggestionLabel ? getSuggestionLabel(item) : item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

const DisplayField = ({ label, value, unit }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{label}</label>
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <span className="font-bold text-slate-800">{value}</span>
      {unit && <span className="text-[10px] font-bold text-slate-400">{unit}</span>}
    </div>
  </div>
);

const CheckItem = ({ done, title, sub, formData, specData, isChecked }: any) => {
  const getCheckState = () => {
    // Determinar el estado según el contexto
    if (title === "Datos Base Capturados") {
      return formData?.producto && formData?.masterId && formData?.cliente;
    } else if (title === "Especificación Generada") {
      return !!specData;
    } else if (title === "Validación Final") {
      return isChecked;
    }
    return false;
  };

  const isCompleted = getCheckState();

  return (
    <li className="flex gap-3">
      <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
        isCompleted 
          ? 'bg-green-50 border-green-500 text-green-600' 
          : 'border-slate-200'
      }`}>
        {isCompleted && <FiCheckCircle size={14} />}
      </div>
      <div>
        <p className={`text-xs font-bold leading-none ${
          isCompleted ? 'text-slate-700' : 'text-slate-400'
        }`}>{title}</p>
        <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
      </div>
    </li>
  );
};

export default CapturaOrden;