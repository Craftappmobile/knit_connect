import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { 
  generateOrderId, 
  generateWayForPayForm, 
  createPaymentRecord,
  updatePaymentStatus,
  isTestMode,
  simulatePaymentResult
} from "@/utils/payment-utils";
import { PlanDetails } from "@/types/database";

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  
  let planDetails: PlanDetails;
  let email: string;
  let name: string;
  
  try {
    planDetails = JSON.parse(params.planDetails as string);
    email = params.email as string;
    name = params.name as string;
  } catch (e) {
    router.replace("/subscription-plans");
    return null;
  }

  useEffect(() => {
    const initPayment = async () => {
      try {
        setLoading(true);
        
        const isTestEnv = await isTestMode();
        setTestMode(isTestEnv);
        
        const newOrderId = generateOrderId();
        setOrderId(newOrderId);
        
        if (session?.user) {
          const paymentId = await createPaymentRecord(
            session.user.id,
            newOrderId,
            planDetails
          );
          
          if (!paymentId) {
            throw new Error("Не вдалося створити запис про платіж");
          }
        } else {
          throw new Error("Користувач не авторизований");
        }
        
        const { url } = generateWayForPayForm({
          orderId: newOrderId,
          amount: planDetails.finalPrice,
          email,
          planType: planDetails.type,
          returnUrl: "https://knit-connect.app/payment-callback"
        });
        
        setPaymentUrl(url);
      } catch (error: Error | any) {
        console.error("Payment initialization error:", error);
        setError(error.message || "Помилка ініціалізації платежу");
      } finally {
        setLoading(false);
      }
    };
    
    initPayment();
  }, []);
  
  const handleNavigationStateChange = async (navState: any) => {
    const url = navState.url;
    
    if (url.includes("payment-callback") || url.includes("wayforpay.com/status")) {
      if (testMode && orderId) {
        const isSuccess = await simulatePaymentResult();
        
        if (isSuccess) {
          await updatePaymentStatus(orderId, "completed", "test_transaction_id");
          router.replace("/payment-success");
        } else {
          await updatePaymentStatus(orderId, "failed");
          router.replace("/payment-error");
        }
      } else if (url.includes("success=true")) {
        if (orderId) {
          const transactionId = new URLSearchParams(url.split("?")[1]).get("transaction") || undefined;
          await updatePaymentStatus(orderId, "completed", transactionId);
        }
        router.replace("/payment-success");
      } else if (url.includes("success=false") || url.includes("error")) {
        if (orderId) {
          await updatePaymentStatus(orderId, "failed");
        }
        router.replace("/payment-error");
      }
    }
  };
  
  const handleCancel = () => {
    if (orderId) {
      updatePaymentStatus(orderId, "failed");
    }
    router.replace("/subscription-plans");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={handleCancel}>
          <Text className="text-xl">✕</Text>
        </Button>
        <H2>Оплата</H2>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-center">Підготовка платіжної форми...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 p-4 items-center justify-center">
          <Text className="text-destructive text-center mb-4">{error}</Text>
          <Button variant="default" onPress={handleCancel}>
            <Text>Повернутися до вибору плану</Text>
          </Button>
        </View>
      ) : (
        <>
          {testMode && (
            <View className="bg-yellow-100 p-2">
              <Text className="text-yellow-800 text-center">Тестовий режим: платіж буде симульовано</Text>
            </View>
          )}
          
          <View className="flex-1">
            {paymentUrl && (
              <WebView
                ref={webViewRef}
                source={{ uri: paymentUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="absolute inset-0 items-center justify-center bg-background">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-4">Завантаження платіжної форми...</Text>
                  </View>
                )}
              />
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
