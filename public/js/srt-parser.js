const SrtParser = {
    /**
     * Converts a timestamp string to milliseconds.
     * Supports formats like "00:00:01,000" or "00:00:01.000".
     */
    toMilliseconds: function(timestamp) {
        if (!timestamp) return 0;
        const match = timestamp.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})([.,](\d{1,3}))?/);
        if (!match) return 0;
        
        const hh = parseInt(match[1]);
        const mm = parseInt(match[2]);
        const ss = parseInt(match[3]);
        const ff = match[5] ? parseInt(match[5].padEnd(3, '0')) : 0;
        
        return (hh * 3600000) + (mm * 60000) + (ss * 1000) + ff;
    },

    /**
     * Converts milliseconds to a timestamp string.
     * Output format: "HH:MM:SS,mmm"
     */
    toTimeString: function(ms) {
        if (ms === undefined || ms === null) return "00:00:00,000";
        
        const hh = Math.floor(ms / 3600000);
        const mm = Math.floor((ms % 3600000) / 60000);
        const ss = Math.floor((ms % 60000) / 1000);
        const ff = Math.floor(ms % 1000);

        const pad = (n, width = 2) => n.toString().padStart(width, '0');
        // SRT standard uses comma for milliseconds
        return `${pad(hh)}:${pad(mm)}:${pad(ss)},${pad(ff, 3)}`;
    },

    /**
     * Helper regex to identify timestamp lines.
     * Matches "00:00:00,000 --> 00:00:00,000" with flexibility.
     */
    timestampRegex: /(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{1,2}:\d{1,2}[.,]\d{1,3})/,

    /**
     * Parses SRT content into an array of caption objects.
     */
    parse: function(content) {
        const captions = [];
        
        // 1. Normalize line endings
        content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        
        // 2. Split by double newlines (blocks) to isolate subtitles
        // Regex: \n followed by variable whitespace including at least one more \n
        const blocks = content.split(/\n\s*\n/);
        
        let indexCounter = 1;

        for (const block of blocks) {
            const lines = block.split("\n").map(l => l.trim()).filter(l => l !== "");
            if (lines.length === 0) continue;

            let startIndex = 0;
            let index = indexCounter;
            let start = 0;
            let end = 0;
            let text = "";
            let timestampMatch = null;
            let timestampLineIndex = -1;

            // 3. Find the timestamp line
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("-->")) {
                     const match = lines[i].match(this.timestampRegex);
                     if (match) {
                         timestampMatch = match;
                         timestampLineIndex = i;
                         break;
                     }
                }
            }

            if (!timestampMatch) {
                // If no timestamp found, skip this block (it's garbage or not a subtitle)
                continue;
            }

            // 4. Extract Index (if present before timestamp)
            if (timestampLineIndex > 0) {
                 const prevLine = lines[timestampLineIndex - 1];
                 if (/^\d+$/.test(prevLine)) {
                     index = parseInt(prevLine, 10);
                 }
                 // If not a number, we stick to our counter
            }

            // 5. Extract Timecodes
            start = this.toMilliseconds(timestampMatch[1]);
            end = this.toMilliseconds(timestampMatch[2]);
            
            // 6. Extract Text (everything after timestamp)
            const contentLines = lines.slice(timestampLineIndex + 1);
            text = contentLines.join("\n"); // content uses \n, app logic handles replacing with <br>

            captions.push({
                index: index,
                start: start,
                end: end,
                duration: end - start,
                content: text
            });

            // If we found an explicit index, use it to update our counter? 
            // Better to just increment our counter or rely on explicit indices if they exist.
            // But if indices are missing, we need the counter.
            // If explicit index was 5, next should be 6.
            indexCounter = index + 1;
        }

        return captions;
    }
};
