export function formatPrice(price: number, currency = 'RUB'): string {
  const formatted = price.toLocaleString('ru-RU');
  return currency === 'RUB' ? `${formatted} ₽` : `${formatted} ${currency}`;
}

export function formatPricePerMeter(price: number, area: number, currency = 'RUB'): string {
  const perMeter = Math.round(price / area);
  return formatPrice(perMeter, currency) + '/м²';
}
