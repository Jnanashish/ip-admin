/**
 * Converts an ASCII letter to its Unicode "Mathematical Sans-Serif Bold" equivalent.
 * Used for styling titles in Telegram / WhatsApp / Instagram captions.
 */
export const translate = (char) => {
    let diff;
    if (/[A-Z]/.test(char)) {
        diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
    } else {
        diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
    }
    return String.fromCodePoint(char.codePointAt(0) + diff);
};
