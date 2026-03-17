'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/AuthContext';
import type { OrderDetails, OrderSpecs, OrderOfferWithSpecs } from '@/types/orders';

interface AcceptOrderButtonProps {
  order: OrderDetails;
  orderOffer?: OrderOfferWithSpecs | null;
  variant?: 'clientes' | 'gestion';
  className?: string;
  children?: React.ReactNode;
}

export default function AcceptOrderButton({ 
  order, 
  orderOffer, 
  variant = 'clientes', 
  className = '',
  children 
}: AcceptOrderButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();

  async function acceptOrder() {
    if (!order) return;
    
    try {
      // Actualizar estado a 'Aceptado', reviewed y reviewed_by
      const updateData = {
        status: 'Aceptado',
        reviewed: true,
        reviewed_by: user?.id
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      // Si es variante 'gestion' y hay contraoferta, insertar specs
      if (variant === 'gestion' && orderOffer?.specs) {
        const specsToInsert = {
          product_id: order.product_id,
          inner_diameter: orderOffer.specs.inner_diameter ?? order.specs?.inner_diameter,
          outer_diameter: orderOffer.specs.outer_diameter ?? order.specs?.outer_diameter,
          width: orderOffer.specs.width ?? order.specs?.width,
          minimum_shipping_weight: orderOffer.specs.minimum_shipping_weight ?? order.specs?.minimum_shipping_weight,
          maximum_shipping_weight: orderOffer.specs.maximum_shipping_weight ?? order.specs?.maximum_shipping_weight,
          pieces_per_package: orderOffer.specs.pieces_per_package ?? order.specs?.pieces_per_package,
          maximum_pallet_width: orderOffer.specs.maximum_pallet_width ?? order.specs?.maximum_pallet_width,
          shipping_packaging: orderOffer.specs.shipping_packaging ?? order.specs?.shipping_packaging,
        };

        await supabase.from('specs').insert(specsToInsert);
      }

      // Redirigir según la variante
      const redirectPath = variant === 'clientes' ? '/ternium/clientes' : '/ternium/gestion';
      router.push(redirectPath);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  }

  return (
    <button 
      onClick={acceptOrder}
      className={className}
    >
      {children}
    </button>
  );
}
