import {
	LockPasswordIcon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldError,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Spinner,
} from '@mallhub/ui';
import { useState } from 'react';
import type { TanStackZodError } from '@/features/.server/trpc/trpc.init';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import * as m from '@/paraglide/messages.js';

type CreateUserDialogProps = {
	trigger: React.ReactNode;
	onSubmit: (data: {
		name: string;
		email: string;
		password: string;
		role: string;
	}) => Promise<void>;
	isSubmitting: boolean;
	fieldErrors?: TanStackZodError | null;
};

const ROLE_OPTIONS = [
	{ value: appRoles.ADMIN_CC, label: () => m.admin_users_role_admin_cc() },
	{
		value: appRoles.ADMIN_LOCAL,
		label: () => m.admin_users_role_admin_local(),
	},
	{ value: appRoles.CUSTOMER, label: () => m.admin_users_role_customer() },
] as const;

export function CreateUserDialog({
	trigger,
	onSubmit,
	isSubmitting,
	fieldErrors,
}: CreateUserDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState<string>(appRoles.ADMIN_CC);
	const roleItems = ROLE_OPTIONS.map((opt) => ({
		value: opt.value,
		label: opt.label(),
	}));

	const resetForm = () => {
		setName('');
		setEmail('');
		setPassword('');
		setRole(appRoles.ADMIN_CC);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit({ name, email, password, role });
		if (!fieldErrors) {
			resetForm();
			setOpen(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) resetForm();
			}}
		>
			<DialogTrigger render={trigger as React.ReactElement} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.admin_users_create_title()}</DialogTitle>
					<DialogDescription>
						{m.admin_users_create_description()}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-5">
					<Field>
						<FieldLabel htmlFor="create-user-name">
							{m.admin_users_create_name_label()}
						</FieldLabel>
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<HugeiconsIcon icon={UserIcon} />
							</InputGroupAddon>
							<InputGroupInput
								id="create-user-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={m.admin_users_create_name_placeholder()}
								required
							/>
						</InputGroup>
						{fieldErrors?.name && (
							<FieldError>{fieldErrors.name.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="create-user-email">
							{m.admin_users_create_email_label()}
						</FieldLabel>
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<HugeiconsIcon icon={Mail01Icon} />
							</InputGroupAddon>
							<InputGroupInput
								id="create-user-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={m.admin_users_create_email_placeholder()}
								required
							/>
						</InputGroup>
						{fieldErrors?.email && (
							<FieldError>{fieldErrors.email.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="create-user-password">
							{m.admin_users_create_password_label()}
						</FieldLabel>
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<HugeiconsIcon icon={LockPasswordIcon} />
							</InputGroupAddon>
							<InputGroupInput
								id="create-user-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={m.admin_users_create_password_placeholder()}
								required
								minLength={8}
							/>
						</InputGroup>
						{fieldErrors?.password && (
							<FieldError>{fieldErrors.password.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel>{m.admin_users_create_role_label()}</FieldLabel>
						<Select
							items={roleItems}
							value={role}
							onValueChange={(value) => setRole(value ?? appRoles.ADMIN_CC)}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ROLE_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Spinner />
									{m.admin_users_create_submit()}
								</>
							) : (
								m.admin_users_create_submit()
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
