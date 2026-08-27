# 2-Neighbor Cellular Automaton

A browser-based cellular automaton simulator.

## Rule

Each cell looks at its 8 surrounding neighbors.

- Exactly 2 neighbors → alive
- Anything other than 2 neighbors → dead

This is a custom cellular automaton and is not the standard Conway's Game of Life rules.

## Features

- Adjustable rows and columns
- Random starting grid
- Manually create patterns by clicking cells
- Start/Pause
- Step forward
- Step backward
- Reset to starting pattern
- Clear grid
- Generation counter
- Population counter
- Keyboard controls
- Responsive grid
- Works entirely in the browser

## Keyboard Controls

| Key | Action |
|---|---|
| Space | Start/Pause |
| Right Arrow | Step forward |
| Left Arrow | Step backward |

## Running Locally

Download the repository and open:

`index.html`

No Python or server is required.

## GitHub Pages

This project can be hosted directly using GitHub Pages because it is a static HTML/CSS/JavaScript application.

Enable GitHub Pages in:

Settings → Pages → Deploy from branch

Then select the branch containing `index.html`.

## License

MIT
