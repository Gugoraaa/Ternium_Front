
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HiOutlineDownload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { FiSettings, FiPackage, FiTruck, FiActivity } from "react-icons/fi";
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderDetails {
  id: number;
  worker_id: string;
  client_id: string;
  product_id: number;
  specs_id: number;
  reviewed_by: string | null;
  created_at: string;
  status: string;
  contra_offer: boolean;
  product?: {
    id: number;
    pt: string;
    master: string;
    name?: string;
  };
  client?: {
    id: string;
    name: string;
  };
  specs?: {
    id: number;
    product_id?: number;
    inner_diameter: number;
    outer_diameter: number;
    minimum_shipping_weight: number;
    maximum_shipping_weight: number;
    pieces_per_package: number;
    maximum_pallet_width: number;
    shipping_packaging: string;
    width?: number;
   
  };
}

interface OrderOffer {
  id: number;
  order_id: number;
  created_by: string;
  note: string;
  reviewed_at: string | null;
  new_specs_id: number;
  specs?: OrderOfferSpecs;
}

interface OrderOfferSpecs {
  id: number;
  product_id?: number;
  inner_diameter?: number;
  outer_diameter?: number;
  width?: number;
  minimum_shipping_weight?: number;
  maximum_shipping_weight?: number;
  pieces_per_package?: number;
  maximum_pallet_width?: number;
  shipping_packaging?: string;
  
}

export default function OrdenDetail() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderOffer, setOrderOffer] = useState<OrderOffer | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = order?.status === 'Revision Operador';

  useEffect(() => {
    fetchOrderDetails();
  }, [params.slug]);

  async function fetchOrderDetails() {
    try {
      setLoading(true);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (*),
          client:client_id (*),
          specs:specs_id (*)
        `)
        .eq('id', params.slug)
        .single();

      if (orderError) throw orderError;
      
      setOrder(orderData);

      // Si hay contraoferta, buscar los detalles
      if (orderData?.contra_offer) {
        const { data: offerData, error: offerError } = await supabase
          .from('order_offers')
          .select(`
            *,
            specs:new_specs_id (*)
          `)
          .eq('order_id', params.slug)
          .single();

        if (offerError) {
          console.error('Error fetching order offer:', offerError);
        } else {
          setOrderOffer(offerData);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    const statusColors: Record<string, string> = {
      'pending': 'bg-orange-50 text-orange-600 border-orange-100',
      'approved': 'bg-green-50 text-green-600 border-green-100',
      'rejected': 'bg-red-50 text-red-600 border-red-100',
      'client_review': 'bg-blue-50 text-blue-600 border-blue-100'
    };
    return statusColors[status] || 'bg-gray-50 text-gray-600 border-gray-100';
  }

  function getStatusText(status: string) {
    const statusTexts: Record<string, string> = {
      'pending': 'Revisión Operador',
      'approved': 'Aceptado',
      'rejected': 'Rechazado',
      'client_review': 'Revisión Cliente'
    };
    return statusTexts[status] || 'Desconocido';
  }

  function isFieldModified(originalValue: any, newValue?: any) {
    // Solo considerar modificado si ambos valores existen y son diferentes
    return originalValue !== undefined && 
           originalValue !== null && 
           newValue !== undefined && 
           newValue !== null && 
           originalValue !== newValue;
    
  }

  async function approveCounterOffer() {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Aceptado' })
        .eq('id', order.id);

      if (error) throw error;

      await supabase.from('specs').insert(orderOffer?.specs)

      // Redirigir de vuelta a la lista de gestión
      router.push('/ternium/gestion');
    } catch (error) {
      console.error('Error approving counter offer:', error);
    }
  }

  async function rejectOrder() {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Rechazado' })
        .eq('id', order.id);

      if (error) throw error;

      // Redirigir de vuelta a la lista de gestión
      router.push('/ternium/gestion');
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  }

  function formatValue(value: any, unit: string = '') {
    return value !== undefined && value !== null ? `${value}${unit}` : 'N/A';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-700">
        <LoadingSpinner size="large" message="Cargando detalles de la orden..." fullScreen />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-700">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Orden no encontrada</h1>
          <button 
            onClick={() => router.back()}
            className="bg-[#ff4301] hover:bg-[#e63d01] text-white px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-700">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2 uppercase tracking-wider">
            <span>Inicio</span> <span>›</span> <span>Gestión</span> <span>›</span> <span className="text-slate-600">Detalle de Orden</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Detalle de Orden #{order.id}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Información completa y especificaciones de la orden.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-700">
          <HiOutlineDownload className="text-lg" /> Descargar PDF
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP INFO CARD */}
        <div className="bg-white rounded-2xl shadow-sm border-l-[6px] border-[#FCA5A5] p-6 flex flex-wrap justify-between items-center gap-6">
          <div className="flex flex-1 justify-between min-w-[600px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID ORDEN</p>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <FiSettings className="text-slate-300"/> #{order.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRODUCTO</p>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <FiPackage className="text-slate-300"/> {order.product?.pt || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CLIENTE</p>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <FiTruck className="text-slate-300"/> {order.client?.name || 'N/A'}
              </p>
            </div>
          </div>
          <div className={`${getStatusColor(order.status)} text-[11px] font-bold px-4 py-1.5 rounded-full border flex items-center gap-2 shrink-0`}>
            <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span> 
            {getStatusText(order.status)}
          </div>
        </div>

        {/* COMPARISON GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: ORIGINAL SPECS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h2 className="flex items-center gap-3 font-black text-slate-800 uppercase text-xs tracking-widest">
                   Especificación Original (IA)
                </h2>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-md uppercase">Sólo lectura</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Producto</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{order.product?.pt || 'N/A'}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Master ID</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{order.product?.master || 'N/A'}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Diámetro Interno</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.inner_diameter, ' mm')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Diámetro Externo</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.outer_diameter, ' mm')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Ancho</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.width, ' mm')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Peso Mínimo</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.minimum_shipping_weight, ' ton')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Peso Máximo</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.maximum_shipping_weight, ' ton')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Piezas por Paquete</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.pieces_per_package, ' pzs')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Ancho Máximo Tarima</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{formatValue(order.specs?.maximum_pallet_width, ' mm')}</p>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Embalaje</p>
                  <p className="text-lg font-bold text-slate-800 leading-none">{order.specs?.shipping_packaging || 'N/A'}</p>
                </div>
             </div>
          </div>

          {/* RIGHT: COUNTEROFFER OR NO COUNTEROFFER */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            {!order?.contra_offer ? (
              // NO HAY CONTRAOFERTA
              <div className="text-center py-12">
                <HiOutlineQuestionMarkCircle className="text-6xl text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-600 mb-2">No hay contraoferta</h2>
                <p className="text-sm text-slate-400">Esta orden no tiene una contraoferta del cliente.</p>
              </div>
            ) : (
              // HAY CONTRAOFERTA
              <>
                <h2 className="flex items-center gap-3 font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
                  <HiOutlineCheckCircle className="text-orange-600 text-xl" /> Contraoferta del Cliente
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Producto</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">{order.product?.pt || 'N/A'}</p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Diámetro Interno</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.inner_diameter), 
                         Number(orderOffer?.specs?.inner_diameter)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.inner_diameter, ' mm')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.inner_diameter, ' mm')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Diámetro Externo</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.outer_diameter), 
                         Number(orderOffer?.specs?.outer_diameter)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.outer_diameter, ' mm')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.outer_diameter, ' mm')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Ancho</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.width), 
                         Number(orderOffer?.specs?.width)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.width, ' mm')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.width, ' mm')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Peso Mínimo</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.minimum_shipping_weight), 
                         Number(orderOffer?.specs?.minimum_shipping_weight)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.minimum_shipping_weight, ' ton')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.minimum_shipping_weight, ' ton')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Peso Máximo</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.maximum_shipping_weight), 
                         Number(orderOffer?.specs?.maximum_shipping_weight)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.maximum_shipping_weight, ' ton')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.maximum_shipping_weight, ' ton')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Piezas por Paquete</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.pieces_per_package), 
                         Number(orderOffer?.specs?.pieces_per_package)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.pieces_per_package, ' pzs')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.pieces_per_package, ' pzs')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Ancho Máximo Tarima</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(
                         Number(order.specs?.maximum_pallet_width), 
                         Number(orderOffer?.specs?.maximum_pallet_width)
                       ) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {formatValue(orderOffer?.specs?.maximum_pallet_width, ' mm')}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         formatValue(order.specs?.maximum_pallet_width, ' mm')
                       )}
                     </p>
                   </div>
                   
                   <div className="p-4 rounded-xl border border-slate-50 bg-[#FBFBFC]">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">Embalaje</p>
                     <p className="text-lg font-bold text-slate-800 leading-none">
                       {isFieldModified(order.specs?.shipping_packaging, orderOffer?.specs?.shipping_packaging) ? (
                         <div className="inline-flex flex-col">
                           <span className="border-2 border-[#FF4D4D] text-[#FF4D4D] font-black px-4 py-1 rounded-lg text-base shadow-sm shadow-red-50">
                             {orderOffer?.specs?.shipping_packaging || 'N/A'}
                           </span>
                           <span className="text-[9px] font-black text-[#FF4D4D] mt-1.5 uppercase tracking-tighter">
                             ⚠️ Modificado por cliente
                           </span>
                         </div>
                       ) : (
                         order.specs?.shipping_packaging || 'N/A'
                       )}
                     </p>
                   </div>
                </div>

                {orderOffer?.note && (
                  <div className="mt-6 bg-[#F1F5F9]/50 p-5 rounded-2xl border-l-4 border-slate-300">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                      <FiActivity className="text-slate-400" /> Comentario del cliente
                    </p>
                    <p className="text-xs text-slate-600 italic leading-relaxed font-medium">
                      "{orderOffer.note}"
                    </p>
                    <div className="mt-3 text-[9px] text-slate-400">
                      <span className="font-medium">Creado por:</span> {orderOffer.created_by} | 
                      <span className="font-medium ml-2">Revisado:</span> {orderOffer.reviewed_at ? new Date(orderOffer.reviewed_at).toLocaleDateString('es-ES') : 'Pendiente'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        {canEdit && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                 <FiSettings className="text-slate-400" /> Acciones de Gestión
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium italic">
                {order?.contra_offer 
                  ? "Revisa la contraoferta del cliente y toma una decisión." 
                  : "Gestiona el estado y aprobación de esta orden."
                }
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
              {order?.contra_offer ? (
                <>
                  <button 
                    onClick={approveCounterOffer}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-100"
                  >
                    <HiOutlineCheckCircle className="text-lg" /> Aceptar Contraoferta
                  </button>
                  <button 
                    onClick={rejectOrder}
                    className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-100"
                  >
                    <HiOutlineXCircle className="text-lg" /> Rechazar Contraoferta
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 md:flex-none bg-[#FF4500] hover:bg-[#E63E00] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-100">
                    <HiOutlineCheckCircle className="text-lg" /> Aprobar Orden
                  </button>
                  <button className="flex-1 md:flex-none bg-[#475569] hover:bg-[#334155] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-800">
                    <HiOutlineXCircle className="text-lg" /> Rechazar Orden
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {!canEdit && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-md">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-sm font-medium mb-2">
                <HiOutlineQuestionMarkCircle className="text-lg" />
                Modo Lectura
              </div>
              <p className="text-slate-400 text-sm">Esta orden no está disponible para edición en estado actual.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

