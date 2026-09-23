import Dexie, { Table } from "dexie";
import { Product, Category, Tag } from "../types";

export class SAkuSimpanDB extends Dexie {
  products!: Table<Product, string>;
  categories!: Table<Category, string>;
  tags!: Table<Tag, string>;

  constructor() {
    super("sAkuSimpanDB");
    this.version(1).stores({
      products: "id, name, price, categoryId, createdAt, updatedAt",
      categories: "id, name, createdAt",
      tags: "id, name, createdAt",
    });
    this.version(2).stores({
      products:
        "id, name, price, categoryId, ownershipStatus, createdAt, updatedAt",
      categories: "id, name, createdAt",
      tags: "id, name, createdAt",
    });
  }
}

export const db = new SAkuSimpanDB();

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_TAGS: Tag[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export async function initializeDatabase() {
  // Bersihkan data dummy/seed bawaan jika ada dari versi sebelumnya
  const dummyPurged = localStorage.getItem("saku_dummy_seed_cleared_v1");
  if (!dummyPurged) {
    const dummyProdIds = ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"];
    const dummyCatIds = [
      "cat-elektronik",
      "cat-pakaian",
      "cat-hobi",
      "cat-kerja",
      "cat-rumah",
    ];
    const dummyTagIds = [
      "tag-impian",
      "tag-prioritas",
      "tag-kerja",
      "tag-diskon",
      "tag-santai",
    ];

    try {
      await db.products.where("id").anyOf(dummyProdIds).delete();
      await db.categories.where("id").anyOf(dummyCatIds).delete();
      await db.tags.where("id").anyOf(dummyTagIds).delete();
    } catch (e) {
      console.warn("Error clearing seed dummy data:", e);
    }
    localStorage.setItem("saku_dummy_seed_cleared_v1", "true");
  }

  if (INITIAL_CATEGORIES.length > 0) {
    const catCount = await db.categories.count();
    if (catCount === 0) {
      await db.categories.bulkAdd(INITIAL_CATEGORIES);
    }
  }

  if (INITIAL_TAGS.length > 0) {
    const tagCount = await db.tags.count();
    if (tagCount === 0) {
      await db.tags.bulkAdd(INITIAL_TAGS);
    }
  }

  if (INITIAL_PRODUCTS.length > 0) {
    const prodCount = await db.products.count();
    if (prodCount === 0) {
      await db.products.bulkAdd(INITIAL_PRODUCTS);
    }
  }
}

export const seedDefaultData = initializeDatabase;

export async function resetAllData() {
  await db.products.clear();
  await db.categories.clear();
  await db.tags.clear();
}
