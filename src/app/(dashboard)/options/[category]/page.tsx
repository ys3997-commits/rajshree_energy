import { notFound, redirect } from "next/navigation";
import { OptionsCategoryScreen } from "../OptionsCategoryScreen";
import { categoryFromSlug } from "../optionsCategories";

type Params = Promise<{ category: string }>;

export default async function OptionsCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { category: slug } = await params;
  if (slug === "documents") redirect("/documents");
  const categoryId = categoryFromSlug(slug.trim().toLowerCase());
  if (!categoryId) notFound();

  return <OptionsCategoryScreen categoryId={categoryId} />;
}
