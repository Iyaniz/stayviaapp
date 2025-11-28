import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

export function ChipSelector({
  options,
  label,
  selected,
  onChange,
  colorScheme,
}: {
  options: string[];
  label: string;
  selected: string[];
  onChange: (newSelected: string[]) => void;
  colorScheme: any;
}) {
  const toggle = (item: string) => {
    const newSelected = selected.includes(item)
      ? selected.filter((x) => x !== item)
      : [...selected, item];
    onChange(newSelected); 
  };

  return (
    <View className="mb-4">
      <Text
        className="font-semibold mb-2"
        style={{ color: colorScheme.foreground }}
      >
        {label}
      </Text>
      <View className="flex-row flex-wrap">
        {options.map((item) => {
          const active = selected.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => toggle(item)}
              className="rounded-md px-3 py-2 m-1 border"
              style={{
                backgroundColor: active
                  ? colorScheme.primary
                  : colorScheme.card,
                borderColor: colorScheme.border,
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : colorScheme.foreground,
                  fontWeight: active ? "600" : "400",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
