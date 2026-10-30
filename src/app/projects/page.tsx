import type { Metadata } from "next";
import ProjectsLibrary from "./ProjectsLibrary";

export const metadata: Metadata = {
  title: "Projects | Viet Hoang",
  description: "Viet Hoang's projects: Gator Guide, AskDMV, HuskyCart, Digital Fridge, and more.",
};

export default function ProjectsPage() {
  return <ProjectsLibrary />;
}
