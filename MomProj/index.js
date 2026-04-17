const ctx = cv.getContext("2d");
const bctx = bcv.getContext("2d");
cv.height = 800
cv.width = 3400
bcv.height = cv.height
bcv.width = cv.width

let qWidth = 25

const letters = { "C": 4, "D": 6, "E": 8, "F": 9, "G": 11, "A": 13, "B": 15 }

const accidentals = {"n": 0, "": 0, "#": 1, "##": 2, "b": -1, "bb": -2, "ff": -2, "f": -1, "ss": 2, "s": 1 }

const lengths = { "q": 1, "e": 1/2, "s": 1/4, "t": 1/8, "h": 2, "w": 4}

class Note {
    constructor(pitch, length) {
        this.pitch = pitch;
        this.length = length;
    }

    draw(x) {
        if (!this.pitch) {
            return;
        }
        drawEllipse(x, this.pitch, this.length)
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
            x += this.notes[i].length
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
        if (text[i].includes("KS-")) {
            calculateKeySig(text[i].slice(3))
        }
        else if (text[i].includes("TS-")) {
        }
        else {
            // template x[i] = A3, #, Q
            const line = text[i].split(",")
            const noteLength = calculateLength(line[2], curr_ts)
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
        <input type="checkbox" onchange="redrawVoices()">
    `;
    voicesList.appendChild(e);
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
        bctx.lineWidth = 2;
        for (let i = 0; i<=cv.width; i+=100) {
            bctx.beginPath();
            bctx.moveTo(i, 0);
            bctx.lineTo(i, cv.height);
            bctx.stroke();
        }
    }
    if (togNotes.checked) {
        bctx.lineWidth = 1;
        for (let i = 0; i<=cv.height; i+=20) {
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
    if (acc_num === 0) {
        acc_num = curr_ks[note[0]] || 0;
    }
    let pitch = parseInt(note[1])

    // calculate key signature notes
    
    return (pitch-1)*12 + letter_num + acc_num
}

function calculateLength(l, ts) {
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

toggle();