import { Analysis } from "@/data-convert/types.ts";
import { getShortNodeName } from "@/data-convert/get-short-node-name.ts";

export const convertAnalysisNodeNamesToShortForm = ( analysis: Analysis ): Analysis => {
  const nodeMetrics = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    const newData = Object.fromEntries(
      Object.entries(data).map(( [ key, val ] ) => [ getShortNodeName(key), val ]),
    );

    return { ...acc, [antipatternName]: newData }
  }, {})

  const edgeHighlight = Object.entries(analysis).reduce(( acc, [ antipatternName, data ] ) => {
    if ( typeof data === 'object' && Array.isArray(Object.values(data)[0]) ) {
      const newData = Object.fromEntries(
        Object.entries(data).map(( [ _, __ ] ) => {
          return [ _,
            __.map(( item ) => getShortNodeName(item))
          ]
        }),
      );
      return { ...acc, [antipatternName]: newData }
    }
    return acc
  }, {})

  return Object.assign({}, nodeMetrics, edgeHighlight)
}