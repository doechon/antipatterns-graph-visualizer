export const whiteTheme = {
  colors: {
    elevation1: '#d4d4d4', // Panel background
    elevation2: '#e5e5e5', // Row background
    elevation3: '#ffffff', // Inputs
    accent1: '#80bfff', // Light blue – primary button
    accent2: '#a3d1ff', // Even lighter for secondary
    accent3: '#cce6ff', // Very soft blue hover/highlight
    highlight1: '#999999', // Borders / lines
    highlight2: '#666666', // Labels
    highlight3: '#111111', // Main text
    vivid1: '#ffa500',     // Vivid detail if needed
    folderWidgetColor: '$highlight2',
    folderTextColor: '$highlight3',
    toolTipBackground: '$highlight1',
    toolTipText: '$highlight3',
  },
  radii: {
    xs: '2px',
    sm: '4px',
    lg: '12px',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    rowGap: '8px',
    colGap: '8px',
  },
  fonts: {
    mono: `ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace`,
    sans: `system-ui, sans-serif`,
  },
  fontSizes: {
    root: '12px',
    toolTip: '$root',
  },
  sizes: {
    rootWidth: '300px',
    controlWidth: '180px',
    numberInputMinWidth: '42px',
    scrubberWidth: '10px',
    scrubberHeight: '18px',
    rowHeight: '26px',
    folderTitleHeight: '22px',
    checkboxSize: '18px',
    joystickWidth: '100px',
    joystickHeight: '100px',
    colorPickerWidth: '$controlWidth',
    colorPickerHeight: '100px',
    imagePreviewWidth: '$controlWidth',
    imagePreviewHeight: '100px',
    monitorHeight: '60px',
    titleBarHeight: '40px',
  },
  shadows: {
    level1: '0 0 8px 0 #00000022',
    level2: '0 4px 16px #00000033',
  },
  borderWidths: {
    root: '1px',
    input: '1px',
    focus: '2px',
    hover: '1px',
    active: '2px',
    folder: '1px',
  },
  fontWeights: {
    label: 'bold',
    folder: 'bold',
    button: '600',
  },
}
