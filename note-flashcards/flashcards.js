const staffCv = document.getElementById("staffCv");
const sctx = staffCv.getContext('2d');

const noteCv = document.getElementById("notesCv");
const nctx = noteCv.getContext('2d');

const stats = document.getElementById('stats')
const staff = document.getElementsByName("staff")

let note = new Image();
note.src = "assets/whole-note.png"
let grandStaff = new Image();
grandStaff.src = "assets/grand-staff.png"

let notes = "FGABCDEFGABDEFGABCDEFG"
let current = ""
let completed = 0;
let correct = 0;

sctx.drawImage(grandStaff, 0, 0, 332, 359)

function check(letter) {
    completed += 1;
    if (letter === notes[current]) {
        correct += 1;
    }
    updateStats();
}

function updateStats() {
    stats.textContent = `You've tested ${completed} notes, with ${correct} correct. (${(correct*100/completed).toFixed(1)}%)`
}

function newNote() {
    nctx.clearRect(0, 0, 332, 359)
    current = Math.floor(22 * Math.random());
    let height = 0;
    if (0 <= current && current <= 10) {
        height = 329 - (current) * 10.5
    }
    else {
        height = 129 - (current-11) * 10.5
    }
    nctx.drawImage(note, 191, height, 30, 30)
}
newNote();