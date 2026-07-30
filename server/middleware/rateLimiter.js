const cache = new Map();

setInterval(() => {
    const currentTime = Date.now();

    for (const [ip, timestamps] of cache) {
        while ( timestamps.length && currentTime - timestamps[0] >= 60 * 1000) {
            timestamps.shift();
        }

        if (timestamps.length === 0) {
            cache.delete(ip);
        }
    }
}, 60 * 1000);

function rateLimiter (windowTime, maxRequests) {
    return (req, res, next) => {
        const ip = req.ip || '127.0.0.1'
        const currentTime = Date.now();

        if (!cache.has(ip)) {
            cache.set(ip, [])
        }

        const timestamps = cache.get(ip);

        while (timestamps.length && currentTime - timestamps[0] >= windowTime){
            timestamps.shift();
        }
        if (timestamps.length >= maxRequests) {
            return res.status(429).json({message: "Too many requests!"})
        }

        timestamps.push(currentTime)
        next();
    }
}

module.exports = {
    rateLimiter
}