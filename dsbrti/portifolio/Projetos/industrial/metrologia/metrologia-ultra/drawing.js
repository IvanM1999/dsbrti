// drawing.js
export const DrawingEngine = {
    dims: { x: 50, y: 40, z: 30 },

    inicializar(idIso, idVistas) {
        this.svgIso = document.getElementById(idIso);
        this.svgVistas = document.getElementById(idVistas);
        this.renderizarGeometrias();
    },

    atualizarDimensoes(x, y, z) {
        this.dims = { x, y, z };
        this.renderizarGeometrias();
    },

    renderizarGeometrias() {
        if (!this.svgIso || !this.svgVistas) return;

        let dx = this.dims.x;
        let dy = this.dims.y;
        let dz = this.dims.z;

        // 1. Renderiza Perspectiva Isométrica Simplificada
        this.svgIso.innerHTML = `
            <path d="M 100 150 L ${100 + dx} 150 L ${100 + dx} ${150 - dy} L 100 ${150 - dy} Z" fill="none" stroke="#38bdf8" stroke-width="2"/>
            <path d="M 100 ${150 - dy} L ${100 + dx} ${150 - dy} L ${100 + dx + dz/2} ${150 - dy - dz/2} L ${100 + dz/2} ${150 - dy - dz/2} Z" fill="none" stroke="#4ade80" stroke-width="1.5"/>
            <path d="M ${100 + dx} 150 L ${100 + dx + dz/2} ${150 - dz/2} L ${100 + dx + dz/2} ${150 - dy - dz/2} L ${100 + dx} ${150 - dy} Z" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
            <text x="10" y="20" fill="#64748b" font-size="10" font-family="monospace">Peça Isométrica (3D)</text>
        `;

        // 2. Renderiza Projeções Ortogonais (Vistas: Frontal, Superior e Lateral Esquerda)
        this.svgVistas.innerHTML = `
            <line x1="150" y1="10" x2="150" y2="210" stroke="#1e293b" stroke-dasharray="4"/>
            <line x1="10" y1="110" x2="290" y2="110" stroke="#1e293b" stroke-dasharray="4"/>

            <rect x="${140 - dx}" y="${100 - dy}" width="${dx}" height="${dy}" fill="none" stroke="#38bdf8" stroke-width="2"/>
            
            <rect x="${140 - dx}" y="120" width="${dx}" height="${dz}" fill="none" stroke="#4ade80" stroke-width="2"/>
            
            <rect x="160" y="${100 - dy}" width="${dz}" height="${dy}" fill="none" stroke="#f59e0b" stroke-width="2"/>

            <text x="10" y="20" fill="#64748b" font-size="10" font-family="monospace">Vistas Técnicas (ABNT)</text>
        `;
    }
};
