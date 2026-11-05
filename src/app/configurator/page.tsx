import type { Metadata } from "next";
import { ConfiguratorWorkspace } from "@/components/configurator/ConfiguratorWorkspace";

export const metadata: Metadata = {
  title: "Configurator | Dishy",
  description: "Stel snel een gerecht samen via een template of kies zelf je ingrediënten.",
};

export default function ConfiguratorPage() {
  return <ConfiguratorWorkspace />;
}