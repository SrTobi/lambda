

const defaultRandomStrings = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomString(length: number = 8, chars: string = defaultRandomStrings): string {
    var result = "";
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export function normFloat(num: number): number {
    return parseFloat((Math.round(num * 100) / 100).toFixed(2));
}