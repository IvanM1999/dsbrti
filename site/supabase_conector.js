const DB_KEY_ORCAMENTOS = 'destiny_db_orcamentos';
const DB_KEY_USUARIOS = 'destiny_db_usuarios';
const DB_KEY_CONFIG = 'destiny_db_config';

const SupabaseConnector = {
    config: { url: '', key: '', connected: false },

    init() {
        const savedConfig = localStorage.getItem(DB_KEY_CONFIG);
        if (savedConfig) this.config = JSON.parse(savedConfig);
    },

    saveConfig(url, key) {
        this.config.url = url;
        this.config.key = key;
        this.config.connected = !!(url && key);
        localStorage.setItem(DB_KEY_CONFIG, JSON.stringify(this.config));
        return this.config.connected;
    },

    getOrcamentos() {
        const data = localStorage.getItem(DB_KEY_ORCAMENTOS);
        return data ? JSON.parse(data) : this.getInitialMockData();
    },

    saveOrcamento(orcamento) {
        const list = this.getOrcamentos();
        if (!orcamento.id) {
            orcamento.id = 'ORC-' + Date.now();
            orcamento.dataCriacao = new Date().toISOString();
        }
        list.unshift(orcamento);
        localStorage.setItem(DB_KEY_ORCAMENTOS, JSON.stringify(list));

        if (this.config.connected) {
            this.syncWithSupabase('orcamentos', orcamento);
        }
        return orcamento;
    },

    deleteOrcamento(id) {
        let list = this.getOrcamentos();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(DB_KEY_ORCAMENTOS, JSON.stringify(list));
    },

    async syncWithSupabase(table, record) {
        if (this.config.url && this.config.key) {
            try {
                await fetch(`${this.config.url}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.config.key,
                        'Authorization': `Bearer ${this.config.key}`
                    },
                    body: JSON.stringify(record)
                });
            } catch (err) {
                console.warn('Erro ao sincronizar Supabase:', err);
            }
        }
    },

    getInitialMockData() {
        const mocks = [
            {
                id: 'ORC-1001', cliente: 'João Silva', cpf: '123.456.789-00', whatsapp: '(47) 99999-1111',
                dispositivo: 'iPhone 11', total: 570, status: 'Aprovado', dataCriacao: new Date().toISOString()
            }
        ];
        localStorage.setItem(DB_KEY_ORCAMENTOS, JSON.stringify(mocks));
        return mocks;
    }
};

SupabaseConnector.init();
