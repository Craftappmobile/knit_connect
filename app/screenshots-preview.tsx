import React from "react";
import { View, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";

const { width } = Dimensions.get("window");

const screenshots = [
  {
    id: 1,
    title: "Калькулятори",
    description: "30+ спеціалізованих калькуляторів для всіх потреб в'язальниці",
    image: require("@/assets/icon.png"), // Replace with actual screenshot
  },
  {
    id: 2,
    title: "Щоденник проєктів",
    description: "Зручний щоденник для відстеження ваших проєктів в'язання",
    image: require("@/assets/icon.png"), // Replace with actual screenshot
  },
  {
    id: 3,
    title: "Спільнота",
    description: "Спілкуйтеся з іншими в'язальницями та діліться досвідом",
    image: require("@/assets/icon.png"), // Replace with actual screenshot
  },
  {
    id: 4,
    title: "Облік пряжі",
    description: "Зручний облік вашої пряжі та матеріалів",
    image: require("@/assets/icon.png"), // Replace with actual screenshot
  },
  {
    id: 5,
    title: "Експорт у PDF",
    description: "Зберігайте та діліться вашими проєктами у PDF форматі",
    image: require("@/assets/icon.png"), // Replace with actual screenshot
  },
];

export default function ScreenshotsPreview() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNext = () => {
    if (currentIndex < screenshots.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubscribe = () => {
    router.push("/subscription-plans");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={handleClose}>
          <Text className="text-xl">✕</Text>
        </Button>
        <H2>Перегляд застосунку</H2>
        <View style={{ width: 40 }} />
      </View>

      <View className="flex-1 p-4">
        <Text className="text-center mb-4">
          Скріншот {currentIndex + 1}/{screenshots.length}
        </Text>

        <View className="flex-1 items-center justify-center">
          <View className="bg-card rounded-lg p-6 w-full max-w-md shadow-sm">
            <H2 className="text-center mb-2">{screenshots[currentIndex].title}</H2>
            <View className="items-center justify-center my-4 bg-muted rounded-lg p-4 aspect-square">
              <Image
                source={screenshots[currentIndex].image}
                style={{ width: width * 0.6, height: width * 0.6, resizeMode: "contain" }}
              />
            </View>
            <Text className="text-center">
              {screenshots[currentIndex].description}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-6">
          <Button
            variant="outline"
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            className={currentIndex === 0 ? "opacity-50" : ""}
          >
            <Text>◄ НАЗАД</Text>
          </Button>
          <Button
            variant="outline"
            onPress={handleNext}
            disabled={currentIndex === screenshots.length - 1}
            className={currentIndex === screenshots.length - 1 ? "opacity-50" : ""}
          >
            <Text>ДАЛІ ►</Text>
          </Button>
        </View>
      </View>

      <View className="p-4 border-t border-border">
        <Button size="lg" onPress={handleSubscribe}>
          <Text>ПРИДБАТИ ЗАРАЗ</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
