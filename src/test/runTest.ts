import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const vscodeExecutablePath = 'C:\\Users\\LENOVO\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe';

    console.log('Testing with installed VS Code executable at:', vscodeExecutablePath);

    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox'
      ]
    });
    console.log('All VS Code tests passed successfully!');
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
