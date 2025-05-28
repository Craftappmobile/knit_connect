// services/deviceService.ts
import { supabase } from '@/config/supabase';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { DeviceRegistrationParams, UserDevice } from '../types/database';

export class DeviceService {
  /**
   * Реєстрація або оновлення пристрою в системі
   */
  static async registerDevice(
    onesignalPlayerId: string,
    params?: Partial<DeviceRegistrationParams>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('register_user_device', {
        p_onesignal_player_id: onesignalPlayerId,
        p_device_type: params?.deviceType || Device.osName?.toLowerCase() || 'unknown',
        p_device_name: params?.deviceName || Device.deviceName || 'Unknown Device',
        p_app_version: params?.appVersion || Application.nativeApplicationVersion || '1.0.0'
      });

      if (error) {
        console.error('Error registering device:', error);
        throw new Error(`Failed to register device: ${error.message}`);
      }

      console.log('Device registered successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error in registerDevice:', error);
      throw error;
    }
  }

  /**
   * Отримання всіх активних пристроїв користувача
   */
  static async getActiveDevices(): Promise<UserDevice[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_active_devices');

      if (error) {
        console.error('Error fetching active devices:', error);
        throw new Error(`Failed to fetch devices: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getActiveDevices:', error);
      throw error;
    }
  }

  /**
   * Деактивація пристрою
   */
  static async deactivateDevice(onesignalPlayerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('deactivate_user_device', {
        p_onesignal_player_id: onesignalPlayerId
      });

      if (error) {
        console.error('Error deactivating device:', error);
        throw new Error(`Failed to deactivate device: ${error.message}`);
      }

      return data || false;
    } catch (error) {
      console.error('Unexpected error in deactivateDevice:', error);
      throw error;
    }
  }

  /**
   * Отримання інформації про поточний пристрій
   */
  static async getCurrentDeviceInfo(): Promise<Partial<DeviceRegistrationParams>> {
    return {
      deviceType: Device.osName?.toLowerCase() || 'unknown',
      deviceName: Device.deviceName || 'Unknown Device',
      appVersion: Application.nativeApplicationVersion || '1.0.0'
    };
  }

  /**
   * Очищення всіх пристроїв користувача (при logout)
   */
  static async deactivateAllUserDevices(): Promise<boolean> {
    try {
      const activeDevices = await this.getActiveDevices();
      
      const deactivationPromises = activeDevices.map(device => 
        this.deactivateDevice(device.onesignal_player_id)
      );

      const results = await Promise.allSettled(deactivationPromises);
      
      // Перевірка чи всі пристрої деактивовано успішно
      const allSuccessful = results.every(result => 
        result.status === 'fulfilled' && result.value === true
      );

      return allSuccessful;
    } catch (error) {
      console.error('Error deactivating all devices:', error);
      return false;
    }
  }
}