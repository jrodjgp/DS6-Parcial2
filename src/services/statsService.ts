import { Asset, OperationalEvent } from '../types';

export type ManagerStats = {
  totalAssets: number;
  operationalEvents: number;
  openPendingEvents: number;
  accumulatedCost: number;
  criticalAssets: number;
  upcomingReviews: number;
};

export function getAssetsForUser(assets: Asset[], userId: string): Asset[] {
  return assets.filter((asset) => asset.userId === userId);
}

export function getEventsForAssets(
  events: OperationalEvent[],
  assets: Asset[],
): OperationalEvent[] {
  const assetIds = new Set(assets.map((asset) => asset.id));
  return events.filter((event) => assetIds.has(event.assetId));
}

export function calculateManagerStats(
  assets: Asset[],
  events: OperationalEvent[],
  userId: string,
  referenceDate = new Date(),
): ManagerStats {
  const managerAssets = getAssetsForUser(assets, userId);
  const managerEvents = getEventsForAssets(events, managerAssets);

  const openPendingEvents = managerEvents.filter(
    (event) => event.status === 'Pendiente' || event.status === 'En proceso',
  ).length;

  const accumulatedCost = managerEvents.reduce((total, event) => total + event.cost, 0);

  const upcomingReviews = managerEvents.filter((event) => {
    if (!event.nextReviewDate) {
      return false;
    }

    const reviewDate = new Date(event.nextReviewDate);

    if (Number.isNaN(reviewDate.getTime())) {
      return false;
    }

    return reviewDate.getTime() > referenceDate.getTime();
  }).length;

  return {
    totalAssets: managerAssets.length,
    operationalEvents: managerEvents.length,
    openPendingEvents,
    accumulatedCost,
    criticalAssets: managerAssets.filter((asset) => asset.priority === 'Crítica').length,
    upcomingReviews,
  };
}
