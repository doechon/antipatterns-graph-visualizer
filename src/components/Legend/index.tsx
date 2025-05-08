import React from 'react';

export interface SummaryProps {
  nodeMetrics?: Array<{ antiPatternName: string, value: number }>,
  edgeHighlight?: Array<{ antiPatternName: string, value: number }>,
  notFoundAntiPatterns?: Array<{ antiPatternName: string, value: number }>,
}

export const Summary = ( { nodeMetrics, edgeHighlight, notFoundAntiPatterns }: SummaryProps ) => {
  if ( !nodeMetrics || !edgeHighlight || !notFoundAntiPatterns ) {
    return null
  }
  console.log('nodeMetrics 2', nodeMetrics)
  return (
    <div
      className={ 'fixed z-[1000] w-[var(--leva-sizes-rootWidth)] left-2.5 top-2.5 bg-[var(--leva-colors-elevation2)] text-[var(--leva-colors-highlight2)] rounded-[var(--leva-radii-lg)] text-center' }>
      <h2>Summary</h2>
      <p>{ '---' }</p>
      <h3>Node Metrics</h3>
      <p>{ '---' }</p>
      <ol>
        { nodeMetrics.map(( { antiPatternName, value } ) => (
          <li>{ antiPatternName } { value }</li>
        )) }
      </ol>
      <p>{ '---' }</p>
      <h3>Edge Highlights</h3>
      <p>{ '---' }</p>
      <ol>
        { edgeHighlight.map(( { antiPatternName, value } ) => (
          <li>{ antiPatternName } { value }</li>
        )) }
      </ol>
      <p>{ '---' }</p>
      <h3>Not Found AntiPatterns</h3>
      <p>{ '---' }</p>
      <ol>
        { notFoundAntiPatterns.map(( { antiPatternName, value } ) => (
          <li>{ antiPatternName } { value }</li>
        )) }
      </ol>
    </div>
  );
};

