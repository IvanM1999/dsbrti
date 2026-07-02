// metrology.js
import { HardwareIntelligence } from './hardware.js';

export const MetrologyEngine = {
    fatorCorrecao: 1.638, 
    viewBoxPxPerMm: 10,
    zeroAbsolutoX: 150,
    posicaoAtualPx: 0,
    mmPrecisoGlobal: 0,
    arrastando: false,
    xInicialLocal: 0,
    xInicialCursor: 0,

    vincularElementos(wrapperId, svgId, leituraId, fatorId) {
        this.wrapper = document.getElementById(wrapperId);
        this.svg = document.getElementById(svgId);
        this.leitura = document.getElementById(leituraId);
        this.fatorDisplay = document.getElementById(fatorId);
    },

    aplicarEscalaFisica() {
        const perfil = HardwareIntelligence.profile;
        let pxPorMmReal = perfil.pxPerMmLg * this.fatorCorrecao;
        let larguraIdealSvgEmMm = 950 / this.viewBoxPxPerMm; 
        let larguraPixelsCss = larguraIdealSvgEmMm * pxPorMmReal;
        
        if (this.wrapper) this.wrapper.style.width = `${larguraPixelsCss}px`;
        if (this.fatorDisplay) this.fatorDisplay.textContent = this.fatorCorrecao.toFixed(5);
    },

    calibrarPorObjeto(valorReferenciaMundoReal) {
        if (!valorReferenciaMundoReal || this.mmPrecisoGlobal === 0) return false;

        // MATEMÁTICA ABSURDA: Cruzamento de matrizes lineares para correção de erro
        let razaoDeErro = this.mmPrecisoGlobal / valorReferenciaMundoReal;
        this.fatorCorrecao = this.fatorCorrecao * razaoDeErro;
        
        this.aplicarEscalaFisica();
        return this.fatorCorrecao;
    },

    desenharPaquimetro() {
        let htmlFixo = `
            <rect x="20" y="80" width="910" height="60" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
            <path d="M 50 80 L 50 240 L 110 240 L 150 140 L 150 80 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
        `;
        for (let i = 0; i <= 60; i++) {
            let x = this.zeroAbsolutoX + (i * this.viewBoxPxPerMm);
            let altura = (i % 10 === 0) ? 22 : (i % 5 === 0 ? 16 : 10);
            htmlFixo += `<line x1="${x}" y1="140" x2="${x}" y2="${140 - altura}" stroke="#1e293b" stroke-width="1.5"/>`;
            if (i % 10 === 0) {
                htmlFixo += `<text x="${x}" y="112" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold" fill="#475569">${i/10}</text>`;
            }
        }

        const larguraDivisaoNonioPx = 0.95 * this.viewBoxPxPerMm; 
        let htmlMovel = `
            <g id="cursor-movel" transform="translate(0,0)">
                <path d="M ${this.zeroAbsolutoX} 80 L ${this.zeroAbsolutoX} 140 L ${this.zeroAbsolutoX + 40} 240 L ${this.zeroAbsolutoX + 80} 240 L ${this.zeroAbsolutoX + 80} 140 L 450 140 L 450 80 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
                <rect x="${this.zeroAbsolutoX}" y="140" width="220" height="45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        `;
        for (let i = 0; i <= 20; i++) {
            let x = this.zeroAbsolutoX + (i * larguraDivisaoNonioPx);
            let altura = (i % 2 === 0) ? 18 : 11;
            htmlMovel += `<line x1="${x}" y1="140" x2="${x}" y2="${140 + altura}" stroke="#dc2626" stroke-width="1.5"/>`;
            if (i % 2 === 0) {
                htmlMovel += `<text x="${x}" y="174" font-size="11" fill="#1e293b" font-family="sans-serif" text-anchor="middle" font-weight="bold">${i/2}</text>`;
            }
        }
        htmlMovel += `</g>`;
        this.svg.innerHTML = htmlFixo + htmlMovel;
    }
};
