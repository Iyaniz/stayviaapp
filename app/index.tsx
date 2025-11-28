import { useRouter } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";

// @ts-ignore - accessing internal global
global._REANIMATED_LOG = {
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
};

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-in");
  }, []);

  return null;
}
