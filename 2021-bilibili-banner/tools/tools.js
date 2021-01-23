const toFixed = (num, digit) => {
    const t = Math.pow(10, digit);
    return Math.round(num * t) / t;
};