/* ============================================================
   auth.js
   DestinyServices OS
   Autenticação Local (Corrigido e Otimizado)
   ============================================================ */

"use strict";

const Auth = (() => {
    
    const SESSION_KEY = "ds_session";
    
    async function login(username, password) {
        
        const users = (await Storage.getAll("users")) || [];
        
        const user = users.find(item => item.username === username);
        
        if (!user) {
            
            throw new Error("Usuário não encontrado.");
            
        }
        
        const hash = await hashPassword(password);
        
        if (hash !== user.password) {
            
            throw new Error("Senha inválida.");
            
        }
        
        const sessionData = {
            
            id: user.id,
            
            username: user.username,
            
            name: user.name,
            
            loginAt: Utils.now(),
            
            token: crypto.randomUUID()
            
        };
        
        sessionStorage.setItem(
            
            SESSION_KEY,
            
            JSON.stringify(sessionData)
            
        );
        
        return sessionData;
        
    }
    
    async function register(data) {
        
        const users = (await Storage.getAll("users")) || [];
        
        const exists = users.some(user => user.username === data.username);
        
        if (exists) {
            
            throw new Error("Usuário já existe.");
            
        }
        
        const user = {
            
            id: Utils.uuid(),
            
            username: data.username,
            
            name: data.name,
            
            password: await hashPassword(data.password),
            
            createdAt: Utils.now()
            
        };
        
        await Storage.save("users", user);
        
        return user;
        
    }
    
    function logout() {
        
        sessionStorage.removeItem(SESSION_KEY);
        
        location.reload();
        
    }
    
    function session() {
        
        const data = sessionStorage.getItem(SESSION_KEY);
        
        if (!data) {
            
            return null;
            
        }
        
        try {
            
            return JSON.parse(data);
            
        } catch (error) {
            
            sessionStorage.removeItem(SESSION_KEY);
            
            return null;
            
        }
        
    }
    
    function logged() {
        
        return session() !== null;
        
    }
    
    async function hashPassword(password) {
        
        const encoder = new TextEncoder();
        
        const buffer = encoder.encode(password);
        
        const hash = await crypto.subtle.digest("SHA-256", buffer);
        
        return Array.from(new Uint8Array(hash))
            
            .map(byte => byte.toString(16).padStart(2, "0"))
            
            .join("");
        
    }
    
    return {
        
        login,
        
        register,
        
        logout,
        
        session,
        
        logged
        
    };
    
})();
