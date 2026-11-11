// INVENTÁRIO
import { state } from "../core/state.js";
import { $ } from "../core/utils.js";

const ITEM_IMAGES = Object.freeze({
    "livro": "assets/items/book.png",
    "chave do armário": "assets/items/chave.png",
    "venda": "assets/items/venda.png",
    "madeira": "assets/items/madeira.png",
    "martelo": "assets/items/ferramentas.png",
    "identidade": "assets/items/id.png"
});

// Itens que podem ser abertos a partir do inventário: { item: { hint, action } }
// Registrados por main.js para o inventário não depender dos leitores.
let openableItems = {};

export function setOpenableItems(items) {
    openableItems = items;
    updateInventory();
}

export function addItem(item) {
    if (!state.inventory.includes(item)) state.inventory.push(item);
    updateInventory();
}

export function hasItem(item) {
    return state.inventory.includes(item);
}

function createItemCard(item) {
    const openable = openableItems[item];
    const card = document.createElement(openable ? "button" : "div");
    card.className = "inventory-item";

    const image = document.createElement("img");
    image.src = ITEM_IMAGES[item] || "";
    image.alt = item;

    const label = document.createElement("span");
    label.textContent = item.toUpperCase();

    card.append(image, label);

    if (openable) {
        card.type = "button";
        card.classList.add("inventory-item-openable");
        card.setAttribute("aria-label", `${openable.hint} ${item}`);

        const hint = document.createElement("small");
        hint.className = "inventory-item-hint";
        hint.textContent = openable.hint;
        card.appendChild(hint);

        card.addEventListener("click", openable.action);
    }

    return card;
}

export function updateInventory() {
    const itemsEl = $("inventory-items");
    if (!itemsEl) return;

    itemsEl.replaceChildren();

    if (!state.inventory.length) {
        itemsEl.textContent = "Vazio";
        return;
    }

    state.inventory.forEach(item => itemsEl.appendChild(createItemCard(item)));
}

export function toggleInventory() {
    const panel = $("inventory");
    const isOpen = !panel.classList.contains("hidden");

    panel.classList.toggle("hidden", isOpen);
    $("inventory-toggle").setAttribute("aria-expanded", String(!isOpen));
}

// Retorna true se o painel estava aberto (usado pelo Esc em main.js)
export function closeInventory() {
    const panel = $("inventory");
    const wasOpen = !panel.classList.contains("hidden");

    panel.classList.add("hidden");
    $("inventory-toggle").setAttribute("aria-expanded", "false");
    return wasOpen;
}
