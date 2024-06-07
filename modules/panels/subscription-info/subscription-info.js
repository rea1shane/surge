const args = parseArgs();

(async () => {
    const data = await getData(args.url);
    if (!data) $done();

    const content = [];

    // Total
    const total = data.total;
    content.push(`Total: ${formatBytes(total)}`);

    // Used
    const used = data.download + data.upload;
    content.push(`Used: ${formatBytes(used)} (${((used / total) * 100).toFixed(2)}%)`);

    // Expire
    if (data.expire) {
        const expireDate = new Date(data.expire * 1000);
        content.push(`Expire: ${formatDate(expireDate)} (${getRemainingDays(expireDate)})`);
    }

    // Update time
    content.push(`Updated on ${currentTime()}`);

    $done({
        title: args.title,
        content: content.join("\n"),
        icon: args.icon,
        "icon-color": args.color,
    });
})();

function getSubscriptionInfo(url) {
    const request = {
        headers: {
            "User-Agent": "Surge module"
        },
        url
    };

    return new Promise((resolve, reject) => {
        $httpClient[args.method](request, (err, resp) => {
            if (err) return reject(err);
            if (resp.status !== 200) return reject(`HTTP status ${resp.status}`);

            const headerKey = Object.keys(resp.headers).find(
                key => key.toLowerCase() === "subscription-userinfo"
            );
            if (headerKey) return resolve(resp.headers[headerKey]);

            reject("Subscription info not found in response header");
        });
    });
}

async function getData(url) {
    try {
        const data = await getSubscriptionInfo(url);
        return Object.fromEntries(
            data.match(/\w+=[\d.eE+-]+/g).map(item => {
                const [key, value] = item.split("=");
                return [key, Number(value)];
            })
        );
    } catch (err) {
        console.error(err);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);

    return `${year}-${month}-${day}`;
}

function getRemainingDays(date) {
    const current = new Date();
    const diffTime = date - current;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? "expired" : `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
}

// FROM CORE
function parseArgs() {
    return Object.fromEntries(
        $argument
            .split("&")
            .map((item) => item.split("=").map(decodeURIComponent))
    );
}

function currentTime() {
    const current = new Date();
    const hours = (`0${current.getHours()}`).slice(-2);
    const minutes = (`0${current.getMinutes()}`).slice(-2);
    const seconds = (`0${current.getSeconds()}`).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
}