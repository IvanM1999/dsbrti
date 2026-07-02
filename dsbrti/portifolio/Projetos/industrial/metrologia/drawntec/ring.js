// ring.js
import { HardwareIntelligence } from './hardware.js';
import { MetrologyEngine } from './metrology.js';

export const RingEngine = {
    tabelas: {
        BR: [
            { diam: 14.8, size: "10" }, { diam: 15.2, size: "11" }, { diam: 15.5, size: "12" },
            { diam: 15.8, size: "13" }, { diam: 16.2, size: "14" }, { diam: 16.5, size: "15" },
            { diam: 16.8, size: "16" }, { diam: 17.2, size: "17" }, { diam: 17.5, size: "18" },
            { diam: 17.8, size: "19" }, { diam: 18.2, size: "20" }, { diam: 18.5, size: "21" },
            { diam: 18.8, size: "22" }, { diam: 19.2, size: "23" }, { diam: 19.5, size: "24" }
        ],
        US: [
            { diam: 14.8, size: "4" }, { diam: 15.2, size: "4.5" }, { diam: 15.6, size: "5" },
            { diam: 16.0, size: "5.5" }, { diam: 16.4, size: "6" }, { diam: 16.9, size: "6.5" },
            { diam: 17.3, size: "7" }, { diam: 17.7, size: "7.5" }, { diam: 18.2, size: "8" }
        ],
        EU: [
            { diam: 14.6, size: "46" }, { diam: 15.3, size: "48" }, { diam: 15.9, size: "50" },
            { diam: 16.5, size: "52" }, { diam: 17.2, size: "54" }, { diam: 17.8, size: "56" }
        ],
        AS: [
            { diam: 14.6, size: "7" }, { diam: 15.0, size: "9" }, { diam: 15.4, size: "11" },
            { diam: 15.8, size: "13" }, { diam: 16.3, size: "15" }, { diam: 16.7, size: "17" }
        ]
    },

    atualizarMedidas(diametroMm, pais, displayDiamId, displaySizeId, circuloId) {
        const lista = this.tabelas[pais] || this.tabelas.BR;
        
        let melhorAjuste = lista[0];
        let menorDiferenca = Math.abs(diametroMm - lista[0].diam);
        
        for (let i = 1; i < lista.length; i++) {
            let diff = Math.abs(diametroMm - lista[i].diam);
            if (diff < menorDiferenca) {
                menorDiferenca = diff;
                melhorAjuste = lista[i];
            }
        }

        document.getElementById(displayDiamId).textContent = diametroMm.toFixed(2);
        document.getElementById(displaySizeId).textContent = melhorAjuste.size;

        // Renderiza o círculo físico aplicando o fator de calibração ativa do sistema
        let pxPorMmReal = HardwareIntelligence.profile.pxPerMmLg * MetrologyEngine.fatorCorrecao;
        let tamanhoPixels = diametroMm * pxPorMmReal;
        
        const circulo = document.getElementById(circuloId);
        if (circulo) {
            circulo.style.width = `${tamanhoPixels}px`;
            circulo.style.height = `${tamanhoPixels}px`;
        }
    }
};
