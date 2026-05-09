import type { Reservation } from '@/features/store-admin-local/shared/types/domain.models';

const seed: Reservation[] = [
	{
		id: 'res_1',
		storeId: 'store_seed_1',
		productId: 'prod_1',
		productName: 'Producto Mock 1',
		quantity: 1,
		customerName: 'Laura Méndez',
		customerEmail: 'laura@example.com',
		pickupPhone: '1234567890',
		startsAt: new Date(Date.now() + 86_400_000).toISOString(),
		endsAt: new Date(Date.now() + 90_000_000).toISOString(),
		status: 'pending',
		notes: 'Prefiere ventana de mañana',
		requestedAt: new Date().toISOString(),
		confirmedAt: null,
		completedAt: null,
		canceledAt: null,
		statusReason: null,
		createdAt: new Date().toISOString(),
	},
	{
		id: 'res_2',
		storeId: 'store_seed_1',
		productId: 'prod_2',
		productName: 'Producto Mock 2',
		quantity: 2,
		customerName: 'Carlos Ruiz',
		customerEmail: 'carlos@example.com',
		pickupPhone: '0987654321',
		startsAt: new Date(Date.now() - 86_400_000).toISOString(),
		endsAt: new Date(Date.now() - 82_800_000).toISOString(),
		status: 'confirmed',
		notes: null,
		requestedAt: new Date(Date.now() - 90_000_000).toISOString(),
		confirmedAt: new Date(Date.now() - 86_400_000).toISOString(),
		completedAt: null,
		canceledAt: null,
		statusReason: null,
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
