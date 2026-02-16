# SRT Merger Development Guide

## Commands
- **Setup**: `npm install` - Install dependencies
- **Run Server**: `node server.js` - Start the server on port 3000
- **Dev Mode**: `npx nodemon server.js` - Run with auto-restart on file changes
- **Quick Start**: `srt-merger.bat` - Windows batch file to start server and open browser

## Code Style Guidelines
- **Indentation**: 4 spaces
- **Naming**: camelCase for functions and variables
- **Semicolons**: Required at end of statements
- **Variables**: Prefer `const`, use `let` when necessary
- **Error Handling**: Use try/catch blocks for parsing and file operations
- **Function Style**: Mixture of function declarations and arrow functions
- **Console Logging**: Acceptable for debugging purposes

## Project Structure
- **Backend**: Express.js server with subtitle processing logic
- **Frontend**: Single HTML page with embedded CSS and JavaScript
- **Key Dependencies**: express, multer, subsrt, bootstrap
- **Key Functions**: `compareSubtitles`, `buildContent`, `isIdentical` 

## Design Principles
- Maintain clean separation between server and client code
- Preserve subtitle formatting tags when editing and saving
- Ensure accurate timeline synchronization in merged output