export type TProduct = {
    _id: string;
    name: string;
    category: string;
    description?: string;
    price: number;
    quantity?: string;
    imageUrl?: string;
    farmer: string
    createdAt: Date;
    updatedAt: Date;
}