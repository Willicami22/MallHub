import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Field,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import type { UserRole } from '@/features/.server/prisma/generated/client';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

type SetRoleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userName: string;
	currentRole: UserRole;
	onConfirm: (role: UserRole) => Promise<void>;
	isSubmitting: boolean;
};

const ALL_ROLES = [
	{ value: appRoles.CUSTOMER, label: () => m.admin_users_role_customer() },
	{
		value: appRoles.ADMIN_LOCAL,
		label: () => m.admin_users_role_admin_local(),
	},
	{ value: appRoles.ADMIN_CC, label: () => m.admin_users_role_admin_cc() },
	{
		value: appRoles.ADMIN_PLATFORM,
		label: () => m.admin_users_role_admin_platform(),
	},
] as const;

export function SetRoleDialog({
	open,
	onOpenChange,
	userName,
	currentRole,
	onConfirm,
	isSubmitting,
}: SetRoleDialogProps) {
	const [selectedRole, setSelectedRole] = useState<string>(currentRole);
	const roleItems = ALL_ROLES.map((opt) => ({
		value: opt.value,
		label: opt.label(),
	}));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onConfirm(selectedRole as UserRole);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);
				if (nextOpen) setSelectedRole(currentRole);
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{m.admin_users_set_role_title()}</DialogTitle>
					<DialogDescription>
						{m.admin_users_set_role_description({ name: userName })}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-5">
					<Field>
						<FieldLabel>{m.admin_users_create_role_label()}</FieldLabel>
						<Select
							items={roleItems}
							value={selectedRole}
							onValueChange={(value) => setSelectedRole(value ?? currentRole)}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ALL_ROLES.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<DialogFooter>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							{m.admin_users_cancel()}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || selectedRole === currentRole}
						>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.admin_users_set_role_confirm()}
								</>
							) : (
								m.admin_users_set_role_confirm()
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
