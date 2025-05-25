import React from 'react';

export interface SummaryProps {
  nodeMetrics?: Array<{ antiPatternName: string, value: number }>,
  edgeHighlight?: Array<{ antiPatternName: string, value: number }>,
  notFoundAntiPatterns?: Array<{ antiPatternName: string, value: number }>,
  activeAntiPatternToggleNames: Array<string>
}

export const Summary = ( {
                           nodeMetrics,
                           edgeHighlight,
                           notFoundAntiPatterns,
                           activeAntiPatternToggleNames
                         }: SummaryProps ) => {
  if ( !nodeMetrics || !edgeHighlight || !notFoundAntiPatterns ) {
    return null
  }
  return (
    <div
      className={ 'w-[var(--leva-sizes-rootWidth)] bg-[var(--leva-colors-elevation2)] text-[var(--leva-colors-highlight2)] rounded-[var(--leva-radii-lg)] text-center' }>
      <h2>Summary</h2>
      <p>{ '---' }</p>
      <h3>Node Metrics</h3>
      <ol>
        { nodeMetrics.map(( { antiPatternName, value } ) => (
          <li
            className={ activeAntiPatternToggleNames.includes(antiPatternName) && 'text-[red]' }>{ antiPatternName } { value }</li>
        )) }
      </ol>
      <p>{ '---' }</p>
      <h3>Edge Highlights</h3>
      <ol>
        { edgeHighlight.map(( { antiPatternName, value } ) => (
          <li>{ antiPatternName } { value }</li>
        )) }
      </ol>
      <p>{ '---' }</p>
      <h3>Not Found AntiPatterns</h3>
      <ol>
        { notFoundAntiPatterns.map(( { antiPatternName } ) => (
          <li>{ antiPatternName }</li>
        )) }
      </ol>
    </div>
  );
};

