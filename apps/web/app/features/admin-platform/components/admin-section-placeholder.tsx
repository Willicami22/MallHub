import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@mallhub/ui';
import * as m from '@/paraglide/messages.js';

interface AdminSectionPlaceholderProps {
	sectionName: string;
}

export function AdminSectionPlaceholder({
	sectionName,
}: AdminSectionPlaceholderProps) {
	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
			<Card>
				<CardHeader>
					<CardTitle>{m.admin_workspace_section_coming_soon_title()}</CardTitle>
					<CardDescription>
						{m.admin_workspace_section_coming_soon_description({
							section: sectionName,
						})}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						{m.admin_workspace_section_coming_soon_note()}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
