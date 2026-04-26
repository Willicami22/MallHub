import { Megaphone01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge, Button } from '@mallhub/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTRPC } from '@/features/trpc/trpc.context';
import * as m from '@/paraglide/messages.js';

export function LandingSponsoredCampaigns() {
	const trpc = useTRPC();
	const trackedImpressionCampaignIdsRef = useRef(new Set<string>());

	const campaignsQuery = useQuery(
		trpc.campaigns.listActive.queryOptions({
			limit: 3,
		}),
	);
	const trackInteractionMutation = useMutation(
		trpc.campaigns.trackInteraction.mutationOptions(),
	);

	const campaigns = campaignsQuery.data?.campaigns ?? [];

	useEffect(() => {
		for (const campaign of campaigns) {
			if (trackedImpressionCampaignIdsRef.current.has(campaign.id)) {
				continue;
			}

			trackedImpressionCampaignIdsRef.current.add(campaign.id);
			void trackInteractionMutation.mutateAsync({
				campaignId: campaign.id,
				eventType: 'IMPRESSION',
			});
		}
	}, [campaigns, trackInteractionMutation]);

	if (!campaigns.length) {
		return null;
	}

	return (
		<section className="bg-background">
			<div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
				<div className="mx-auto max-w-2xl space-y-3 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<HugeiconsIcon icon={Megaphone01Icon} className="size-4" />
						{m.landing_campaigns_badge()}
					</div>
					<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
						{m.landing_campaigns_title()}
					</h2>
					<p className="text-muted-foreground">
						{m.landing_campaigns_subtitle()}
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
					{campaigns.map((campaign) => (
						<article key={campaign.id} className="rounded-xl border bg-card">
							<img
								src={campaign.imageUrl}
								alt={campaign.name}
								className="h-40 w-full rounded-t-xl object-cover"
								loading="lazy"
							/>
							<div className="space-y-4 p-5">
								<div className="flex items-center justify-between gap-2">
									<p className="truncate text-sm text-muted-foreground">
										{campaign.advertiserName}
									</p>
									<Badge variant="secondary">
										{m.landing_campaigns_badge()}
									</Badge>
								</div>
								<h3 className="text-base font-semibold text-foreground">
									{campaign.name}
								</h3>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{m.landing_campaigns_target_malls({
										malls:
											campaign.targetMalls
												.map((mall) => mall.name)
												.join(', ') || '-',
									})}
								</p>
								<Button
									className="w-full"
									type="button"
									onClick={() => {
										void trackInteractionMutation.mutateAsync({
											campaignId: campaign.id,
											eventType: 'CLICK',
										});
										globalThis.open(
											campaign.destinationUrl,
											'_blank',
											'noopener,noreferrer',
										);
									}}
								>
									{m.landing_campaigns_cta()}
								</Button>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
