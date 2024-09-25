// common.js

// Function to parse date string in 'DD/MM/YYYY' format to a Date object
function parseDateString(dateStr) {
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// Function to format dates for display (e.g., '12 בספטמבר 2024')
function formatDateForDisplay(date) {
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ב${monthName} ${year}`;
}

// Function to get the Hebrew name of the day
function getDayName(date) {
    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return daysOfWeek[date.getDay()];
}

// Function to update the footer
function updateFooter(dataDateStr, location) {
    const footer = document.querySelector('footer');

    // Parse dataDateStr to Date object
    const dataDate = parseDateString(dataDateStr);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let footerDateText = '';
    if (dataDate.getTime() === today.getTime()) {
        footerDateText = 'היום';
    } else if (dataDate.getTime() === yesterday.getTime()) {
        footerDateText = 'אתמול';
    } else {
		footerDateText = '-' + formatDateForDisplay(dataDate);
    }

		footer.innerHTML = `המחיר נכון ל${footerDateText},<wbr> ב${location}`;
}

// Function to format a Date object to 'DD/MM/YYYY' string
function formatDateString(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
