import { redirect } from "next/navigation";
import { OPTION_CATEGORIES } from "./optionsCategories";

export default function OptionsPage() {
  redirect(`/options/${OPTION_CATEGORIES[0].slug}`);
}
