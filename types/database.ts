// types/database.ts
export interface UserDevice {
  id: string;
  user_id: string;
  onesignal_player_id: string;
  device_type: string | null;
  device_name: string | null;
  app_version: string | null;
  is_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface DeviceRegistrationParams {
  onesignalPlayerId: string;
  deviceType?: string;
  deviceName?: string;
  appVersion?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'expired';
  plan_type: 'monthly' | 'yearly';
  expiry_date: string;
  price_paid: number;
  promo_code_used?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  plan_type: 'monthly' | 'yearly';
  wayforpay_transaction_id?: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  active: boolean;
}

export interface PlanDetails {
  type: 'monthly' | 'yearly';
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  promoCode: string | null;
}

export interface Database {
  public: {
    Tables: {
      user_devices: {
        Row: UserDevice;
        Insert: Omit<UserDevice, 'id' | 'created_at' | 'last_updated'> & {
          id?: string;
          created_at?: string;
          last_updated?: string;
        };
        Update: Partial<Omit<UserDevice, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      promo_codes: {
        Row: PromoCode;
        Insert: Omit<PromoCode, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PromoCode, 'id'>>;
      };
    };
    Functions: {
      register_user_device: {
        Args: {
          p_onesignal_player_id: string;
          p_device_type?: string;
          p_device_name?: string;
          p_app_version?: string;
        };
        Returns: string;
      };
      deactivate_user_device: {
        Args: {
          p_onesignal_player_id: string;
        };
        Returns: boolean;
      };
      get_user_active_devices: {
        Args: Record<string, never>;
        Returns: UserDevice[];
      };
    };
  };
}
