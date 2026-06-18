/**
 * DATABANK INDUSTRIAL GRANULAR INDUSTRIAL V6.0 (db_industrial.js)
 */

const BASE_USINAGEM = [
    { bitola: "M3 x 0.5", tipo: "Métrica Normal ISO", passo: "0.50 mm", d_menor: "2.459 mm", broca: "2.5 mm", setor: "Usinagem" },
    { bitola: "M4 x 0.7", tipo: "Métrica Normal ISO", passo: "0.70 mm", d_menor: "3.242 mm", broca: "3.3 mm", setor: "Usinagem" },
    { bitola: "M5 x 0.8", tipo: "Métrica Normal ISO", passo: "0.80 mm", d_menor: "4.134 mm", broca: "4.2 mm", setor: "Usinagem" },
    { bitola: "M6 x 1.0", tipo: "Métrica Normal ISO", passo: "1.00 mm", d_menor: "4.917 mm", broca: "5.0 mm", setor: "Usinagem" },
    { bitola: "M8 x 1.25", tipo: "Métrica Normal ISO", passo: "1.25 mm", d_menor: "6.647 mm", broca: "6.8 mm", setor: "Usinagem" },
    { bitola: "M10 x 1.5", tipo: "Métrica Normal ISO", passo: "1.50 mm", d_menor: "8.376 mm", broca: "8.5 mm", setor: "Usinagem" },
    { bitola: "M8 x 1.0", tipo: "Métrica Fina ISO", passo: "1.00 mm", d_menor: "6.917 mm", broca: "7.0 mm", setor: "Usinagem" },
    { bitola: "M10 x 1.25", tipo: "Métrica Fina ISO", passo: "1.25 mm", d_menor: "8.647 mm", broca: "8.8 mm", setor: "Usinagem" },
    { bitola: "1/4\" - 20 UNC", tipo: "Polegada Unificada", passo: "1.270 mm", d_menor: "4.970 mm", broca: "5.1 mm", setor: "Usinagem" },
    { bitola: "5/16\" - 18 UNC", tipo: "Polegada Unificada", passo: "1.411 mm", d_menor: "6.410 mm", broca: "6.6 mm", setor: "Usinagem" },
    { bitola: "3/8\" - 16 UNC", tipo: "Polegada Unificada", passo: "1.587 mm", d_menor: "7.740 mm", broca: "8.0 mm", setor: "Usinagem" }
];

const BASE_TOLERANCIAS = [
    { classe: "H7", tipo: "Furo Ajuste Mecânico", faixa: "10 a 30 mm", es: "+0.021 mm", ei: "0.000 mm", acopl: "Folga Livre", aplicacao: "Ajuste de polias de precisão, engrenagens padrão e guias mecânicas cilíndricas", setor: "Desenho Técnico" },
    { classe: "g6", tipo: "Eixo Deslizante Livre", faixa: "10 a 30 mm", es: "-0.007 mm", ei: "-0.020 mm", acopl: "Folga Fina", aplicacao: "Peças lineares móveis estruturais, eixos rotativos de caixas redutoras", setor: "Desenho Técnico" },
    { classe: "h6", tipo: "Eixo Ajuste Desmontável", faixa: "10 a 30 mm", es: "0.000 mm", ei: "-0.013 mm", acopl: "Transição Neutra", aplicacao: "Montagem estática de engrenagens fixadas por chavetas paralelas", setor: "Desenho Técnico" },
    { classe: "p6", tipo: "Eixo Prensa Interferência", faixa: "10 a 30 mm", es: "+0.035 mm", ei: "+0.022 mm", acopl: "Interferência", aplicacao: "Fixação definitiva de buchas de bronze por acoplamento prensado", setor: "Desenho Técnico" }
];

const BASE_MANUTENCAO = [
    { nome: "Loop 4-20mA", cat: "Automação", param1: "4mA (Zero) / 20mA (Span)", param2: "250 Ω Interna", desc: "Sinal elétrico analógico padronizado robusto para sensores industriais", setor: "Manutenção" },
    { nome: "RS-485 Modbus RTU", cat: "Redes Técnicas", param1: "Diferencial ±5V", param2: "120 Ω Casamento", desc: "Rede multiponto serial usada para comunicar CLPs e inversores de frequência", setor: "Manutenção" },
    { nome: "Aço Carbono (END)", cat: "Ultrassom", param1: "Longitudinal: 5920 m/s", param2: "Transversal: 3230 m/s", desc: "Constantes mecânicas de velocidade sônica para calibração de detectores de trinca", setor: "Manutenção" },
    { nome: "Ferro Cinzento FC250", cat: "Metalurgia", param1: "Contração: 1.0% a 1.2%", param2: "Vazamento: ~1350°C", desc: "Dados cinéticos térmicos para projetos de moldagem e reparos em carcaças estruturais", setor: "Manutenção" }
];
