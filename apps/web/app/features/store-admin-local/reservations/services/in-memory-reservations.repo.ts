import type { Reservation } from '@/features/store-admin-local/shared/types/domain.models';

const seed: Reservation[] = [
	{
		id: 'res_1',
		storeId: 'store_seed_1',
		customerName: 'Laura Méndez',
		customerEmail: 'laura@example.com',
		startsAt: new Date(Date.now() + 86_400_000).toISOString(),
		endsAt: new Date(Date.now() + 90_000_000).toISOString(),
		status: 'pending',
		notes: 'Prefiere ventana de mañana',
		createdAt: new Date().toISOString(),
	},
	{
		id: 'res_2',
		storeId: 'store_seed_1',
		customerName: 'Carlos Ruiz',
		customerEmail: 'carlos@example.com',
		startsAt: new Date(Date.now() - 86_400_000).toISOString(),
		endsAt: new Date(Date.now() - 82_800_000).toISOString(),
		status: 'confirmed',
		notes: null,
		createdAt: new Date().toISOString(),
	},
];

let rows = [...seed];

export const inMemoryReservationsRepo = {
	listByStore(storeId: string): Reservation[] {
		return rows.filter((row) => row.storeId === storeId);
	},
	getById(id: string): Reservation | undefined {
		return rows.find((row) => row.id === id);
	},
	update(reservation: Reservation) {
		const index = rows.findIndex((row) => row.id === reservation.id);
		if (index === -1) {
			return;
		}
		rows = [...rows.slice(0, index), reservation, ...rows.slice(index + 1)];
	},
};
