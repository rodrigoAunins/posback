import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import { OrderMap } from '../common/types';

interface FindAllParams {
  limit?: number;
  offset?: number;
  orderOptions?: OrderMap;
  searchTerm?: string;
  brandId?: string;
  categoryId?: string;
  stockOnly?: boolean;
  localId?: number; // 👈 agregado
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Busca productos con soporte para:
   * - paginación (limit, offset)
   * - orden (orderOptions)
   * - búsqueda global (searchTerm en name/barcode)
   * - filtro por brandId
   * - filtro por categoryId
   * - filtro opcional de "solo con stock" (stock>0)
   */
  async findAll(params: FindAllParams = {}): Promise<Product[]> {
    const {
      limit,
      offset,
      orderOptions,
      searchTerm,
      brandId,
      categoryId,
      stockOnly,
      localId, // 👈 agregado
    } = params;
  
    const qb = this.productRepository.createQueryBuilder('product');
  
    if (searchTerm) {
      qb.andWhere('(product.name ILIKE :st OR product.barcode ILIKE :st)', {
        st: `%${searchTerm}%`,
      });
    }
  
    if (brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId });
    }
  
    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
  
    if (stockOnly) {
      qb.andWhere('product.stock > 0');
    }
  
    if (localId !== undefined) {
      qb.andWhere('product.localId = :localId', { localId }); // 👈 filtro agregado
    }
  
    if (limit) {
      qb.take(limit);
    }
    if (offset) {
      qb.skip(offset);
    }
  
    if (orderOptions) {
      Object.entries(orderOptions).forEach(([col, dir]) => {
        qb.addOrderBy(`product.${col}`, dir as 'ASC' | 'DESC');
      });
    }
  
    return qb.getMany();
  }
  

  // Nuevo método para obtener un producto por ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    return product;
  }

  /**
   * Crear un producto
   */
  async create(data: Partial<Product>): Promise<Product> {
    const product = new Product();
    // Genera un ID si no viene
    product.id = data.id ?? Date.now().toString();

    // Asignar campos
    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.categoryId !== undefined) product.categoryId = data.categoryId;
    if (data.brandId !== undefined) product.brandId = data.brandId;
    if (data.barcode !== undefined) product.barcode = data.barcode;
    if (data.image !== undefined) product.image = data.image;
    if (data.deleted !== undefined) product.deleted = data.deleted;

    // Manejo de variantes
    const anyData = data as any;
    if (anyData.variants && Array.isArray(anyData.variants) && anyData.variants.length > 0) {
      product.variantsJson = JSON.stringify(anyData.variants);
      const sumVariants = anyData.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
      product.stock = sumVariants;
    } else {
      product.variantsJson = null;
      if (data.stock !== undefined) {
        product.stock = data.stock;
      } else {
        product.stock = 0; // default
      }
    }

    // 👇 CAMBIO MÍNIMO AQUÍ
    product.localId = data.localId ?? 1;

    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  /**
   * Actualizar un producto
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.categoryId !== undefined) product.categoryId = data.categoryId;
    if (data.brandId !== undefined) product.brandId = data.brandId;
    if (data.barcode !== undefined) product.barcode = data.barcode;
    if (data.image !== undefined) product.image = data.image;
    if (data.deleted !== undefined) product.deleted = data.deleted;

    const anyData = data as any;
    if (anyData.variants && Array.isArray(anyData.variants) && anyData.variants.length > 0) {
      product.variantsJson = JSON.stringify(anyData.variants);
      const sumVariants = anyData.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
      product.stock = sumVariants;
    } else {
      product.variantsJson = null;
      if (data.stock !== undefined) {
        product.stock = data.stock;
      }
    }

    // 👇 CAMBIO MÍNIMO AQUÍ TAMBIÉN
    product.localId = data.localId ?? 1;

    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  /**
   * Eliminar un producto
   */
  async delete(id: string): Promise<boolean> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return false;
    }
    await this.productRepository.remove(product);
    return true;
  }
}
