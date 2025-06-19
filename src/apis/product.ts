// api/product.ts

import { baseUrl } from "../config/api";
import { Product } from "../screens/protected/market";


export const getProductDetails = async (productId: string): Promise<Product> => {
  try {
    const response = await fetch(`${baseUrl}/api/products/farmer/produce/single/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};
