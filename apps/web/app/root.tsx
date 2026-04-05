import { Button, Toaster } from '@mallhub/ui';
import { ThemeProvider } from 'next-themes';
import {
	type MiddlewareFunction,
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import { TrpcQueryClientProvider } from '@/features/trpc/trpc.provider';
import type { Route } from './+types/root';
import * as m from './paraglide/messages.js';
import { getLocale, localizeHref } from './paraglide/runtime.js';
import { paraglideMiddleware } from './paraglide/server.js';
import './app.css';

export const links: Route.LinksFunction = () => [];

export const middleware: MiddlewareFunction[] = [
	(ctx, next) => {
		const pathname = new URL(ctx.request.url).pathname;
		if (pathname === '/api' || pathname.startsWith('/api/')) {
			return next();
		}

		return paraglideMiddleware(ctx.request, () => next());
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<Toaster position="bottom-right" />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<ThemeProvider attribute="class" storageKey="theme" enableSystem>
			<TrpcQueryClientProvider>
				<Outlet />
			</TrpcQueryClientProvider>
		</ThemeProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const title = isRouteErrorResponse(error)
		? `Error ${error.status}`
		: m.error_title();
	const message = isRouteErrorResponse(error)
		? error.statusText || m.error_status_fallback()
		: error instanceof Error
			? error.message
			: m.error_unknown();

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-xl items-center justify-center p-4">
			<div className="w-full space-y-4 rounded-lg border bg-card p-6">
				<h1 className="text-xl font-semibold">{title}</h1>
				<p className="text-sm text-muted-foreground">{message}</p>
				<Button
					onClick={() => {
						window.location.href = localizeHref('/');
					}}
				>
					{m.error_back_to_home()}
				</Button>
			</div>
		</div>
	);
}
