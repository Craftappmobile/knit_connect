import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { createOrUpdateSubscription } from "@/utils/payment-utils";
import { PlanDetails } from "@/types/database";

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useAuth();
  const [subscriptionCreated, setSubscriptionCreated] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  let planDetails: PlanDetails;
  try {
    if (params.planDetails) {
      planDetails = JSON.parse(params.planDetails as string);
    } else {
      planDetails = {
        type: 'monthly',
        originalPrice: 99,
        discountPercent: 0,
        finalPrice: 99,
        promoCode: null
      };
    }
  } catch (e) {
    console.error("Error parsing plan details:", e);
    planDetails = {
      type: 'monthly',
      originalPrice: 99,
      discountPercent: 0,
      finalPrice: 99,
      promoCode: null
    };
  }

  useEffect(() => {
    const setupSubscription = async () => {
      if (session?.user && !subscriptionCreated) {
        try {
          const success = await createOrUpdateSubscription(
            session.user.id,
            planDetails
          );
          
          if (success) {
            setSubscriptionCreated(true);
          } else {
            setError("Не вдалося активувати підписку. Зверніться до служби підтримки.");
          }
        } catch (error: Error | any) {
          console.error("Error creating subscription:", error);
          setError(error.message || "Помилка активації підписки");
        }
      }
    };
    
    setupSubscription();
  }, [session, planDetails, subscriptionCreated]);

  const handleContinue = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 items-center justify-center">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">✓</Text>
        </View>
        
        <H1 className="text-center mb-2">Оплата успішна!</H1>
        
        <Muted className="text-center mb-6">
          Дякуємо за оплату. Ваша підписка успішно активована.
        </Muted>
        
        <View className="bg-card p-4 rounded-lg w-full mb-6">
          <Text className="font-bold mb-2">Деталі підписки:</Text>
          <Text>План: {planDetails.type === 'monthly' ? 'Місячний' : 'Річний'}</Text>
          <Text>Сума: {planDetails.finalPrice} грн</Text>
          {planDetails.promoCode && (
            <Text>Промокод: {planDetails.promoCode}</Text>
          )}
          <Text>
            Термін дії: до {new Date(
              new Date().setMonth(
                new Date().getMonth() + (planDetails.type === 'monthly' ? 1 : 12)
              )
            ).toLocaleDateString('uk-UA')}
          </Text>
        </View>
        
        {error && (
          <View className="bg-destructive/10 p-3 rounded-md mb-6 w-full">
            <Text className="text-destructive text-center">{error}</Text>
          </View>
        )}
        
        <Button size="lg" className="w-full" onPress={handleContinue}>
          <Text>ПЕРЕЙТИ ДО ЗАСТОСУНКУ</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
