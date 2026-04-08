import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@mallhub/ui';
import * as m from '@/paraglide/messages.js';

const faqs = [
	{ id: 'faq-1', getQ: m.landing_faq_1_q, getA: m.landing_faq_1_a },
	{ id: 'faq-2', getQ: m.landing_faq_2_q, getA: m.landing_faq_2_a },
	{ id: 'faq-3', getQ: m.landing_faq_3_q, getA: m.landing_faq_3_a },
	{ id: 'faq-4', getQ: m.landing_faq_4_q, getA: m.landing_faq_4_a },
	{ id: 'faq-5', getQ: m.landing_faq_5_q, getA: m.landing_faq_5_a },
] as const;

export function LandingFaq() {
	return (
		<section className="bg-background">
			<div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
				<h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					{m.landing_faq_title()}
				</h2>

				<div className="mt-12">
					<Accordion>
						{faqs.map((faq) => (
							<AccordionItem key={faq.id} value={faq.id}>
								<AccordionTrigger>{faq.getQ()}</AccordionTrigger>
								<AccordionContent>
									<p className="text-muted-foreground">{faq.getA()}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
