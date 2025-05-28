// config/oneSignal.ts
import { OneSignal } from 'react-native-onesignal';
import { DeviceService } from '../services/deviceService';

export class OneSignalIntegration {
  static async initialize(appId: string) {
    try {
      // Ініціалізація OneSignal
      OneSignal.initialize(appId);
      
      // Запит дозволу на нотифікації
      const permission = await OneSignal.Notifications.requestPermission(true);
      
      if (permission) {
        // Отримання Player ID та реєстрація в базі
        await this.registerDevice();
      }
      
      // Підписка на зміни Player ID
      OneSignal.User.addObserver('onesignal_id', this.onPlayerIdChanged);
      
    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      throw error;
    }
  }

  static async registerDevice() {
    try {
      const playerId = await OneSignal.User.getOnesignalId();
      
      if (playerId) {
        const deviceId = await DeviceService.registerDevice(playerId);
        console.log('Device registered with ID:', deviceId);
        return deviceId;
      } else {
        console.warn('OneSignal Player ID is not available yet');
      }
    } catch (error) {
      console.error('Device registration failed:', error);
      throw error;
    }
  }

  static onPlayerIdChanged = async (event: any) => {
    console.log('OneSignal Player ID changed:', event);
    await OneSignalIntegration.registerDevice();
  };
}