import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select";
import type { TriggerRef } from "@rn-primitives/select";
import { Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BedSelector({
  label,
  value,
  onChange,
  options = ["Single Occupancy", "2 Persons", "3–4 Persons"],
}: {
  label: string;
  value: string | null;
  onChange: (val: string) => void;
  options?: string[];
}) {
  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  const selectedOption: Option | undefined = value
    ? { label: value, value: value }
    : undefined;

  const placeholderText = selectedOption
    ? selectedOption.label
    : `Select ${label.toLowerCase()}`;

  // ✅ Fix for Android touch not opening menu
  const handlePress = () => {
    ref.current?.open();
  };

  return (
    <Select
      value={selectedOption}
      onValueChange={(option: Option) => onChange(option?.value || "")}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <SelectTrigger
          ref={ref}
          className="border border-gray-300 dark:border-neutral-700 rounded-md px-4 py-1 bg-white dark:bg-neutral-900 w-full"
        >
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
      </TouchableOpacity>

      <SelectContent insets={contentInsets} className="w-full">
        <SelectGroup>
          <SelectLabel className="text-gray-500 dark:text-gray-400">
            {label}
          </SelectLabel>

          {options.map((opt) => (
            <SelectItem key={opt} value={opt} label={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
