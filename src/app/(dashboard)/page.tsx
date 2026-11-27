import { Suspense } from "react";
import {
  HomeAboveFold,
  HomeChartsSection,
  HomeQuickActionsSection,
  HomeSectionFallback,
  HomeStockListsSection,
} from "./HomeSections";

export default function HomePage() {
  return (
    <div className="home">
      <Suspense fallback={<HomeSectionFallback label="Loading key information" />}>
        <HomeAboveFold />
      </Suspense>

      <Suspense fallback={<HomeSectionFallback label="Loading quick links" />}>
        <HomeQuickActionsSection />
      </Suspense>

      <Suspense fallback={<HomeSectionFallback label="Loading charts" />}>
        <HomeChartsSection />
      </Suspense>

      <Suspense fallback={<HomeSectionFallback label="Loading stock lists" />}>
        <HomeStockListsSection />
      </Suspense>
    </div>
  );
}
