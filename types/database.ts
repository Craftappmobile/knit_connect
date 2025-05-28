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