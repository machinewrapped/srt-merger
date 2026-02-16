# SRT Merger Development Guide

## Commands
- **Quick Start**: `srt-merger.bat` - Windows batch file to open browser

## Code Style Guidelines
- **Indentation**: 4 spaces
- **Naming**: camelCase for functions and variables
- **Semicolons**: Required at end of statements
- **Variables**: Prefer `const`, use `let` when necessary
- **Error Handling**: Use try/catch blocks for parsing and file operations
- **Function Style**: Mixture of function declarations and arrow functions
- **Console Logging**: Acceptable for debugging purposes

## Project Structure
- **Frontend**: Single HTML page with embedded CSS and JavaScript
- **Key Dependencies**: bootstrap
- **Key Functions**: `compareSubtitles`, `buildContent`, `isIdentical` 

## Design Principles
- Preserve subtitle formatting tags when editing and saving
- Ensure accurate timeline synchronization in merged output
