import { LoadingState } from "@/components/ui/loading-state";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");
  return <LoadingState label={t("loading")} />;
}
