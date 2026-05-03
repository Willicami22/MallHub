import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@mallhub/ui';
import { Link } from 'react-router';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import * as m from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';

export function GuestAuthDialog({
	open,
	onClose,
	returnTo,
	title,
	description,
}: {
	open: boolean;
	onClose: () => void;
	returnTo: string;
	title: string;
	description: string;
}) {
	const registerHref = withReturnTo(localizeHref('/auth/register'), returnTo);
	const loginHref = withReturnTo(localizeHref('/auth/login'), returnTo);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button nativeButton={false} render={<Link to={registerHref} />}>
						{m.product_detail_reserve_guest_register()}
					</Button>
					<Button
						variant="outline"
						nativeButton={false}
						render={<Link to={loginHref} />}
					>
						{m.product_detail_reserve_guest_login()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
