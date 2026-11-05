import type { Metadata } from "next";
import { DishLibrary } from "@/components/dishes/DishLibrary";

export const metadata: Metadata = {
  title: "Gerechten | Dishy",
  description: "Je bibliotheek met familiegerechten.",
};

export default function GerechtenPage() {
  return <DishLibrary />;
}