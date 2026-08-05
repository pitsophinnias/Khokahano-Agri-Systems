// ---------------------------------------------------------------------------
// products.service.js
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";

// ── LIST / SEARCH ─────────────────────────────────────────────
export async function getProducts(params = {}) {
  const { category, district, query, sort } = params;

  // Always safe integers — never NaN, never undefined
  const page  = Math.max(1, parseInt(params.page)  || 1);
  const limit = Math.max(1, parseInt(params.limit) || 20);

  const where = {
    isActive: true,
    ...(category && category !== "all" ? {
      category: category.toUpperCase(),
    } : {}),
    ...(district && district !== "all" ? {
      district: { equals: district, mode: "insensitive" },
    } : {}),
    ...(query ? {
      OR: [
        { title:       { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { district:    { contains: query, mode: "insensitive" } },
        { farmer: { user:     { firstName: { contains: query, mode: "insensitive" } } } },
        { farmer: { farmName: { contains: query, mode: "insensitive" } } },
      ],
    } : {}),
  };

  const orderBy = {
    "price-asc":  { pricePerUnit: "asc"  },
    "price-desc": { pricePerUnit: "desc" },
    "rating":     { rating: "desc"       },
    "newest":     { createdAt: "desc"    },
  }[sort] ?? { createdAt: "desc" };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        farmer: {
          select: {
            id: true, isVerified: true, farmName: true,
            user: {
              select: {
                firstName: true, lastName: true,
                phone: true, district: true, village: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(formatProduct),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

// ── SINGLE PRODUCT ────────────────────────────────────────────
export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      farmer: {
        select: {
          id: true, isVerified: true, farmName: true, avgResponseMins: true,
          user: {
            select: {
              firstName: true, lastName: true,
              phone: true, district: true, village: true,
            },
          },
        },
      },
    },
  });
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return formatProduct(product);
}

// ── FARMER'S OWN PRODUCTS ────────────────────────────────────
export async function getFarmerProducts(farmerId, { includeInactive = false } = {}) {
  const products = await prisma.product.findMany({
    where: { farmerId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });
  return products.map(formatProduct);
}

// ── CREATE PRODUCT ────────────────────────────────────────────
export async function createProduct(farmerId, data, imageFiles = []) {
  const {
    title, titleSt, description, descriptionSt,
    category, pricePerUnit, unit, unitSt,
    stockQuantity, minOrderQty,
    district, village,
  } = data;

  const product = await prisma.product.create({
    data: {
      farmerId,
      title, titleSt, description, descriptionSt,
      category: category.toUpperCase(),
      pricePerUnit:  parseFloat(pricePerUnit),
      unit, unitSt,
      stockQuantity: parseInt(stockQuantity),
      minOrderQty:   parseInt(minOrderQty) || 1,
      district, village,
      images: {
        create: imageFiles.map((file, i) => ({
          url:       `/uploads/${file.filename}`,
          isPrimary: i === 0,
        })),
      },
    },
    include: { images: true },
  });

  return formatProduct(product);
}

// ── UPDATE PRODUCT ────────────────────────────────────────────
export async function updateProduct(productId, farmerId, data) {
  const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
  if (!existing) {
    const err = new Error("Product not found or you do not have permission to edit it");
    err.status = 404;
    throw err;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      ...(data.pricePerUnit  ? { pricePerUnit:  parseFloat(data.pricePerUnit) }  : {}),
      ...(data.stockQuantity ? { stockQuantity: parseInt(data.stockQuantity) }   : {}),
      ...(data.minOrderQty   ? { minOrderQty:   parseInt(data.minOrderQty) }     : {}),
      ...(data.category      ? { category: data.category.toUpperCase() }         : {}),
    },
    include: { images: true },
  });

  return formatProduct(product);
}

// ── DEACTIVATE ────────────────────────────────────────────────
export async function deactivateProduct(productId, farmerId) {
  const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
  if (!existing) {
    const err = new Error("Product not found or you do not have permission");
    err.status = 404;
    throw err;
  }
  await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
  return { message: "Product removed from marketplace" };
}

// ── UPDATE STOCK ──────────────────────────────────────────────
export async function updateStock(productId, farmerId, quantity) {
  const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
  if (!existing) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return prisma.product.update({
    where: { id: productId },
    data:  { stockQuantity: parseInt(quantity) },
  });
}

// ── MARKETPLACE STATS ─────────────────────────────────────────
export async function getMarketplaceStats() {
  const [farmers, products] = await Promise.all([
    prisma.farmer.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);
  return { totalFarmers: farmers, totalDistricts: 10, totalListings: products, avgRating: 4.8 };
}

// ── HELPERS ───────────────────────────────────────────────────
function formatProduct(p) {
  return {
    id:          p.id,
    category:    p.category,
    district:    p.district,
    village:     p.village,
    title:       { en: p.title,       st: p.titleSt },
    description: { en: p.description, st: p.descriptionSt },
    price:       p.pricePerUnit,
    currency:    p.currency,
    unit:        { en: p.unit, st: p.unitSt },
    stock:       p.stockQuantity,
    minOrder:    p.minOrderQty,
    isActive:    p.isActive,
    rating:      p.rating,
    reviews:     p.reviewCount,
    images:      p.images?.map((img) => img.url) ?? [],
    badge:       stockBadge(p.stockQuantity),
    farmer:      p.farmer ? formatFarmer(p.farmer) : undefined,
    createdAt:   p.createdAt,
  };
}

function formatFarmer(f) {
  return {
    id:       f.id,
    verified: f.isVerified,
    name: {
      en: `${f.user.firstName} ${f.user.lastName}`,
      st: `${f.user.firstName} ${f.user.lastName}`,
    },
    farmName:        f.farmName,
    phone:           f.user.phone,
    district:        f.user.district,
    village:         f.user.village,
    avgResponseMins: f.avgResponseMins,
  };
}

function stockBadge(qty) {
  if (qty === 0) return { type: "red",   en: "Out of stock", st: "Ha e na letho" };
  if (qty < 20)  return { type: "amber", en: "Low stock",    st: "E fokola" };
  return               { type: "green", en: "In stock",     st: "E teng" };
}