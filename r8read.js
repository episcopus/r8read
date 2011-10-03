var fs = require('fs');

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
            // Padding's meaning is unknown.
            var padding = this.buffer[startOff++] & 0xF;
            var score = extractIntFromNvram(this.buffer, startOff, 7);
            startOff += 7;
            if (i == 0) {
                console.log((i + 1) + ") " + name + " (" + longname  +  ") : " + score + ". P=" + padding);
            }
            else {
                console.log((i + 1) + ") " + name + " : " + score + ". P=" + padding);
            }
        }
    }

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
}