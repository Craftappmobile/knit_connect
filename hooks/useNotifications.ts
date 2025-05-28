// hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Универсальний імпорт OneSignal
let OneSignal;
try {
  const oneSignalMod = require('react-native-onesignal');
  OneSignal = oneSignalMod.OneSignal || oneSignalMod.default || oneSignalMod;
  console.log('✅ OneSignal успішно імпортовано');
  console.log('📋 Доступні методи:', Object.keys(OneSignal || {}));
} catch (e) {
  console.log('❌ Помилка імпорту OneSignal:', e);
}

export function useNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeOneSignal = async () => {
      try {
        // Перевіряємо, чи ми не на веб (тобто на Android або iOS)
        const isNativePlatform = Platform.OS === 'android' || Platform.OS === 'ios';
        
        if (isNativePlatform && OneSignal) {
          // Отримуємо App ID з конфігурації
          const appId = Constants.expoConfig?.extra?.oneSignalAppId || "064a7314-cd39-49f2-acb8-391e8446bc38";
          
          // Перевіряємо наявність App ID
          if (!appId) {
            console.warn('❗ OneSignal App ID не знайдено! Перевірте налаштування.');
            return false;
          }
          
          console.log('📦 Використовуємо OneSignal App ID:', appId);
          console.log('📡 Ініціалізуємо OneSignal 5.x...');
          
          // Ініціалізація OneSignal 5.x
          await OneSignal.initialize(appId);
          
          // Налаштування рівня логування
          if (OneSignal.Debug && typeof OneSignal.Debug.setLogLevel === 'function') {
            try {
              const LogLevel = OneSignal.LogLevel || { VERBOSE: 6, NONE: 0 };
              OneSignal.Debug.setLogLevel(LogLevel.VERBOSE, LogLevel.NONE);
            } catch (logError) {
              console.log('Не вдалося встановити рівень логування:', logError);
            }
          }
          
          // Обробники подій для 5.x
          if (OneSignal.Notifications) {
            try {
              // Правильний API для OneSignal 5.x
              OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
                console.log('📬 Отримано сповіщення на передньому плані:', event.notification.title);
                // Опціонально: запобігти автоматичному показу та показати вручну
                // event.preventDefault();
                // event.display();
              });
              
              // Додаємо обробник натискань на сповіщення
              OneSignal.Notifications.addEventListener('click', (event) => {
                console.log('👆 Натиснуто на сповіщення:', event.notification.title);
                // Тут можна додати навігацію або інші дії
                if (event.result.url) {
                  console.log('🔗 URL для переходу:', event.result.url);
                }
              });
              
              // Додаємо обробник змін дозволів
              OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
                console.log('🔔 Зміна дозволів на сповіщення:', permission);
              });
              
              console.log('✅ Обробники подій успішно налаштовано');
            } catch (eventError) {
              console.log('Не вдалося налаштувати обробники подій:', eventError);
            }
          }
          
          // Отримання Player ID для тестування
          try {
            // Невелика затримка для завершення ініціалізації
            setTimeout(async () => {
              try {
                const playerId = await OneSignal.User.getOnesignalId();
                console.log('🆔 OneSignal Player ID:', playerId);
              } catch (idError) {
                console.log('Не вдалося отримати Player ID:', idError);
              }
            }, 2000);
          } catch (e) {
            console.log('Помилка при спробі отримати Player ID:', e);
          }
          
          if (mounted) {
            setIsInitialized(true);
            console.log('🎉 OneSignal 5.x успішно ініціалізовано');
          }
          return true;
        } else {
          console.log('Нотифікації недоступні в поточному середовищі');
          console.log('Platform.OS:', Platform.OS);
          console.log('OneSignal доступний:', !!OneSignal);
          return false;
        }
      } catch (error) {
        console.error('🔥 Помилка при ініціалізації OneSignal:', error);
        return false;
      }
    };

    initializeOneSignal();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Повертаємо API для роботи з нотифікаціями
  return {
    isAvailable: !!OneSignal && isInitialized,
    requestPermission: async () => {
      if (!OneSignal || !isInitialized) return false;
      
      try {
        const accepted = await OneSignal.Notifications.requestPermission(true);
        return accepted;
      } catch (e) {
        console.error('Помилка запиту дозволів:', e);
        return false;
      }
    },
    // Додаткові методи для роботи з нотифікаціями
    sendTag: (key, value) => {
      if (!OneSignal || !isInitialized) return;
      OneSignal.User.addTag(key, value);
    },
    identifyUser: (userId) => {
      if (!OneSignal || !isInitialized) return;
      OneSignal.login(userId);
    },
    logoutUser: () => {
      if (!OneSignal || !isInitialized) return;
      OneSignal.logout();
    }
  };
}

export default useNotifications;