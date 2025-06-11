const { execSync } = require('child_process');

try {
  execSync('dotnet --version', { stdio: 'inherit' });
} catch (err) {
  console.error('The .NET SDK is required but was not found. Install it from https://dotnet.microsoft.com/download.');
  process.exit(1);
}
