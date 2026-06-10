"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicVehicle = toPublicVehicle;
function toPublicVehicle(vehicle) {
    if (!vehicle)
        return null;
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
        price: vehicle.announcedPrice,
        featured: vehicle.featured,
        description: vehicle.publicDescription,
        available: vehicle.status === 'AVAILABLE',
        viewCount: vehicle.viewCount,
        favoriteCount: vehicle.favoriteCount,
        spec: vehicle.spec ? toPublicSpec(vehicle.spec) : undefined,
        media: Array.isArray(vehicle.media)
            ? vehicle.media
                .filter((m) => m.published)
                .sort((a, b) => a.position - b.position)
                .map((m) => ({
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
function toPublicSpec(spec) {
    const { id: _id, vehicleId: _vehicleId, source: _source, fieldSources: _fieldSources, lastSyncedAt: _lastSyncedAt, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = spec;
    return rest;
}
//# sourceMappingURL=vehicles.serializer.js.map