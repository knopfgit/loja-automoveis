/* eslint-disable no-console */
/**
 * Injeta um conjunto de frames SPIN_360 num veículo, pra testar o viewer 360°
 * com giro liso de verdade (não o fallback da galeria).
 *
 * Frames: dataset 360 aberto da Scaleflex (cloudimage-360-view), 36 fotos.
 *
 * Uso:
 *   npx ts-node prisma/seed-360.ts            # usa o primeiro veículo do banco
 *   npx ts-node prisma/seed-360.ts <slug>     # usa um veículo específico
 *
 * É idempotente: limpa os SPIN_360 antigos do veículo antes de inserir.
 * Não mexe na galeria normal (isMain/posição das fotos comuns ficam intactas).
 */
import { PrismaClient, MediaRole } from '@prisma/client';

const prisma = new PrismaClient();

const FRAME_COUNT = 36;
const frameUrl = (i: number) =>
  `https://scaleflex.cloudimg.io/v7/demo/360-car/car-${i}.jpg`;

async function main() {
  const slug = process.argv[2];

  const vehicle = slug
    ? await prisma.vehicle.findUnique({ where: { slug } })
    : await prisma.vehicle.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!vehicle) {
    console.error(
      slug
        ? `Nenhum veículo com slug "${slug}".`
        : 'Nenhum veículo no banco. Rode o seed principal antes.',
    );
    process.exit(1);
  }

  // Idempotência: remove frames de giro anteriores deste veículo.
  const removed = await prisma.vehicleMedia.deleteMany({
    where: { vehicleId: vehicle.id, role: MediaRole.SPIN_360 },
  });
  if (removed.count) console.log(`Removidos ${removed.count} frames antigos.`);

  await prisma.vehicleMedia.createMany({
    data: Array.from({ length: FRAME_COUNT }, (_, idx) => ({
      vehicleId: vehicle.id,
      type: 'image',
      role: MediaRole.SPIN_360,
      url: frameUrl(idx + 1),
      position: idx,
      isMain: false,
      published: true,
      altText: `${vehicle.brand} ${vehicle.model} — 360° frame ${idx + 1}`,
    })),
  });

  console.log(
    `\n✅ ${FRAME_COUNT} frames SPIN_360 adicionados em "${vehicle.brand} ${vehicle.model}".`,
  );
  console.log(`Abra no site: /veiculos/${vehicle.slug}  (ou o catálogo e clique nesse carro)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());