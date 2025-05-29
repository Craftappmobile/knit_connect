import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { PlanDetails } from "@/types/database";

const formSchema = z
  .object({
    email: z.string().email("Будь ласка, введіть дійсну електронну адресу."),
    password: z
      .string()
      .min(8, "Будь ласка, введіть щонайменше 8 символів.")
      .max(64, "Будь ласка, введіть менше 64 символів.")
      .regex(
        /^(?=.*[a-z])/,
        "Ваш пароль повинен містити принаймні одну малу літеру.",
      )
      .regex(
        /^(?=.*[A-Z])/,
        "Ваш пароль повинен містити принаймні одну велику літеру.",
      )
      .regex(/^(?=.*[0-9])/, "Ваш пароль повинен містити принаймні одну цифру.")
      .regex(
        /^(?=.*[!@#$%^&*])/,
        "Ваш пароль повинен містити принаймні один спеціальний символ.",
      ),
    confirmPassword: z.string().min(8, "Будь ласка, введіть щонайменше 8 символів."),
    firstName: z.string().min(1, "Будь ласка, введіть ваше ім'я."),
    lastName: z.string().min(1, "Будь ласка, введіть ваше прізвище."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не співпадають.",
    path: ["confirmPassword"],
  });

export default function Registration() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  let planDetails: PlanDetails;
  try {
    planDetails = JSON.parse(params.planDetails as string);
  } catch (e) {
    router.replace("/subscription-plans");
    return null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setError(null);
      
      await signUp(data.email, data.password);
      
      
      router.push({
        pathname: "/payment",
        params: { 
          planDetails: params.planDetails as string,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`
        }
      });
    } catch (error: Error | any) {
      console.error("Registration error:", error.message);
      setError(error.message || "Помилка реєстрації. Спробуйте ще раз.");
    }
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-row items-center mb-4">
        <Button variant="ghost" size="icon" onPress={handleBack}>
          <Text className="text-xl">←</Text>
        </Button>
        <H2 className="ml-2">Реєстрація</H2>
      </View>
      
      <View className="flex-1 gap-4">
        <Muted>
          Створіть обліковий запис для доступу до всіх функцій застосунку.
          Ви обрали {planDetails.type === 'monthly' ? 'місячний' : 'річний'} план за {planDetails.finalPrice} грн.
        </Muted>
        
        {error && (
          <View className="bg-destructive/10 p-3 rounded-md">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}
        
        <Form {...form}>
          <View className="gap-4">
            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormInput
                      label="Ім'я"
                      placeholder="Ім'я"
                      autoCapitalize="words"
                      autoCorrect={false}
                      {...field}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormInput
                      label="Прізвище"
                      placeholder="Прізвище"
                      autoCapitalize="words"
                      autoCorrect={false}
                      {...field}
                    />
                  )}
                />
              </View>
            </View>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormInput
                  label="Email"
                  placeholder="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  {...field}
                />
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormInput
                  label="Пароль"
                  placeholder="Пароль"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  {...field}
                />
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormInput
                  label="Підтвердження паролю"
                  placeholder="Підтвердження паролю"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  {...field}
                />
              )}
            />
          </View>
        </Form>
      </View>
      
      <Button
        size="lg"
        variant="default"
        onPress={form.handleSubmit(onSubmit)}
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text>ПРОДОВЖИТИ ДО ОПЛАТИ</Text>
        )}
      </Button>
    </SafeAreaView>
  );
}
