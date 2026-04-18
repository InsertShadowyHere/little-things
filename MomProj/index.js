const ctx = cv.getContext("2d");
const bctx = bcv.getContext("2d");
cv.height = 800
cv.width = 2400
bcv.height = cv.height
bcv.width = cv.width

ctx.font = 'bold 12px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'left';

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
    }

    draw(x) {
        if (!this.pitch) {
            return;
        }
        console.log(this.length)
        console.log(qWidth)
        drawEllipse(x, this.pitch, qWidth * this.length)
    }
}

class Voice {
    constructor() {
        this.notes = [];
        this.color = "";
        this.min = 0;
        this.max = 100;
    }

    draw() {
        ctx.fillStyle = this.color;
        let x = 0;
        for (let i = 0; i<this.notes.length; i++) {
            this.notes[i].draw(x)
            x += qWidth * this.notes[i].length
        }
    }
}

const voices = []

let curr_ks = {}
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

    // parse data within file
    for (let i = 0; i<text.length; i++) {
        // line sets key signature
        if (text[i].includes("KS-")) {
            calculateKeySig(text[i].slice(3, 5))
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
            console.log(line[2])
            console.log(line[2][0])
            const noteLength = lengths[line[2][0]]
            console.log("note length:", noteLength)
            if (line[2].length >= 1) {
                let specialLength = line[2].slice(1)
                if (specialLength.includes(".")) { noteLength *= 1.5; }
                if (specialLength.includes("t")) { noteLength *= 2/3; }
            }
            let pitch = ""
            if (line[0] !== "") {
                pitch = calculatePitch(line[0], line[1])
                if (pitch < pmin) {
                    pmin = pitch;
                }
                if (pitch > pmax) {
                    pmax = pitch;
                }
            }
            v.notes.push(new Note(pitch, noteLength))
        }
    }
    v.min = pmin;
    v.max = pmax;
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
        <div>Voice ${num+1}</div>
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
    return toggledVoices;
}

function calculateKeySig(ksString) {
    console.log("calculating key signature with ksstring of ", ksString)
    const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
    const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
    curr_ks = {};

    if (ksString.endsWith('b')) {
        const count = parseInt(ksString);
        for (let i = 0; i < count; i++) {
            curr_ks[flatOrder[i]] = -1;
        }
    } else if (ksString.endsWith('#')) {
        const count = parseInt(ksString);
        for (let i = 0; i < count; i++) {
            curr_ks[sharpOrder[i]] = 1;
        }
    }
}

function toggle() {
    bctx.clearRect(0, 0, bcv.width, bcv.height)
    if (togC.checked) {
        bctx.lineWidth = 3;
        bctx.beginPath();
        bctx.moveTo(0, cv.height/2);
        bctx.lineTo(cv.width, cv.height/2);
        bctx.stroke();
    }
    if (togBarl.checked) {
        const barlineWidth = parseInt(barlNum.value) * qWidth * lengths[barlType.value]
        bctx.lineWidth = 2;
        bctx.font = "18px Arial";
        bctx.fillStyle = "black";
        let barNumber = parseInt(barNum.value);
        bctx.textAlign = "left";
        for (let i = 0; i<=cv.width; i+=barlineWidth) {
            bctx.beginPath();
            bctx.moveTo(i, 20);
            bctx.lineTo(i, cv.height);
            bctx.stroke();
            bctx.fillText(barNumber, i, 18);
            barNumber += 1;
            
            // draw text
            
            
        }
    }
    if (togNotes.checked) {
        bctx.lineWidth = 1;
        for (let i = 20; i<=cv.height; i+=20) {
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

    // draw double canvas
    const offscreenCV = document.createElement('canvas')
    offscreenCV.width = cv.width
    offscreenCV.height = cv.height
    const octx = offscreenCV.getContext('2d')

    octx.drawImage(cv, 0, 0, maxX, cv.height, 0, 0, maxX, cv.height);
    octx.drawImage(bcv, 0, 0, maxX, bcv.height, 0, 0, maxX, bcv.height);

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
function calculatePitch(note, accidental) {
    // given A2, # or B3, b, find the number on the table that calculates to it
    let letter_num = letters[note[0]]
    let acc_num = accidentals[accidental]
    if (accidental === "") {
        acc_num = curr_ks[note[0]] || 0;
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
    ctx.ellipse(x + length/2, cv.height - pitch*10, length/2, 10, 0, 0, 2 * Math.PI);
    ctx.fill()
}

function setCircle() {
    qWidth = 20 / lengths[circleNote.value]
    redrawVoices();
    toggle();
}

function setBarCt() {
    const barlineWidth = parseInt(barlNum.value) * qWidth * lengths[barlType.value]
    wrapper.width = barlineWidth * barCt.value
    cv.width = barlineWidth * barCt.value
    bcv.width = cv.width
    toggle()
    redrawVoices()
}

toggle();
redrawVoices();