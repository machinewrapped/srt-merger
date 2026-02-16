# srt-merger

This is a simple utility to help merge two different subtitle translations for a film. It aligns the subtitles using timecodes and allows individual lines to be selected from each file (or neither/both), then generates a new `.srt` file with the selected lines.

**Note:** This tool assumes the subtitles are already synchronized.

## Features
- **Client-Side Only**: Does not require a server or internet connection. All processing happens in your browser.
- **Privacy**: Your subtitle files are processed locally and never uploaded to any server.
- **Visual Comparison**: Side-by-side view of two subtitle files aligned by timecode.
- **Intelligent Conflict Detection**: Automatically highlights rows with overlapping times or conflicting text.
- **Editing**: Double-click any line to edit text or timecodes directly.
- **Flexible Merging**: Select lines from either file, or Shift+Click to include both versions.
- **Persistence**: Your work is saved automatically in your browser (IndexedDB) so you don't lose progress if you accidentally close the tab.
- **Reset Session**: Easily clear all data and start fresh.

## Setup
No installation required! Just download or clone this repository.

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, etc.).

## Usage
1.  **Launch the App**:
    - Double-click **`srt-merger.bat`** (Windows).
    - Or open `public/index.html` directly in your browser.

2.  **Compare Subtitles**:
    - Select your primary subtitle file as **File 1**.
    - Select the alternative translation as **File 2**.
    - The tool will automatically align and display them.

3.  **Merge**:
    - Go through the rows. Identical lines are greyed out automatically.
    - For conflicting lines, check the box for the version you want to keep.
    - **Shift + Click** a checkbox to select it without deselecting the other side (useful for keeping both versions).

4.  **Edit**:
    - Double-click any text cell to edit the content or timestamp. 
    - Click outside the cell to save your changes locally.

5.  **Save**:
    - Click **"Save Merged SRT"** to download your new subtitle file.

## Screenshots
![image](https://github.com/machinewrapped/srt-merger/assets/10140676/fd2e5fac-48de-40da-9683-9a5a587d9d9e)
