'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  HiOutlineClipboardList, 
  HiOutlineSparkles, 
  HiOutlineExclamationCircle,
  HiOutlineMailOpen,
  HiOutlineTrendingUp,
  HiOutlineX
} from "react-icons/hi";
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import AcceptOrderButton from '@/components/AcceptOrderButton';
import { useUser } from '@/context/AuthContext';
import type { OrderSpecs,OrderOffer,OrderOfferWithSpecs,OrderDetails } from '@/types/orders';




export default function DetalleEdicionOrden() {
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const slug = params.slug;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [orderOffer, setOrderOffer] = useState<OrderOfferWithSpecs | null>(null);
    const [editedSpecs, setEditedSpecs] = useState<OrderSpecs | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [clientNote, setClientNote] = useState<string>("");

    useEffect(() => {
        fetchOrderDetails();
    }, [params.slug]);

    useEffect(() => {
        if (!order) return;
        
        if (orderOffer?.specs) {
            setEditedSpecs(orderOffer.specs);
        } else {
            setEditedSpecs({
                id: order.specs?.id,
                product_id: order.specs?.product_id,
                inner_diameter: order.specs?.inner_diameter,
                outer_diameter: order.specs?.outer_diameter,
                width: order.specs?.width,
                minimum_shipping_weight: order.specs?.minimum_shipping_weight,
                maximum_shipping_weight: order.specs?.maximum_shipping_weight,
                pieces_per_package: order.specs?.pieces_per_package,
                maximum_pallet_width: order.specs?.maximum_pallet_width,
                shipping_packaging: order.specs?.shipping_packaging,
            });
        }
    }, [order, orderOffer]);

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
                        specs:order_offers_specs (*)
                    `)
                    .eq('order_id', params.slug)
                    .single();

                if (offerError) {
                    console.error('Error fetching order offer:', offerError);
                } else {
                    console.log('Order offer data:', offerData);
                    console.log('Original specs:', orderData.specs);
                    console.log('Offer specs:', offerData.specs);
                    setOrderOffer(offerData);
                }
            } else {
                console.log('No contra_offer found for order:', orderData?.id);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    }

    

    function resetToOriginalSpecs() {
        if (!order?.specs) return;
        setEditedSpecs({
            id: order.specs.id,
            product_id: order.specs.product_id,
            inner_diameter: order.specs.inner_diameter,
            outer_diameter: order.specs.outer_diameter,
            width: order.specs.width,
            minimum_shipping_weight: order.specs.minimum_shipping_weight,
            maximum_shipping_weight: order.specs.maximum_shipping_weight,
            pieces_per_package: order.specs.pieces_per_package,
            maximum_pallet_width: order.specs.maximum_pallet_width,
            shipping_packaging: order.specs.shipping_packaging,
        });
    }

    function formatValue(value: any, unit: string = '') {
        return value !== undefined && value !== null ? `${value}${unit}` : 'N/A';
    }

    function getInputValue(value: any) {
        return value !== undefined && value !== null ? value : '';
    }

    function isFieldModified(originalValue: any, newValue?: any) {
        return newValue !== undefined && newValue !== null && originalValue !== newValue;
    }

    async function rejectOrder() {
        if (!order) return;
        
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'Rechazado' })
                .eq('id', order.id);

            if (error) throw error;

            // Cerrar modal y redirigir
            setShowRejectModal(false);
            router.push('/ternium/clientes');
        } catch (error) {
            console.error('Error rejecting order:', error);
        }
    }

    async function requestReview() {
        if (!order || !order.specs) return;
        
        try {
            // Primero cambiar el status a 'Revision Operador'
            

            // Si hay cambios en los specs, insertarlos en order_offers_specs
            const hasChanges = order.specs && editedSpecs && Object.keys(editedSpecs).some(key => {
                const specKey = key as keyof OrderSpecs;
                const editedValue = editedSpecs[specKey];
                const originalValue = order.specs![specKey];
                
                return editedValue !== undefined && 
                       editedValue !== null && 
                       originalValue !== editedValue;
            });

            if (hasChanges && editedSpecs) {
                // Primero insertar todos los specs (modificados y no modificados) en order_offers_specs
                const allSpecsToInsert = {
                    inner_diameter: editedSpecs.inner_diameter ?? order.specs!.inner_diameter,
                    outer_diameter: editedSpecs.outer_diameter ?? order.specs!.outer_diameter,
                    width: editedSpecs.width ?? order.specs.width,
                    minimum_shipping_weight: editedSpecs.minimum_shipping_weight ?? order.specs.minimum_shipping_weight,
                    maximum_shipping_weight: editedSpecs.maximum_shipping_weight ?? order.specs.maximum_shipping_weight,
                    pieces_per_package: editedSpecs.pieces_per_package ?? order.specs.pieces_per_package,
                    maximum_pallet_width: editedSpecs.maximum_pallet_width ?? order.specs.maximum_pallet_width,
                    shipping_packaging: editedSpecs.shipping_packaging ?? order.specs.shipping_packaging,
                    product_id: order.product_id
                };

                const { data: specsData, error: specsError } = await supabase
                    .from('order_offers_specs')
                    .insert(allSpecsToInsert)
                    .select()
                    .single();

                if (specsError) throw specsError;

                const { data: offerData, error: offerError } = await supabase
                    .from('order_offers')
                    .insert({
                        order_id: order.id,
                        created_by: user?.id , 
                        note: clientNote== "" ? "No hay comentario proporcionado" : clientNote,
                        new_specs_id: specsData.id,
                        
                    })
                    .select()
                    .single();

                if (offerError) throw offerError;

                await supabase
                    .from('orders')
                    .update({ 
                        contra_offer: true,
                    })
                    .eq('id', order.id);
                
                const { error: statusError } = await supabase
                .from('orders')
                .update({ status: 'Revision Operador' })
                .eq('id', order.id);

            if (statusError) throw statusError;
            }

            // Redirigir a la lista de órdenes
            router.push('/ternium/clientes');
        } catch (error) {
            console.error('Error requesting review:', error);
        }
    }

    
    function openRejectModal() {
        setShowRejectModal(true);
    }

    function closeRejectModal() {
        setShowRejectModal(false);
    }

    const canEdit = order?.status === 'Revision Cliente';
    const demoMode = false; // Cambiar a true para ver cambios de ejemplo
    let demoOrderOffer = orderOffer;
    
    if (demoMode && order && !orderOffer) {
        demoOrderOffer = {
            specs: {
                outer_diameter: 1280,
                width: 1250,
                shipping_packaging: "Caja de madera"
            }
        } as OrderOffer;
    }

    const effectiveSpecs: OrderSpecs = {
        ...(orderOffer?.specs ?? {}),
        ...(editedSpecs ?? {})
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans text-slate-700">
                <LoadingSpinner size="large" message="Cargando detalles de la orden..." fullScreen />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans text-slate-700">
                <div className="max-w-5xl mx-auto text-center py-20">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Orden no encontrada</h1>
                    <button 
                        onClick={() => router.back()}
                        className="bg-[#ff4d17] hover:bg-[#e64010] text-white px-6 py-2 rounded-lg"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans text-slate-700">
      
      {/* NAVEGACIÓN Y TÍTULO */}
      <div className="max-w-5xl mx-auto mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
          <span>Inicio</span> <span>›</span> <span>Órdenes</span> <span>›</span> <span className="text-slate-600">Detalle {slug}</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Detalle y Edición de Orden #{order.id}
        </h1>
        <div className="flex gap-4 mt-1 text-sm font-medium">
          <span className="text-slate-400 font-bold uppercase tracking-tight">ID de Orden: <span className="text-slate-700">{order.id}</span></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 font-bold uppercase tracking-tight">Master: <span className="text-slate-700">{order.product?.master || 'N/A'}</span></span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* CARD 1: RESUMEN DE ORDEN */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <HiOutlineClipboardList className="text-orange-500 text-xl" /> Resumen de Orden
            </h2>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
              Datos Fijos
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Cliente</p>
              <p className="font-bold text-slate-800">{order.client?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Producto</p>
              <p className="font-bold text-slate-800">{ order.product?.pt || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Fecha de Solicitud</p>
              <p className="font-bold text-slate-800">{order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* CARD 2: ESPECIFICACIÓN PROPUESTA (FORMULARIO) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-slate-800 text-lg">Especificación Propuesta</h2>
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter">
                <HiOutlineSparkles className="text-sm" /> Generado por modelo IA
              </span>
              {!canEdit && (
                <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 uppercase tracking-tighter">
                  Modo Lectura
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetToOriginalSpecs}
                disabled={!canEdit || !order?.specs}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-[11px] hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rehacer
              </button>
              <span className="text-[11px] text-slate-400 italic">Última actualización: hace 12 min</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Diámetro Interno */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diámetro Interno (mm)</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.inner_diameter ?? demoOrderOffer?.specs?.inner_diameter ?? order.specs?.inner_diameter))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), inner_diameter: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.inner_diameter, effectiveSpecs?.inner_diameter) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.inner_diameter, effectiveSpecs?.inner_diameter) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.inner_diameter)}</span></p>
              )}
            </div>

            {/* Diámetro Externo */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diámetro Externo (mm)</label>
                {isFieldModified(order.specs?.outer_diameter, effectiveSpecs?.outer_diameter) && (
                  <span className="text-[9px] font-black text-white bg-orange-400 px-2 py-0.5 rounded uppercase">Modificado por cliente</span>
                )}
              </div>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.outer_diameter ?? demoOrderOffer?.specs?.outer_diameter ?? order.specs?.outer_diameter))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), outer_diameter: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none ${
                    isFieldModified(order.specs?.outer_diameter, effectiveSpecs?.outer_diameter) 
                        ? 'bg-orange-50/30 border-2 border-orange-400' 
                        : 'bg-slate-50 border border-slate-200'
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.outer_diameter, effectiveSpecs?.outer_diameter) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.outer_diameter)}</span></p>
              )}
            </div>

            {/* Ancho */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ancho (mm)</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.width ?? demoOrderOffer?.specs?.width ?? order.specs?.width))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), width: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.width, effectiveSpecs?.width) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.width, effectiveSpecs?.width) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.width)}</span></p>
              )}
            </div>

            {/* Peso Mínimo */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso Mínimo (kg)</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.minimum_shipping_weight ?? demoOrderOffer?.specs?.minimum_shipping_weight ?? order.specs?.minimum_shipping_weight))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), minimum_shipping_weight: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.minimum_shipping_weight, effectiveSpecs?.minimum_shipping_weight) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.minimum_shipping_weight, effectiveSpecs?.minimum_shipping_weight) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.minimum_shipping_weight)}</span></p>
              )}
            </div>

            {/* Peso Máximo */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso Máximo (kg)</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.maximum_shipping_weight ?? demoOrderOffer?.specs?.maximum_shipping_weight ?? order.specs?.maximum_shipping_weight))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), maximum_shipping_weight: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.maximum_shipping_weight, effectiveSpecs?.maximum_shipping_weight) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.maximum_shipping_weight, effectiveSpecs?.maximum_shipping_weight) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.maximum_shipping_weight)}</span></p>
              )}
            </div>

            {/* Piezas por Paquete */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Piezas por Paquete</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.pieces_per_package ?? demoOrderOffer?.specs?.pieces_per_package ?? order.specs?.pieces_per_package))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), pieces_per_package: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.pieces_per_package, effectiveSpecs?.pieces_per_package) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.pieces_per_package, effectiveSpecs?.pieces_per_package) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.pieces_per_package)}</span></p>
              )}
            </div>

            {/* Ancho Máximo Tarima */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ancho Máximo Tarima (mm)</label>
              <input 
                type="number" 
                step="1"
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.maximum_pallet_width ?? demoOrderOffer?.specs?.maximum_pallet_width ?? order.specs?.maximum_pallet_width))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), maximum_pallet_width: v === '' ? undefined : Number(v) }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.maximum_pallet_width, effectiveSpecs?.maximum_pallet_width) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.maximum_pallet_width, effectiveSpecs?.maximum_pallet_width) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{formatValue(order.specs?.maximum_pallet_width)}</span></p>
              )}
            </div>

            {/* Embalaje */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Embalaje</label>
              <input 
                type="text" 
                disabled={!canEdit}
                value={getInputValue((editedSpecs?.shipping_packaging ?? demoOrderOffer?.specs?.shipping_packaging ?? order.specs?.shipping_packaging))}
                onChange={(e) => {
                    if (!canEdit) return;
                    const v = e.target.value;
                    setEditedSpecs((prev) => ({ ...(prev ?? {}), shipping_packaging: v === '' ? undefined : v }));
                }}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                    isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging) ? 'bg-orange-50/30 border-2 border-orange-400' : ''
                } ${!canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} 
              />
              {isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging) && (
                <p className="text-[10px] text-slate-400">Valor propuesto: <span className="line-through italic">{order.specs?.shipping_packaging || 'N/A'}</span></p>
              )}
            </div>

            {/* Nota del Cliente */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nota del Cliente</label>
              <textarea 
                disabled={!canEdit}
                value={clientNote}
                onChange={(e) => {
                    if (!canEdit) return;
                    setClientNote(e.target.value);
                }}
                placeholder="Agrega un comentario sobre los cambios solicitados..."
                rows={3}
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none ${
                    !canEdit ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                }`} 
              />
            </div>

          </div>
        </section>

        {/* CARD 3: CAMBIOS DETECTADOS */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <span className="text-orange-500 font-black text-xl">⇄</span>
            <h2 className="font-bold text-slate-800">Cambios Detectados</h2>
            <span className="text-xs text-slate-400 ml-auto">
              {demoOrderOffer ? 'Contraoferta encontrada' : 'Sin contraoferta'} | 
              Campos modificados: {[
                isFieldModified(Number(order.specs?.inner_diameter), Number(effectiveSpecs?.inner_diameter)),
                isFieldModified(Number(order.specs?.outer_diameter), Number(effectiveSpecs?.outer_diameter)),
                isFieldModified(Number(order.specs?.width), Number(effectiveSpecs?.width)),
                isFieldModified(Number(order.specs?.minimum_shipping_weight), Number(effectiveSpecs?.minimum_shipping_weight)),
                isFieldModified(Number(order.specs?.maximum_shipping_weight), Number(effectiveSpecs?.maximum_shipping_weight)),
                isFieldModified(Number(order.specs?.pieces_per_package), Number(effectiveSpecs?.pieces_per_package)),
                isFieldModified(Number(order.specs?.maximum_pallet_width), Number(effectiveSpecs?.maximum_pallet_width)),
                isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging)
              ].filter(Boolean).length}
            </span>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="text-left px-8 py-3">Parámetro</th>
                  <th className="text-left px-8 py-3">Valor Original</th>
                  <th className="text-right px-8 py-3">Valor Cliente</th>
                </tr>
              </thead>
              <tbody>
                {isFieldModified(
                  Number(order.specs?.inner_diameter), 
                  Number(effectiveSpecs?.inner_diameter)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Diámetro Interno</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.inner_diameter, ' mm')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.inner_diameter, ' mm')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.outer_diameter), 
                  Number(effectiveSpecs?.outer_diameter)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Diámetro Externo</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.outer_diameter, ' mm')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.outer_diameter, ' mm')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.width), 
                  Number(effectiveSpecs?.width)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Ancho</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.width, ' mm')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.width, ' mm')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.minimum_shipping_weight), 
                  Number(effectiveSpecs?.minimum_shipping_weight)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Peso Mínimo</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.minimum_shipping_weight, ' kg')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.minimum_shipping_weight, ' kg')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.maximum_shipping_weight), 
                  Number(effectiveSpecs?.maximum_shipping_weight)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Peso Máximo</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.maximum_shipping_weight, ' kg')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.maximum_shipping_weight, ' kg')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.pieces_per_package), 
                  Number(effectiveSpecs?.pieces_per_package)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Piezas por Paquete</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.pieces_per_package)}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.pieces_per_package)} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(
                  Number(order.specs?.maximum_pallet_width), 
                  Number(effectiveSpecs?.maximum_pallet_width)
                ) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Ancho Máximo Tarima</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{formatValue(order.specs?.maximum_pallet_width, ' mm')}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {formatValue(effectiveSpecs?.maximum_pallet_width, ' mm')} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging) && (
                  <tr className="border-t border-slate-50">
                    <td className="px-8 py-4 font-bold text-slate-700">Embalaje</td>
                    <td className="px-8 py-4 text-slate-300 font-medium">{order.specs?.shipping_packaging || 'N/A'}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-orange-600 font-black flex items-center justify-end gap-1">
                        {effectiveSpecs?.shipping_packaging || 'N/A'} <HiOutlineTrendingUp className="text-lg" />
                      </span>
                    </td>
                  </tr>
                )}
                {!demoOrderOffer || (
                  !isFieldModified(Number(order.specs?.inner_diameter), Number(effectiveSpecs?.inner_diameter)) &&
                  !isFieldModified(Number(order.specs?.outer_diameter), Number(effectiveSpecs?.outer_diameter)) &&
                  !isFieldModified(Number(order.specs?.width), Number(effectiveSpecs?.width)) &&
                  !isFieldModified(Number(order.specs?.minimum_shipping_weight), Number(effectiveSpecs?.minimum_shipping_weight)) &&
                  !isFieldModified(Number(order.specs?.maximum_shipping_weight), Number(effectiveSpecs?.maximum_shipping_weight)) &&
                  !isFieldModified(Number(order.specs?.pieces_per_package), Number(effectiveSpecs?.pieces_per_package)) &&
                  !isFieldModified(Number(order.specs?.maximum_pallet_width), Number(effectiveSpecs?.maximum_pallet_width)) &&
                  !isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging)
                ) && (
                  <tr>
                    <td colSpan={3} className="px-8 py-8 text-center text-slate-400 text-sm">
                      No se detectaron cambios en la especificación
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {(demoOrderOffer && (
              isFieldModified(Number(order.specs?.inner_diameter), Number(effectiveSpecs?.inner_diameter)) ||
              isFieldModified(Number(order.specs?.outer_diameter), Number(effectiveSpecs?.outer_diameter)) ||
              isFieldModified(Number(order.specs?.width), Number(effectiveSpecs?.width)) ||
              isFieldModified(Number(order.specs?.minimum_shipping_weight), Number(effectiveSpecs?.minimum_shipping_weight)) ||
              isFieldModified(Number(order.specs?.maximum_shipping_weight), Number(effectiveSpecs?.maximum_shipping_weight)) ||
              isFieldModified(Number(order.specs?.pieces_per_package), Number(effectiveSpecs?.pieces_per_package)) ||
              isFieldModified(Number(order.specs?.maximum_pallet_width), Number(effectiveSpecs?.maximum_pallet_width)) ||
              isFieldModified(order.specs?.shipping_packaging, effectiveSpecs?.shipping_packaging)
            )) && (
              <div className="m-4 bg-orange-50/50 border border-orange-100 p-3 rounded-lg flex items-center gap-3">
                <HiOutlineExclamationCircle className="text-orange-500 text-lg shrink-0" />
                <p className="text-[11px] text-orange-800 font-medium leading-tight">
                  Los cambios realizados por el cliente pueden afectar los tiempos de producción y logística estimados.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ACCIONES FINALES */}
        {canEdit && (
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
            <AcceptOrderButton
              order={order}
              orderOffer={orderOffer}
              variant="clientes"
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-100"
            >
              Aceptar
            </AcceptOrderButton>
            <button 
              onClick={openRejectModal}
              className="bg-orange-500 text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
            >
              Rechazar
            </button>
            <button 
              onClick={requestReview}
              className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <HiOutlineMailOpen className="text-lg" /> Solicitar Revisión
            </button>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN DE RECHAZO */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Confirmar Rechazo</h3>
                <button 
                  onClick={closeRejectModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <HiOutlineX className="text-xl" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">¿Estás seguro que quieres rechazar este pedido?</p>
                    <p className="text-sm text-slate-500 mt-1">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                  <p className="font-medium mb-1">Orden #{order?.id}</p>
                  <p className="text-xs">{order?.product?.pt}</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={closeRejectModal}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={rejectOrder}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Sí, Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

