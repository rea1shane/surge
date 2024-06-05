// Arg
function parseArgs() {
    return Object.fromEntries(
        $argument
            .split("&")
            .map((item) => item.split("=").map(decodeURIComponent))
    );
}

// Current Time
function currentTime() {
    const current = new Date();
    const hours = (`0${current.getHours()}`).slice(-2);
    const minutes = (`0${current.getMinutes()}`).slice(-2);
    const seconds = (`0${current.getSeconds()}`).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
}