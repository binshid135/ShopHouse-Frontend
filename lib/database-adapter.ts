import { getPool, query } from './neon';

export interface Product {
  id: string;
  name: string;
  short_description: string | null;
  original_price: number;
  discounted_price: number;
  stock: number;
  category: string;
  images: string[];
  is_recommended: boolean;
  is_most_recommended: boolean;
  recommendation_order: number;
  created_at: string;
  updated_at: string;
}

export class DatabaseAdapter {
  static async getProduct(id: string): Promise<Product | null> {
    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async getAllProducts(): Promise<Product[]> {
    const result = await query(`
      SELECT * FROM products 
      ORDER BY is_most_recommended DESC, recommendation_order ASC, created_at DESC
    `);
    return result.rows;
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await query(
      `INSERT INTO products (
        name, short_description, original_price, discounted_price, stock, category,
        images, is_recommended, is_most_recommended, recommendation_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        product.name,
        product.short_description,
        product.original_price,
        product.discounted_price,
        product.stock,
        product.category,
        product.images,
        product.is_recommended,
        product.is_most_recommended,
        product.recommendation_order
      ]
    );
    return result.rows[0];
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    fields.push('updated_at = $' + paramCount);
    values.push(new Date().toISOString());
    paramCount++;

    values.push(id);

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async deleteProduct(id: string): Promise<void> {
    await query('DELETE FROM products WHERE id = $1', [id]);
  }

  // Add other methods for users, orders, etc.
  static async getMostRecommendedProduct(): Promise<Product | null> {
    const result = await query(
      'SELECT * FROM products WHERE is_most_recommended = true LIMIT 1'
    );
    return result.rows[0] || null;
  }

  static async getRecommendedProducts(): Promise<Product[]> {
    const result = await query(
      'SELECT * FROM products WHERE is_recommended = true AND is_most_recommended = false ORDER BY recommendation_order ASC'
    );
    return result.rows;
  }

  static async getRecommendedProductsCount(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM products WHERE is_recommended = true AND is_most_recommended = false'
    );
    return parseInt(result.rows[0].count);
  }
}