function pathArguments(args) {
  if (args.length < 1) throw new Error('Missing Path Argument(s)')
  const path = [...args].slice(0, args.length - 1)
  path.forEach(pathArg => {
    if (typeof pathArg != 'string') throw new Error(`Invalid Path Argument "${pathArg}"`)
  })
  return path
}

module.exports = pathArguments
