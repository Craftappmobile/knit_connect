import React, { useState } from "react";
import { View, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { PLAN_PRICES, calculateFinalPrice, validatePromoCode } from "@/utils/payment-utils";
import { PlanDetails } from "@/types/database";

export default function SubscriptionPlans() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
  };

  const handlePromoCodeChange = (text: string) => {
    setPromoCode(text);
    if (promoError) setPromoError(null);
    if (promoDiscount) setPromoDiscount(null);
  };

  const validatePromoCodeHandler = async () => {
    if (!promoCode.trim()) {
      setPromoError('Введіть промокод');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const discount = await validatePromoCode(promoCode);
      
      if (discount) {
        setPromoDiscount(discount);
      } else {
        setPromoError('Недійсний промокод');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoError('Помилка перевірки промокоду');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleContinue = () => {
    const originalPrice = PLAN_PRICES[selectedPlan];
    const finalPrice = promoDiscount 
      ? calculateFinalPrice(originalPrice, promoDiscount) 
      : originalPrice;

    const planDetails: PlanDetails = {
      type: selectedPlan,
      originalPrice,
      discountPercent: promoDiscount || 0,
      finalPrice,
      promoCode: promoDiscount ? promoCode : null
    };

    router.push({
      pathname: "/registration",
      params: { planDetails: JSON.stringify(planDetails) }
    });
  };

  const handleClose = () => {
    router.back();
  };

  const originalPrice = PLAN_PRICES[selectedPlan];
  const finalPrice = promoDiscount 
    ? calculateFinalPrice(originalPrice, promoDiscount) 
    : originalPrice;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={handleClose}>
          <Text className="text-xl">✕</Text>
        </Button>
        <H2>Обрати план</H2>
        <View style={{ width: 40 }} />
      </View>

      <View className="flex-1 p-4">
        {/* Yearly Plan */}
        <View className={`p-4 rounded-lg mb-4 border ${selectedPlan === 'yearly' ? 'border-primary' : 'border-border'}`}>
          <View className="flex-row justify-between items-center mb-2">
            <H2>РІЧНИЙ</H2>
            <Button 
              variant={selectedPlan === 'yearly' ? 'default' : 'outline'} 
              onPress={() => handlePlanSelect('yearly')}
            >
              <Text>ОБРАТИ</Text>
            </Button>
          </View>
          <Text className="text-lg font-bold mb-1">
            {promoDiscount && selectedPlan === 'yearly' ? (
              <>
                <Text className="line-through text-muted-foreground">{PLAN_PRICES.yearly} грн/рік</Text>
                {' '}
                {calculateFinalPrice(PLAN_PRICES.yearly, promoDiscount)} грн/рік
              </>
            ) : (
              `${PLAN_PRICES.yearly} грн/рік`
            )}
          </Text>
          <Text className="text-primary mb-2">Економія 33%</Text>
          <View className="gap-1">
            <Text>• Всі калькулятори</Text>
            <Text>• Необмежені проекти</Text>
            <Text>• Повний доступ</Text>
            <Text>• Експорт у PDF</Text>
          </View>
        </View>

        {/* Monthly Plan */}
        <View className={`p-4 rounded-lg mb-4 border ${selectedPlan === 'monthly' ? 'border-primary' : 'border-border'}`}>
          <View className="flex-row justify-between items-center mb-2">
            <H2>МІСЯЧНИЙ</H2>
            <Button 
              variant={selectedPlan === 'monthly' ? 'default' : 'outline'} 
              onPress={() => handlePlanSelect('monthly')}
            >
              <Text>ОБРАТИ</Text>
            </Button>
          </View>
          <Text className="text-lg font-bold mb-1">
            {promoDiscount && selectedPlan === 'monthly' ? (
              <>
                <Text className="line-through text-muted-foreground">{PLAN_PRICES.monthly} грн/місяць</Text>
                {' '}
                {calculateFinalPrice(PLAN_PRICES.monthly, promoDiscount)} грн/місяць
              </>
            ) : (
              `${PLAN_PRICES.monthly} грн/місяць`
            )}
          </Text>
          <View className="gap-1">
            <Text>• Всі калькулятори</Text>
            <Text>• Обмежені проекти</Text>
            <Text>• Повний доступ</Text>
          </View>
        </View>

        {/* Promo Code */}
        <View className="mt-4">
          <Text className="mb-2">Маєте промокод?</Text>
          <View className="flex-row">
            <TextInput
              className="flex-1 p-3 border border-border rounded-l-lg"
              placeholder="Ввести промокод"
              value={promoCode}
              onChangeText={handlePromoCodeChange}
            />
            <Button
              variant="default"
              className="rounded-l-none"
              onPress={validatePromoCodeHandler}
              disabled={isValidatingPromo || !promoCode.trim()}
            >
              {isValidatingPromo ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text>Застосувати</Text>
              )}
            </Button>
          </View>
          {promoError && (
            <Text className="text-destructive mt-1">{promoError}</Text>
          )}
          {promoDiscount && (
            <Text className="text-primary mt-1">
              Знижка {promoDiscount}% застосована!
            </Text>
          )}
        </View>
      </View>

      <View className="p-4 border-t border-border">
        <Button size="lg" onPress={handleContinue}>
          <Text>ПРОДОВЖИТИ</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
