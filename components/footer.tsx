import { router } from "expo-router";
import { Home, LibraryBig, Plus } from "lucide-react-native";
import React, { ReactElement } from "react";
import {
  Alert,
  GestureResponderEvent,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type RouteKey = "home" | "library" | "create";

interface FooterProps {
  onNavigate?: (route: RouteKey) => void;
  active?: RouteKey;
}

/**
 * Reusable Footer component:
 * - uses lucide-react-native icons
 * - responsive icon size based on screen width
 * - accessible Pressable buttons
 * - calls onNavigate(route) if provided, otherwise shows an Alert (useful for demo)
 */
export const Footer: React.FC<FooterProps> = ({ onNavigate, active = "home" }) => {
  const { width } = useWindowDimensions();
  const iconSize = Math.round(Math.max(18, Math.min(28, width * 0.06))); // responsive size

  const handlePress = (route: RouteKey) => {
    if (route === "home") {
      // Redireciona para a tela games
      router.push("/(tabs)/home");
      return;
    }
    
    if (onNavigate) {
      onNavigate(route);
    } else {
      // fallback demo action to satisfy "at least one functional button"
      Alert.alert("Botão pressionado", `Você clicou em: ${route}`);
    }
  };

  const NavButton = ({
    label,
    icon,
    route,
  }: {
    label: string;
    icon: ReactElement;
    route: RouteKey;
  }) => {
    const selected = active === route;
    const color = selected ? "#F8FAFC" : "#94A3B8"; // text/icon colors (tailwind slate variants)
    return (
      <Pressable
        onPress={(e: GestureResponderEvent) => handlePress(route)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        android_ripple={{ color: "rgba(255,255,255,0.06)" }}
        testID={`footer-${route}`}
        className="flex-1 items-center py-1"
        hitSlop={8}
      >
        {React.cloneElement(icon, { size: iconSize, color })}
        <Text className={`text-xs mt-1`} style={{ color }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-row bg-vapor-primary border-t border-slate-700/20 justify-around py-1 px-2 items-center">
      <NavButton label="Início" icon={<Home />} route="home" />
      <NavButton label="Suas Listas" icon={<LibraryBig />} route="library" />
      <NavButton label="Criar" icon={<Plus />} route="create" />
    </View>
  );
};

export default Footer;