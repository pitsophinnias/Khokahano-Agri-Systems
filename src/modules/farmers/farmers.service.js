// ---------------------------------------------------------------------------
// farmers.service.js
// ---------------------------------------------------------------------------
import prisma from "../../config/db.js";

export async function getFarmerProfile(farmerId) {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true,
          email: true, phone: true, district: true, village: true, createdAt: true,
        },
      },
      _count: { select: { products: true, orders: true } },
    },
  });
  if (!farmer) {
    const err = new Error("Farmer not found");
    err.status = 404;
    throw err;
  }
  return farmer;
}

export async function updateFarmerProfile(farmerId, userId, data) {
  const { firstName, lastName, village, farmName, bio } = data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName  && { lastName  }),
      ...(village   && { village   }),
    },
  });

  const farmer = await prisma.farmer.update({
    where: { id: farmerId },
    data: {
      ...(farmName && { farmName }),
      ...(bio      && { bio      }),
    },
    include: {
      user: {
        select: {
          firstName: true, lastName: true,
          email: true, phone: true, district: true, village: true,
        },
      },
    },
  });

  return farmer;
}

export async function updateProfilePhoto(farmerId, filename) {
  return prisma.farmer.update({
    where: { id: farmerId },
    data:  { profilePhotoUrl: `/uploads/${filename}` },
  });
}

export async function getPublicFarmers({ district, page = 1, limit = 20 } = {}) {
  const where = {
    user: { isActive: true },
    ...(district && { user: { district } }),
  };

  const [farmers, total] = await Promise.all([
    prisma.farmer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, district: true, village: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.farmer.count({ where }),
  ]);

  return { farmers, total, page, pages: Math.ceil(total / limit) };
}