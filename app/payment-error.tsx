import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function PaymentError() {
  const router = useRouter();

  const handleRetry = () => {
    router.back();
  };

  const handleContactSupport = () => {
    alert("Зв'язок з підтримкою: support@knit-connect.app");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 items-center justify-center">
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">✕</Text>
        </View>
        
        <H1 className="text-center mb-2">Помилка оплати</H1>
        
        <Muted className="text-center mb-6">
          На жаль, виникла помилка під час обробки вашого платежу. 
          Ваша підписка не активована, і з вашої картки не було списано кошти.
        </Muted>
        
        <View className="w-full gap-4">
          <Button 
            size="lg" 
            variant="default" 
            className="w-full" 
            onPress={handleRetry}
          >
            <Text>СПРОБУВАТИ ЩЕ РАЗ</Text>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full" 
            onPress={handleContactSupport}
          >
            <Text>ЗВ'ЯЗАТИСЯ З ПІДТРИМКОЮ</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
