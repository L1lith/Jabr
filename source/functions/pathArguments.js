function pathArguments(args, saveIndexes=1, minLength = 1) {
  const path = [...args].slice(0, args.length - saveIndexes)
  if (path.length < minLength) throw new Error('Missing Path Argument(s)')
  path.forEach(pathArg => {
    if (typeof pathArg != 'string') throw new Error(`Invalid Path Argument "${pathArg}"`)
  })
  return path
}

module.exports = pathArguments
