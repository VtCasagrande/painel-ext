const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Listar todas as recorrências
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recorrencias')
      .select(`
        *,
        cliente:cliente_id(id, nome, cpf, telefone)
      `)
      .order('proxima_compra', { ascending: true });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar recorrências:', error);
    res.status(500).json({ error: 'Erro ao listar recorrências' });
  }
});

// Buscar recorrência por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('recorrencias')
      .select(`
        *,
        cliente:cliente_id(id, nome, cpf, telefone)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recorrência não encontrada' });
      }
      throw error;
    }
    
    // Buscar produtos da recorrência
    const { data: produtos, error: produtosError } = await supabase
      .from('recorrencia_produtos')
      .select(`
        *,
        produto:produto_id(id, codigo, nome, descricao, preco)
      `)
      .eq('recorrencia_id', id);
      
    if (produtosError) throw produtosError;
    
    const recorrenciaCompleta = {
      ...data,
      produtos: produtos
    };
    
    res.json(recorrenciaCompleta);
  } catch (error) {
    console.error('Erro ao buscar recorrência:', error);
    res.status(500).json({ error: 'Erro ao buscar recorrência' });
  }
});

// Buscar recorrências por cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    const { data, error } = await supabase
      .from('recorrencias')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('proxima_compra', { ascending: true });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar recorrências do cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar recorrências do cliente' });
  }
});

// Criar recorrência
router.post('/', async (req, res) => {
  try {
    const { 
      cliente_id, 
      intervalo_dias, 
      ultima_compra, 
      proxima_compra, 
      status, 
      observacoes,
      produtos
    } = req.body;
    
    // Validações básicas
    if (!cliente_id || !intervalo_dias || !ultima_compra || !produtos || produtos.length === 0) {
      return res.status(400).json({ 
        error: 'Cliente, intervalo de dias, data da última compra e produtos são obrigatórios' 
      });
    }
    
    // Calcular valor total
    let valor_total = 0;
    produtos.forEach(produto => {
      valor_total += produto.quantidade * produto.preco_unitario;
    });
    
    // Iniciar transação
    const { data: recorrencia, error: recorrenciaError } = await supabase
      .from('recorrencias')
      .insert([
        { 
          cliente_id, 
          intervalo_dias, 
          ultima_compra, 
          proxima_compra: proxima_compra || calcularProximaCompra(ultima_compra, intervalo_dias), 
          status: status || 'ativa',
          valor_total,
          observacoes,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
      
    if (recorrenciaError) throw recorrenciaError;
    
    // Inserir produtos da recorrência
    const produtosFormatados = produtos.map(produto => ({
      recorrencia_id: recorrencia.id,
      produto_id: produto.produto_id,
      quantidade: produto.quantidade,
      preco_unitario: produto.preco_unitario,
      subtotal: produto.quantidade * produto.preco_unitario,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    const { error: produtosError } = await supabase
      .from('recorrencia_produtos')
      .insert(produtosFormatados);
      
    if (produtosError) throw produtosError;
    
    // Registrar no histórico de compras
    const { error: historicoError } = await supabase
      .from('historico_compras')
      .insert([
        {
          recorrencia_id: recorrencia.id,
          data: ultima_compra,
          valor: valor_total,
          status: 'realizada',
          observacoes: 'Primeira compra registrada',
          created_at: new Date()
        }
      ]);
      
    if (historicoError) throw historicoError;
    
    // Buscar a recorrência completa para retornar
    const { data: recorrenciaCompleta, error: buscaError } = await supabase
      .from('recorrencias')
      .select(`
        *,
        cliente:cliente_id(id, nome, cpf, telefone)
      `)
      .eq('id', recorrencia.id)
      .single();
      
    if (buscaError) throw buscaError;
    
    // Buscar produtos da recorrência
    const { data: produtosInseridos, error: buscaProdutosError } = await supabase
      .from('recorrencia_produtos')
      .select(`
        *,
        produto:produto_id(id, codigo, nome, descricao, preco)
      `)
      .eq('recorrencia_id', recorrencia.id);
      
    if (buscaProdutosError) throw buscaProdutosError;
    
    const resultado = {
      ...recorrenciaCompleta,
      produtos: produtosInseridos
    };
    
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Erro ao criar recorrência:', error);
    res.status(500).json({ error: 'Erro ao criar recorrência' });
  }
});

// Atualizar recorrência
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      cliente_id, 
      intervalo_dias, 
      ultima_compra, 
      proxima_compra, 
      status, 
      observacoes,
      produtos
    } = req.body;
    
    // Validações básicas
    if (!cliente_id || !intervalo_dias || !ultima_compra) {
      return res.status(400).json({ 
        error: 'Cliente, intervalo de dias e data da última compra são obrigatórios' 
      });
    }
    
    // Calcular valor total (se houver produtos)
    let valor_total = 0;
    if (produtos && produtos.length > 0) {
      produtos.forEach(produto => {
        valor_total += produto.quantidade * produto.preco_unitario;
      });
    } else {
      // Buscar valor total atual se não houver produtos
      const { data: recorrenciaAtual, error: buscaError } = await supabase
        .from('recorrencias')
        .select('valor_total')
        .eq('id', id)
        .single();
        
      if (buscaError) throw buscaError;
      valor_total = recorrenciaAtual.valor_total;
    }
    
    // Atualizar recorrência
    const { data: recorrencia, error: recorrenciaError } = await supabase
      .from('recorrencias')
      .update({ 
        cliente_id, 
        intervalo_dias, 
        ultima_compra, 
        proxima_compra: proxima_compra || calcularProximaCompra(ultima_compra, intervalo_dias), 
        status: status || 'ativa',
        valor_total,
        observacoes,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (recorrenciaError) {
      if (recorrenciaError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recorrência não encontrada' });
      }
      throw recorrenciaError;
    }
    
    // Atualizar produtos se fornecidos
    if (produtos && produtos.length > 0) {
      // Remover produtos existentes
      const { error: deleteError } = await supabase
        .from('recorrencia_produtos')
        .delete()
        .eq('recorrencia_id', id);
        
      if (deleteError) throw deleteError;
      
      // Inserir novos produtos
      const produtosFormatados = produtos.map(produto => ({
        recorrencia_id: id,
        produto_id: produto.produto_id,
        quantidade: produto.quantidade,
        preco_unitario: produto.preco_unitario,
        subtotal: produto.quantidade * produto.preco_unitario,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const { error: produtosError } = await supabase
        .from('recorrencia_produtos')
        .insert(produtosFormatados);
        
      if (produtosError) throw produtosError;
    }
    
    // Buscar a recorrência completa para retornar
    const { data: recorrenciaCompleta, error: buscaError } = await supabase
      .from('recorrencias')
      .select(`
        *,
        cliente:cliente_id(id, nome, cpf, telefone)
      `)
      .eq('id', id)
      .single();
      
    if (buscaError) throw buscaError;
    
    // Buscar produtos da recorrência
    const { data: produtosAtualizados, error: buscaProdutosError } = await supabase
      .from('recorrencia_produtos')
      .select(`
        *,
        produto:produto_id(id, codigo, nome, descricao, preco)
      `)
      .eq('recorrencia_id', id);
      
    if (buscaProdutosError) throw buscaProdutosError;
    
    const resultado = {
      ...recorrenciaCompleta,
      produtos: produtosAtualizados
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar recorrência:', error);
    res.status(500).json({ error: 'Erro ao atualizar recorrência' });
  }
});

// Registrar nova compra para uma recorrência
router.post('/:id/registrar-compra', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_compra, valor, observacoes } = req.body;
    
    // Validações básicas
    if (!data_compra) {
      return res.status(400).json({ error: 'Data da compra é obrigatória' });
    }
    
    // Buscar recorrência
    const { data: recorrencia, error: recorrenciaError } = await supabase
      .from('recorrencias')
      .select('*')
      .eq('id', id)
      .single();
      
    if (recorrenciaError) {
      if (recorrenciaError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recorrência não encontrada' });
      }
      throw recorrenciaError;
    }
    
    // Calcular próxima compra
    const proxima_compra = calcularProximaCompra(data_compra, recorrencia.intervalo_dias);
    
    // Atualizar recorrência
    const { error: updateError } = await supabase
      .from('recorrencias')
      .update({ 
        ultima_compra: data_compra, 
        proxima_compra,
        updated_at: new Date()
      })
      .eq('id', id);
      
    if (updateError) throw updateError;
    
    // Registrar no histórico de compras
    const { data: historicoCompra, error: historicoError } = await supabase
      .from('historico_compras')
      .insert([
        {
          recorrencia_id: id,
          data: data_compra,
          valor: valor || recorrencia.valor_total,
          status: 'realizada',
          observacoes,
          created_at: new Date()
        }
      ])
      .select()
      .single();
      
    if (historicoError) throw historicoError;
    
    // Buscar a recorrência atualizada
    const { data: recorrenciaAtualizada, error: buscaError } = await supabase
      .from('recorrencias')
      .select(`
        *,
        cliente:cliente_id(id, nome, cpf, telefone)
      `)
      .eq('id', id)
      .single();
      
    if (buscaError) throw buscaError;
    
    const resultado = {
      recorrencia: recorrenciaAtualizada,
      compra: historicoCompra
    };
    
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Erro ao registrar compra:', error);
    res.status(500).json({ error: 'Erro ao registrar compra' });
  }
});

// Excluir recorrência
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Excluir produtos da recorrência
    const { error: produtosError } = await supabase
      .from('recorrencia_produtos')
      .delete()
      .eq('recorrencia_id', id);
      
    if (produtosError) throw produtosError;
    
    // Excluir histórico de compras
    const { error: historicoError } = await supabase
      .from('historico_compras')
      .delete()
      .eq('recorrencia_id', id);
      
    if (historicoError) throw historicoError;
    
    // Excluir recorrência
    const { error } = await supabase
      .from('recorrencias')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir recorrência:', error);
    res.status(500).json({ error: 'Erro ao excluir recorrência' });
  }
});

// Listar histórico de compras de uma recorrência
router.get('/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('historico_compras')
      .select('*')
      .eq('recorrencia_id', id)
      .order('data', { ascending: false });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar histórico de compras:', error);
    res.status(500).json({ error: 'Erro ao listar histórico de compras' });
  }
});

// Função para calcular próxima data de compra
function calcularProximaCompra(dataUltimaCompra, intervaloDias) {
  const data = new Date(dataUltimaCompra);
  data.setDate(data.getDate() + parseInt(intervaloDias));
  return data.toISOString().split('T')[0];
}

module.exports = router; 