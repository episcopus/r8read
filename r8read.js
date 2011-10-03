var fs = require('fs');

// r8read module
//
// standalone usage: node r8read.js <path to robotron.nv>
//
// or from code:
//   var r8read = require('./r8read.js');
//   var r = r8read.Reader(<path to robotron.nv>);
//   r.printHighScores();
//   r.printStats();

var r8 = module.exports;
r8.Reader = (function() {
    // Initials are stored in byte sequences with upper nibble set to 0xF.
    // Consecutive bytes need to be sliced in half (to discard upper nibble) and 
    // then packed together in order to reconstitute original ASCII byte.
    // Blank characters are padded by the game with ':'.
    var extractAsciiFromNvram = function(inBuf, offset, len) {
        var buf = new Buffer(len);

        for (var j = 0; j < len; j++) {
            var hiOrder = inBuf[offset++] & 0xF;
            var loOrder = inBuf[offset++] & 0xF;
            var comp = loOrder | (hiOrder << 4);

            buf[j] = (comp == 0x3A ? 0x20 : comp);
        }

        var bufStr = buf.toString('ascii');
        return bufStr;
    };

    // Scores are stored in byte sequences with upper nibble set to 0xF.
    // Numbers are regualr non ASCII numerals in base 10.
    var extractIntFromNvram = function(inBuf, offset, len) {
        var ret = 0;

        for (var i = 0; i < len; i++) {
            var num = inBuf[offset++] & 0xF;
            ret *= 10;
            ret += num;
        }

        return ret;
    };

    // Offsets of all stats stored in nvram. Each has a 6 byte length, and is stored 
    // the same was as regular high scores.
    var statsTable = {
        'left slot coins'      : 0x102,
        'middle slot coins'    : 0x108,
        'right slot coins'     : 0x10E,
        'total coins'          : 0x114,
        'extra men earned'     : 0x11A,
        'play time in minutes' : 0x120,
        'men played'           : 0x126,
        'credits played'       : 0x12C
    };

    var Reader = function(nvPath) {
        if (!(this instanceof Reader)) {
            return new Reader(nvPath);
        }
        try {
            this.buffer = fs.readFileSync(nvPath);
        }
        catch (e) {
            var err = "Invalid file name: " + nvPath;
            console.error(err);
            throw new Error(err);
        }
    };

    Reader.prototype.printHighScores = function() {
        for (var i=0, startOff=0x132; i<37; i++) {
            var name = extractAsciiFromNvram(this.buffer, startOff, 3);
            startOff += 6;
            var longname;
            // The high score has the opportunity to store an up to 20 character (robotron settings configurable)
            // string/long name with his usual initials.  It is stored after the first score's initials.
            if (i == 0) {
                longname = extractAsciiFromNvram(this.buffer, startOff, 20);
                startOff += 40;
            }
            // Padding's purpose is unclear.
            var padding = this.buffer[startOff++] & 0xF;
            var score = extractIntFromNvram(this.buffer, startOff, 7);
            startOff += 7;
            if (i == 0) {
                console.log((i + 1) + ") " + name + " (" + longname  +  ") : " + score);
            }
            else {
                console.log((i + 1) + ") " + name + " : " + score);
            }
        }
    };

    Reader.prototype.printStats = function() {
        for (var name in statsTable) {
            if (statsTable.hasOwnProperty(name)) {
                var val = extractIntFromNvram(this.buffer, statsTable[name], 6);
                console.log(name + ": " + val);
            }
        }
    };

    return Reader;
}());

// Standalone execution code follows.
var nvramPath, r8reader;
if (!module.parent) {
    if (process.argv.length != 3) {
        console.log("r8read - robotron 2084 nvram reader\n");
        console.log("Usage: node r8read.js <path to robotron.nv>");
        process.exit();
    }

    nvramPath = process.argv[2];

    var r8reader = new r8.Reader(nvramPath);
    r8reader.printHighScores();
    r8reader.printStats();
}