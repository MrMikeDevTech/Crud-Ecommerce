/**
 * Verifica si ya han pasado 12 horas desde la última actualización.
 *
 * @param lastUpdate - Fecha de la última vez que se actualizó el avatar.
 * @returns Un objeto con:
 *   - `canUpdate`: `true` si ya pasaron 12h, `false` si aún no.
 *   - `remaining`: Si `canUpdate` es `false`, contiene `{ hours, minutes }`. Si no, es `null`.
 */
export function checkAvatarUpdateCooldown(
    lastUpdate: Date | null,
    cooldownHours = 12
): {
    canUpdate: boolean;
    remaining: { hours: number; minutes: number } | null;
} {
    if (!lastUpdate) {
        return { canUpdate: true, remaining: null };
    }

    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= cooldownHours) {
        return { canUpdate: true, remaining: null };
    }

    const remainingMs = cooldownHours * 60 * 60 * 1000 - diffMs;
    let hours = Math.floor(remainingMs / (1000 * 60 * 60));
    let minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 60) {
        hours += 1;
        minutes = 0;
    }

    return {
        canUpdate: false,
        remaining: { hours, minutes }
    };
}
