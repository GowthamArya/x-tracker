# X-Tracker

X-Tracker is an Ionic Angular frontend application. The backend will be added later using .NET Web APIs.

## Prerequisites

The following tools are required:

- Git
- Node.js and npm
- Angular CLI
- Ionic CLI
- .NET SDK for the future backend

The project currently contains only the frontend. The `server` folder is reserved for the future .NET Web API project.

## 1. Check Existing Installations

Open Terminal and run:

```bash
git --version
node --version
npm --version
ng version
ionic --version
dotnet --version
```

If a command displays a version number, that tool is already installed. If a command displays `command not found`, install the corresponding tool.

## 2. Install Git

Check whether Git is installed:

```bash
git --version
```

If Git is not installed, install Apple's Command Line Tools:

```bash
xcode-select --install
```

Verify the installation:

```bash
git --version
```

## 3. Install Node.js and npm

Angular 20 requires a supported Node.js version. Use Node.js 20.19 or newer, Node.js 22.12 or newer, or a newer supported LTS version.

Check the existing installation:

```bash
node --version
npm --version
```

The recommended method on macOS is Homebrew. Check whether Homebrew is installed:

```bash
brew --version
```

If Homebrew is not installed, install it from <https://brew.sh>.

Install Node.js:

```bash
brew install node
```

Verify the installation:

```bash
node --version
npm --version
```

## 4. Install Angular CLI

Check whether Angular CLI is installed:

```bash
ng version
```

If it is not installed, install it globally:

```bash
npm install --global @angular/cli
```

Verify the installation:

```bash
ng version
```

The project also includes Angular CLI as a local development dependency, so the global installation is optional. The local version can be checked with:

```bash
npx ng version
```

## 5. Install Ionic CLI

Check whether Ionic CLI is installed:

```bash
ionic --version
```

If it is not installed, install it globally:

```bash
npm install --global @ionic/cli
```

Verify the installation:

```bash
ionic --version
```

## 6. Install the .NET SDK for the Future Backend

The backend has not been created yet. Do not create or install backend-specific dependencies until the .NET Web API project is added.

Check whether the .NET SDK is already installed:

```bash
dotnet --version
dotnet --list-sdks
dotnet --info
```

When the backend project is ready, install the .NET SDK version required by that project from <https://dotnet.microsoft.com/download>.

After installation, verify it:

```bash
dotnet --version
```

The backend will eventually be created inside the `server` folder, for example:

```text
server/
└── XTracker.Api/
```

## 7. Clone the Repository

If the repository has not been cloned yet:

```bash
git clone <repository-url>
cd x-tracker
```

If the repository is already available locally:

```bash
cd /path/to/x-tracker
```

## 8. Install Frontend Dependencies

Move to the frontend directory:

```bash
cd client
```

Install the dependencies:

```bash
npm install
```

For a clean installation using the lock file, use:

```bash
npm ci
```

Use `npm ci` when `package-lock.json` is available and dependencies should match the committed versions exactly.

## 9. Start the Frontend

From the `client` directory, run:

```bash
npm start
```

Alternatively, run:

```bash
ng serve
```

To use a specific host and port:

```bash
npm start -- --host 127.0.0.1 --port 8100
```

Open the application at <http://localhost:8100>.

Stop the development server with `Control + C`.

## 10. Build the Frontend

From the `client` directory:

```bash
npm run build
```

The production build will be generated in the `client/www` directory.

For continuous development builds:

```bash
npm run watch
```

## 11. Run Frontend Tests

From the `client` directory:

```bash
npm test
```

To run tests without opening a browser window:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## 12. Lint the Frontend

From the `client` directory:

```bash
npm run lint
```

## 13. Start the Backend

The backend is not available yet because the .NET Web API project has not been created.

After the backend is added, the expected commands will be similar to:

```bash
cd server/XTracker.Api
dotnet restore
dotnet build
dotnet run
```

The backend URL will be displayed in the terminal. It will usually be similar to:

```text
https://localhost:7001
http://localhost:5000
```

The exact port depends on the backend project's configuration.

## 14. Run Frontend and Backend Together

Use two Terminal windows.

### Terminal 1: Frontend

```bash
cd x-tracker/client
npm start
```

### Terminal 2: Backend

After the .NET project is created:

```bash
cd x-tracker/server/XTracker.Api
dotnet run
```

The frontend will normally run at <http://localhost:8100>. The backend will run at one of the URLs displayed by `dotnet run`.

## Project Structure

```text
x-tracker/
├── README.md
├── client/
│   ├── package.json
│   ├── angular.json
│   ├── capacitor.config.ts
│   └── src/
│       └── app/
└── server/
	└── .NET Web API project will be added here
```

## Common Issues

### `node: command not found`

Install Node.js and restart Terminal:

```bash
brew install node
```

### `ng: command not found`

Install Angular CLI:

```bash
npm install --global @angular/cli
```

Or use the project-local CLI:

```bash
npx ng version
```

### `ionic: command not found`

Install Ionic CLI:

```bash
npm install --global @ionic/cli
```

### Dependency installation fails

From the `client` directory, remove installed dependencies and reinstall:

```bash
rm -rf node_modules
npm ci
```

### Port 8100 is already in use

Start the frontend on another port:

```bash
npm start -- --host 127.0.0.1 --port 8200
```

Then open <http://localhost:8200>.

### .NET command is not available

Install the .NET SDK from <https://dotnet.microsoft.com/download>, restart Terminal, and verify it:

```bash
dotnet --version
```

## Quick Start

After the prerequisites are installed:

```bash
cd x-tracker/client
npm ci
npm start
```

Open <http://localhost:8100> in a browser.

The backend setup will be added to this README after the .NET Web API project is created.
