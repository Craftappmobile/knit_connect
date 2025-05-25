# Інтеграція Supabase

Цей документ описує інтеграцію Supabase в проєкт "Розрахуй і В'яжи", включаючи налаштування автентифікації, зберігання даних та синхронізацію.

## Налаштування підключення

Проєкт використовує клієнт Supabase для взаємодії з Supabase API. Клієнт ініціалізується за допомогою URL та анонімного ключа, отриманих з .env файлу.

### Файл .env

Для роботи з Supabase потрібно створити файл `.env` з наступними змінними:

```
EXPO_PUBLIC_SUPABASE_URL="https://your-project-url.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Ініціалізація клієнта

Клієнт Supabase ініціалізується в файлі `lib/supabaseClient.ts`:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Отримуємо дані з змінних середовища Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL або Anon Key не знайдено. Перевірте змінні середовища EXPO_PUBLIC_SUPABASE_URL та EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  // Для режиму розробки можна використовувати хардкодовані значення
  // Але для продакшн це небезпечно!
}

// Створюємо клієнт Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Автентифікація

Автентифікація користувачів реалізована через Supabase Auth. Для зручності використання, всі методи автентифікації обгорнуті в React Context.

### Провайдер автентифікації

Провайдер автентифікації знаходиться в файлі `context/supabase-provider.tsx`:

```typescript
export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  // Реєстрація нового користувача
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error);
      return;
    }

    if (data.session) {
      setSession(data.session);
    }
  };

  // Вхід користувача
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      return;
    }

    if (data.session) {
      setSession(data.session);
    }
  };

  // Вихід користувача
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    }
  };

  // Ініціалізація сесії при запуску
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Підписка на зміни стану авторизації
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

### Використання автентифікації в компонентах

Для використання функцій автентифікації в компонентах, можна використовувати хук `useAuth`:

```typescript
import { useAuth } from "@/context/supabase-provider";

function LoginScreen() {
  const { signIn } = useAuth();
  
  const handleLogin = async () => {
    await signIn(email, password);
  };
  
  // ...
}
```

## Безпечне зберігання даних

Для безпечного зберігання сесії та інших чутливих даних використовується комбінація `AsyncStorage` та `SecureStore`. Для великих даних, які не вміщуються в `SecureStore`, реалізований клас `LargeSecureStore`, який шифрує дані перед зберіганням.

```typescript
// config/supabase.ts
class LargeSecureStore {
  // Шифрування даних
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
  
  // Розшифрування даних
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
  
  // AsyncStorage-сумісний інтерфейс
  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return encrypted;
    }
    return await this._decrypt(key, encrypted);
  }
  
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
  
  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}
```

## Оптимізація продуктивності

Для оптимізації продуктивності застосовуються наступні підходи:

1. **Автоматичне оновлення токенів** тільки коли додаток активний:

```typescript
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

2. **Кешування запитів** для зменшення кількості мережевих запитів.

3. **Ефективне управління підписками** з відписуванням при виході з екрану:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('table_db_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'your_table' }, 
      (payload) => {
        // Handle changes
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Структура бази даних

Проєкт використовує наступні таблиці в Supabase:

1. **users** - інформація про користувачів (створюється автоматично Supabase Auth)
2. **projects** - проєкти в'язання
3. **yarn_inventory** - запаси пряжі
4. **patterns** - схеми в'язання
5. **posts** - дописи користувачів у спільноті

## Налаштування Row-Level Security (RLS)

Для захисту даних користувачів використовуються політики безпеки на рівні рядків (RLS):

```sql
-- Приклад політики для таблиці projects
CREATE POLICY "Users can only see their own projects" ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own projects" ON projects
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Кроки для налаштування Supabase проєкту

1. Створіть новий проєкт на [Supabase](https://supabase.com/).
2. Скопіюйте URL та анонімний ключ з вкладки Settings > API.
3. Створіть файл `.env` і додайте ці ключі.
4. Налаштуйте таблиці та RLS політики в інтерфейсі Supabase.
5. Налаштуйте провайдери автентифікації (email/password, OAuth тощо).
6. Перевірте підключення, запустивши додаток і спробувавши зареєструватися/увійти.

## Корисні посилання

- [Документація Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [Документація Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signup)