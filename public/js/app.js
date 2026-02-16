
let fileSections = null;

function isIdenticalSubtitle(sub1, sub2) {
    if (!sub1 || !sub2) return false;
    return (sub1.start === sub2.start) && (sub1.end === sub2.end) && (sub1.content === sub2.content);
}

function isIdenticalRow(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    
    for (let i = 0; i < arr1.length; i++) {
        if (!isIdenticalSubtitle(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}

function isIdenticalTextRow(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].content !== arr2[i].content) {
            return false;
        }
    }
    return true;
}

function compareSubtitles(srt1, srt2) {
    let i = 0; // iterator for srt1
    let j = 0; // iterator for srt2
    const sections = [];
    let index = 0;
    
    // Sort just in case? Usually valid SRT is sorted, but safe to assume it's okay or parser handles it.
    // server.js didn't sort input, so we assume valid input.

    while (i < srt1.length || j < srt2.length) {
        const sectionFile1 = [];
        const sectionFile2 = [];

        if (i >= srt1.length) {
            while (j < srt2.length) sectionFile2.push(srt2[j++]);
            sections.push({ index: index++, file1: null, file2: sectionFile2 });
            break;
        }

        if (j >= srt2.length) {
            while (i < srt1.length) sectionFile1.push(srt1[i++]);
            sections.push({ index: index++, file1: sectionFile1, file2: null });
            break;
        }

        const next_srt2_start = srt2[j].start;
        while (i < srt1.length && srt1[i].end <= next_srt2_start) {
            sectionFile1.push(srt1[i++]);
        }

        if (!sectionFile1.length) {
            const next_srt1_start = srt1[i].start;
            while (j < srt2.length && srt2[j].end <= next_srt1_start) {
                sectionFile2.push(srt2[j++]);
            }    
        }

        if (!sectionFile1.length && !sectionFile2.length) {
            while (i < srt1.length && j < srt2.length && isIdenticalSubtitle(srt1[i], srt2[j])) {
                sectionFile1.push(srt1[i++]);
                sectionFile2.push(srt2[j++]);
            }
        }

        if (!sectionFile1.length && !sectionFile2.length) {
            let sectionEndTime = Math.max(srt1[i].end, srt2[j].end);

            while (i < srt1.length && srt1[i].end <= sectionEndTime) {
                sectionFile1.push(srt1[i++]);
            }
    
            while (j < srt2.length && srt2[j].end <= sectionEndTime) {
                sectionFile2.push(srt2[j++]);
            }
        }

        sections.push({ index: index++, file1: sectionFile1.length ? sectionFile1 : null, file2: sectionFile2.length ? sectionFile2 : null });
    }

    return sections;
}

function buildContent(captions) {
    let srt = '';
    const eol = "\r\n";
    for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];
        srt += (i + 1).toString() + eol;
        srt += SrtParser.toTimeString(caption.start) + " --> " + SrtParser.toTimeString(caption.end) + eol;
        srt += caption.content + eol;
        srt += eol;
    }
    return srt;
}

// Global functions for UI

window.processFiles = async function(file1, file2) {
    if (!file1 || !file2) return;

    const read = (f) => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(f);
    });

    const [content1, content2] = await Promise.all([read(file1), read(file2)]);

    const srt1 = SrtParser.parse(content1);
    const srt2 = SrtParser.parse(content2);

    fileSections = compareSubtitles(srt1, srt2);
    return fileSections;
}

window.updateClientSubtitle = function(fileSide, index, newContent) {
    if (!fileSections) return;
    const section = fileSections.find(s => s.index === index);
    if (!section) return;

    // The UI passes the raw text from the textarea. 
    // We need to parse it back into the object structure.
    const parsed = SrtParser.parse(newContent);
    
    if (fileSide === 'file1') section.file1 = parsed;
    else section.file2 = parsed;

    return parsed;
}

window.generateClientMergedFile = function(file1Indices, file2Indices) {
    if (!fileSections) return null;
    const selectedSubtitles = [];

    fileSections.forEach(section => {
        if (file1Indices.includes(section.index) && section.file1) {
            section.file1.forEach(line => selectedSubtitles.push(line));
        }
        if (file2Indices.includes(section.index) && section.file2) {
            section.file2.forEach(line => selectedSubtitles.push(line));
        }
    });

    // Sort by start time
    selectedSubtitles.sort((a, b) => a.start - b.start);

    // Re-index? 
    // The server `buildContent` uses loop index + 1. So yes, re-indexing happens automatically in buildContent.
    
    return buildContent(selectedSubtitles);
}

// UI Helper Functions and Event Handlers

async function compareFiles() {
    const file1 = document.querySelector('input[name="file1"]').files[0];
    const file2 = document.querySelector('input[name="file2"]').files[0];

    if (file1 && file2) {
        const sections = await window.processFiles(file1, file2);
        populateTable(sections);
    }
}

function checkFilesSelected() {
    const file1 = document.querySelector('input[name="file1"]').files[0];
    const file2 = document.querySelector('input[name="file2"]').files[0];

    if (file1 && file2) {
        compareFiles();
    }
}

function formatTimestamp(milliseconds) {
    if (typeof milliseconds !== 'number') return milliseconds;
    
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function sanitizeSubtitleHtml(text) {
    // Allow only SRT formatting tags: <i>, <b>, <u>, <font>
    const allowedTags = ['i', 'b', 'u', 'font'];
    const tagPattern = allowedTags.map(t => `${t}(?:\\s[^>]*)?`).join('|');
    const allowedRegex = new RegExp(`<\\/?(${tagPattern})>`, 'gi');

    // Extract allowed tags, escape everything else, then restore allowed tags
    const placeholders = [];
    const withPlaceholders = text.replace(allowedRegex, (match) => {
        placeholders.push(match);
        return `\x00${placeholders.length - 1}\x00`;
    });

    // Escape HTML in the remaining text
    const escaped = withPlaceholders
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Restore allowed tags and convert newlines to <br/>
    return escaped
        .replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i, 10)])
        .replace(/\n/g, '<br/>');
}

function generateSubtitleHTML(subtitles) {
    if (!subtitles || subtitles.length === 0) return '';

    return subtitles.map(sub => `
        <div class='subtitle'>
            <b>${sub.index}. ${formatTimestamp(sub.start)} --> ${formatTimestamp(sub.end)}</b><br/>
            ${sanitizeSubtitleHtml(sub.content)}
        </div>
    `).join('');
}

function extractSubtitlesFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const subtitles = doc.querySelectorAll('.subtitle');

    return Array.from(subtitles).map((subtitle) => {
        const [header, ...textLines] = subtitle.innerHTML.split('<br>');
        const headerText = header.replace(/<b>|<\/b>/g, '').trim();
        const dotIndex = headerText.indexOf('. ');
        if (dotIndex === -1) return null;

        const index = headerText.substring(0, dotIndex);
        const timestamps = headerText.substring(dotIndex + 2);
        const timeMatches = timestamps.match(/\d{2}:\d{2}:\d{2},\d{3}/g);
        if (!timeMatches || timeMatches.length < 2) return null;

        return {
            index: parseInt(index.trim(), 10),
            start: timeMatches[0],
            end: timeMatches[1],
            content: textLines.join('\n')
        };
    }).filter(Boolean);
}

function extractSubtitlesFromText(text) {
    const lines = text.split('\n\n');
    return lines.map((line, n) => {
        const [header, ...textLines] = line.split('\n');
        const [index, timestamps] = header.split('. ');
        const [start, end] = timestamps.split(' --> ');

        return {
            index: parseInt(index.trim(), 10),
            start: start,
            end: end,
            content: textLines.join('\n')
        };
    });
}

function generateSubtitleText(subtitles) {
    if (!subtitles || subtitles.length === 0) return '';

    const lines = subtitles.map(sub => `${sub.index}\n${formatTimestamp(sub.start)} --> ${formatTimestamp(sub.end)}\n${sub.content.trim()}`);

    return lines.join('\n\n');
}


function createBootstrapCheckbox(name, value, isChecked = false, isHidden = false) {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.classList.add('form-check');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = name;
    checkbox.value = value;
    checkbox.checked = isChecked;
    checkbox.classList.add('form-check-input');
    if (isHidden) checkbox.style.display = 'none';

    checkbox.addEventListener('click', handleCheckboxClick);

    checkboxWrapper.appendChild(checkbox);

    return checkboxWrapper;
}

function handleCheckboxClick(event) {
    const currentCheckbox = event.target;
    if (!event.shiftKey) {
        // Retrieve all checkboxes once to improve performance
        const siblingCheckboxes = document.querySelectorAll("input[type='checkbox']");
        // Loop through checkboxes and deselect matching conditions
        siblingCheckboxes.forEach(checkbox => {
            if (checkbox !== currentCheckbox && checkbox.value === currentCheckbox.value) {
                checkbox.checked = false;
            }
        });
    }
}

function autoResizeTextArea(textArea) {
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
}

function makeEditable(cell, index, fileSide) {
    cell.ondblclick = () => {
        // Extract the content of the <div> with class 'subtitle' for the editable content
        const subtitles = extractSubtitlesFromHtml(cell.innerHTML);
        if (!subtitles) {
            console.error('Subtitle not found in cell:', cell);
            return;
        }

        if (cell.querySelector('textarea')) {
            return;
        }

        cell.dataset.file = fileSide;
        cell.dataset.index = index;

        const text = generateSubtitleText(subtitles);
        const original = cell.innerHTML;

        const input = document.createElement('textarea');
        input.value = text;
        input.classList.add('form-control');
        cell.innerHTML = '';
        cell.appendChild(input);
        autoResizeTextArea(input);
        input.addEventListener('input', () => autoResizeTextArea(input));
        input.focus();

        input.onblur = () => {
            cell.innerHTML = original;
            updateSubtitlesLocally(fileSide, index, input.value);
        };
    };
}

function populateTable(results) {
    const tableBody = document.getElementById('comparisonTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    results.forEach((result, index) => {
        const row = tableBody.insertRow();
        row.dataset.index = index;

        // File 1 column
        const cell1 = row.insertCell();
        cell1.innerHTML = generateSubtitleHTML(result.file1);
        cell1.classList.add('file-column', 'file1');
        makeEditable(cell1, index, 'file1');

        // Checkbox for File 1
        const cellCheckbox1 = row.insertCell();
        const checkbox1 = createBootstrapCheckbox('file1', result.index, !!result.file1, !result.file1);
        cellCheckbox1.appendChild(checkbox1);

        // Checkbox for File 2
        const cellCheckbox2 = row.insertCell();
        const checkbox2 = createBootstrapCheckbox('file2', result.index, false, !result.file2);
        cellCheckbox2.appendChild(checkbox2);

        // File 2 column
        const cell2 = row.insertCell();
        cell2.innerHTML = generateSubtitleHTML(result.file2);
        cell2.classList.add('file-column');
        makeEditable(cell2, index, 'file2');

        if (isIdenticalRow(result.file1, result.file2)) {
            checkbox2.style.display = 'none';
            cell2.style.color = 'lightgrey';
        } else if (isIdenticalTextRow(result.file1, result.file2)) {
            cell2.style.color = 'grey';
        }
    });
}

function updateCellContent(file, index, subtitles) {
    if (!subtitles) return;

    const rows = document.querySelectorAll('tr');
    const row = Array.from(rows).find(row => row.dataset.index === String(index));
    console.assert(row, 'Row not found:', index);

    const cells = row.querySelectorAll('td');
    const cell = Array.from(cells).find(cell => cell.dataset.file === file);
    console.assert(cell, 'Cell not found:', file, index);

    cell.innerHTML = generateSubtitleHTML(subtitles);
}

function updateSubtitlesLocally(file, index, content) {
    const updatedSubtitles = window.updateClientSubtitle(file, index, content);
    console.log('Subtitle updated locally', updatedSubtitles);
    updateCellContent(file, index, updatedSubtitles);
}

async function saveMergedFile() {
    const selectedFile1Indices = [...document.querySelectorAll('input[name="file1"]:checked')].map(checkbox => parseInt(checkbox.value, 10));
    const selectedFile2Indices = [...document.querySelectorAll('input[name="file2"]:checked')].map(checkbox => parseInt(checkbox.value, 10));

    const mergedContent = window.generateClientMergedFile(selectedFile1Indices, selectedFile2Indices);
    
    // Try the File System Access API first (supported in Edge, Chrome, Opera)
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'merged.srt',
                types: [{
                    description: 'SubRip Subtitle File',
                    accept: { 'text/plain': ['.srt'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(mergedContent);
            await writable.close();
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Failed to save file:', err);
                alert('Failed to save file using the system dialog. Falling back to default download.');
            } else {
                return; // User cancelled
            }
        }
    }

    // Fallback for other browsers or if API fails
    const blob = new Blob([mergedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'merged.srt';
    document.body.appendChild(a);
    a.click();
    
    // Slight delay before cleanup to ensure the download starts properly
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

