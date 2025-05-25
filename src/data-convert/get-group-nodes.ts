import { ReactflowNodeWithData } from "@/data-convert/types.ts";


export const getGroupNodes = ( { activeToggles, parentIds }: {
  activeToggles: string[],
  parentIds: string[]
} ): ReactflowNodeWithData[] => {

  const allSubsetsOfNodeGroupNames = activeToggles.reduce(
    ( subsets, value ) => subsets.concat(
      subsets.map(set => [ value, ...set ])
    ),
    [ [] ])
    .map(arr => arr.sort().join(' x '))
    .filter(groupName => groupName && parentIds.includes(groupName))
    .sort(( x, y ) => y.length - x.length);


  const groupNodes: ReactflowNodeWithData[] = allSubsetsOfNodeGroupNames.map(( nodeName, i ) => {
    return {
      id: nodeName,
      type: 'group',
      position: { x: 0, y: 0 },
      data: {
        id: nodeName,
        type: 'group',
        position: { x: 0, y: 0 },
        sourceHandles: [],
        targetHandles: [],
        width: 1000,
        height: 1000
      }
    }
  })

  return groupNodes;
}