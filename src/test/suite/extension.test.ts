import * as assert from 'assert';
import * as vscode from 'vscode';

describe('BugBoo Extension Real Activation & Command Test Suite', () => {
  it('Extension activates properly in VS Code', async () => {
    const ext = vscode.extensions.getExtension('kiranmayee-abbireddy.bugboo');
    assert.ok(ext, 'BugBoo extension should be registered in VS Code');
    if (!ext.isActive) {
      await ext.activate();
    }
    assert.strictEqual(ext.isActive, true, 'BugBoo extension should be active');
  });

  it('Registered commands exist in VS Code command system', async () => {
    const allCommands = await vscode.commands.getCommands(true);
    assert.ok(allCommands.includes('bugboo.summon'), 'bugboo.summon should be registered');
    assert.ok(allCommands.includes('bugboo.changeMood'), 'bugboo.changeMood should be registered');
    assert.ok(allCommands.includes('bugboo.showStats'), 'bugboo.showStats should be registered');
    assert.ok(allCommands.includes('bugboo.resetProgress'), 'bugboo.resetProgress should be registered');
  });

  it('Can execute bugboo.showStats without crashing', async () => {
    await vscode.commands.executeCommand('bugboo.showStats');
    assert.ok(true, 'Executed bugboo.showStats successfully');
  });

  it('Can open document and trigger editor events without errors', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'javascript',
      content: 'console.log("hello BugBoo");'
    });
    await vscode.window.showTextDocument(doc);
    assert.ok(doc, 'Opened virtual document');
  });
});
