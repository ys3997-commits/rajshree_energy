import { OptionsClient } from "./OptionsClient";
import { loadOptionsData } from "./loadOptionsData";
import type { CategoryId } from "./optionsCategories";

export async function OptionsCategoryScreen({
  categoryId,
}: {
  categoryId: CategoryId;
}) {
  const data = await loadOptionsData(categoryId);
  return <OptionsClient key={categoryId} categoryId={categoryId} {...data} />;
}
