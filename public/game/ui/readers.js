// LEITORES: documento e livro abertos a partir do inventário.
import { bookPages } from "../data/book.js";
import { $ } from "../core/utils.js";

let bookPageIndex = 0;
let bookReachedEnd = false;
let readingReturnFocus = null;
let onBookClosed = null;

function isModalOpen(id) {
    return !$(id).classList.contains("hidden");
}

function openReadingModal(id, focusId) {
    readingReturnFocus = document.activeElement;
    $(id).classList.remove("hidden");
    $(focusId).focus();
}

function closeReadingModal(id) {
    $(id).classList.add("hidden");

    if (readingReturnFocus && document.body.contains(readingReturnFocus)) {
        readingReturnFocus.focus();
    }
    readingReturnFocus = null;
}

// Fecha os leitores sem disparar efeitos (usado ao iniciar/reiniciar/game over)
export function closeReadingModals() {
    $("document-viewer").classList.add("hidden");
    $("book-reader").classList.add("hidden");
    readingReturnFocus = null;
}

// DOCUMENTO

export function openDocumentViewer() {
    openReadingModal("document-viewer", "document-close");
}

function closeDocumentViewer() {
    closeReadingModal("document-viewer");
}

// LIVRO

export function openBookReader() {
    bookPageIndex = 0;
    bookReachedEnd = false;
    renderBookPage();
    openReadingModal("book-reader", "book-next");
}

function renderBookPage() {
    const page = bookPages[bookPageIndex];
    const isLast = bookPageIndex === bookPages.length - 1;

    if (isLast) bookReachedEnd = true;

    $("book-page-title").textContent = page.title || "";
    $("book-page-text").textContent = page.text;
    $("book-page-counter").textContent = `${bookPageIndex + 1}/${bookPages.length}`;
    $("book-prev").disabled = bookPageIndex === 0;

    const next = $("book-next");
    const finish = $("book-finish");
    next.classList.toggle("hidden", isLast);
    finish.classList.toggle("hidden", !isLast);

    // Mantém o foco num botão visível ao trocar Próxima por Fechar livro
    if (isLast && document.activeElement === next) finish.focus();
}

function changeBookPage(delta) {
    const target = bookPageIndex + delta;
    if (target < 0 || target >= bookPages.length) return;
    bookPageIndex = target;
    renderBookPage();
}

function closeBookReader() {
    if (!isModalOpen("book-reader")) return;

    closeReadingModal("book-reader");
    onBookClosed?.(bookReachedEnd);
}

function handleKeydown(event) {
    if (isModalOpen("document-viewer")) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeDocumentViewer();
        }
        return;
    }

    if (!isModalOpen("book-reader")) return;

    const actions = {
        Escape: closeBookReader,
        ArrowLeft: () => changeBookPage(-1),
        ArrowRight: () => changeBookPage(1)
    };

    if (actions[event.key]) {
        event.preventDefault();
        actions[event.key]();
    }
}

// onBookClosed(reachedEnd) é chamado sempre que o livro é fechado.
export function initReaders({ onBookClosed: callback }) {
    onBookClosed = callback;

    $("document-close").addEventListener("click", closeDocumentViewer);
    $("book-close").addEventListener("click", closeBookReader);
    $("book-finish").addEventListener("click", closeBookReader);
    $("book-prev").addEventListener("click", () => changeBookPage(-1));
    $("book-next").addEventListener("click", () => changeBookPage(1));
    document.addEventListener("keydown", handleKeydown);
}
