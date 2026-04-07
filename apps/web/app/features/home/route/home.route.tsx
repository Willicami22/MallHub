import * as m from '@/paraglide/messages.js';
import { LandingBusinessBenefits } from '../components/landing-business-benefits';
import { LandingBuyerBenefits } from '../components/landing-buyer-benefits';
import { LandingFaq } from '../components/landing-faq';
import { LandingFeatures } from '../components/landing-features';
import { LandingFinalCta } from '../components/landing-final-cta';
import { LandingFooter } from '../components/landing-footer';
import { LandingHero } from '../components/landing-hero';
import { LandingHowItWorks } from '../components/landing-how-it-works';
import { LandingProblemSolution } from '../components/landing-problem-solution';
import { LandingStats } from '../components/landing-stats';
import { LandingTrust } from '../components/landing-trust';
import type { Route } from './+types/home.route';

export const meta = ({ location: _location }: Route.MetaArgs) => [
	{ title: m.landing_meta_title() },
	{ name: 'description', content: m.landing_meta_description() },
];

export default function HomeRoute() {
	return (
		<>
			<LandingHero />
			<LandingStats />
			<LandingProblemSolution />
			<LandingHowItWorks />
			<LandingBuyerBenefits />
			<LandingBusinessBenefits />
			<LandingFeatures />
			<LandingTrust />
			<LandingFaq />
			<LandingFinalCta />
			<LandingFooter />
		</>
	);
}
