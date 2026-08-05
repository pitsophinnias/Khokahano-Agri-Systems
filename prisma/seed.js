import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin ─────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where:  { email: "admin@khokahanoagrisystems.ls" },
    update: {},
    create: {
      email:        "admin@khokahanoagrisystems.ls",
      phone:        "+26657638217",
      passwordHash: adminPassword,
      role:         "ADMIN",
      firstName:    "Khokahano",
      lastName:     "Admin",
      district:     "Maseru",
      admin:        { create: {} },
    },
  });
  console.log("✅ Admin created");

  // ── Real farmers ──────────────────────────────────────────
  const farmerPassword = await bcrypt.hash("farmer1234", 12);

  const f1 = await prisma.user.upsert({
    where:  { email: "nthabiseng@khokahano.ls" },
    update: {},
    create: {
      email: "nthabiseng@khokahano.ls", phone: "+26658123456",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Nthabiseng", lastName: "Mokoena",
      district: "Maseru", village: "Ha Thetsane",
      farmer: { create: { farmName: "Mokoena Poultry Farm", isVerified: true, verifiedAt: new Date(), subscription: "GROWTH" } },
    },
    include: { farmer: true },
  });

  const f2 = await prisma.user.upsert({
    where:  { email: "thabiso@khokahano.ls" },
    update: {},
    create: {
      email: "thabiso@khokahano.ls", phone: "+26662345678",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Thabiso", lastName: "Letsie",
      district: "Maseru", village: "Lithabaneng",
      farmer: { create: { farmName: "Letsie Layers Farm", isVerified: true, verifiedAt: new Date(), subscription: "BASIC" } },
    },
    include: { farmer: true },
  });

  const f3 = await prisma.user.upsert({
    where:  { email: "mamorena@khokahano.ls" },
    update: {},
    create: {
      email: "mamorena@khokahano.ls", phone: "+26659876543",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Mamorena", lastName: "Sello",
      district: "Leribe", village: "Hlotse",
      farmer: { create: { farmName: "Sello Free Range Farm", isVerified: false, subscription: "BASIC" } },
    },
    include: { farmer: true },
  });

  const f4 = await prisma.user.upsert({
    where:  { email: "retselisitsoe@khokahano.ls" },
    update: {},
    create: {
      email: "retselisitsoe@khokahano.ls", phone: "+26663457890",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Retselisitsoe", lastName: "Molapo",
      district: "Berea", village: "Teyateyaneng",
      farmer: { create: { farmName: "Molapo Indigenous Farm", isVerified: true, verifiedAt: new Date(), subscription: "PREMIUM" } },
    },
    include: { farmer: true },
  });

  const f5 = await prisma.user.upsert({
    where:  { email: "mamatseliso@khokahano.ls" },
    update: {},
    create: {
      email: "mamatseliso@khokahano.ls", phone: "+26658000001",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Mamatseliso", lastName: "Pitso",
      district: "Butha-Buthe", village: "Butha-Buthe Town",
      farmer: { create: { farmName: "Pitso Farm", isVerified: true, verifiedAt: new Date(), subscription: "GROWTH" } },
    },
    include: { farmer: true },
  });

  const f6 = await prisma.user.upsert({
    where:  { email: "alotsi@khokahano.ls" },
    update: {},
    create: {
      email: "alotsi@khokahano.ls", phone: "+26658000002",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Alotsi", lastName: "Thabelang",
      district: "Butha-Buthe", village: "Butha-Buthe Town",
      farmer: { create: { farmName: "Thabelang Poultry", isVerified: false, subscription: "BASIC" } },
    },
    include: { farmer: true },
  });

  const f7 = await prisma.user.upsert({
    where:  { email: "mathapelo@khokahano.ls" },
    update: {},
    create: {
      email: "mathapelo@khokahano.ls", phone: "+26658000003",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Mathapelo", lastName: "Mohapinyane",
      district: "Maseru", village: "Motimposo",
      farmer: { create: { farmName: "Mohapinyane Broilers", isVerified: true, verifiedAt: new Date(), subscription: "BASIC" } },
    },
    include: { farmer: true },
  });

  const f8 = await prisma.user.upsert({
    where:  { email: "lineo@khokahano.ls" },
    update: {},
    create: {
      email: "lineo@khokahano.ls", phone: "+26656789012",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Lineo", lastName: "Ramaili",
      district: "Berea", village: "Mapoteng",
      farmer: { create: { farmName: "Ramaili Farm", isVerified: false, subscription: "BASIC" } },
    },
    include: { farmer: true },
  });

  const f9 = await prisma.user.upsert({
    where:  { email: "thabo@khokahano.ls" },
    update: {},
    create: {
      email: "thabo@khokahano.ls", phone: "+26657001013",
      passwordHash: farmerPassword, role: "FARMER",
      firstName: "Thabo", lastName: "Ramosoeu",
      district: "Leribe", village: "Hlotse",
      farmer: { create: { farmName: "Ramosoeu Feed Supplies", isVerified: true, verifiedAt: new Date(), subscription: "GROWTH" } },
    },
    include: { farmer: true },
  });

  console.log("✅ Farmers created (9)");

  // ── Products ──────────────────────────────────────────────
  const products = [
    {
      farmerId: f1.farmer.id, district: "Maseru", village: "Ha Thetsane",
      title: "Day-old broiler chicks", titleSt: "Li-pjoana tsa li-broiler",
      description: "Healthy Ross 308 day-old chicks. Vaccinated against Marek's disease. Available every week.",
      descriptionSt: "Li-pjoana tse phelang tsa Ross 308. Li kolosetsa Marek. Li fumaneha beke le beke.",
      category: "BROILERS", pricePerUnit: 35, unit: "per chick", unitSt: "ka pjoana",
      stockQuantity: 500, minOrderQty: 20,
      image: "/assets/products/live-broilers.jpg",
    },
    {
      farmerId: f2.farmer.id, district: "Maseru", village: "Lithabaneng",
      title: "Point-of-lay hens (16 wks)", titleSt: "Likhukhu tse haufi le ho bua mae",
      description: "Lohmann Brown ready-to-lay pullets. Fully vaccinated. Excellent laying history.",
      descriptionSt: "Li-Lohmann Brown tse loketsoeng ho bua mae. Li kolotsoa kaofela.",
      category: "LAYERS", pricePerUnit: 180, unit: "per bird", unitSt: "ka nonyana",
      stockQuantity: 120, minOrderQty: 1,
      image: "/assets/products/point-of-lay.jpg",
    },
    {
      farmerId: f3.farmer.id, district: "Leribe", village: "Hlotse",
      title: "Fresh free-range eggs", titleSt: "Mae a foreshe a likhukhu tsa ntle",
      description: "Farm-fresh eggs collected daily from free-range layers. Available Mon, Wed, Fri.",
      descriptionSt: "Mae a polasi a khokahanoa letsatsi le letsatsi. A fumaneha Msombuluko, Laboraro, Labohlano.",
      category: "EGGS", pricePerUnit: 28, unit: "per tray (30)", unitSt: "ka thepe (30)",
      stockQuantity: 200, minOrderQty: 1,
      image: "/assets/products/eggs-mamatseliso.jpg",
    },
    {
      farmerId: f4.farmer.id, district: "Berea", village: "Teyateyaneng",
      title: "Indigenous chickens (mature, live)", titleSt: "Likhukhu tsa naha (tse holile, tse phelang)",
      description: "Naturally raised Basotho indigenous chickens. No hormones, no antibiotics. Live or slaughtered on request.",
      descriptionSt: "Likhukhu tsa Basotho tse holisitsoeng ka tlhaho. Ha ho makhomelo.",
      category: "INDIGENOUS", pricePerUnit: 120, unit: "per bird", unitSt: "ka nonyana",
      stockQuantity: 45, minOrderQty: 1,
      image: "/assets/products/ind-chicken.jpg",
    },
    {
      farmerId: f5.farmer.id, district: "Butha-Buthe", village: "Butha-Buthe Town",
      title: "Fresh farm eggs — tray of 30", titleSt: "Mae a polasi a foreshe — thepe ea 30",
      description: "Fresh eggs from our free-range layers in Butha-Buthe. Collected daily.",
      descriptionSt: "Mae a foreshe ho tsoa likhukhu tsa rona tsa ntle Butha-Buthe.",
      category: "EGGS", pricePerUnit: 60, unit: "per tray (30 eggs)", unitSt: "ka thepe (mae a 30)",
      stockQuantity: 150, minOrderQty: 1,
      image: "/assets/products/eggs-mamatseliso.jpg",
    },
    {
      farmerId: f6.farmer.id, district: "Butha-Buthe", village: "Butha-Buthe Town",
      title: "Full indigenous chicken — slaughtered & packaged", titleSt: "Khukhu ea naha e felletseng — e hlatsuoeng",
      description: "Whole indigenous chickens slaughtered fresh and individually wrapped. Ready for cooking or freezing.",
      descriptionSt: "Likhukhu tsa naha tse hlatsuoeng tse foreshe le ho phahamisoa ka ho iphapanyetsoa.",
      category: "INDIGENOUS", pricePerUnit: 120, unit: "per chicken", unitSt: "ka khukhu",
      stockQuantity: 30, minOrderQty: 1,
      image: "/assets/products/chicken-alotsi.jpg",
    },
    {
      farmerId: f7.farmer.id, district: "Maseru", village: "Motimposo",
      title: "Full broiler — slaughtered & wrapped", titleSt: "Khukhu ea broiler e felletseng — e hlatsuoeng",
      description: "Fresh whole broiler chickens, individually wrapped. Ready for delivery or pickup in Maseru.",
      descriptionSt: "Likhukhu tsa broiler tse foreshe, li phahamisitsoe ka bo mong.",
      category: "BROILERS", pricePerUnit: 100, unit: "per chicken", unitSt: "ka khukhu",
      stockQuantity: 50, minOrderQty: 1,
      image: "/assets/products/chicken-mathapelo.jpg",
    },
    {
      farmerId: f8.farmer.id, district: "Berea", village: "Mapoteng",
      title: "Live broilers (5–6 weeks)", titleSt: "Li-broiler tse phelang (beke 5–6)",
      description: "Ready-to-slaughter broilers averaging 1.8–2.2 kg live weight. Strict biosecurity maintained.",
      descriptionSt: "Li-broiler tse loketsoeng ho hlatsuoa. Boima bo thusang ke kg 1.8–2.2.",
      category: "BROILERS", pricePerUnit: 95, unit: "per bird", unitSt: "ka nonyana",
      stockQuantity: 200, minOrderQty: 1,
      image: "/assets/products/live-broilers.jpg",
    },
    {
      farmerId: f9.farmer.id, district: "Leribe", village: "Hlotse",
      title: "Broiler finisher pellets 50 kg", titleSt: "Mocha oa ho phetha oa li-broiler 50 kg",
      description: "World Broiler Finisher 50 kg bag. For broilers from 4 weeks to slaughter. Fast weight gain.",
      descriptionSt: "Sekhao sa Broiler Finisher sa 50 kg. Bakeng sa li-broiler tse libekeng tse 4 ho fihlela ho hlatsuoa.",
      category: "FEED_AND_SUPPLIES", pricePerUnit: 580, unit: "per 50 kg bag", unitSt: "ka sekhao sa 50 kg",
      stockQuantity: 40, minOrderQty: 1,
      image: "/assets/products/broiler-finisher.jpg",
    },
    {
      farmerId: f9.farmer.id, district: "Leribe", village: "Hlotse",
      title: "Broiler starter crumble 25 kg", titleSt: "Mocha oa li-broiler (25 kg)",
      description: "High-protein starter crumble for day-old to 2-week broilers. 22% protein.",
      descriptionSt: "Mocha o nang le protein e ngata bakeng sa li-broiler tse ncha. Protein 22%.",
      category: "FEED_AND_SUPPLIES", pricePerUnit: 320, unit: "per 25 kg bag", unitSt: "ka sekhao sa 25 kg",
      stockQuantity: 80, minOrderQty: 1,
      image: "/assets/products/broiler-finisher.jpg",
    },
    {
      farmerId: f9.farmer.id, district: "Leribe", village: "Hlotse",
      title: "Poultry drinker — 5 litre", titleSt: "Seno sa likhukhu — litha tse 5",
      description: "5-litre gravity-fed poultry drinker with leg stands. Easy to fill and clean.",
      descriptionSt: "Seno sa likhukhu sa litha tse 5 se nang le maoto. Se bonolo ho tlatsa le ho hlatsa.",
      category: "FEED_AND_SUPPLIES", pricePerUnit: 85, unit: "per unit", unitSt: "ka sona",
      stockQuantity: 25, minOrderQty: 1,
      image: "/assets/products/poultry-feeder.jpg",
    },
    {
      farmerId: f9.farmer.id, district: "Leribe", village: "Hlotse",
      title: "Phenix Stresspac — vitamin & electrolyte supplement", titleSt: "Phenix Stresspac — setlhahiso sa livitamine",
      description: "Virbac Phenix Stresspac — soluble vitamins and electrolytes for poultry. Mix in drinking water.",
      descriptionSt: "Virbac Phenix Stresspac — livitamine le electrolyte tse qhibilikang bakeng sa likhukhu.",
      category: "FEED_AND_SUPPLIES", pricePerUnit: 45, unit: "per sachet", unitSt: "ka sephahla",
      stockQuantity: 120, minOrderQty: 1,
      image: "/assets/products/stress-pack.jpg",
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        farmerId:      p.farmerId,
        title:         p.title,
        titleSt:       p.titleSt,
        description:   p.description,
        descriptionSt: p.descriptionSt,
        category:      p.category,
        pricePerUnit:  p.pricePerUnit,
        unit:          p.unit,
        unitSt:        p.unitSt,
        stockQuantity: p.stockQuantity,
        minOrderQty:   p.minOrderQty,
        district:      p.district,
        village:       p.village,
        images: { create: [{ url: p.image, isPrimary: true }] },
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // ── Test buyer ────────────────────────────────────────────
  const buyerPassword = await bcrypt.hash("buyer1234", 12);
  await prisma.user.upsert({
    where:  { email: "buyer@test.ls" },
    update: {},
    create: {
      email: "buyer@test.ls", phone: "+26656000001",
      passwordHash: buyerPassword, role: "BUYER",
      firstName: "Test", lastName: "Buyer",
      district: "Maseru", village: "Ha Abia",
      buyer: { create: {} },
    },
  });
  console.log("✅ Test buyer created");

  console.log("\n🎉 Seed complete!");
  console.log("   Admin:   admin@khokahanoagrisystems.ls / admin1234");
  console.log("   Farmers: nthabiseng@khokahano.ls / farmer1234 (and 8 others)");
  console.log("   Buyer:   buyer@test.ls / buyer1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());