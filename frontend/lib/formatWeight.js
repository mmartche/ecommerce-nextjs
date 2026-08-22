export function formatWeight(
  grams
) {
  const value =
    Number(grams || 0);

  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(2)} kg`;
  }

  return `${value} g`;
}