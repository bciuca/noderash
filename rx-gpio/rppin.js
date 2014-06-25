    // GPIO to physical pin mapping (mappings are rev B of raspberry pi)
var g2p = {
    $2:  3,
    $3:  5,
    $4:  7,
    $14:  8,
    $15: 10,
    $17: 11,
    $18: 12,
    $27: 13,
    $22: 15,
    $23: 16,
    $24: 18,
    $10: 19,
    $9: 21,
    $25: 22,
    $11: 23,
    $8: 24,
    $7: 26
};

// Make it readonly.
Object.freeze(g2p);

module.exports = g2p;