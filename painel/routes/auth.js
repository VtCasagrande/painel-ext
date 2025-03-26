const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Simulação de autenticação simples para fins de demonstração
    // Em produção, deve-se implementar autenticação adequada via Supabase Auth
    if (email === 'admin@nmalls.com' && senha === 'senha123') {
      const token = jwt.sign(
        { id: 1, email, role: 'admin' },
        process.env.JWT_SECRET || 'secret_temporario',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      return res.json({ token });
    }
    
    return res.status(401).json({ error: 'Credenciais inválidas' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no processo de login' });
  }
});

// Verificar token
router.get('/verificar', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'secret_temporario', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
      
      res.json({ 
        valido: true, 
        usuario: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        } 
      });
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: 'Erro ao verificar token' });
  }
});

module.exports = router; 