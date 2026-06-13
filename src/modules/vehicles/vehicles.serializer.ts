/**
 * Maps a Vehicle (with optional spec/media) to the PUBLIC shape.
 * NEVER include: purchasePrice, suggestedPrice, minPrice, soldPrice,
 * internalNotes, plate, renavam, chassis, engineNumber, acquisition costs,
 * or any other internal/commercial field.
 */
export function toPublicVehicle(vehicle: any) {
  if (!vehicle) return null;
  return {
    id: vehicle.id,
    publicCode: vehicle.publicCode,
    slug: vehicle.slug,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    manufactureYear: vehicle.manufactureYear,
    modelYear: vehicle.modelYear,
    category: vehicle.category,
    bodyType: vehicle.bodyType,
    color: vehicle.color,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    doors: vehicle.doors,
    mileage: vehicle.mileage,
    seats: vehicle.seats,
    condition: vehicle.condition,
    // Only the announced price is public. Prisma Decimal serializes as a JSON
    // string, so coerce to number to honor the documented contract.
    price:
      vehicle.announcedPrice == null ? null : Number(vehicle.announcedPrice),
    featured: vehicle.featured,
    description: vehicle.publicDescription,
    available: vehicle.status === 'AVAILABLE',
    viewCount: vehicle.viewCount,
    favoriteCount: vehicle.favoriteCount,
    spec: vehicle.spec ? toPublicSpec(vehicle.spec) : undefined,
    media: Array.isArray(vehicle.media)
      ? vehicle.media
          .filter((m: any) => m.published)
          .sort((a: any, b: any) => a.position - b.position)
          .map((m: any) => ({
            url: m.url,
            type: m.type,
            isMain: m.isMain,
            position: m.position,
            altText: m.altText,
          }))
      : undefined,
    createdAt: vehicle.createdAt,
  };
}

function toPublicSpec(spec: any) {
  const {
    id: _id,
    vehicleId: _vehicleId,
    source: _source,
    fieldSources: _fieldSources,
    lastSyncedAt: _lastSyncedAt,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = spec;
  return rest;
}
