var fs = require('fs');
var nvramPath, buffer;

if (process.argv.length != 3) {
    console.log("Robotron nvram high score extractor\n");
    console.log("Usage: node robotron.js <path to robotron.nv>");
    process.exit();
}

// Initials are stored in byte sequences with upper nibble set to 0xF.
// Consecutive bytes need to be sliced in half (to discard upper nibble) and 
// then packed together in order to reconstitute original ASCII byte.
// Blank characters are padded by the game with ':'.
var extractAsciiFromNvram = function(inBuf, offset, len) {
    var buf = new Buffer(len);

    for (var j = 0; j < len; j++) {
        var hiOrder = buffer[offset++] & 0xF;
        var loOrder = buffer[offset++] & 0xF;
        var comp = loOrder | (hiOrder << 4);
        // console.log("index: " + offset - 2 + " hi: " + hiOrder + " lo: " + loOrder + " comp: " + comp);

        buf[j] = (comp == 0x3A ? 0x20 : comp);
    }

    var bufStr = buf.toString('ascii');
    return bufStr;
};

// Scores are stored in byte sequences with upper nibble set to 0xF.
// Numbers are regualr non ASCII numerals in base 10.
var extractIntFromNvram = function(buffer, offset, len) {
    var ret = 0;

    for (var i = 0; i < len; i++) {
        var num = buffer[offset++] & 0xF;
        ret *= 10;
        ret += num;
        // console.log("i: " + i + " num: " + num + " ret: " + ret);
    }

    return ret;
};

nvramPath = process.argv[2];
try {
    buffer = fs.readFileSync(nvramPath);
}
catch (e) {
    console.error("Invalid file name: " + nvramPath);
    process.exit(1);
}

for (var i=0, startOff=0x132; i<37; i++) {
    var name = extractAsciiFromNvram(buffer, startOff, 3);
    startOff += 6;
    var longname;
    // The high score has the opportunity to store an up to 20 character (robotron settings configurable)
    // string/long name with his usual initials.  It is stored after the first score's initials.
    if (i == 0) {
        longname = extractAsciiFromNvram(buffer, startOff, 20);
        startOff += 40;
    }
    // Padding's meaning is unknown.
    var padding = buffer[startOff++] & 0xF;
    var score = extractIntFromNvram(buffer, startOff, 7);
    startOff += 7;
    if (i == 0) {
        console.log((i + 1) + ") " + name + " (" + longname  +  ") : " + score + ". P=" + padding);
    }
    else {
        console.log((i + 1) + ") " + name + " : " + score + ". P=" + padding);
    }
}
