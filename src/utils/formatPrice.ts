export function formatPrice(price: number | string, currency = 'RUB'): string {
  const num = Math.round(Number(price));
  const formatted = num.toLocaleString('ru-RU');
  return currency === 'RUB' ? `${formatted} ₽` : `${formatted} ${currency}`;
}

export function formatPricePerMeter(price: number | string, area: number, currency = 'RUB'): string {
  const perMeter = Math.round(Number(price) / area);
  return formatPrice(perMeter, currency) + '/м²';
}
