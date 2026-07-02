// hardware.js
export const HardwareIntelligence = {
    profile: { ppi: 96, dpr: 1, pxPerMmLg: 3.77, device: "Genérico" },
    
    mapearAmbiente() {
        this.profile.dpr = window.devicePixelRatio || 1;
        const ua = navigator.userAgent;
        
        // Perfil cirúrgico do Motorola Moto G73 5G
        if (/Android/i.test(ua) && (screen.width === 1080 || screen.height === 1080)) {
            this.profile.ppi = 405;
            this.profile.device = "Motorola Moto G73 5G (405 PPI)";
        } else if (/Android/i.test(ua) || /iPhone/i.test(ua)) {
            this.profile.ppi = 320; // Média mobile
            this.profile.device = "Mobile Genérico (Estimado)";
        } else {
            this.profile.ppi = 141; // Desktop convencional
            this.profile.device = "Desktop / Monitor Comum";
        }

        // Resolução matemática de pixels lógicos por mm
        this.profile.pxPerMmLg = (this.profile.ppi / 25.4) / this.profile.dpr;
        return this.profile;
    }
};
