-- Satıcı profil alanları (hepsi nullable, geriye dönük güvenli)
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "sector" TEXT;
