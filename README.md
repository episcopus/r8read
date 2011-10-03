Robotron High Scores
====================

Scores and stats and other runtime data is stored in Robotron's 1K ram file, which is dumped by MAME on exit to the <MAMEPATH>/nvram/robotron.nv file.

Scores
------

All bytes are with upper nibble 0xF.

* 0x132 = AAA (half of ascii code in lower 4 bits of each byte) (6 bytes) - name of top score
* 0x138 = AAA (6 bytes) - long name of top score (20 chars x 2 bytes = 40 bytes)
* 0x161 = 0093800 (7 bytes) - numeric portion of top score
* 0x168 = 0064950 (2nd score)
* 0x176 = 0063075 (3rd score)
* etc...

each score (after first one) takes 14 bytes, by offset:
* 0-5: name (initials = 3 ascii chars)
* 6:   padding (unclear purpose for this digit?)
* 7-D: score

Stats
-----

3 0 0 3 8 4 17 3
4 0 0 4 12 6 24 4

6 bytes each - raw base 10 digits.

* 0x102 3 -> 4          left slot coins
* 0x108 0 -> 0          middle slot coins
* 0x10E 0 -> 0          right slot coins
* 0x114 3 -> 4          total coins
* 0x11A 8 -> 12         extra men earned
* 0x120 4 -> 6          play time in minutes
* 0x126 17 -> 24        men played
* 0x12C 3 -> 4          credits played

Game also shows following (calculated) stats in service menu:

* time (minutes) per credit
* turns (men) per credit