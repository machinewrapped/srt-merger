const express = require('express');
const multer = require('multer');
const subsrt = require('subsrt');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let fileSections

function isIdentical(line1, line2) {
    return (line1.start == line2.start) && (line1.end == line2.end) && (line1.content == line2.content);
}

function compareSubtitles(srt1, srt2) {
    let i = 0; // iterator for srt1
    let j = 0; // iterator for srt2
    const sections = [];
    let index = 0;
    let sectionEndTime;

    // Normalize line endings
    srt1.forEach(line => line.content = line.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
    srt2.forEach(line => line.content = line.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));

    while (i < srt1.length || j < srt2.length) {
        const sectionFile1 = [];
        const sectionFile2 = [];

        if (i >= srt1.length) {
            // Add all remaining lines from srt2 to the section
            while (j < srt2.length) {
                sectionFile2.push(srt2[j++]);
            }
            sections.push({ index: index++, file1: null, file2: sectionFile2 });
            break;
        }

        if (j >= srt2.length) {
            // Add all remaining lines from srt1 to the section
            while (i < srt1.length) {
                sectionFile1.push(srt1[i++]);
            }
            sections.push({ index: index++, file1: sectionFile1, file2: null });
            break;
        }

        // Add lines that are only in srt1
        const next_srt2_start = srt2[j].start;
        while (i < srt1.length && srt1[i].end <= next_srt2_start) {
            sectionFile1.push(srt1[i++]);
        }

        if (!sectionFile1.length) {
            const next_srt1_start = srt1[i].start;
            // Add lines that are only in srt2
            while (j < srt2.length && srt2[j].end <= next_srt1_start) {
                sectionFile2.push(srt2[j++]);
            }    
        }

        if (!sectionFile1.length && !sectionFile2.length) {
            // Add lines that are identical in srt1 and srt2
            while (i < srt1.length && j < srt2.length && isIdentical(srt1[i], srt2[j])) {
                sectionFile1.push(srt1[i++]);
                sectionFile2.push(srt2[j++]);
            }
        }

        if (!sectionFile1.length && !sectionFile2.length) {
            // Check for one or more overlapping lines in srt1 and srt2
            sectionEndTime = Math.max(srt1[i].end, srt2[j].end);

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

function toTimeString(ms) {
    var hh = Math.floor(ms / 1000 / 3600);
    var mm = Math.floor(ms / 1000 / 60 % 60);
    var ss = Math.floor(ms / 1000 % 60);
    var ff = Math.floor(ms % 1000);
    var time = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss + "," + (ff < 100 ? "0" : "") + (ff < 10 ? "0" : "") + ff;
    return time;
  }

function buildContent(captions) {
    // Convert the merged subtitles to SRT format
    // Using our own implementation as subsrt uses text instead of content, so it loses tags
    let srt = '';
    var eol = "\r\n";
    for (var i = 0; i < captions.length; i++) {
      var caption = captions[i];
      if (typeof caption.type === "undefined" || caption.type == "caption") {
        srt += (i + 1).toString() + eol;
        srt += toTimeString(caption.start) + " --> " + toTimeString(caption.end) + eol;
        srt += caption.content + eol;
        srt += eol;
      }
      else {
        console.log("SKIP:", caption);
      }
    }

    return srt;
}

app.post('/upload', upload.fields([{ name: 'file1' }, { name: 'file2' }]), (req, res) => {
    // Log the filenames to the console
    console.log("Left: " + req.files.file1[0].originalname);
    console.log("Right; " + req.files.file2[0].originalname);

    // Parse the uploaded SRT files
    srt1 = subsrt.parse(req.files.file1[0].buffer.toString());
    srt2 = subsrt.parse(req.files.file2[0].buffer.toString());

    // Compare the timestamps
    fileSections = compareSubtitles(srt1, srt2);

    res.json({ sections: fileSections });
});

app.post('/merge', (req, res) => {
    const file1Indices = req.body.file1Indices;
    const file2Indices = req.body.file2Indices;

    const selectedSubtitles = [];

    fileSections.forEach(section => {
        if (file1Indices.includes(section.index)) {
            for (const line of section.file1) {
                selectedSubtitles.push(line);
            }
        }

        if (file2Indices.includes(section.index)) {
            for (const line of section.file2) {
                selectedSubtitles.push(line);
            }
        }
    });

    // Ensure there are no undefined entries
    if (selectedSubtitles.includes(undefined)) {
        return res.status(500).send('Error: Undefined subtitle entry detected.');
    }

    // Sort the merged subtitles by start time
    selectedSubtitles.sort((a, b) => a.start - b.start);

    // Convert to SRT format
    const mergedSrtContent = buildContent(selectedSubtitles);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.srt');
    res.send(mergedSrtContent);
});

app.post('/update-subtitle', (req, res) => {
    const { file, index, content } = req.body;

    if (!fileSections) {
        return res.status(500).send('Error: File is not loaded.');
    }

    // console.log("Updating subtitles", text)

    try {
        // Normalise newlines to CRLF
        const text  = content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        subtitles = subsrt.parse(text);
    } catch (error) {
        return res.status(500).send('Error: Invalid subtitle format.');
    }

    if (!subtitles) {
        return res.status(500).send('Error: Invalid subtitle format.');
    }

    console.log("Updated subtitles", subtitles)

    // Find the corresponding section
    const section = fileSections.find(section => section.index === index);
    if (section && section[file]) {
        section[file] = subtitles;
        res.json({ message: 'Subtitle updated successfully', file: file, index: index, subtitles: subtitles});
    } else {
        res.status(404).json({ message: 'Subtitle not found', file: file, index: index });
    }

});


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
