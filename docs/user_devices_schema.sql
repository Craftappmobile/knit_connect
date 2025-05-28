-- Створення таблиці для зберігання пристроїв користувачів
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onesignal_player_id TEXT NOT NULL,
  device_type TEXT,
  device_name TEXT,
  app_version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, onesignal_player_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_player_id ON public.user_devices(onesignal_player_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_active ON public.user_devices(is_active);

-- Права доступу: тільки авторизовані користувачі можуть керувати своїми пристроями
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Політики RLS
CREATE POLICY "Users can view their own devices"
  ON public.user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON public.user_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON public.user_devices
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Функція для реєстрації пристрою (upsert)
CREATE OR REPLACE FUNCTION public.register_user_device(
  p_onesignal_player_id TEXT,
  p_device_type TEXT DEFAULT NULL,
  p_device_name TEXT DEFAULT NULL,
  p_app_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_device_id UUID;
BEGIN
  -- Отримуємо ID поточного користувача
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Вставка/оновлення запису про пристрій
  INSERT INTO public.user_devices (
    user_id, 
    onesignal_player_id, 
    device_type, 
    device_name, 
    app_version, 
    is_active, 
    last_updated
  )
  VALUES (
    v_user_id, 
    p_onesignal_player_id, 
    p_device_type, 
    p_device_name, 
    p_app_version, 
    TRUE, 
    now()
  )
  ON CONFLICT (user_id, onesignal_player_id) DO UPDATE SET
    device_type = COALESCE(EXCLUDED.device_type, user_devices.device_type),
    device_name = COALESCE(EXCLUDED.device_name, user_devices.device_name),
    app_version = COALESCE(EXCLUDED.app_version, user_devices.app_version),
    is_active = TRUE,
    last_updated = now()
  RETURNING id INTO v_device_id;
  
  RETURN v_device_id;
END;
$$;

-- Функція для деактивації пристрою
CREATE OR REPLACE FUNCTION public.deactivate_user_device(
  p_onesignal_player_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_rows_affected INT;
BEGIN
  -- Отримуємо ID поточного користувача
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Деактивуємо пристрій
  UPDATE public.user_devices
  SET is_active = FALSE, last_updated = now()
  WHERE user_id = v_user_id
    AND onesignal_player_id = p_onesignal_player_id;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  RETURN v_rows_affected > 0;
END;
$$;

-- Функція для отримання активних пристроїв поточного користувача
CREATE OR REPLACE FUNCTION public.get_user_active_devices()
RETURNS SETOF public.user_devices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Отримуємо ID поточного користувача
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  SELECT *
  FROM public.user_devices
  WHERE user_id = v_user_id
    AND is_active = TRUE;
END;
$$;