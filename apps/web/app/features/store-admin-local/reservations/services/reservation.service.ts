import { inMemoryReservationsRepo } from '@/features/store-admin-local/reservations/services/in-memory-reservations.repo';
import { mockLatency } from '@/features/store-admin-local/shared/lib/mock-api.lib';
import type {
	Reservation,
	ReservationStatus,
} from '@/features/store-admin-local/shared/types/domain.models';
import { ServiceError } from '@/features/store-admin-local/shared/types/service-error.types';

const allowed: Record<ReservationStatus, ReservationStatus[]> = {
	pending: ['confirmed', 'rejected', 'canceled'],
	confirmed: ['completed', 'canceled'],
	rejected: [],
	canceled: [],
	completed: [],
};

export const reservationService = {
	async listByStore(storeId: string): Promise<Reservation[]> {
		await mockLatency(260);
		return inMemoryReservationsRepo.listByStore(storeId);
	},

	async transition(
		reservationId: string,
		next: ReservationStatus,
	): Promise<Reservation> {
		await mockLatency(220);
		const current = inMemoryReservationsRepo.getById(reservationId);
		if (!current) {
			throw new ServiceError('Reserva no encontrada', {
				code: 'NOT_FOUND',
				status: 404,
			});
		}

		const options = allowed[current.status];
		if (!options.includes(next)) {
			throw new ServiceError('Transición no permitida', {
				code: 'VALIDATION',
				status: 400,
			});
		}

		const updated: Reservation = { ...current, status: next };
		inMemoryReservationsRepo.update(updated);
		return updated;
	},
};
