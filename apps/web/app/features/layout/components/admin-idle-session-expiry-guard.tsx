import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
	authReasons,
	withAuthReason,
} from '@/features/better-auth/auth-reason.lib';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';
import { useAppSession } from '@/features/better-auth/better-auth-session.provider';
import { withReturnTo } from '@/features/better-auth/return-to.lib';
import { useTRPC } from '@/features/trpc/trpc.context';
import { localizeHref } from '@/paraglide/runtime.js';

const IDLE_SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = [
	'mousedown',
	'keydown',
	'scroll',
	'touchstart',
	'mousemove',
] as const;

const toCurrentPath = (location: {
	pathname: string;
	search: string;
	hash: string;
}) => `${location.pathname}${location.search}${location.hash}`;

export function AdminIdleSessionExpiryGuard() {
	const trpc = useTRPC();
	const session = useAppSession();
	const location = useLocation();
	const navigate = useNavigate();
	const timerRef = useRef<number | null>(null);
	const isExpiringRef = useRef(false);
	const expireAdminSessionMutation = useMutation(
		trpc.auth.expireAdminSession.mutationOptions(),
	);

	const isAdminPlatformUser =
		session.data?.user.role === appRoles.ADMIN_PLATFORM;

	const clearIdleTimer = useCallback(() => {
		if (timerRef.current === null) {
			return;
		}

		window.clearTimeout(timerRef.current);
		timerRef.current = null;
	}, []);

	const getSessionExpiredRedirectHref = useCallback(() => {
		const returnTo = toCurrentPath(location);
		const loginHref = withReturnTo(localizeHref('/auth/login'), returnTo);
		return withAuthReason(loginHref, authReasons.ADMIN_SESSION_EXPIRED);
	}, [location]);

	const handleSessionExpiry = useCallback(async () => {
		if (isExpiringRef.current) {
			return;
		}

		isExpiringRef.current = true;

		try {
			await expireAdminSessionMutation.mutateAsync({
				currentPath: toCurrentPath(location),
			});
		} catch (error) {
			console.error('[admin.idle-session-expiry] Error', { error });
		}

		navigate(getSessionExpiredRedirectHref(), { replace: true });
	}, [
		expireAdminSessionMutation,
		getSessionExpiredRedirectHref,
		location,
		navigate,
	]);

	const scheduleIdleTimer = useCallback(() => {
		clearIdleTimer();

		if (!isAdminPlatformUser || isExpiringRef.current) {
			return;
		}

		timerRef.current = window.setTimeout(() => {
			void handleSessionExpiry();
		}, IDLE_SESSION_TIMEOUT_MS);
	}, [clearIdleTimer, handleSessionExpiry, isAdminPlatformUser]);

	useEffect(() => {
		if (!isAdminPlatformUser) {
			clearIdleTimer();
			isExpiringRef.current = false;
			return;
		}

		scheduleIdleTimer();

		const resetIdleTimer = () => {
			scheduleIdleTimer();
		};

		for (const eventName of ACTIVITY_EVENTS) {
			window.addEventListener(eventName, resetIdleTimer);
		}

		return () => {
			clearIdleTimer();
			for (const eventName of ACTIVITY_EVENTS) {
				window.removeEventListener(eventName, resetIdleTimer);
			}
		};
	}, [clearIdleTimer, isAdminPlatformUser, scheduleIdleTimer]);

	return null;
}
