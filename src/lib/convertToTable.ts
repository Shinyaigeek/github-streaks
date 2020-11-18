const bold = (str: string): string => `\u001b[1m${str}\u001b[22m`
const dim = (str: string): string => `\u001b[2m${str}\u001b[22m`

export function convertToTable<T extends { [key: string]: any }> (objects: T[], orderedKeys: (keyof T)[]) {
  const columnLength = orderedKeys.map(key => key.toString().length)

  for (let i = 0; i < orderedKeys.length; i++) {
    const key = orderedKeys[i] as string
    for (const object of objects) {
      columnLength[i] = Math.max(columnLength[i], object[key].toString().length)
    }
  }

  const rowDelimiter = dim('+' + columnLength.reduce((accr, len) => `${accr} ${'-'.repeat(len)} +`, ''))
  const cellDelimiter = dim('|')
  let table = rowDelimiter + '\n' +
    cellDelimiter + orderedKeys.map((key, i) => ` ${bold((key as string)[i === 0 ? 'padEnd' : 'padStart'](columnLength[i]))} `).join(cellDelimiter) + cellDelimiter + '\n' +
    rowDelimiter + '\n'

  for (const object of objects) {
    table += cellDelimiter
    for (let i = 0; i < orderedKeys.length; i++) {
      table += ` ${(object[orderedKeys[i]] as string)[i === 0 ? 'padEnd' : 'padStart'](columnLength[i])} ${cellDelimiter}`
    }
    table += '\n'
    table += rowDelimiter + '\n'
  }

  return table
}
