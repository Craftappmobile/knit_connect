import "../global.css";
import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { useEffect } from "react";

import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useNotifications } from "@/hooks/useNotifications";

export default function AppLayout() {
	const { colorScheme } = useColorScheme();
	// Використовуємо хук для ініціалізації нотифікацій
	const notifications = useNotifications();
	
	useEffect(() => {
		const setupNotifications = async () => {
			console.log('Перевіряємо доступність нотифікацій...');
			
			if (notifications.isAvailable) {
				console.log('🔔 Нотифікації доступні!');
				// Запитуємо дозволи, якщо потрібно
				const hasPermission = await notifications.requestPermission();
				console.log('Статус дозволів на нотифікації:', hasPermission);
			} else {
				console.log('⚠️ Нотифікації недоступні');
				// Тут можна додати альтернативну логіку для середовищ без OneSignal
			}
		};
		
		setupNotifications();
	}, [notifications.isAvailable]);

	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
				<Stack.Screen name="(protected)" />
				<Stack.Screen name="welcome" />
				<Stack.Screen name="screenshots-preview" />
				<Stack.Screen name="subscription-plans" />
				<Stack.Screen name="registration" />
				<Stack.Screen name="payment" />
				<Stack.Screen name="payment-success" />
				<Stack.Screen name="payment-error" />
				<Stack.Screen
					name="sign-up"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign Up",
						headerStyle: {
							backgroundColor:
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background,
						},
						headerTintColor:
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground,
						gestureEnabled: true,
					}}
				/>
				<Stack.Screen
					name="sign-in"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign In",
						headerStyle: {
							backgroundColor:
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background,
						},
						headerTintColor:
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground,
						gestureEnabled: true,
					}}
				/>
			</Stack>
		</AuthProvider>
	);
}
