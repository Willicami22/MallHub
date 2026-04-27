import 'dotenv/config';
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
					status: 'ACTIVE' as const,
				},
				{
					name: 'Apple Store',
					category: 'Tecnología',
					description: 'Dispositivos, accesorios y soporte oficial Apple.',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Liverpool',
					category: 'Tienda departamental',
					description:
						'Ropa, hogar, electrónica y mucho más bajo un mismo techo.',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Cinépolis',
					category: 'Entretenimiento',
					description: 'Las mejores películas en salas de última generación.',
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
					status: 'ACTIVE' as const,
				},
				{
					name: 'Sephora',
					category: 'Belleza',
					description: 'Las mejores marcas de cosmética y cuidado personal.',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Sanborns',
					category: 'Libros y café',
					description:
						'Libros, revistas, música, café y más en un espacio icónico.',
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
					status: 'ACTIVE' as const,
				},
				{
					name: 'Starbucks',
					category: 'Café',
					description: 'Tu bebida favorita con la mejor experiencia de café.',
					status: 'ACTIVE' as const,
				},
				{
					name: 'Coppel',
					category: 'Tienda departamental',
					description:
						'Electrodomésticos, muebles, ropa y más con facilidades de pago.',
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
					status: 'ACTIVE' as const,
				},
				{
					name: 'Pull & Bear',
					category: 'Moda joven',
					description: 'Estilo urbano y casual para el día a día.',
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

	console.log('Database seeding completed.');
}

void seed();
