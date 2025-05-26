import Swal from "sweetalert2";

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

export function successModal(title, transactionHash) {
    Swal.fire({
        icon: "success",
        title: title,
        html: `
    <p style="margin-bottom: 10px;">Transaction detail can be seen below:</p>
    <p>
      <a 
        href="https://holesky.etherscan.io/tx/${transactionHash}" 
        target="_blank" 
        style="color: blue; text-decoration: underline; font-size: 1rem;">
        ${transactionHash}
      </a>
    </p>`,
        customClass: {
            popup: 'swal-modal',
            confirmButton: 'swal-confirm-button swal-wide-button',
            actions: 'swal-one-buttons'
        }
    });
}

export function normalModal(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        customClass: {
            popup: 'swal-modal',
            confirmButton: 'swal-confirm-button swal-wide-button',
            actions: 'swal-one-buttons'
        }
    });
}