import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';

export interface ExcelImportMappingDto {
  nombreProducto?: string;
  descripcion?: string;
  precio?: string;
  categoria?: string;
  marca?: string;
  codigoBarras?: string;
}

@Injectable()
export class ExcelImportService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Normaliza una cadena para facilitar comparaciones "fuzzy"
  normalizeString(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  async importExcel(file: any, mapping?: ExcelImportMappingDto): Promise<any> {
    // Leemos el Excel desde file.buffer
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    // Mapeo de columnas (con valores por defecto)
    const headers = {
      nombreProducto: mapping?.nombreProducto || 'Nombre del Producto',
      descripcion: mapping?.descripcion || 'Descripción',
      precio: mapping?.precio || 'Precio',
      categoria: mapping?.categoria || 'Categoría',
      marca: mapping?.marca || 'Marca',
      codigoBarras: mapping?.codigoBarras || 'Código de Barras',
    };

    const summary = {
      rowsProcessed: rows.length,
      categoriesCreated: 0,
      brandsCreated: 0,
      productsCreated: 0,
      productsUpdated: 0,
    };

    for (const row of rows) {
      const productName: string = row[headers.nombreProducto]?.toString().trim();
      const description: string = row[headers.descripcion]?.toString().trim();
      const precioStr: string = row[headers.precio]?.toString().trim();
      const precio = parseFloat(precioStr) || 0;
      const categoriaName: string = row[headers.categoria]?.toString().trim();
      const marcaName: string = row[headers.marca]?.toString().trim();
      const barcode: string = row[headers.codigoBarras]?.toString().trim();

      if (!productName) continue;

      // --- Procesar Categoría ---
      const normCategory = this.normalizeString(categoriaName);
      let category: Category | null = (await this.categoryRepository.findOne({ where: { name: categoriaName } })) || null;
      if (!category) {
        const allCategories: Category[] = await this.categoryRepository.find();
        category = allCategories.find(cat => this.normalizeString(cat.name) === normCategory) || null;
      }
      if (!category) {
        const newCategory = new Category();
        newCategory.id = Date.now().toString() + Math.random().toString();
        newCategory.name = categoriaName;
        newCategory.image = undefined; // Sin imagen
        newCategory.updatedAt = new Date();
        newCategory.deleted = false;
        category = await this.categoryRepository.save(newCategory);
        summary.categoriesCreated++;
      }

      // --- Procesar Marca ---
      const normBrand = this.normalizeString(marcaName);
      let brand: Brand | null = (await this.brandRepository.findOne({ where: { name: marcaName, categoryId: category!.id } })) || null;
      if (!brand) {
        const allBrands: Brand[] = await this.brandRepository.find({ where: { categoryId: category!.id } });
        brand = allBrands.find(b => this.normalizeString(b.name) === normBrand) || null;
      }
      if (!brand) {
        const newBrand = new Brand();
        newBrand.id = Date.now().toString() + Math.random().toString();
        newBrand.name = marcaName;
        newBrand.categoryId = category!.id;
        newBrand.image = undefined;
        newBrand.updatedAt = new Date();
        newBrand.deleted = false;
        brand = await this.brandRepository.save(newBrand);
        summary.brandsCreated++;
      }

      // --- Procesar Producto ---
      let product: Product | null = null;
      if (barcode) {
        product = (await this.productRepository.findOne({ where: { barcode } })) || null;
      }
      if (!product) {
        const products: Product[] = await this.productRepository.find({
          where: { categoryId: category!.id, brandId: brand!.id },
        });
        const normProductName = this.normalizeString(productName);
        product = products.find(p => this.normalizeString(p.name) === normProductName) || null;
      }
      if (product) {
        // Actualizamos precio, descripción o código si es diferente
        let updated = false;
        if (product.price !== precio) {
          product.price = precio;
          updated = true;
        }
        if (description && product.description !== description) {
          product.description = description;
          updated = true;
        }
        if (barcode && product.barcode !== barcode) {
          product.barcode = barcode;
          updated = true;
        }
        if (updated) {
          product.updatedAt = new Date();
          await this.productRepository.save(product);
          summary.productsUpdated++;
        }
      } else {
        const newProduct = new Product();
        newProduct.id = Date.now().toString() + Math.random().toString();
        newProduct.name = productName;
        newProduct.description = description;
        newProduct.price = precio;
        newProduct.stock = 0;
        newProduct.categoryId = category!.id;
        newProduct.brandId = brand!.id;
        newProduct.barcode = barcode || undefined;
        newProduct.image = undefined;
        newProduct.variantsJson = null;
        newProduct.updatedAt = new Date();
        newProduct.deleted = false;
        product = await this.productRepository.save(newProduct);
        summary.productsCreated++;
      }
    }
    return summary;
  }
}
