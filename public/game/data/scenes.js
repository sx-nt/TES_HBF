// DEFINIÇÃO DOS CENÁRIOS
// images.blindfolded / images.unblindfolded: imagem com e sem a venda.
// images.windowsCovered: quarto com as janelas tapadas (com a venda).
// images.machineZoom: zoom da máquina (sem a venda).

const MACHINE_ZOOM_IMAGE = "assets/maps/S_Venda/maquina_zoom_sem_venda.png";

export const GATES_OFFICER_IMAGE = "assets/maps/C_Venda/gates_officer.png";

export const scenes = Object.freeze({
    beach: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/beach_d_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/beach_d_sem_venda.png",
            machineZoom: MACHINE_ZOOM_IMAGE
        }
    },

    gates: {
        hasHuman: true,
        images: {
            blindfolded: "assets/maps/C_Venda/gates_com_venda.png",
            unblindfolded: GATES_OFFICER_IMAGE
        }
    },

    houseFront: {
        hasHuman: true,
        images: {
            blindfolded: "assets/maps/C_Venda/frente_casa_com_venda.png",
            unblindfolded: "assets/maps/C_Venda/frente_casa_com_venda.png"
        }
    },

    quarto: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/quarto_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/quarto_sem_venda.png",
            windowsCovered: "assets/maps/C_Venda/quarto_com_venda_janela_tapada.png"
        }
    },

    mirror: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/mirror_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/mirror_sem_venda.png"
        }
    },

    construcao: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/construcao_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/construcao_sem_venda.png",
            machineZoom: MACHINE_ZOOM_IMAGE
        }
    },

    ww: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/ww_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/ww_sem_venda.png"
        }
    },

    quadroZoom: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/C_Venda/zoom_quadro_com_venda.png",
            unblindfolded: "assets/maps/S_Venda/zoom_quadro_sem_venda.png"
        }
    },

    cofre: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/S_Venda/zoom_cofre_sem_venda.png",
            unblindfolded: "assets/maps/S_Venda/zoom_cofre_sem_venda.png"
        }
    },

    cofreAberto: {
        hasHuman: false,
        images: {
            blindfolded: "assets/maps/S_Venda/zoom_cofre_aberto.png",
            unblindfolded: "assets/maps/S_Venda/zoom_cofre_aberto.png"
        }
    }
});

// REGRAS DE SEGURANÇA
// O jogador só morre se estiver fora de casa sem a venda.
// A construção é acessada pelos fundos, sem humanos por perto: área segura.
export const OUTSIDE_HOUSE_SCENES = Object.freeze(["gates", "houseFront"]);
export const INSIDE_HOUSE_SCENES = Object.freeze([
    "quarto", "mirror", "ww", "quadroZoom", "cofre", "cofreAberto", "construcao"
]);

export const SAFE_CODE = "030330";
