import React from "react";
import { TextInput, View, Text, KeyboardTypeOptions } from "react-native";

type FormInputProps = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: "text" | "number";
  colorScheme: any;
};

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  type = "text",
  colorScheme,
}: FormInputProps) {
  const keyboardType: KeyboardTypeOptions =
    type === "number" ? "decimal-pad" : "default"; // 👈 allows decimals

  return (
    <View className="mb-3">
      {label && (
        <Text
          className="font-semibold mb-1"
          style={{ color: colorScheme.foreground }}
        >
          {label}
        </Text>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorScheme.mutedForeground}
        multiline={multiline}
        keyboardType={keyboardType} 
        className="rounded-md px-3 py-2 border text-base"
        style={{
          backgroundColor: colorScheme.input,
          borderColor: colorScheme.border,
          color: colorScheme.foreground,
        }}
      />
    </View>
  );
}
