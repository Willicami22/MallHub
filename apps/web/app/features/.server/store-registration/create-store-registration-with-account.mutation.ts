import { TRPCError } from '@trpc/server';
import { isAPIError } from 'better-auth/api';
import { z } from 'zod';
import { notifyStoreRegistrationRequest } from '@/features/.server/admin-platform/store-registration/store-registration-notification.lib';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { appendResponseHeaders } from '@/features/.server/better-auth/response-headers.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { getLocaleFromAsyncStorage } from '@/features/.server/trpc/locale.context';
import { procedures } from '@/features/.server/trpc/trpc.init';
import * as m from '@/paraglide/messages.js';

const inputSchema = z.object({
	mallId: z.string().trim().min(1),
	storeName: z.string().trim().min(2),
	category: z.string().trim().min(2),
	mail: z.email(),
	password: z.string().min(8).max(128),
	contactPhone: z.string().trim().min(7).max(20),
	description: z.string().trim().max(2000).optional(),
});

const toApiErrorCode = (error: unknown): string | null => {
	if (!isAPIError(error)) return null;
	return typeof error.body?.code === 'string' ? error.body.code : null;
};

export const createStoreRegistrationWithAccountMutation = procedures.public
	.input(inputSchema)
	.mutation(async ({ ctx, input }) => {
		const locale = getLocaleFromAsyncStorage();

		const mall = await prisma.mall.findUnique({
			where: { id: input.mallId },
			select: {
				id: true,
				name: true,
				status: true,
				adminCcUser: { select: { id: true, name: true, email: true } },
			},
		});

		if (!mall) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: m.admin_store_registrations_create_mall_not_found(
					{},
					{ locale },
				),
			});
		}

		if (mall.status !== 'ACTIVE') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: m.admin_store_registrations_create_mall_inactive(
					{},
					{ locale },
				),
			});
		}

		type SignUpWithHeadersResult = {
			headers: Headers;
			response: { user: { id: string } };
		};
		let signUpResult!: SignUpWithHeadersResult;

		try {
			signUpResult = (await auth.api.signUpEmail({
				body: {
					email: input.mail,
					password: input.password,
					name: input.storeName,
				},
				headers: ctx.headers,
				returnHeaders: true,
			})) as unknown as SignUpWithHeadersResult;
		} catch (error) {
			const code = toApiErrorCode(error);

			if (
				code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' ||
				code === 'USER_ALREADY_EXISTS'
			) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: m.register_email_already_exists({}, { locale }),
					cause: new z.ZodError([
						{
							code: 'custom',
							path: ['mail'],
							message: m.register_email_already_exists({}, { locale }),
						},
					]),
				});
			}

			if (code === 'INVALID_EMAIL') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_validation_email_invalid({}, { locale }),
					cause: new z.ZodError([
						{
							code: 'custom',
							path: ['mail'],
							message: m.register_validation_email_invalid({}, { locale }),
						},
					]),
				});
			}

			if (code === 'PASSWORD_TOO_SHORT') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: m.register_password_too_short({}, { locale }),
					cause: new z.ZodError([
						{
							code: 'custom',
							path: ['password'],
							message: m.register_password_too_short({}, { locale }),
						},
					]),
				});
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: m.auth_unexpected_error({}, { locale }),
				cause: error instanceof Error ? error : undefined,
			});
		}

		const createdUser = await prisma.user.findUniqueOrThrow({
			where: { email: input.mail },
			select: { id: true },
		});

		await prisma.user.update({
			where: { id: createdUser.id },
			data: { role: 'ADMIN_LOCAL' },
		});

		const registrationRequest = await prisma.storeRegistrationRequest.create({
			data: {
				mallId: input.mallId,
				applicantUserId: createdUser.id,
				storeName: input.storeName,
				category: input.category,
				description: input.description?.trim() || null,
				contactEmail: input.mail,
				contactPhone: input.contactPhone,
				status: 'PENDING',
			},
			select: {
				id: true,
				storeName: true,
				category: true,
				status: true,
				createdAt: true,
			},
		});

		notifyStoreRegistrationRequest({
			registrationRequestId: registrationRequest.id,
			storeName: registrationRequest.storeName,
			mallName: mall.name,
			applicantUser: { name: input.storeName, email: input.mail },
			adminCcUser: mall.adminCcUser
				? {
						name: mall.adminCcUser.name,
						email: mall.adminCcUser.email,
					}
				: null,
		});

		appendResponseHeaders(ctx.resHeaders, signUpResult.headers);

		return { registrationRequest };
	});
