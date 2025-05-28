import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Безпосередньо використовуємо змінні середовища з Expo
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Якщо змінні середовища не знайдено, використовуємо резервні значення
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL або Anon Key не знайдено. Використовуємо резервні значення.");
  
  // Для налагодження
  console.log("Доступні змінні середовища:", process.env);
  
  // Резервні значення для розробки (в продакшн не рекомендується)
  supabaseUrl = "https://ojfqvdfactdrdwydkurk.supabase.co";
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZnF2ZGZhY3RkcmR3eWRrdXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTcxNjYsImV4cCI6MjA2Mzc3MzE2Nn0.PFfLoRgRqjH7vCrcIDwU-zLwU2Tv0_j6LPfIkZZbsK4";
}

// Створюємо клієнт Supabase на верхньому рівні файлу
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
