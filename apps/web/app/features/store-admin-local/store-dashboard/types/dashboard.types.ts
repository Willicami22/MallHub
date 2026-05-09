export type TopProduct = {
	productId: string;
	name: string;
	count: number;
};

export type OutOfStockProduct = {
	id: string;
	name: string;
	stock: number;
	isReservable: boolean;
};
