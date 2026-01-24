const staffCv = document.getElementById("staffCv");
const sctx = staffCv.getContext('2d');

const noteCv = document.getElementById("notesCv");
const nctx = noteCv.getContext('2d');

const stats = document.getElementById('stats')
const staff = document.getElementsByName("staff")

let note = new Image();
note.src = "./assets/whole-note.png"
let grandStaff = new Image();
grandStaff.src = "./assets/grand-staff.png"

let notes = "FGABCDEFGABDEFGABCDEFG"
let current = ""
let completed = 0;
let correct = 0;
let staves = 0;
let wrongs = [];
let wrongTime = 10;

function check(letter) {
    completed += 1;
    const bodyElem = document.body;
    if (letter === notes[current]) {
        correct += 1;
        bodyElem.classList.remove('flash-incorrect');
        bodyElem.classList.add('flash-correct');
    } else {
        let alreadyWrong = 0;
        wrongs.forEach((item) => {
            if (item[0] === current) {
                item[1] = wrongTime
                alreadyWrong = 1;
            }
        })
        if (alreadyWrong === 0) {
            wrongs.push([current, wrongTime])
        }
        bodyElem.classList.remove('flash-correct');
        bodyElem.classList.add('flash-incorrect');
    }
    setTimeout(() => {
        bodyElem.classList.remove('flash-correct', 'flash-incorrect');
    }, 300);
    updateStats();
}

function changeStaves() {
    const old = staves;
    wrongs = [];
    staves = parseInt(document.querySelector('input[name="staff"]:checked').value);
    sctx.clearRect(0, 0, 332, 359)
    sctx.drawImage(grandStaff, 0, 0, 332, 359)
    
    if (staves === 1) { // only treble
        sctx.fillStyle = "#ffffff"
        sctx.fillRect(0, 48, 34, 311)
        sctx.fillRect(0, 200, 332, 159)
        sctx.fillRect(30, 135, 10, 100)

    }
    else if (staves === 2) { // bass
        sctx.fillStyle = "#ffffff"
        sctx.fillRect(0, 48, 34, 311)
        sctx.fillRect(0, 0, 332, 200)
        sctx.fillRect(30, 185, 10, 63)
    }
    if (old !== staves) {
        newNote();
    }
    
}


function updateStats() {
    stats.textContent = `You've tested ${completed} notes, with ${correct} correct. (${(correct*100/completed).toFixed(1)}%)`
}

function newNote() {
    nctx.clearRect(0, 0, 332, 359)
    if (staves === 0) {
        current = Math.floor(22 * Math.random());
    }
    else if (staves === 1) {
        current = Math.floor(11 + 11 * Math.random());
    }
    else if (staves === 2) {
        current = Math.floor(11 * Math.random());
    }
    for (let i = 0; i<wrongs.length; i++) {
        if (0.2 > Math.random()) {
            current = wrongs[i][0]
        }
        
        wrongs[i][1] -= 1
        if (wrongs[i][1] <= 0) {
            wrongs.splice(i, 1)
        }
    }    
    let height = 0;
    if (0 <= current && current <= 10) {
        height = 329 - (current) * 10.5
    }
    else {
        height = 129 - (current-11) * 10.5
    }
    nctx.drawImage(note, 191, height, 30, 30)
}
changeStaves();

newNote();