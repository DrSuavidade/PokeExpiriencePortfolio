// src/utils/collision2d.ts
export type Rect = {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
};

export function circleIntersectsRect(
    x: number,
    z: number,
    r: number,
    rect: Rect
) {
    const closestX = Math.max(rect.minX, Math.min(x, rect.maxX));
    const closestZ = Math.max(rect.minZ, Math.min(z, rect.maxZ));
    const dx = x - closestX;
    const dz = z - closestZ;
    return dx * dx + dz * dz < r * r;
}

/**
 * Slide resolution:
 * - if full move collides, try X-only then Z-only
 * - else revert
 */
export function resolveXZ(
    prevX: number,
    prevZ: number,
    nextX: number,
    nextZ: number,
    radius: number,
    blocks: Rect[]
) {
    const hit = blocks.some((b) => circleIntersectsRect(nextX, nextZ, radius, b));
    if (!hit) return { x: nextX, z: nextZ };

    const hitX = blocks.some((b) => circleIntersectsRect(nextX, prevZ, radius, b));
    if (!hitX) return { x: nextX, z: prevZ };

    const hitZ = blocks.some((b) => circleIntersectsRect(prevX, nextZ, radius, b));
    if (!hitZ) return { x: prevX, z: nextZ };

    return { x: prevX, z: prevZ };
}
