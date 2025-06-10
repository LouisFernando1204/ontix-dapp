import Swal from "sweetalert2";
import QRCode from "qrcode";

export function truncate(
    text,
    startChar,
    endChar,
    maxLength
) {
    if (text.length > maxLength) {
        let start = text.substring(0, startChar);
        let end = text.substring(text.length - endChar, text.length);
        while (start.length + end.length < maxLength) {
            start = start + ".";
        }
        return start + end;
    }
    return text;
}

export function successModal(title, transactionHash, eventArgsArray = []) {
    const argsHtml = eventArgsArray
        .map((args) => {
            const entries = Object.entries(args)
                .filter(([key]) => isNaN(key))
                .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                .join("");
            return `<div style="margin-bottom: 10px;"><br/>${entries}</div>`;
        })
        .join("");
    Swal.fire({
        icon: "success",
        title: title,
        showCancelButton: false,
        customClass: {
            confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
        },
        buttonsStyling: false,
        html: `
      <p style="margin-bottom: 10px;">Transaction detail can be seen below:</p>
      <p>
        <a 
          href="https://sepolia-optimism.etherscan.io/tx/${transactionHash}" 
          target="_blank" 
          style="color: blue; text-decoration: underline; font-size: 1rem;">
          ${transactionHash}
        </a>
      </p>
      <hr style="margin: 12px 0;" />
      ${argsHtml}
    `
    });
}

export function normalModal(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showCancelButton: false,
        customClass: {
            confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
        },
        buttonsStyling: false
    });
}

export function errorMessage(err) {
    const convertedError = err;
    if (convertedError.reason) {
        return convertedError.reason;
    }
    else {
        return "Unknown error"
    }
}

export async function generateQrCodeBlob(text, ticketId) {
    const dataUrl = await QRCode.toDataURL(text);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const filename = `qrcode-${ticketId}-${Date.now()}.png`;
    return new File([blob], filename, { type: "image/png" });
}

export function formatFullDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);
    return `${formattedDate}, ${formattedTime}`;
};

export function formatEventDuration(startTimestamp, endTimestamp) {
    const start = new Date(startTimestamp * 1000);
    const end = new Date(endTimestamp * 1000);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = start.toLocaleDateString('en-ID', dateOptions);
    const startTime = start.toLocaleTimeString('en-ID', timeOptions);
    const endTime = end.toLocaleTimeString('id-en', timeOptions);
    return `${formattedDate}, ${startTime} - ${endTime}`;
};

export function formatDuration(startTimestamp, endTimestamp) {
    const start = new Date(startTimestamp * 1000);
    const end = new Date(endTimestamp * 1000);
    const durationMs = Math.max(end - start, 0);
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `Duration: ${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`;
}