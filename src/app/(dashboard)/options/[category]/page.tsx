import { notFound } from "next/navigation";
import { OptionsClient } from "../OptionsClient";
import { categoryFromSlug } from "../optionsCategories";
import { loadOptionsData } from "../loadOptionsData";

type Params = Promise<{ category: string }>;

export default async function OptionsCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { category: slug } = await params;
  const categoryId = categoryFromSlug(slug);
  if (!categoryId) notFound();

  const data = await loadOptionsData();

  return <OptionsClient categoryId={categoryId} {...data} />;
}
