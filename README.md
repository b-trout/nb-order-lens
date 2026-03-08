# nb-order-lens

VSCode extension that highlights Jupyter notebook cells whose execution order is non-consecutive.

## Features

- Adds a **red left border** to any code cell whose execution count is out of sequence.
- Automatically updates decorations as you run or re-run cells.
- Trailing unexecuted cells (no execution count) are ignored — only executed cells are evaluated.

## How It Works

After each notebook change, the extension reads the `executionOrder` of every code cell and checks whether they form a consecutive sequence starting from 1 (e.g. `[1, 2, 3, ...]`). Any cell whose count doesn't match its expected position is flagged with a red left border in the editor gutter.

Examples:

| Execution counts | Flagged cells |
|---|---|
| `[1, 2, 3]` | none |
| `[1, 3, 4]` | cells 2 and 3 (gap after cell 1) |
| `[3, 2, 1]` | cells 1 and 3 (wrong position) |
| `[1, 2, undefined]` | none (trailing unexecuted cell ignored) |

## Requirements

- VS Code **1.85.0** or later
- The [Jupyter](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter) extension

## Extension Settings

This extension contributes no settings.

## Known Issues

Decorations are applied only to cells currently visible on screen. Cells that are scrolled out of view are decorated as they scroll into view.

## Contributing

Bug reports and feature requests are welcome at [GitHub Issues](https://github.com/b-trout/nb-order-lens/issues).
