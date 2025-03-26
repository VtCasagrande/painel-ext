const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Buscar cliente por CPF
router.get('/cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    const cpfNumerico = cpf.replace(/\D/g, '');
    
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('cpf', cpfNumerico)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente por CPF' });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, telefone, email, observacoes } = req.body;
    
    // Validações básicas
    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }
    
    const cpfNumerico = cpf.replace(/\D/g, '');
    
    // Verificar se CPF já existe
    const { data: existingCliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('cpf', cpfNumerico)
      .single();
      
    if (existingCliente) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([
        { 
          nome, 
          cpf: cpfNumerico, 
          telefone, 
          email, 
          observacoes,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, email, observacoes } = req.body;
    
    // Validações básicas
    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }
    
    const cpfNumerico = cpf.replace(/\D/g, '');
    
    // Verificar se CPF já existe (exceto para o cliente atual)
    const { data: existingCliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('cpf', cpfNumerico)
      .neq('id', id)
      .single();
      
    if (existingCliente) {
      return res.status(400).json({ error: 'CPF já cadastrado para outro cliente' });
    }
    
    const { data, error } = await supabase
      .from('clientes')
      .update({ 
        nome, 
        cpf: cpfNumerico, 
        telefone, 
        email, 
        observacoes,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem recorrências associadas
    const { data: recorrencias, error: recorrenciasError } = await supabase
      .from('recorrencias')
      .select('id')
      .eq('cliente_id', id);
      
    if (recorrenciasError) throw recorrenciasError;
    
    if (recorrencias.length > 0) {
      return res.status(400).json({ 
        error: 'Cliente possui recorrências associadas. Exclua as recorrências primeiro.' 
      });
    }
    
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

module.exports = router; 