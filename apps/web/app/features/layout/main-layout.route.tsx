import { Outlet } from 'react-router';
import { Navbar } from './components/navbar';

export default function MainLayoutRoute() {
	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<Navbar />
			<main className="flex-1">
				<Outlet />
			</main>
		</div>
	);
}
