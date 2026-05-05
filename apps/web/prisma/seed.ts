import 'dotenv/config';
import { subDays } from 'date-fns';
import { auth } from '@/features/.server/auth/better-auth-server.lib';
import { serverEnv } from '@/features/.server/env/server-env.lib';
import { prisma } from '@/features/.server/prisma/prisma.server';
import { appRoles } from '@/features/better-auth/better-auth-access-control.lib';

async function seed() {
	console.log('Starting database seeding...');

	const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = serverEnv;

	// --- Admin user ---
	const existingAdmin = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
		select: { id: true },
	});

	if (!existingAdmin) {
		await auth.api.signUpEmail({
			body: {
				email: ADMIN_EMAIL,
				name: ADMIN_NAME,
				password: ADMIN_PASSWORD,
			},
			asResponse: false,
		});
	}

	await prisma.user.update({
		where: { email: ADMIN_EMAIL },
		data: {
			name: ADMIN_NAME,
			role: appRoles.ADMIN_PLATFORM,
			emailVerified: true,
		},
	});

	// --- Demo malls ---
	const mallsData = [
		{
			name: 'Centro Comercial Gran Plaza',
			city: 'Ciudad de México',
			address: 'Av. Insurgentes Sur 1457, Col. Insurgentes Mixcoac',
			description:
				'El centro comercial más grande del sur de la ciudad con más de 200 tiendas, cines y restaurantes.',
			status: 'ACTIVE' as const,
		},
		{
			name: 'Mall del Pacífico',
			city: 'Guadalajara',
			address: 'Av. Vallarta 3959, Fracc. Vallarta San Jorge',
			description:
				'Moderno centro comercial en el corazón de Guadalajara con las mejores marcas nacionales e internacionales.',
			status: 'ACTIVE' as const,
		},
		{
			name: 'Plaza Galerías Norte',
			city: 'Monterrey',
			address: 'Av. Gonzalitos 600 Norte, Col. Mitras Centro',
			description:
				'Centro comercial familiar con amplia oferta gastronómica y entretenimiento para toda la familia.',
			status: 'ACTIVE' as const,
		},
		{
			name: 'Paseo del Ángel',
			city: 'Puebla',
			address: 'Blvd. Atlixcáyotl 2501, Reserva Territorial Atlixcáyotl',
			description:
				'Experiencia de compras al aire libre con jardines y ambiente relajado en el corazón de Puebla.',
			status: 'ACTIVE' as const,
		},
	];

	const createdMalls: { id: string; name: string }[] = [];

	for (const mallData of mallsData) {
		const existing = await prisma.mall.findFirst({
			where: { name: mallData.name },
			select: { id: true, name: true },
		});

		if (existing) {
			createdMalls.push(existing);
			console.log(`  Mall already exists: ${mallData.name}`);
		} else {
			const mall = await prisma.mall.create({
				data: mallData,
				select: { id: true, name: true },
			});
			createdMalls.push(mall);
			console.log(`  Created mall: ${mallData.name}`);
		}
	}

	// --- Demo stores per mall ---
	const storesData = [
		// Gran Plaza
		{
			mallName: 'Centro Comercial Gran Plaza',
			stores: [
				{
					name: 'Zara',
					category: 'Moda',
					description: 'Última tendencia en moda para toda la familia.',
					floor: '2',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Apple Store',
					category: 'Tecnología',
					description: 'Dispositivos, accesorios y soporte oficial Apple.',
					floor: '1',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Liverpool',
					category: 'Tienda departamental',
					description:
						'Ropa, hogar, electrónica y mucho más bajo un mismo techo.',
					floor: '1–3',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Cinépolis',
					category: 'Entretenimiento',
					description: 'Las mejores películas en salas de última generación.',
					floor: '4',
					openHours: '11:00–23:00',
					status: 'ACTIVE' as const,
				},
			],
		},
		// Mall del Pacífico
		{
			mallName: 'Mall del Pacífico',
			stores: [
				{
					name: 'H&M',
					category: 'Moda',
					description: 'Moda asequible y sostenible para toda ocasión.',
					floor: '1',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Sephora',
					category: 'Belleza',
					description: 'Las mejores marcas de cosmética y cuidado personal.',
					floor: '2',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Sanborns',
					category: 'Libros y café',
					description:
						'Libros, revistas, música, café y más en un espacio icónico.',
					floor: 'PB',
					openHours: '08:00–22:00',
					status: 'ACTIVE' as const,
				},
			],
		},
		// Plaza Galerías Norte
		{
			mallName: 'Plaza Galerías Norte',
			stores: [
				{
					name: 'Nike',
					category: 'Deportes',
					description:
						'Calzado, ropa y accesorios deportivos de la marca más icónica.',
					floor: '1',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Starbucks',
					category: 'Café',
					description: 'Tu bebida favorita con la mejor experiencia de café.',
					floor: 'PB',
					openHours: '07:00–22:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Coppel',
					category: 'Tienda departamental',
					description:
						'Electrodomésticos, muebles, ropa y más con facilidades de pago.',
					floor: '1',
					openHours: '10:00–20:00',
					status: 'ACTIVE' as const,
				},
			],
		},
		// Paseo del Ángel
		{
			mallName: 'Paseo del Ángel',
			stores: [
				{
					name: 'Palacio de Hierro',
					category: 'Lujo y moda',
					description: 'Las marcas más exclusivas en moda, hogar y joyería.',
					floor: '1–2',
					openHours: '11:00–21:00',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Pull & Bear',
					category: 'Moda joven',
					description: 'Estilo urbano y casual para el día a día.',
					floor: '1',
					openHours: '10:00–21:00',
					status: 'ACTIVE' as const,
				},
			],
		},
	];

	const createdStores: { id: string; mallId: string; name: string }[] = [];

	for (const mallGroup of storesData) {
		const mall = createdMalls.find((m) => m.name === mallGroup.mallName);
		if (!mall) continue;

		for (const storeData of mallGroup.stores) {
			const existing = await prisma.store.findFirst({
				where: { name: storeData.name, mallId: mall.id },
				select: { id: true, mallId: true, name: true },
			});

			if (existing) {
				createdStores.push(existing);
				console.log(
					`  Store already exists: ${storeData.name} @ ${mallGroup.mallName}`,
				);
			} else {
				const store = await prisma.store.create({
					data: {
						...storeData,
						mallId: mall.id,
					},
					select: { id: true, mallId: true, name: true },
				});
				createdStores.push(store);
				console.log(
					`  Created store: ${storeData.name} @ ${mallGroup.mallName}`,
				);
			}
		}
	}

	// --- Demo products ---
	const productsMap: {
		storeName: string;
		products: {
			name: string;
			category: string;
			description: string;
			priceOriginal: number;
			priceDiscount?: number;
			stock: number;
			status: 'ACTIVE';
		}[];
	}[] = [
		{
			storeName: 'Zara',
			products: [
				{
					name: 'Chaqueta de cuero sintético',
					category: 'Ropa',
					description:
						'Chaqueta slim fit en cuero sintético negro. Tallas XS-XL.',
					priceOriginal: 1599,
					priceDiscount: 1199,
					stock: 15,
					status: 'ACTIVE',
				},
				{
					name: 'Jeans slim fit',
					category: 'Pantalones',
					description:
						'Jeans de corte slim con lavado medio. Disponible en varios talles.',
					priceOriginal: 899,
					stock: 30,
					status: 'ACTIVE',
				},
			],
		},
		{
			storeName: 'Apple Store',
			products: [
				{
					name: 'iPhone 16 Pro 128 GB',
					category: 'Smartphones',
					description:
						'El iPhone más avanzado con chip A18 Pro y cámara de 48 MP.',
					priceOriginal: 27999,
					stock: 8,
					status: 'ACTIVE',
				},
				{
					name: 'AirPods Pro (2ª gen)',
					category: 'Audio',
					description: 'Cancelación de ruido activa adaptativa con USB-C.',
					priceOriginal: 6299,
					priceDiscount: 5799,
					stock: 20,
					status: 'ACTIVE',
				},
			],
		},
		{
			storeName: 'Nike',
			products: [
				{
					name: 'Air Max 270',
					category: 'Calzado',
					description:
						'Zapatillas con cámara de aire visible y suela ultraligera.',
					priceOriginal: 3299,
					stock: 25,
					status: 'ACTIVE',
				},
				{
					name: 'Camiseta Dri-FIT',
					category: 'Ropa deportiva',
					description:
						'Camiseta técnica con tecnología Dri-FIT para mayor comodidad.',
					priceOriginal: 699,
					priceDiscount: 499,
					stock: 50,
					status: 'ACTIVE',
				},
			],
		},
		{
			storeName: 'Sephora',
			products: [
				{
					name: 'Perfume Lancôme Idôle EDP 50 ml',
					category: 'Fragancias',
					description: 'Fragancia floral fresca con notas de rosa y jazmín.',
					priceOriginal: 2199,
					stock: 12,
					status: 'ACTIVE',
				},
				{
					name: 'Paleta de sombras Urban Decay Naked',
					category: 'Maquillaje',
					description:
						'12 sombras neutras de larga duración con acabados mate y shimmer.',
					priceOriginal: 1899,
					priceDiscount: 1599,
					stock: 18,
					status: 'ACTIVE',
				},
			],
		},
	];

	for (const storeGroup of productsMap) {
		const store = createdStores.find((s) => s.name === storeGroup.storeName);
		if (!store) continue;

		for (const productData of storeGroup.products) {
			const existing = await prisma.product.findFirst({
				where: { name: productData.name, storeId: store.id },
				select: { id: true },
			});

			if (existing) {
				console.log(`  Product already exists: ${productData.name}`);
			} else {
				await prisma.product.create({
					data: {
						...productData,
						storeId: store.id,
						mallId: store.mallId,
					},
				});
				console.log(`  Created product: ${productData.name}`);
			}
		}
	}

	// --- Demo promotions ---
	const now = new Date();
	const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
	const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

	const promotionsData: {
		storeName: string;
		title: string;
		description: string;
		endsAt: Date | null;
	}[] = [
		{
			storeName: 'Zara',
			title: 'Sale de fin de temporada — 30% en toda la colección',
			description:
				'Aprovecha los descuentos de fin de temporada primavera-verano en todas las prendas seleccionadas. Oferta válida mientras dure el stock.',
			endsAt: in14Days,
		},
		{
			storeName: 'Apple Store',
			title: 'Trade-in especial — $3,000 de descuento por tu iPhone 14',
			description:
				'Entrega tu iPhone 14 en cualquier condición y obtén $3,000 de descuento inmediato en la compra de un iPhone 16 Pro.',
			endsAt: in30Days,
		},
		{
			storeName: 'Nike',
			title: '2x1 en camisetas Dri-FIT',
			description:
				'Compra 2 camisetas deportivas Dri-FIT y llévate la de menor precio gratis. Aplica en tallas S a XL.',
			endsAt: in14Days,
		},
		{
			storeName: 'Sephora',
			title: 'Regalo sorpresa en compras mayores a $1,500',
			description:
				'Por cada compra superior a $1,500 MXN recibirás un kit de regalo sorpresa con productos de belleza de temporada.',
			endsAt: in30Days,
		},
		{
			storeName: 'H&M',
			title: 'Nueva colección verano — precios de lanzamiento',
			description:
				'Descubre la nueva colección de verano con precios especiales de lanzamiento disponibles solo este fin de semana.',
			endsAt: in14Days,
		},
	];

	for (const promoData of promotionsData) {
		const store = createdStores.find((s) => s.name === promoData.storeName);
		if (!store) continue;

		const existing = await prisma.promotion.findFirst({
			where: { title: promoData.title, storeId: store.id },
			select: { id: true },
		});

		if (existing) {
			console.log(`  Promotion already exists: ${promoData.title}`);
		} else {
			await prisma.promotion.create({
				data: {
					title: promoData.title,
					description: promoData.description,
					endsAt: promoData.endsAt,
					status: 'ACTIVE',
					storeId: store.id,
					mallId: store.mallId,
				},
			});
			console.log(`  Created promotion: ${promoData.title}`);
		}
	}

	// --- Admin CC user ---
	const adminCcEmail = 'admin-cc@mallhub.com';
	const existingAdminCc = await prisma.user.findUnique({
		where: { email: adminCcEmail },
		select: { id: true },
	});
	if (!existingAdminCc) {
		await auth.api.signUpEmail({
			body: {
				email: adminCcEmail,
				name: 'Admin CC Demo',
				password: 'AdminCC123!',
			},
			asResponse: false,
		});
	}
	const adminCcUser = await prisma.user.update({
		where: { email: adminCcEmail },
		data: {
			name: 'Admin CC Demo',
			role: appRoles.ADMIN_CC,
			emailVerified: true,
		},
		select: { id: true },
	});
	console.log(`  Admin CC user ready: ${adminCcEmail}`);

	// --- Link Admin CC to Gran Plaza ---
	const granPlaza = createdMalls.find(
		(m) => m.name === 'Centro Comercial Gran Plaza',
	);
	if (granPlaza) {
		const platformAdmin = await prisma.user.findUniqueOrThrow({
			where: { email: ADMIN_EMAIL },
			select: { id: true },
		});

		await prisma.user.update({
			where: { id: adminCcUser.id },
			data: { preferredMallId: granPlaza.id },
		});

		await prisma.mall.update({
			where: { id: granPlaza.id },
			data: { adminCcUserId: adminCcUser.id },
		});

		const existingAssignment = await prisma.adminCcAssignment.findFirst({
			where: { mallId: granPlaza.id, adminCcUserId: adminCcUser.id },
			select: { id: true },
		});
		if (!existingAssignment) {
			await prisma.adminCcAssignment.create({
				data: {
					mallId: granPlaza.id,
					adminCcUserId: adminCcUser.id,
					createdByUserId: platformAdmin.id,
				},
			});
			console.log('  Created AdminCcAssignment for Gran Plaza');
		}

		// --- DailyMallMetric: last 90 days for Gran Plaza ---
		const granPlazaStores = createdStores.filter(
			(s) => s.mallId === granPlaza.id,
		);

		for (let i = 89; i >= 0; i--) {
			const date = subDays(new Date(), i);
			const metricDate = new Date(
				Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
			);

			const isWeekend = date.getDay() === 0 || date.getDay() === 6;
			const seed = date.getTime();
			const rng = (s: number) => {
				const x = Math.sin(s) * 10000;
				return x - Math.floor(x);
			};

			const base = Math.floor(80 + rng(seed) * 120);
			const searches = Math.floor(base * (isWeekend ? 1.5 : 1.0));
			const reservations = Math.floor(searches * (0.08 + rng(seed + 1) * 0.07));
			const completed = Math.floor(reservations * (0.65 + rng(seed + 2) * 0.3));

			await prisma.dailyMallMetric.upsert({
				where: { mallId_metricDate: { mallId: granPlaza.id, metricDate } },
				create: {
					mallId: granPlaza.id,
					metricDate,
					searchesCount: searches,
					reservationsTotal: reservations,
					reservationsCompleted: completed,
					activeStores: granPlazaStores.length,
				},
				update: {},
			});
		}
		console.log('  Upserted 90 days of DailyMallMetric for Gran Plaza');

		// --- Customer demo user ---
		const customerEmail = 'customer-demo@mallhub.com';
		if (
			!(await prisma.user.findUnique({
				where: { email: customerEmail },
				select: { id: true },
			}))
		) {
			await auth.api.signUpEmail({
				body: {
					email: customerEmail,
					name: 'Cliente Demo',
					password: 'Customer123!',
				},
				asResponse: false,
			});
		}
		await prisma.user.update({
			where: { email: customerEmail },
			data: { emailVerified: true },
		});
		const customerUser = await prisma.user.findUniqueOrThrow({
			where: { email: customerEmail },
			select: { id: true },
		});
		console.log(`  Customer user ready: ${customerEmail}`);

		// --- Demo reservations spread over 90 days ---
		for (const store of granPlazaStores) {
			const storeProducts = await prisma.product.findMany({
				where: { storeId: store.id, status: 'ACTIVE' },
				select: { id: true },
				take: 2,
			});
			if (storeProducts.length === 0) continue;

			for (let i = 0; i < 20; i++) {
				const product = storeProducts[i % storeProducts.length];
				const qrCode = `SEED-${store.id.slice(-6)}-${product.id.slice(-6)}-${i}`;
				if (
					await prisma.reservation.findUnique({
						where: { qrCodeValue: qrCode },
						select: { id: true },
					})
				)
					continue;

				const daysAgo = Math.floor((i / 20) * 89) + 1;
				const requestedAt = subDays(new Date(), daysAgo);
				await prisma.reservation.create({
					data: {
						mallId: granPlaza.id,
						storeId: store.id,
						productId: product.id,
						customerUserId: customerUser.id,
						status: 'COMPLETED',
						quantity: 1,
						pickupFullName: 'Cliente Demo',
						pickupPhone: '+5215512345678',
						qrCodeValue: qrCode,
						requestedAt,
						completedAt: new Date(requestedAt.getTime() + 24 * 60 * 60 * 1000),
					},
				});
			}
		}
		console.log('  Created demo reservations for Gran Plaza');

		// --- Out-of-stock product for alerts demo ---
		const zaraStore = granPlazaStores.find((s) => s.name === 'Zara');
		if (zaraStore) {
			const exists = await prisma.product.findFirst({
				where: {
					storeId: zaraStore.id,
					name: 'Vestido midi primavera (sin stock)',
				},
				select: { id: true },
			});
			if (!exists) {
				await prisma.product.create({
					data: {
						name: 'Vestido midi primavera (sin stock)',
						category: 'Ropa',
						description:
							'Vestido ligero para primavera. Agotado temporalmente.',
						priceOriginal: 849,
						stock: 0,
						status: 'ACTIVE',
						storeId: zaraStore.id,
						mallId: granPlaza.id,
					},
				});
				console.log('  Created out-of-stock product for alerts demo');
			}
		}
	}

	console.log('Database seeding completed.');
}

void seed();
