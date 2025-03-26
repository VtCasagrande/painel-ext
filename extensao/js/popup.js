document.addEventListener('DOMContentLoaded', () => {
  const cpfInput = document.getElementById('cpf');
  const consultarBtn = document.getElementById('consultar');
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const clientInfo = document.getElementById('client-info');
  const clientDetails = document.getElementById('client-details');
  const abrirPainelBtn = document.getElementById('abrir-painel');
  
  // Formatação de CPF
  cpfInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{3})$/, '$1.$2');
    }
    
    e.target.value = value;
  });
  
  // Configurar URL do painel web
  const painelUrl = 'http://localhost:3000';
  abrirPainelBtn.href = painelUrl;
  
  // Consultar cliente por CPF
  consultarBtn.addEventListener('click', async () => {
    const cpf = cpfInput.value.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
      showError('CPF inválido. Informe os 11 dígitos.');
      return;
    }
    
    try {
      showLoading();
      
      const response = await fetch(`${painelUrl}/api/clientes/cpf/${cpf}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          showError('Cliente não encontrado. Deseja cadastrá-lo no painel?');
          
          // Adicionar link para cadastro
          errorMessage.innerHTML += `<br><a href="${painelUrl}/novo-cliente?cpf=${cpf}" target="_blank">Cadastrar novo cliente</a>`;
        } else {
          showError('Erro ao consultar cliente. Tente novamente.');
        }
        return;
      }
      
      const cliente = await response.json();
      
      // Buscar recorrências do cliente
      const recorrenciasResponse = await fetch(`${painelUrl}/api/recorrencias/cliente/${cliente.id}`);
      let recorrencias = [];
      
      if (recorrenciasResponse.ok) {
        recorrencias = await recorrenciasResponse.json();
      }
      
      displayClientInfo(cliente, recorrencias);
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro de conexão. Verifique se o painel web está ativo.');
    }
  });
  
  function showLoading() {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    clientInfo.classList.add('hidden');
  }
  
  function showError(message) {
    loading.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    clientInfo.classList.add('hidden');
    errorMessage.textContent = message;
  }
  
  function displayClientInfo(cliente, recorrencias) {
    loading.classList.add('hidden');
    errorMessage.classList.add('hidden');
    clientInfo.classList.remove('hidden');
    
    let html = `
      <p><strong>Nome:</strong> ${cliente.nome}</p>
      <p><strong>CPF:</strong> ${formatCPF(cliente.cpf)}</p>
      <p><strong>Telefone:</strong> ${formatPhone(cliente.telefone)}</p>
    `;
    
    if (recorrencias.length > 0) {
      html += '<h3>Recorrências:</h3><ul>';
      
      recorrencias.forEach(rec => {
        const proximaCompra = new Date(rec.proxima_compra);
        const dataFormatada = proximaCompra.toLocaleDateString('pt-BR');
        
        html += `
          <li>
            <p>Próxima compra: <strong>${dataFormatada}</strong></p>
            <p>Intervalo: ${rec.intervalo_dias} dias</p>
            <p>Valor: R$ ${rec.valor_total.toFixed(2)}</p>
            <a href="${painelUrl}/recorrencia/${rec.id}" target="_blank">Ver detalhes</a>
          </li>
        `;
      });
      
      html += '</ul>';
    } else {
      html += `
        <p>Sem recorrências cadastradas.</p>
        <a href="${painelUrl}/nova-recorrencia?cliente=${cliente.id}" target="_blank">Cadastrar recorrência</a>
      `;
    }
    
    clientDetails.innerHTML = html;
  }
  
  function formatCPF(cpf) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  
  function formatPhone(phone) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
}); 