import * as vscode from 'vscode';
import { NotebookDecorator } from './decorator';

let decorator: NotebookDecorator | undefined;

/** Activates the extension and registers all event listeners. */
export function activate(context: vscode.ExtensionContext): void {
  decorator = new NotebookDecorator();

  // Decorate any notebooks already open at activation time.
  for (const editor of vscode.window.visibleNotebookEditors) {
    decorator.decorate(editor.notebook);
  }

  // Why onDidChangeVisibleNotebookEditors instead of onDidOpenNotebookDocument:
  // The "open" event fires as soon as the document is registered, before the
  // notebook's cell editors are ready. This event fires after the editors are
  // fully rendered, so TextEditors can be found for the cells immediately.
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleNotebookEditors((editors) => {
      for (const editor of editors) {
        decorator?.decorate(editor.notebook);
      }
    })
  );

  // Why vscode.workspace, not vscode.notebooks:
  // The vscode.notebooks namespace does not expose onDidChangeNotebookDocument
  // in the stable API. The event lives on vscode.workspace.
  context.subscriptions.push(
    vscode.workspace.onDidChangeNotebookDocument((event) => {
      decorator?.decorate(event.notebook);
    })
  );

  // Why a third event listener for visible text editors:
  // Each notebook cell only has a TextEditor while it is rendered on screen.
  // When the user scrolls new cells into view, VSCode creates fresh TextEditor
  // instances for those cells and fires this event. Without this listener,
  // cells that scroll in after activation would never receive decorations.
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(() => {
      for (const editor of vscode.window.visibleNotebookEditors) {
        decorator?.decorate(editor.notebook);
      }
    })
  );

  context.subscriptions.push(decorator);
}

/** Deactivates the extension and releases decoration resources. */
export function deactivate(): void {
  decorator?.dispose();
}
