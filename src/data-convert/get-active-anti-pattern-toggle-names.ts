import { ReactflowLayoutConfig } from "@/layout/node";

export const getActiveAntiPatternToggleNames = ( toggles: ReactflowLayoutConfig['toggles'] ) => {
  if ( Object.values(toggles).length === 0 ) return [];

  const activeToggles = toggles.reduce(( acc, cur ) => {
    const [ [ antiPatternToggle, isToggled ], ] = Object.entries(cur);
    if ( isToggled ) return [ ...acc, antiPatternToggle ]
    return acc
  }, [])

  return activeToggles
}