import { Button, Toaster } from '@mallhub/ui';
import { ThemeProvider } from 'next-themes';
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import { TrpcQueryClientProvider } from '@/features/trpc/trpc.provider';
import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
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
		: 'Ocurrió un error';
	const message = isRouteErrorResponse(error)
		? error.statusText || 'No se pudo completar la solicitud.'
		: error instanceof Error
			? error.message
			: 'Error desconocido.';

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-xl items-center justify-center p-4">
			<div className="w-full space-y-4 rounded-lg border bg-card p-6">
				<h1 className="text-xl font-semibold">{title}</h1>
				<p className="text-sm text-muted-foreground">{message}</p>
				<Button
					onClick={() => {
						window.location.href = '/';
					}}
				>
					Volver al inicio
				</Button>
			</div>
		</div>
	);
}
