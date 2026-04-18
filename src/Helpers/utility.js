const BITLY_TOKEN = process.env.REACT_APP_TOKEN;

// [BIT.LY]
// shorten a long job link with bitly
export const shortenurl = async (link) => {
    try {
        const res = await fetch("https://api-ssl.bitly.com/v4/shorten", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${BITLY_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ long_url: link, domain: "bit.ly" }),
        });
        const json = await res.json();
        const data = json.link;
        if (data) return data;
        return link;
    } catch {
        return link;
    }
};

// [BIT.LY]
export const getLinkClickCount = async (link) => {
    try {
        const linkWithoutHttps = link.replace(/^https:\/\//, "");
        const res = await fetch(`https://api-ssl.bitly.com/v4/bitlinks/${linkWithoutHttps}/clicks?unit=month`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${BITLY_TOKEN}`,
            },
        });
        const json = await res.json();
        return json;
    } catch {
        return null;
    }
};

// copy any text to clipboard
export const copyToClipBoard = (text) => {
    navigator.clipboard.writeText(text);
};

// generate date from ISO date string
export const generateDateFromISOString = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().substring(0, 10);
};
