// Utilitários compartilhados por todos os módulos.

export const $ = (id) => document.getElementById(id);

export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function preloadImage(src) {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => {
            console.warn("Erro ao carregar imagem:", src);
            resolve(false);
        };
        image.src = src;
    });
}
