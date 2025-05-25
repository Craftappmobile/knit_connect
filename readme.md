# Розрахуй і В'яжи — Mobile-First Додаток для Майстрів В'язання 🧶

![Версія](https://img.shields.io/badge/версія-1.0.0-brightgreen)
![Expo](https://img.shields.io/badge/Expo-~53.0.8-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.79.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.49.4-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-purple)

Мобільний додаток з підтримкою офлайн-режиму для майстрів в'язання, який дозволяє створювати проєкти, керувати запасами пряжі, розраховувати матеріали та ділитися своїми роботами.

## 📱 Ключові особливості

- **Offline-First**: Повна функціональність навіть без доступу до інтернету
- **Синхронізація даних**: Автоматична синхронізація локальних даних з хмарою при підключенні
- **Розрахунки**: Інструменти для розрахунку витрат пряжі та матеріалів
- **Управління проєктами**: Створення, редагування та відстеження прогресу проєктів
- **Каталог пряжі**: Управління особистими запасами пряжі
- **Соціальні функції**: Можливість ділитися роботами та взаємодіяти з іншими майстрами

## 🛠️ Технічний стек

### Клієнтська частина
- **React Native (Expo)**: Фреймворк для розробки кросплатформних мобільних додатків
- **TypeScript**: Типізована надбудова над JavaScript
- **NativeWind (TailwindCSS)**: Утиліти для стилізації UI
- **Expo Router**: Навігація в додатку
- **React Hook Form**: Управління формами
- **Zod**: Валідація даних

### Серверна частина
- **Supabase**: БД PostgreSQL, автентифікація, зберігання файлів, realtime функціонал
- **Expo Secure Store**: Безпечне зберігання конфіденційних даних
- **AsyncStorage**: Локальне зберігання даних

## 🗂️ Структура проєкту

```
expo-supabase-starter/
├── .env                     # Змінні середовища (не включено до репозиторію)
├── .env.example             # Приклад змінних середовища
├── app.config.js            # Конфігурація Expo
├── app.json                 # Конфігурація додатку
├── app/                     # Екрани та маршрути додатку (Expo Router)
│   ├── (protected)/         # Захищені маршрути (потребують авторизації)
│   │   ├── (tabs)/          # Вкладки в додатку
│   │   │   ├── _layout.tsx  # Розмітка навігації по вкладках
│   │   │   ├── index.tsx    # Головний екран
│   │   │   └── settings.tsx # Екран налаштувань
│   │   ├── _layout.tsx      # Розмітка захищеної зони
│   │   └── modal.tsx        # Модальне вікно
│   ├── _layout.tsx          # Головна розмітка додатку
│   ├── sign-in.tsx          # Екран входу
│   ├── sign-up.tsx          # Екран реєстрації
│   └── welcome.tsx          # Вітальний екран
├── assets/                  # Статичні ресурси (зображення, шрифти тощо)
├── components/              # Перевикористовувані компоненти
│   ├── ui/                  # UI компоненти (кнопки, поля вводу тощо)
│   │   ├── button.tsx       # Компонент кнопки
│   │   ├── form.tsx         # Компоненти форм
│   │   ├── input.tsx        # Компонент введення тексту
│   │   ├── label.tsx        # Компонент мітки
│   │   ├── radio-group.tsx  # Компонент групи радіокнопок
│   │   ├── switch.tsx       # Компонент перемикача
│   │   ├── text.tsx         # Компонент тексту
│   │   ├── textarea.tsx     # Компонент текстової області
│   │   └── typography.tsx   # Типографіка
│   ├── image.tsx            # Компонент для зображень
│   └── safe-area-view.tsx   # Компонент для безпечних зон екрану
├── config/                  # Конфігураційні файли
│   └── supabase.ts          # Конфігурація клієнта Supabase з шифруванням
├── constants/               # Константи додатку
├── context/                 # React контексти
│   └── supabase-provider.tsx # Провайдер для Supabase автентифікації
├── lib/                     # Бібліотеки та утиліти
│   ├── supabaseClient.ts    # Клієнт Supabase
│   ├── useColorScheme.ts    # Хук для роботи з темною/світлою темою
│   └── utils.ts             # Утиліти
└── scripts/                 # Скрипти автоматизації
```

## 🚀 Початок роботи

### Передумови
- Node.js (рекомендовано LTS версію)
- Yarn або npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (для Android емулятора)
- Xcode (для iOS емулятора, тільки на macOS)

### Налаштування

1. **Клонуйте репозиторій**:
```bash
git clone https://your-repository-url.git
cd expo-supabase-starter
```

2. **Встановіть залежності**:
```bash
yarn install
# або
npm install
```

3. **Налаштуйте змінні середовища**:
- Створіть файл `.env` на основі `.env.example`
- Додайте ваші ключі Supabase:
```
EXPO_PUBLIC_SUPABASE_URL="ваш-url-supabase"
EXPO_PUBLIC_SUPABASE_ANON_KEY="ваш-публічний-ключ-supabase"
```

4. **Запустіть додаток**:
```bash
yarn start
# або
npm start
```
- Натисніть `a` для запуску на Android емуляторі
- Натисніть `i` для запуску на iOS емуляторі (тільки на macOS)
- Або відскануйте QR-код з Expo Go на вашому пристрої

## 🔄 Архітектура синхронізації даних

Додаток проєктується з архітектурою offline-first:

### Клієнт Supabase
```typescript
// lib/supabaseClient.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Отримання даних з env змінних
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Створення клієнта Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Захищене сховище для великих даних
```typescript
// config/supabase.ts
class LargeSecureStore {
  // Шифрування даних перед зберіганням
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1),
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(
      key,
      aesjs.utils.hex.fromBytes(encryptionKey),
    );
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }
  
  // Розшифрування даних після отримання
  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }
  
  // Інтерфейс для AsyncStorage-сумісного сховища
  async getItem(key: string) { /* ... */ }
  async removeItem(key: string) { /* ... */ }
  async setItem(key: string, value: string) { /* ... */ }
}
```

### Автентифікація з управлінням станом
```typescript
// context/supabase-provider.tsx
export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  // Методи для авторизації
  const signUp = async (email: string, password: string) => { /* ... */ }
  const signIn = async (email: string, password: string) => { /* ... */ }
  const signOut = async () => { /* ... */ }

  // Ініціалізація та відстеження стану авторизації
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    setInitialized(true);
  }, []);

  // Навігація на основі стану авторизації
  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();
      if (session) {
        router.replace("/");
      } else {
        router.replace("/welcome");
      }
    }
  }, [initialized, session]);

  // Надання контексту авторизації додатку
  return (
    <AuthContext.Provider
      value={{
        initialized,
        session,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

## 🔐 Безпека

Додаток реалізує наступні заходи безпеки:

1. **Безпечне зберігання токенів**: Використання Expo SecureStore
2. **Шифрування даних**: Шифрування чутливих даних перед зберіганням
3. **Row-Level Security**: Політики безпеки на рівні рядків у Supabase
4. **Автоматичне оновлення токенів**: Реалізовано через Supabase Auth
5. **Моніторинг стану додатку**: Авторефреш токенів тільки коли додаток активний

## 📋 Функціональні області (заплановані)

1. **Управління проєктами в'язання**
   - Створення, редагування та видалення проєктів
   - Відстеження прогресу
   - Зберігання схем і інструкцій

2. **Калькулятори для розрахунків**
   - Розрахунок витрат пряжі
   - Конвертація одиниць вимірювання
   - Калькулятор візерунків

3. **Управління запасами пряжі**
   - Каталогізація наявної пряжі
   - Відстеження використання
   - Нагадування про закінчення матеріалів

4. **Соціальні функції**
   - Публікація завершених робіт
   - Взаємодія з іншими користувачами
   - Обмін схемами і порадами

5. **Офлайн-функціональність**
   - Повний доступ до всіх функцій без інтернету
   - Фонова синхронізація при підключенні

## 🧪 Етапи розробки (16 етапів)

1-2: Фундамент та синхронізація даних
3-4: UI компоненти та автентифікація
5-7: Калькулятори, проєкти, склад пряжі
8-10: Спільнота, галерея, сповіщення
11-14: Платежі, локалізація, тестування
15-16: Адмін-панель, аналітика

## 🛠️ Розгортання

Проєкт готовий до розгортання з використанням EAS (Expo Application Services):

```bash
# Налаштування EAS
eas build:configure

# Створення тестової збірки
eas build --profile development

# Створення продакшн збірки
eas build --profile production
```

## 📝 Ліцензія

Цей проєкт ліцензований за ліцензією MIT - дивіться файл [LICENSE](LICENSE) для детальної інформації.

## 🔗 Корисні посилання

- [Документація Expo](https://docs.expo.dev/)
- [Документація Supabase](https://supabase.com/docs)
- [Документація NativeWind](https://www.nativewind.dev/)
