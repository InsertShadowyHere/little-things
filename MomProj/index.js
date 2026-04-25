const ctx = cv.getContext("2d");
const bctx = bcv.getContext("2d");
const scale = 4
cv.height = 800 * scale
cv.width = 2400 * scale
bcv.height = cv.height
bcv.width = cv.width
cv.style.height = "800px";
cv.style.width = "2400px";
bcv.style.height = cv.style.height;
bcv.style.width = cv.style.width;


ctx.font = 'bold 12px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'left';

let maxVoiceWidth = 0;
let qWidth = 20
const margin = 5;

const letters = { "C": 4, "D": 6, "E": 8, "F": 9, "G": 11, "A": 13, "B": 15 }

const accidentals = {"n": 0, "": 0, "#": 1, "##": 2, "b": -1, "bb": -2, "ff": -2, "f": -1, "ss": 2, "s": 1 }

const lengths = { "q": 1, "e": 1/2, "s": 1/4, "t": 1/8, "h": 2, "w": 4}
const noteTypes = { "Whole": "w", "Half": "h", "Quarter": "q", "Eighth": "e", "Sixteenth": "s", "Thirty-Second": "t" }
const noteTypeList = ["Whole", "Half", "Quarter", "Eighth", "Sixteenth", "Thirty-Second"]
noteTypeList.forEach(noteType => {
    barlType.add(new Option(noteType, noteTypes[noteType]));
});
barlType.value = "q"
noteTypeList.forEach(noteType => {
    circleNote.add(new Option(noteType, noteTypes[noteType]));
});
circleNote.value = "q"


class Note {
    constructor(pitch, length) {
        this.pitch = pitch;
        this.length = length;
        this.extraPitch = null;
        this.extraLength = null;

    }

    draw(x) {
        if (!this.pitch) {
            return;
        }
        drawEllipse(x, this.pitch, qWidth * this.length)
        if (this.extraPitch) {
            drawEllipse(x, this.extraPitch, qWidth * this.extraLength)
        }
    }
}

class Voice {
    constructor() {
        this.notes = [];
        this.color = "";
    }

    draw() {
        ctx.fillStyle = this.color;
        let x = 0;
        for (let i = 0; i<this.notes.length; i++) {
            this.notes[i].draw(x)
            x += qWidth * this.notes[i].length * scale
        }
        maxVoiceWidth = Math.max(x, maxVoiceWidth)
    }
}

const voices = [];

let curr_ts = 4;


// download and use content from the file upload button
async function load() {
    // import file
    let x = await imp.files[0].text();
    
    x = x.split("\n")
    parseLoad(x)
}

// parse the text data from a loaded voice
function parseLoad(text) {
    const v = new Voice();
    let pmin = 0;
    let pmax = 100;
    let currKS = {};

    // parse data within file
    for (let i = 0; i<text.length; i++) {
        // line sets key signature
        if (text[i].includes("KS-")) {
            currKS = calculateKeySig(text[i].slice(3, 5))
        }
        // line sets time signature
        else if (text[i].includes("TS-")) {
        }
        // if line is a header line
        else if (text[i].includes("Pitch") || text[i].includes("pitch")) {
            // skip this
        }
        else if (/^[,\s]*$/.test(text[i])) {
            // Line is empty or only commas/whitespace
        }
        else {
            // template x[i] = A3, #, Q
            const line = text[i].split(",")
            let noteLength = lengths[line[2][0]]
            if (line[2].length >= 1) {
                let specialLength = line[2].slice(1)
                if (specialLength.includes(".")) { noteLength *= 1.5; }
                if (specialLength.includes("t")) { noteLength *= 2/3; }
            }
            let pitch = ""
            if (line[0] !== "") {
                pitch = calculatePitch(line[0], line[1], currKS)
            }
            const n = new Note(pitch, noteLength);

            // extra notes
            if (line.length >= 7) {
                let extraLength = lengths[line[6][0]]
                if (line[6].length >= 1) {
                    let specialLength = line[6].slice(1)
                    if (specialLength.includes(".")) { extraLength *= 1.5; }
                    if (specialLength.includes("t")) { extraLength *= 2/3; }
                }
                let extraPitch = ""
                if (line[4] !== "") {
                    extraPitch = calculatePitch(line[4], line[5], currKS)
                }
                n.extraLength = extraLength;
                n.extraPitch = extraPitch;

            }
            v.notes.push(n)
        }
    }
    voices.push(v)
    makeVoiceListItem(v)
}

function makeVoiceListItem(v) {
    const voicesList = document.querySelector('.voices-list');
    const e = document.createElement("div");
    const num = voicesList.querySelectorAll('.voice').length;
    e.className = "voice";
    e.voice = v
    e.innerHTML = `
        <input style='width: 80px' value='Voice ${num+1}'>
        <input onchange="redrawVoices()" type="color" id="colorPicker" name="colorPicker" value="#ff0000">
        <button class="delete-voice">&#128465;</button>
        <input checked type="checkbox" onchange="redrawVoices()">
    `;
    voicesList.appendChild(e);
    redrawVoices()
    e.querySelector('.delete-voice').onclick = function() {
        e.remove();
        redrawVoices();
    };
}

function redrawVoices() {
    maxVoiceWidth = 0;
    ctx.clearRect(0, 0, cv.width, cv.height)
    const voicesList = document.querySelector('.voices-list');
    const voiceDivs = voicesList.querySelectorAll('.voice');
    const toggledVoices = [];
    voiceDivs.forEach(div => {
        const checkbox = div.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            const color = div.querySelector('input[type="color"]');
            div.voice.color = color.value
            div.voice.draw()
        }
    });
}

function calculateKeySig(ksString) {
    const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
    const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
    let currKS = {};

    if (ksString.endsWith('b')) {
        const count = parseInt(ksString);
        for (let i = 0; i < count; i++) {
            currKS[flatOrder[i]] = -1;
        }
    } else if (ksString.endsWith('#')) {
        const count = parseInt(ksString);
        for (let i = 0; i < count; i++) {
            currKS[sharpOrder[i]] = 1;
        }
    }
    return currKS
}

function toggle() {
    bctx.clearRect(0, 0, bcv.width, bcv.height)
    if (togC.checked) {
        bctx.lineWidth = 5;
        bctx.beginPath();
        bctx.moveTo(0, cv.height/2);
        bctx.lineTo(cv.width, cv.height/2);
        bctx.stroke();
    }
    if (togBarl.checked) {
        const barlineWidth = parseInt(barlNum.value) * qWidth * lengths[barlType.value]
        bctx.lineWidth = 4;
        bctx.font = String(18 * scale) + "px Arial";
        bctx.fillStyle = "black";
        let barNumber = parseInt(barNum.value);
        bctx.textAlign = "left";
        for (let i = 0; i<=cv.width; i+=barlineWidth*scale) {
            bctx.beginPath();
            bctx.moveTo(i, 20*scale);
            bctx.lineTo(i, cv.height);
            bctx.stroke();
            bctx.fillText(barNumber, i, 18*scale);
            barNumber += 1;
        }
    }
    if (togNotes.checked) {
        bctx.lineWidth = 3;
        for (let i = 20*scale; i<=cv.height; i+=20*scale) {
            bctx.beginPath();
            bctx.moveTo(0, i);
            bctx.lineTo(cv.width, i);
            bctx.stroke();
        }
    }
    if (togOut.checked) {
        bctx.lineWidth = 5;
        bctx.strokeRect(0, 0, cv.width, cv.height)
    }
}

function drawAll() {
    voices.forEach(voice => {
        voice.draw();
    })
}

// export the composite image into a file
function exportImg() {
    let maxX = 0;
    voices.forEach(voice => {
        let x = 0;
        voice.notes.forEach(note => {
            x += note.length;
        });
        if (x > maxX) maxX = x;
    });

    // draw double canvas (padded!)
    const offscreenCV = document.createElement('canvas')
    offscreenCV.width = cv.width + 10
    offscreenCV.height = cv.height + 10
    const octx = offscreenCV.getContext('2d')

    octx.drawImage(cv, 5, 5);
    octx.drawImage(bcv, 5, 5);

    const link = document.createElement('a');
    link.href = offscreenCV.toDataURL();
    link.download = 'music-art.png';
    link.click();
}

/* calculatePitch
examples:
calculatePitch("A3", "#")
calculatePitch("A4", "#")
calculatePitch("B3", "##")
Used to get the number on the table of each pitch

*/
function calculatePitch(note, accidental, currKS) {
    // given A2, # or B3, b, find the number on the table that calculates to it
    let letter_num = letters[note[0]]
    let acc_num = accidentals[accidental]
    if (accidental === "") {
        acc_num = currKS[note[0]] || 0;
    }
    let octave = parseInt(note.slice(1))

    // calculate key signature notes
    
    return (octave-1)*12 + letter_num + acc_num
}

function calculateLength(l) {
    if (l.length >= 1) {
        let finalLength = qWidth * lengths[l[0]]
        if (l[1] === ".") {
            finalLength *= 1.5;
        }
        else if (l[1] === "t") {
            finalLength *= 2;
            finalLength /= 3;
        }
    
        return finalLength
    }
    else {
        let finalLength = qWidth * lengths[l]
        return finalLength
    }
    
}

function drawEllipse(x, pitch, length) {
    // ctx.ellipse(x, y, rx, ry, rotation, 0, 2 * Math.PI);
    ctx.beginPath()
    ctx.ellipse(x + (length/2)*scale, cv.height - (pitch*10)*scale, (length/2)*scale, 10*scale, 0, 0, 2 * Math.PI);
    ctx.fill()
}

function setCircle() {
    qWidth = 20 / lengths[circleNote.value]
    redrawVoices();
    toggle();
}

function setBarCt() {
    const barlineWidth = parseInt(barlNum.value) * qWidth * lengths[barlType.value]
    const newWidth = barlineWidth * barCt.value * scale;
    cv.width = newWidth;
    bcv.width = newWidth;
    cv.style.width = ""; // or set to e.g. "2400px" for a fixed view
    bcv.style.width = "";
    toggle()
    redrawVoices()
}

toggle();
redrawVoices();