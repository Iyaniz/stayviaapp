import React from "react";
import { View, Text, StyleSheet, Image, Switch } from "react-native";
import CustomBtn from "@/components/CustomBtn";

export type InfoCardProps = {
  bgColor: string;
  tagColor: string;
  tagTextColor: string;
  title: string;
  subtitle: string;
  image: any;
  read: boolean;
  toggleRead: () => void;
  onPress: () => void;
  tag: string;
  btnText: string;
  switchLabel: string;
};

export default function InfoCard({
  bgColor,
  tagColor,
  tagTextColor,
  title,
  subtitle,
  image,
  read,
  toggleRead,
  onPress,
  tag,
  btnText,
  switchLabel,
}: InfoCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.tag, { backgroundColor: tagColor, color: tagTextColor }]}>{tag}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{switchLabel}</Text>
          <Switch value={read} onValueChange={toggleRead} />
        </View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <Image source={image} style={styles.icon} resizeMode="contain" />
      <CustomBtn text={btnText} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchLabel: {
    fontSize: 14,
    marginRight: 4,
    color: "#333",
  },
  tag: {
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  icon: {
    width: 60,
    height: 60,
    alignSelf: "flex-end",
    marginBottom: 12,
  },
});
