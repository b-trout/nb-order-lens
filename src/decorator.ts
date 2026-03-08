import * as vscode from 'vscode';
import { getProblematicIndices } from './validator';

/**
 * Manages red left-border decorations on notebook cells whose execution order
 * is not consecutive starting from 1.
 *
 * Why TextEditorDecorationType instead of NotebookEditor.setDecorations:
 * The NotebookEditor decoration API (createNotebookEditorDecorationType /
 * NotebookEditor.setDecorations) is a proposed, unstable API as of early 2026.
 * Using it requires "enableProposedApi": true in package.json, which restricts
 * the extension to VSCode Insiders builds and voids Marketplace compatibility.
 * The stable workaround is that every notebook cell exposes a cell.document
 * (TextDocument), which can be paired with a TextEditor from
 * vscode.window.visibleTextEditors using URI comparison.
 */
export class NotebookDecorator implements vscode.Disposable {
  private readonly decorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      borderColor: new vscode.ThemeColor('errorForeground'),
      borderStyle: 'solid',
      borderWidth: '0 0 0 3px',
      overviewRulerColor: new vscode.ThemeColor('errorForeground'),
      overviewRulerLane: vscode.OverviewRulerLane.Left,
    });
  }

  /**
   * Applies or clears decorations for all visible code cells in the given
   * notebook. Cells whose execution order is out of sequence receive a red
   * left border; all others have decorations explicitly cleared.
   */
  decorate(notebook: vscode.NotebookDocument): void {
    const codeCells = notebook
      .getCells()
      .filter((c) => c.kind === vscode.NotebookCellKind.Code);

    const counts = codeCells.map((c) => c.executionSummary?.executionOrder);
    const problematicSet = new Set(getProblematicIndices(counts));

    for (let i = 0; i < codeCells.length; i++) {
      const cell = codeCells[i];
      if (!cell) {
        continue;
      }

      // A TextEditor only exists for cells currently rendered on screen.
      // Cells that are scrolled out of view have no TextEditor, so we skip
      // them here. onDidChangeVisibleTextEditors in extension.ts re-triggers
      // this method when new cells scroll into view.
      //
      // Why URI.toString() comparison: notebook cell URIs use the custom
      // "vscode-notebook-cell" scheme. Comparing the full URI string is the
      // safe, scheme-agnostic way to match a cell to its editor.
      const editor = vscode.window.visibleTextEditors.find(
        (e) => e.document.uri.toString() === cell.document.uri.toString()
      );
      if (!editor) {
        continue;
      }

      if (problematicSet.has(i)) {
        const lastLine = cell.document.lineCount - 1;
        const lastLineText = cell.document.lineAt(lastLine).text;
        const range = new vscode.Range(0, 0, lastLine, lastLineText.length);
        editor.setDecorations(this.decorationType, [{ range }]);
      } else {
        // Explicitly clear decorations for non-problematic cells. Decorations
        // are sticky — they persist until replaced with an empty array. A cell
        // that was previously flagged (e.g. before re-execution) must be
        // actively reset, otherwise the red border remains stale.
        editor.setDecorations(this.decorationType, []);
      }
    }
  }

  dispose(): void {
    this.decorationType.dispose();
  }
}
