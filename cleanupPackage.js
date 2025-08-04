import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

const originalPackagePath = join(import.meta.dirname, 'package.json')
const distPackagePath = join(import.meta.dirname, 'dist', 'package.json')

const data = JSON.parse(await readFile(originalPackagePath, 'utf8'))

delete data.scripts
delete data.devDependencies

await writeFile(distPackagePath, JSON.stringify(data))
