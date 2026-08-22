export type ShippingRegion =
  | 'CONTINENT'
  | 'ISLANDS';

export function getShippingRegion(
  postalCode: string,
): ShippingRegion {
  const normalized =
    postalCode.trim();

  if (
    !/^\d{4}-\d{3}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      'Invalid Portuguese postal code',
    );
  }

  const prefix =
    Number(
      normalized.slice(0, 4),
    );

  if (
    prefix >= 9000 &&
    prefix <= 9999
  ) {
    return 'ISLANDS';
  }

  return 'CONTINENT';
}