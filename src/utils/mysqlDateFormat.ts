export const toMySQLDate = (date: Date) => {
  if (!(date instanceof Date) ) throw new Error('Fecha inválida');
  return date.toISOString().slice(0, 10)
}

export const toMySQLDateTime = (date: Date) => {
  if (!(date instanceof Date) ) throw new Error('Fecha inválida');
  return date.toISOString().replace('T', ' ').slice(0, 19)
}
