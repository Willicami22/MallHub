import { startOfDay, subDays } from 'date-fns';
import { z } from 'zod';

/**
 * MOCK-DB CENTRALIZADO PARA ADMIN CC
 *
 * - Simula una base de datos de centros comerciales
 * - Mantiene estado en memoria (persiste durante la sesión)
 * - Proporciona CRUD operations para todos los módulos admin-cc
 * - SIN acceso a PostgreSQL/Prisma
 */

// ============================================================================
// TIPOS Y ESQUEMAS ZODU
// ============================================================================

export const StoreStatusEnum = z.enum([
	'PENDING',
	'APPROVED',
	'REJECTED',
	'SUSPENDED',
	'ACTIVE',
]);

export type StoreStatus = z.infer<typeof StoreStatusEnum>;

export const StoreSchema = z.object({
	id: z.string(),
	mallId: z.string(),
	name: z.string(),
	category: z.string(),
	status: StoreStatusEnum,
	requestedAt: z.string().datetime(),
	approvedAt: z.string().datetime().optional(),
	contactEmail: z.string().email(),
	ownerUserId: z.string().optional(),
});

export type Store = z.infer<typeof StoreSchema>;

export const MallConfigSchema = z.object({
	mallId: z.string(),
	name: z.string(),
	description: z.string(),
	address: z.string(),
	hours: z.array(
		z.object({
			day: z.string(),
			open: z.string(),
			close: z.string(),
		}),
	),
	categories: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
		}),
	),
	logoUrl: z.string(),
	bannerUrl: z.string(),
	mapSvgUrl: z.string(),
});

export type MallConfig = z.infer<typeof MallConfigSchema>;

export const DailyMetricSchema = z.object({
	mallId: z.string(),
	date: z.string(), // YYYY-MM-DD
	visits: z.number(),
	reservations: z.number(),
	completed: z.number(),
});

export type DailyMetric = z.infer<typeof DailyMetricSchema>;

export const EventSchema = z.object({
	id: z.string(),
	mallId: z.string(),
	title: z.string(),
	description: z.string(),
	date: z.string().datetime(),
	location: z.string(),
	status: z.enum(['DRAFT', 'PUBLISHED', 'ENDED']),
});

export type Event = z.infer<typeof EventSchema>;

// ============================================================================
// MOCK DATA STORAGE (En Memoria)
// ============================================================================

interface MockDbStore {
	stores: Map<string, Store>;
	malls: Map<string, MallConfig>;
	metrics: Map<string, DailyMetric>; // key: "mallId-YYYY-MM-DD"
	events: Map<string, Event>;
}

const mockDb: MockDbStore = {
	stores: new Map(),
	malls: new Map(),
	metrics: new Map(),
	events: new Map(),
};

// ============================================================================
// INICIALIZACIÓN CON DATOS DEMO
// ============================================================================

export function initializeAdminCcMockDb() {
	// MALL DEFAULT
	const defaultMallId = 'mall-001';

	const defaultMallConfig: MallConfig = {
		mallId: defaultMallId,
		name: 'Plaza Central',
		description:
			'Centro comercial premium en el corazón de la ciudad, con acceso a todas las principales marcas internacionales.',
		address: 'Av. Principal 1200, Ciudad Central',
		hours: [
			{ day: 'Lunes', open: '09:00', close: '20:00' },
			{ day: 'Martes', open: '09:00', close: '20:00' },
			{ day: 'Miércoles', open: '09:00', close: '20:00' },
			{ day: 'Jueves', open: '09:00', close: '20:00' },
			{ day: 'Viernes', open: '09:00', close: '21:00' },
			{ day: 'Sábado', open: '10:00', close: '22:00' },
			{ day: 'Domingo', open: '10:00', close: '19:00' },
		],
		categories: [
			{ id: 'cat-001', name: 'Deportes' },
			{ id: 'cat-002', name: 'Ropa' },
			{ id: 'cat-003', name: 'Alimentos' },
			{ id: 'cat-004', name: 'Entretenimiento' },
			{ id: 'cat-005', name: 'Electrónica' },
		],
		logoUrl: '/mall-logo.png',
		bannerUrl: '/mall-banner.jpg',
		mapSvgUrl: '/mall-map.svg',
	};

	mockDb.malls.set(defaultMallId, defaultMallConfig);

	// TIENDAS DEMO
	const demoStores: Store[] = [
		{
			id: 'store-001',
			mallId: defaultMallId,
			name: 'Nike Store',
			category: 'Deportes',
			status: 'PENDING',
			requestedAt: subDays(new Date(), 2).toISOString(),
			contactEmail: 'gerente@nike-mall.com',
			ownerUserId: 'user-nike-001',
		},
		{
			id: 'store-002',
			mallId: defaultMallId,
			name: 'Zara',
			category: 'Ropa',
			status: 'APPROVED',
			requestedAt: subDays(new Date(), 30).toISOString(),
			approvedAt: subDays(new Date(), 28).toISOString(),
			contactEmail: 'admin@zara-mall.com',
			ownerUserId: 'user-zara-001',
		},
		{
			id: 'store-003',
			mallId: defaultMallId,
			name: 'Starbucks',
			category: 'Alimentos',
			status: 'PENDING',
			requestedAt: subDays(new Date(), 0.2).toISOString(), // Hace 5 horas aprox
			contactEmail: 'franquicia@starbucks.com',
			ownerUserId: 'user-starbucks-001',
		},
		{
			id: 'store-004',
			mallId: defaultMallId,
			name: 'Cineplanet',
			category: 'Entretenimiento',
			status: 'REJECTED',
			requestedAt: subDays(new Date(), 15).toISOString(),
			contactEmail: 'contacto@cineplanet.com',
		},
		{
			id: 'store-005',
			mallId: defaultMallId,
			name: 'Apple Store',
			category: 'Electrónica',
			status: 'ACTIVE',
			requestedAt: subDays(new Date(), 60).toISOString(),
			approvedAt: subDays(new Date(), 55).toISOString(),
			contactEmail: 'admin@apple-mall.com',
			ownerUserId: 'user-apple-001',
		},
	];

	demoStores.forEach((store) => {
		mockDb.stores.set(store.id, store);
	});

	// MÉTRICAS DEMO (últimos 30 días)
	for (let i = 29; i >= 0; i--) {
		const date = subDays(new Date(), i);
		const dateStr = startOfDay(date).toISOString().split('T')[0];

		// Generar números pseudo-aleatorios deterministicos basados en la fecha
		// Para que siempre sean iguales para la misma fecha
		const seed = date.getTime();
		const seedRandom = (s: number) => {
			const x = Math.sin(s) * 10000;
			return x - Math.floor(x);
		};

		// Más visitas el fin de semana
		const dayOfWeek = date.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		const baseVisits = 400 + seedRandom(seed) * 300;
		const multiplier = isWeekend ? 1.5 : 1;

		const metric: DailyMetric = {
			mallId: defaultMallId,
			date: dateStr,
			visits: Math.floor(baseVisits * multiplier),
			reservations: Math.floor(
				baseVisits * multiplier * 0.15 + seedRandom(seed + 1000) * 50,
			),
			completed: Math.floor(
				baseVisits * multiplier * 0.12 + seedRandom(seed + 2000) * 40,
			),
		};

		mockDb.metrics.set(`${defaultMallId}-${dateStr}`, metric);
	}

	// EVENTOS DEMO
	const demoEvents: Event[] = [
		{
			id: 'event-001',
			mallId: defaultMallId,
			title: 'Gran Venta de Verano',
			description: 'Promociones hasta 50% en ropa y accesorios',
			date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			location: 'Zona Centro',
			status: 'PUBLISHED',
		},
		{
			id: 'event-002',
			mallId: defaultMallId,
			title: 'Noche de Cine',
			description: 'Estrenos exclusivos con descuentos especiales',
			date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
			location: 'Cineplanet',
			status: 'DRAFT',
		},
	];

	demoEvents.forEach((event) => {
		mockDb.events.set(event.id, event);
	});

	console.log('✅ Mock-DB Admin CC inicializado');
}

// ============================================================================
// CRUD OPERATIONS - STORES
// ============================================================================

export function getStoresByMallId(mallId: string): Store[] {
	return Array.from(mockDb.stores.values()).filter(
		(store) => store.mallId === mallId,
	);
}

export function getStoreById(storeId: string): Store | null {
	return mockDb.stores.get(storeId) ?? null;
}

export function updateStoreStatus(
	storeId: string,
	newStatus: StoreStatus,
): Store {
	const store = mockDb.stores.get(storeId);
	if (!store) {
		throw new Error(`Store ${storeId} not found`);
	}

	const updated: Store = {
		...store,
		status: newStatus,
		...(newStatus === 'APPROVED' && { approvedAt: new Date().toISOString() }),
	};

	mockDb.stores.set(storeId, updated);
	return updated;
}

export function addStore(
	mallId: string,
	data: Omit<Store, 'id' | 'mallId' | 'requestedAt'>,
): Store {
	const storeId = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const newStore: Store = {
		id: storeId,
		mallId,
		...data,
		requestedAt: new Date().toISOString(),
	};

	mockDb.stores.set(storeId, newStore);
	return newStore;
}

export function suspendStore(storeId: string): Store {
	return updateStoreStatus(storeId, 'SUSPENDED');
}

export function reactivateStore(storeId: string): Store {
	const store = mockDb.stores.get(storeId);
	if (!store) throw new Error(`Store ${storeId} not found`);

	const updated: Store = {
		...store,
		status: store.status === 'SUSPENDED' ? 'ACTIVE' : store.status,
	};

	mockDb.stores.set(storeId, updated);
	return updated;
}

export function getStorePublicPreview(storeId: string) {
	const store = getStoreById(storeId);
	if (!store) return null;

	// Retornar información pública del store (lo que ven los clientes)
	return {
		id: store.id,
		name: store.name,
		category: store.category,
		contactEmail: store.contactEmail,
		status: store.status,
	};
}

// ============================================================================
// CRUD OPERATIONS - MALL CONFIG
// ============================================================================

export function getMallConfig(mallId: string): MallConfig | null {
	return mockDb.malls.get(mallId) ?? null;
}

export function updateMallConfig(
	mallId: string,
	updates: Partial<MallConfig>,
): MallConfig {
	const existing = mockDb.malls.get(mallId);
	if (!existing) {
		throw new Error(`Mall ${mallId} not found`);
	}

	const updated: MallConfig = {
		...existing,
		...updates,
		mallId, // Ensure mallId is never changed
	};

	mockDb.malls.set(mallId, updated);
	return updated;
}

// ============================================================================
// CRUD OPERATIONS - METRICS (KPIs)
// ============================================================================

export function getDailyMetrics(
	mallId: string,
	startDate: Date,
	endDate: Date,
): DailyMetric[] {
	const metrics: DailyMetric[] = [];

	const current = new Date(startDate);
	current.setHours(0, 0, 0, 0);

	const end = new Date(endDate);
	end.setHours(23, 59, 59, 999);

	while (current <= end) {
		const dateStr = current.toISOString().split('T')[0];
		const key = `${mallId}-${dateStr}`;
		const metric = mockDb.metrics.get(key);

		if (metric) {
			metrics.push(metric);
		}

		current.setDate(current.getDate() + 1);
	}

	return metrics;
}

export function getAggregatedKpis(
	mallId: string,
	startDate: Date,
	endDate: Date,
): {
	totalVisits: number;
	totalReservations: number;
	totalCompleted: number;
	activeStores: number;
	conversionRate: number;
	timeSeriesData: Array<{ date: string; visits: number; reservations: number }>;
} {
	const metrics = getDailyMetrics(mallId, startDate, endDate);
	const stores = getStoresByMallId(mallId);

	const totalVisits = metrics.reduce((sum, m) => sum + m.visits, 0);
	const totalReservations = metrics.reduce((sum, m) => sum + m.reservations, 0);
	const totalCompleted = metrics.reduce((sum, m) => sum + m.completed, 0);

	const activeStores = stores.filter(
		(s) => s.status === 'APPROVED' || s.status === 'ACTIVE',
	).length;

	const conversionRate =
		totalVisits > 0
			? Math.round((totalCompleted / totalVisits) * 100 * 100) / 100
			: 0;

	const timeSeriesData = metrics.map((m) => ({
		date: m.date,
		visits: m.visits,
		reservations: m.reservations,
	}));

	return {
		totalVisits,
		totalReservations,
		totalCompleted,
		activeStores,
		conversionRate,
		timeSeriesData,
	};
}

// ============================================================================
// CRUD OPERATIONS - EVENTS
// ============================================================================

export function getEventsByMallId(mallId: string): Event[] {
	return Array.from(mockDb.events.values()).filter(
		(event) => event.mallId === mallId,
	);
}

export function getEventById(eventId: string): Event | null {
	return mockDb.events.get(eventId) ?? null;
}

export function addEvent(mallId: string, data: Omit<Event, 'id'>): Event {
	const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	const newEvent: Event = {
		id: eventId,
		...data,
		mallId,
	};

	mockDb.events.set(eventId, newEvent);
	return newEvent;
}

export function updateEvent(eventId: string, updates: Partial<Event>): Event {
	const event = mockDb.events.get(eventId);
	if (!event) {
		throw new Error(`Event ${eventId} not found`);
	}

	const updated: Event = {
		...event,
		...updates,
		id: event.id, // Ensure ID is never changed
		mallId: event.mallId, // Ensure mallId is never changed
	};

	mockDb.events.set(eventId, updated);
	return updated;
}

export function deleteEvent(eventId: string): boolean {
	return mockDb.events.delete(eventId);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getDefaultMallId(): string {
	const firstMall = mockDb.malls.keys().next().value;
	return firstMall || 'mall-001';
}

export function debugMockDb() {
	return {
		malls: Array.from(mockDb.malls.values()),
		stores: Array.from(mockDb.stores.values()),
		metricsCount: mockDb.metrics.size,
		events: Array.from(mockDb.events.values()),
	};
}
