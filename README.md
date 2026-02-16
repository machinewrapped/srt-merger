# srt-merger

This is a simple utility to help merge two different subtitle translations for a film. It aligns the subtitles using timecodes and allows individual lines to be selected from each file (or neither/both), then generates a new `.srt` file with the selected lines.

[Run it in your browser](https://machinewrapped.github.io/srt-merger/)

**Note:** This tool assumes the subtitles are already synchronized.

## Features
- **Visual Comparison**: Side-by-side view of two subtitle files aligned by timecode.
- **Flexible Merging**: Select lines from either file, or Shift+Click to include both versions.
- **Editing**: Double-click any line to edit text or timecodes directly.
- **Client-Side Only**: Does not require a server or internet connection. All processing happens in your browser.

<img width="3408" height="1880" alt="SRT Merger Serverless" src="https://github.com/user-attachments/assets/ffd69348-1272-49bd-81d1-0c56383261bf" />

## Setup
No installation required! Just download or clone this repository or [run it in your browser](https://machinewrapped.github.io/srt-merger/).

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, etc.).

## Usage
1.  **Launch the App**:
    - **Online**: Visit the [GitHub Pages Deployment](https://machinewrapped.github.io/srt-merger/).
    - **Local**: Double-click **`srt-merger.bat`** (Windows) or open `public/index.html` directly in your browser.

2.  **Compare Subtitles**:
    - Select your primary subtitle file as **File 1**.
    - Select the alternative translation as **File 2**.
    - The tool will automatically align and display them.

3.  **Merge**:
    - Go through the rows. Identical lines are greyed out automatically.
    - For conflicting lines, check the box for the version you want to keep (or neither, or both).
    - **Shift + Click** a checkbox to select it without deselecting the other side (useful for keeping both versions).

4.  **Edit**:
    - Double-click any text cell to edit the content or timestamp. 
    - Click outside the cell to save your changes locally.

5.  **Save**:
    - Click **"Save Merged SRT"** to download your new subtitle file.
