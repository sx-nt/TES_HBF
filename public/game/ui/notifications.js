// NOTIFICAÇÕES DO SISTEMA (Notification API do navegador)
// Sem servidor nem service worker: só funciona com a aba aberta, e só avisa
// quando ela não está visível (o jogador saiu para outra aba/janela).
// A permissão só é pedida por gesto do jogador (botão no menu de pausa).
// Se o navegador não suporta ou a permissão foi negada, tudo vira no-op.
// API pública: notify, notificationsEnabled, setNotificationsEnabled,
// initNotifications.

const STORAGE_KEY = "mee-notifications";
const ICON = new URL("../assets/items/venda.png", import.meta.url).href;

const supported = typeof window !== "undefined" && "Notification" in window;

let wanted = readPreference();

function readPreference() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
        return false;
    }
}

function writePreference(on) {
    try {
        localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
        // Armazenamento indisponível: a escolha vale só para esta sessão.
    }
}

function permission() {
    return supported ? Notification.permission : "denied";
}

export function notificationsEnabled() {
    return wanted && permission() === "granted";
}

// Pede a permissão (se preciso) e liga/desliga. Retorna o estado final.
export async function setNotificationsEnabled(on) {
    if (!on || !supported) {
        wanted = false;
        writePreference(false);
        return false;
    }

    let result = permission();
    if (result === "default") {
        try {
            // Safari antigo usa callback em vez de Promise
            result = await new Promise(resolve => {
                const maybe = Notification.requestPermission(resolve);
                if (maybe?.then) maybe.then(resolve, () => resolve("denied"));
            });
        } catch {
            result = "denied";
        }
    }

    wanted = result === "granted";
    writePreference(wanted);
    return wanted;
}

// Envia uma notificação do sistema se estiver ativada e a aba estiver oculta.
export function notify(title, body = "") {
    if (!notificationsEnabled()) return null;
    if (document.visibilityState === "visible") return null;

    try {
        const notification = new Notification(title, {
            body,
            icon: ICON,
            lang: "pt-BR",
            tag: "mee-jogo"
        });
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        return notification;
    } catch {
        // Alguns navegadores (ex.: Chrome no Android) exigem service worker.
        return null;
    }
}

// BOTÃO NO MENU DE PAUSA

function updateButton() {
    const button = document.getElementById("notifications-toggle");
    if (!button) return;

    const on = notificationsEnabled();
    let label = `Notificações: ${on ? "ativadas" : "desativadas"}`;
    if (!supported) label = "Notificações: indisponíveis";
    else if (permission() === "denied") label = "Notificações: bloqueadas";

    button.textContent = label;
    button.setAttribute("aria-pressed", String(on));
    button.disabled = !supported;
}

export function initNotifications() {
    const button = document.getElementById("notifications-toggle");
    if (!button) return;

    button.addEventListener("click", async () => {
        await setNotificationsEnabled(!notificationsEnabled());
        updateButton();
    });
    updateButton();
}
