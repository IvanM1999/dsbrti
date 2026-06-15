/* ============================================================
   DSBRTI — db_industrial.js
   Banco de dados de unidades, normas ISO, tabelas técnicas.
   Todas as matrizes e constantes do sistema.
   ============================================================ */

'use strict';

const DSBRTI_DB = (() => {
  // --- Conversões de Unidades (fator multiplicativo para unidade base SI) ---
  const UNITS = {
    length: {
      base: 'm',
      units: {
        m:   { label: 'Metro (m)',            factor: 1 },
        km:  { label: 'Quilômetro (km)',      factor: 1e3 },
        cm:  { label: 'Centímetro (cm)',      factor: 1e-2 },
        mm:  { label: 'Milímetro (mm)',       factor: 1e-3 },
        um:  { label: 'Micrômetro (µm)',      factor: 1e-6 },
        nm:  { label: 'Nanômetro (nm)',       factor: 1e-9 },
        in:  { label: 'Polegada (in)',        factor: 0.0254 },
        ft:  { label: 'Pé (ft)',              factor: 0.3048 },
        yd:  { label: 'Jarda (yd)',           factor: 0.9144 },
        mi:  { label: 'Milha (mi)',           factor: 1609.344 },
        mil: { label: 'Mil (0.001")',         factor: 2.54e-5 },
      }
    },
    mass: {
      base: 'kg',
      units: {
        kg:  { label: 'Quilograma (kg)',      factor: 1 },
        g:   { label: 'Grama (g)',            factor: 1e-3 },
        mg:  { label: 'Miligrama (mg)',       factor: 1e-6 },
        t:   { label: 'Tonelada (t)',         factor: 1e3 },
        lb:  { label: 'Libra (lb)',           factor: 0.45359237 },
        oz:  { label: 'Onça (oz)',            factor: 0.028349523125 },
        slug:{ label: 'Slug',                 factor: 14.593903 },
      }
    },
    pressure: {
      base: 'Pa',
      units: {
        Pa:   { label: 'Pascal (Pa)',         factor: 1 },
        kPa:  { label: 'Quilopascal (kPa)',   factor: 1e3 },
        MPa:  { label: 'Megapascal (MPa)',    factor: 1e6 },
        bar:  { label: 'Bar',                 factor: 1e5 },
        mbar: { label: 'Milibar (mbar)',      factor: 1e2 },
        psi:  { label: 'PSI (lbf/in²)',      factor: 6894.757293168 },
        atm:  { label: 'Atmosfera (atm)',     factor: 101325 },
        mmHg: { label: 'mmHg (Torr)',         factor: 133.322368421 },
        kgfcm2:{label: 'kgf/cm²',             factor: 98066.5 },
      }
    },
    temperature: {
      base: 'K',
      units: {
        K: { label: 'Kelvin (K)',  convert: (v, to) => to === 'K' ? v : to === 'C' ? v - 273.15 : v * 9/5 - 459.67 },
        C: { label: '°Celsius',    convert: (v, to) => to === 'C' ? v : to === 'K' ? v + 273.15 : v * 9/5 + 32 },
        F: { label: '°Fahrenheit', convert: (v, to) => to === 'F' ? v : to === 'K' ? (v + 459.67) * 5/9 : (v - 32) * 5/9 },
      }
    },
    flow: {
      base: 'm³/s',
      units: {
        m3s:    { label: 'm³/s',              factor: 1 },
        m3h:    { label: 'm³/h',              factor: 1/3600 },
        Ls:     { label: 'L/s',               factor: 1e-3 },
        Lmin:   { label: 'L/min',             factor: 1e-3 / 60 },
        gpm:    { label: 'GPM (gal/min)',     factor: 6.30901964e-5 },
        cfm:    { label: 'CFM (ft³/min)',     factor: 0.000471947443 },
        bblpd:  { label: 'bbl/dia',           factor: 1.84013073e-6 },
      }
    },
    hardness: {
      base: 'HV',
      units: {
        HV: { label: 'Vickers (HV)',  factor: 1 },
        HB: { label: 'Brinell (HB)',  factor: 0.95, approx: true },
        HRC:{ label: 'Rockwell C',    factor: 0, convert: (v, to) => {
          // Aproximação: HRC para HV (ISO 18265)
          if (to === 'HV') return Math.round((v * 15 + 80));
          if (to === 'HB') return Math.round((v * 14 + 70));
          return v;
        }},
        HRB:{ label: 'Rockwell B',    factor: 0, convert: (v, to) => {
          if (to === 'HB') return Math.round((v * 1.8 + 35));
          if (to === 'HV') return Math.round((v * 1.9 + 30));
          return v;
        }},
      }
    }
  };

  // --- Classes de Tolerância ISO 286 (valores em µm) ---
  // [faixa nominal min, max, IT01, IT0, IT1, IT2, IT3, IT4, IT5, IT6, IT7, IT8, IT9, IT10, IT11, IT12, IT13, IT14, IT15, IT16, IT17, IT18]
  const ISO_TOLERANCE_TABLE = [
    [0, 3,      0.3, 0.5, 0.8, 1.2, 2, 3, 4, 6, 10, 14, 25, 40, 60, 100, 140, 250, 400, 600, 1000, 1400],
    [3, 6,      0.4, 0.6, 1, 1.5, 2.5, 4, 5, 8, 12, 18, 30, 48, 75, 120, 180, 300, 480, 750, 1200, 1800],
    [6, 10,     0.4, 0.6, 1, 1.5, 2.5, 4, 6, 9, 15, 22, 36, 58, 90, 150, 220, 360, 580, 900, 1500, 2200],
    [10, 18,    0.5, 0.8, 1.2, 2, 3, 5, 8, 11, 18, 27, 43, 70, 110, 180, 270, 430, 700, 1100, 1800, 2700],
    [18, 30,    0.6, 1, 1.5, 2.5, 4, 6, 9, 13, 21, 33, 52, 84, 130, 210, 330, 520, 840, 1300, 2100, 3300],
    [30, 50,    0.6, 1, 1.5, 2.5, 4, 7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000, 1600, 2500, 3900],
    [50, 80,    0.8, 1.2, 2, 3, 5, 8, 13, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200, 1900, 3000, 4600],
    [80, 120,   1, 1.5, 2.5, 4, 6, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400, 2200, 3500, 5400],
    [120, 180,  1.2, 2, 3.5, 5, 8, 12, 18, 25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300],
    [180, 250,  2, 3, 4.5, 7, 10, 14, 20, 29, 46, 72, 115, 185, 290, 460, 720, 1150, 1850, 2900, 4600, 7200],
    [250, 315,  2.5, 4, 6, 8, 12, 16, 23, 32, 52, 81, 130, 210, 320, 520, 810, 1300, 2100, 3200, 5200, 8100],
    [315, 400,  3, 5, 7, 9, 13, 18, 25, 36, 57, 89, 140, 230, 360, 570, 890, 1400, 2300, 3600, 5700, 8900],
    [400, 500,  4, 6, 8, 10, 15, 20, 27, 40, 63, 97, 155, 250, 400, 630, 970, 1550, 2500, 4000, 6300, 9700],
  ];

  const IT_CLASSES = ['IT01','IT0','IT1','IT2','IT3','IT4','IT5','IT6','IT7','IT8','IT9','IT10','IT11','IT12','IT13','IT14','IT15','IT16','IT17','IT18'];

  // --- Rugosidade ISO 4287 ---
  const RUGOSIDADE = [
    { param: 'Ra', desc: 'Desvio médio aritmético do perfil', unidade: 'µm' },
    { param: 'Rz', desc: 'Altura máxima do perfil (10 pontos)', unidade: 'µm' },
    { param: 'Rq', desc: 'Desvio quadrático médio (RMS)', unidade: 'µm' },
    { param: 'Rt', desc: 'Altura total do perfil', unidade: 'µm' },
    { param: 'Rp', desc: 'Altura máxima do pico', unidade: 'µm' },
    { param: 'Rv', desc: 'Profundidade máxima do vale', unidade: 'µm' },
    { param: 'Rsk', desc: 'Assimetria do perfil (Skewness)', unidade: '' },
    { param: 'Rku', desc: 'Curtose do perfil (Kurtosis)', unidade: '' },
    { param: 'Rsm', desc: 'Largura média dos elementos do perfil', unidade: 'mm' },
    { param: 'Rmr', desc: 'Relação de material (Bearing ratio)', unidade: '%' },
  ];

  // --- Dureza (tabela de conversão aproximada) ---
  const HARDNESS_CONV = [
    { HRC: 68, HRB: '-', HB: 780, HV: 820, Nmm2: 3000 },
    { HRC: 65, HRB: '-', HB: 720, HV: 755, Nmm2: 2750 },
    { HRC: 60, HRB: '-', HB: 650, HV: 680, Nmm2: 2450 },
    { HRC: 55, HRB: '-', HB: 580, HV: 610, Nmm2: 2100 },
    { HRC: 50, HRB: '-', HB: 510, HV: 530, Nmm2: 1820 },
    { HRC: 45, HRB: '-', HB: 440, HV: 460, Nmm2: 1550 },
    { HRC: 40, HRB: '-', HB: 370, HV: 385, Nmm2: 1300 },
    { HRC: 35, HRB: '-', HB: 310, HV: 320, Nmm2: 1100 },
    { HRC: 30, HRB: '-', HB: 260, HV: 270, Nmm2: 920 },
    { HRC: 25, HRB: '-', HB: 220, HV: 230, Nmm2: 780 },
    { HRC: 20, HRB: '-', HB: 185, HV: 195, Nmm2: 660 },
    { HRC: '-', HRB: 100, HB: 240, HV: 252, Nmm2: 860 },
    { HRC: '-', HRB: 95, HB: 210, HV: 220, Nmm2: 750 },
    { HRC: '-', HRB: 90, HB: 185, HV: 193, Nmm2: 660 },
    { HRC: '-', HRB: 85, HB: 165, HV: 172, Nmm2: 590 },
    { HRC: '-', HRB: 80, HB: 145, HV: 151, Nmm2: 520 },
  ];

  // --- Portfólio de projetos ---
  const PORTFOLIO = [
    {
      id: 1,
      title: 'CMM — Programação de Máquina de Medição por Coordenadas',
      category: 'metrologia',
      desc: 'Desenvolvimento de rotinas de medição para CMM DEA com PC-DMIS. Redução de 40% no tempo de inspeção.',
      year: '2024',
    },
    {
      id: 2,
      title: 'Sistema de Controle Estatístico do Processo (CEP)',
      category: 'qualidade',
      desc: 'Implementação de cartas de controle X̄-R e X̄-S para linha de usinagem de precisão. Rejeição reduzida em 18%.',
      year: '2024',
    },
    {
      id: 3,
      title: 'DSBRTI Core — Motor de Conversões Industriais',
      category: 'software',
      desc: 'Plataforma web progressiva para conversão de unidades, tabelas ISO e consulta técnica. Open source.',
      year: '2025',
    },
    {
      id: 4,
      title: 'Projeto de Dispositivo de Fixação Modular',
      category: 'mecanica',
      desc: 'Projeto e fabricação de dispositivo modular para fresamento de precisão com sistema de referência a 3 pontos.',
      year: '2023',
    },
    {
      id: 5,
      title: 'Análise de Rugosidade em Superfícies Usinadas',
      category: 'metrologia',
      desc: 'Estudo comparativo de parâmetros Ra, Rz e Rq em diferentes processos de usinagem (torneamento, fresamento, retificação).',
      year: '2023',
    },
    {
      id: 6,
      title: 'Auditoria Interna ISO 9001:2015',
      category: 'qualidade',
      desc: 'Auditoria completa do SGQ com elaboração de relatório de não-conformidades e plano de ação corretiva.',
      year: '2023',
    },
    {
      id: 7,
      title: 'Calculadora de Ajustes ISO 286',
      category: 'software',
      desc: 'Ferramenta interativa para cálculo de folga/interferência máxima e mínima entre furos e eixos.',
      year: '2025',
    },
    {
      id: 8,
      title: 'Redesign de Suporte para Mancal de Rolamento',
      category: 'mecanica',
      desc: 'Análise estrutural e redimensionamento de suporte para mancal de 80 mm utilizando elementos finitos (FEA).',
      year: '2022',
    },
  ];

  // --- Competências (currículo) ---
  const SKILLS = [
    'Metrologia', 'GD&T', 'ISO 286', 'ISO 2768', 'CMM', 'Paquímetro',
    'Micrômetro', 'Rugosidade', 'SolidWorks', 'AutoCAD', 'CEP',
    'ISO 9001', 'Lean Manufacturing', 'Python', 'JavaScript', 'SQL',
    'Ferramental', 'Usinagem', 'Soldagem', 'Leitura de Desenho Técnico',
  ];

  // --- Certificações ---
  const CERTIFICATIONS = [
    'Green Belt Lean Six Sigma',
    'Auditor Interno ISO 9001:2015',
    'Metrologia Avançada SENAI',
    'Programação CMM (PC-DMIS)',
    'SolidWorks Associate (CSWA)',
    'NR-12 — Segurança em Máquinas',
  ];

  // --- Referência Rápida (exibida na index) ---
  const QUICK_REFS = [
    { label: '1" = 25,4 mm', title: 'Polegada → Milímetro' },
    { label: '1 kgf/cm² ≈ 14,22 psi', title: 'Pressão' },
    { label: 'IT7 — Tolerância padrão ISO', title: 'Tolerância' },
    { label: 'H7/g6 — Ajuste deslizante', title: 'Ajuste ISO' },
    { label: 'Ra 0,8 µm — Acabamento fino', title: 'Rugosidade' },
    { label: 'HRC 40 ≈ HB 370', title: 'Conversão Dureza' },
    { label: '0 °C = 273,15 K', title: 'Temperatura' },
    { label: '1 bar = 0,1 MPa', title: 'Pressão' },
    { label: '1 L/min ≈ 0,264 GPM', title: 'Vazão' },
    { label: '1 kg = 2,20462 lb', title: 'Massa' },
  ];

  // --- API pública ---
  return {
    UNITS,
    ISO_TOLERANCE_TABLE,
    IT_CLASSES,
    RUGOSIDADE,
    HARDNESS_CONV,
    PORTFOLIO,
    SKILLS,
    CERTIFICATIONS,
    QUICK_REFS,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DSBRTI_DB;
}
