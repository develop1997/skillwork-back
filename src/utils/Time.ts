export function getDeltaTime(time: Date) {
    return new Date().getTime() - time.getTime();
}

export function getDateTime() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = now.toLocaleString('en-US', options);
    return formattedDate;
}