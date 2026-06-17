// api.js — Mini‑API local para manipular o arquivo bateria_nova.json

export const NOMINAL = 5000;

let fileHandle = null;
let dataCache = null;

export async function openFilePicker() {
  fileHandle = await window.showOpenFilePicker({
    types: [
      {
        description: "Arquivo de dados da bateria",
        accept: { "application/json": [".json"] }
      }
    ],
    multiple: false
  }).then(handles => handles[0]);

  return await loadFile();
}

export async function createNewFile() {
  fileHandle = await window.showSaveFilePicker({
    suggestedName: "bateria_nova.json",
    types: [
      {
        description: "Arquivo de dados da bateria",
        accept: { "application/json": [".json"] }
      }
    ]
  });

  dataCache = {
    nominal_capacity_mAh: NOMINAL,
    cycles: []
  };

  await saveFile();
  return dataCache;
}

export async function loadFile() {
  if (!fileHandle) throw new Error("Nenhum arquivo aberto.");

  const file = await fileHandle.getFile();
  const text = await file.text();

  try {
    dataCache = JSON.parse(text);
  } catch {
    dataCache = {
      nominal_capacity_mAh: NOMINAL,
      cycles: []
    };
  }

  return dataCache;
}

export async function saveFile() {
  if (!fileHandle) throw new Error("Nenhum arquivo aberto.");
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(dataCache, null, 2));
  await writable.close();
}

export function getData() {
  return dataCache;
}

export async function addCycle(cycle) {
  if (!dataCache) throw new Error("Arquivo não carregado.");
  dataCache.cycles.push(cycle);
  await saveFile();
}

export async function removeCycle(id) {
  if (!dataCache) throw new Error("Arquivo não carregado.");
  dataCache.cycles = dataCache.cycles.filter(c => c.id !== id);
  await saveFile();
}

export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2);
}