import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Безпосередньо використовуємо змінні середовища з Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL або Anon Key не знайдено. Перевірте змінні середовища EXPO_PUBLIC_SUPABASE_URL та EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  
  // Для налагодження
  console.log("Доступні змінні середовища:", process.env);
  
  // Явно вказати URL і ключ безпосередньо з .env.example, якщо не можемо отримати через process.env
  // Це тимчасове рішення для тестування
  const hardcodedUrl = "https://ojfqvdfactdrdwydkurk.supabase.co";
  const hardcodedKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZnF2ZGZhY3RkcmR3eWRrdXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxNjYsImV4cCI6MjA2Mzc3MzE2Nn0.PFfLoRgRqjH7vCrcIDwU-zLwU2Tv0_j6LPfIkZZbsK4";
  
  // Створюємо клієнт Supabase з хардкодованими даними
  export const supabase = createClient(hardcodedUrl, hardcodedKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  // Створюємо клієнт Supabase з отриманими даними з process.env
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
