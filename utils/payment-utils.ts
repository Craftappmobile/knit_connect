import { supabase } from '@/config/supabase';
import { Payment, PlanDetails } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

export const PLAN_PRICES = {
  monthly: 99, // UAH
  yearly: 799, // UAH
};

/**
 * Check if the app is running in test/development mode
 */
export const isTestMode = async (): Promise<boolean> => {
  return process.env.NODE_ENV !== "production";
};

/**
 * Generate a unique order ID for payment processing
 */
export const generateOrderId = (): string => {
  return `order_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
};

/**
 * Calculate final price after applying promo code discount
 */
export const calculateFinalPrice = (originalPrice: number, discountPercent: number): number => {
  if (discountPercent <= 0 || discountPercent > 100) {
    return originalPrice;
  }
  
  const discountAmount = (originalPrice * discountPercent) / 100;
  return Math.round(originalPrice - discountAmount);
};

/**
 * Generate WayForPay payment form URL with required parameters
 */
export const generateWayForPayForm = (params: {
  orderId: string;
  amount: number;
  email: string;
  planType: 'monthly' | 'yearly';
  returnUrl?: string;
}): { url: string } => {
  const merchantAccount = 'test_merch_n1';
  const productName = `${params.planType}_subscription`;
  const returnUrl = params.returnUrl || 'https://knit-connect.app/payment-callback';
  
  const url = `https://secure.wayforpay.com/pay?merchantAccount=${merchantAccount}`
    + `&merchantDomainName=knit-connect.app`
    + `&merchantTransactionSecureType=AUTO`
    + `&orderReference=${params.orderId}`
    + `&orderDate=${Math.floor(Date.now() / 1000)}`
    + `&amount=${params.amount}`
    + `&currency=UAH`
    + `&productName[]=${productName}`
    + `&productPrice[]=${params.amount}`
    + `&productCount[]=1`
    + `&clientEmail=${params.email}`
    + `&returnUrl=${encodeURIComponent(returnUrl)}`;
  
  return { url };
};

/**
 * Create a payment record in the database
 */
export const createPaymentRecord = async (
  userId: string,
  orderId: string,
  planDetails: PlanDetails
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        id: orderId,
        user_id: userId,
        amount: planDetails.finalPrice,
        status: 'pending',
        plan_type: planDetails.type,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Exception creating payment record:', error);
    return null;
  }
};

/**
 * Update payment status after processing
 */
export const updatePaymentStatus = async (
  orderId: string,
  status: 'completed' | 'failed',
  transactionId?: string
): Promise<boolean> => {
  try {
    const updateData: Partial<Payment> = {
      status,
    };
    
    if (transactionId) {
      updateData.wayforpay_transaction_id = transactionId;
    }
    
    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating payment status:', error);
    return false;
  }
};

/**
 * Create or update user subscription after successful payment
 */
export const createOrUpdateSubscription = async (
  userId: string,
  planDetails: PlanDetails
): Promise<boolean> => {
  try {
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (planDetails.type === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingSubscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: planDetails.type,
          expiry_date: expiryDate.toISOString(),
          price_paid: planDetails.finalPrice,
          promo_code_used: planDetails.promoCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
        
      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          plan_type: planDetails.type,
          expiry_date: expiryDate.toISOString(),
          price_paid: planDetails.finalPrice,
          promo_code_used: planDetails.promoCode || null,
        });
        
      if (error) {
        console.error('Error creating subscription:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in subscription management:', error);
    return false;
  }
};

/**
 * Validate promo code and return discount percentage if valid
 */
export const validatePromoCode = async (code: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('discount_percent, valid_until, max_uses, current_uses, active')
      .eq('code', code)
      .single();
      
    if (error || !data) {
      console.error('Error validating promo code:', error);
      return null;
    }
    
    if (!data.active) {
      return null;
    }
    
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return null;
    }
    
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return null;
    }
    
    return data.discount_percent;
  } catch (error) {
    console.error('Exception validating promo code:', error);
    return null;
  }
};

/**
 * Increment promo code usage count
 */
export const incrementPromoCodeUsage = async (code: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('increment_promo_code_usage', {
      p_code: code,
    });
    
    if (error) {
      console.error('Error incrementing promo code usage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception incrementing promo code usage:', error);
    return false;
  }
};

/**
 * For testing: Simulate payment result with 80% success rate
 */
export const simulatePaymentResult = async (): Promise<boolean> => {
  return Math.random() > 0.2;
};
