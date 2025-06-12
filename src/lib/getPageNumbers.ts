export function getPageNumbers(current: number, total: number) {
    const delta = 1; // сколько страниц показать до и после текущей (по желанию)
    const range = [];
    const rangeWithDots = [];
    let l = -1;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l !== -1) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push("...");
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}
