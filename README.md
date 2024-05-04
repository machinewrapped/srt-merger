# srt-merger
This is a simple utility to help with the case where you have two different translations for a film, both of which have some flaws and some advantages. It aligns the subtitles using timecodes and allows individual lines to be selected from each file (or neither/both), then writes a new .srt file with the selected lines. This assumes the subtitles are already in synch, so make sure it is the case.

## setup
Install node.js, download the repository and open a command shell in the directory. Run 'npm install' to download the packages the project uses.

Launch the merge server with 'node server.js' (or srt-merger.bat), then connect to the URL displayed in the console with a browser (http://localhost:3000 by default).

Alternatively, open the directory in Visual Studio Code and configure it as a standard Node.js project.

## usage
Select the "best" subtitles as File 1, as these will be selected by default. Select the alternative translation as File 2, then go through selecting or deselecting lines from each file as appropriate. Shift + Click to include both sides.

When ready to save, click "Save Merged SRT".

![image](https://github.com/machinewrapped/srt-merger/assets/10140676/fd2e5fac-48de-40da-9683-9a5a587d9d9e)

