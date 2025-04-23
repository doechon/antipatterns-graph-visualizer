export const getShortNodeName = ( nodeId: string ): string => {
  const arr = nodeId.split('.')
  return arr[arr.length - 1]
}