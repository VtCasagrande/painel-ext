const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Buscar produto por código EAN
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo', codigo)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar produto por código:', error);
    res.status(500).json({ error: 'Erro ao buscar produto por código' });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  try {
    const { codigo, nome, descricao, preco } = req.body;
    
    // Validações básicas
    if (!codigo || !nome || !preco) {
      return res.status(400).json({ error: 'Código, nome e preço são obrigatórios' });
    }
    
    // Verificar se código já existe
    const { data: existingProduto } = await supabase
      .from('produtos')
      .select('id')
      .eq('codigo', codigo)
      .single();
      
    if (existingProduto) {
      return res.status(400).json({ error: 'Código já cadastrado' });
    }
    
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        { 
          codigo, 
          nome, 
          descricao, 
          preco,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nome, descricao, preco } = req.body;
    
    // Validações básicas
    if (!codigo || !nome || !preco) {
      return res.status(400).json({ error: 'Código, nome e preço são obrigatórios' });
    }
    
    // Verificar se código já existe (exceto para o produto atual)
    const { data: existingProduto } = await supabase
      .from('produtos')
      .select('id')
      .eq('codigo', codigo)
      .neq('id', id)
      .single();
      
    if (existingProduto) {
      return res.status(400).json({ error: 'Código já cadastrado para outro produto' });
    }
    
    const { data, error } = await supabase
      .from('produtos')
      .update({ 
        codigo, 
        nome, 
        descricao, 
        preco,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem recorrências associadas
    const { data: recorrenciaProdutos, error: recorrenciaError } = await supabase
      .from('recorrencia_produtos')
      .select('id')
      .eq('produto_id', id);
      
    if (recorrenciaError) throw recorrenciaError;
    
    if (recorrenciaProdutos.length > 0) {
      return res.status(400).json({ 
        error: 'Produto possui recorrências associadas. Não é possível excluir.' 
      });
    }
    
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

// Busca de produtos
router.get('/busca/:termo', async (req, res) => {
  try {
    const { termo } = req.params;
    
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .or(`codigo.ilike.%${termo}%,nome.ilike.%${termo}%,descricao.ilike.%${termo}%`)
      .order('nome', { ascending: true });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

module.exports = router; 