
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const carrinhoItens = document.getElementById('carrinhoItens');
  const carrinhoTotal = document.getElementById('carrinhoTotal');
  const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
  const resumoItens = document.getElementById('resumoItens');
  const resumoTotal = document.getElementById('resumoTotal');
  const modalCarrinho = document.getElementById('modalCarrinho');
  const modalPagamento = document.getElementById('modalPagamento');
  const formPagamento = document.getElementById('formPagamento');
  const btnFecharModal = document.querySelectorAll('.close-modal');
  const toast = document.getElementById('toastAdicionado');
  const closeToast = document.querySelector('.close-toast');
  
  // Carrinho de compras
  let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Inicialização
  function init() {
    atualizarContadorCarrinho();
    configurarEventos();
    renderizarCarrinho();
  }
  
  // Abrir o carrinho
  window.abrirCarrinho = function() {
    if (modalCarrinho) {
      modalCarrinho.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Impede o scroll da página
    }
  };
  
  // Fechar o carrinho
  window.fecharModalCarrinho = function() {
    if (modalCarrinho) {
      modalCarrinho.style.display = 'none';
      document.body.style.overflow = ''; // Restaura o scroll da página
    }
  };
  
  // Fechar o modal de pagamento
  window.fecharModalPagamento = function() {
    if (modalPagamento) {
      modalPagamento.style.display = 'none';
      document.body.style.overflow = ''; // Restaura o scroll da página
    }
  };
  
  // Alternar entre os campos de pagamento
  document.querySelectorAll('input[name="forma_pagamento"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const dadosCartao = document.getElementById('dadosCartao');
      const dadosPix = document.getElementById('dadosPix');
      
      if (this.value === 'pix') {
        dadosCartao.style.display = 'none';
        dadosPix.style.display = 'block';
      } else {
        dadosCartao.style.display = 'block';
        dadosPix.style.display = 'none';
      }
    });
  });
  
  // Formatar número do cartão
  window.formatarNumeroCartao = function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value.trim();
  };
  
  // Formatar validade
  window.formatarValidade = function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
  };
  
  // Formatar CPF
  window.formatarCPF = function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 6) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (value.length > 6 && value.length <= 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
    e.target.value = value;
  };
  
  // Copiar chave PIX
  window.copiarChavePix = function(chave) {
    const input = document.createElement('input');
    input.value = chave;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    
    // Mostrar notificação
    mostrarNotificacao('Chave PIX copiada para a área de transferência!');
  };
  
  // Configurar eventos
  function configurarEventos() {
    // Fechar modais
    btnFecharModal.forEach(btn => {
      btn.addEventListener('click', () => {
        modalCarrinho.style.display = 'none';
        modalPagamento.style.display = 'none';
      });
    });
    
    // Fechar ao clicar fora do modal
    window.addEventListener('click', (e) => {
      if (e.target === modalCarrinho) modalCarrinho.style.display = 'none';
      if (e.target === modalPagamento) modalPagamento.style.display = 'none';
    });
    
    // Fechar toast
    if (closeToast) {
      closeToast.addEventListener('click', () => {
        toast.classList.remove('active');
      });
    }
    
    // Formulário de pagamento
    if (formPagamento) {
      formPagamento.addEventListener('submit', finalizarCompra);
    }
    
    // Botão finalizar compra
    if (finalizarCompraBtn) {
      finalizarCompraBtn.addEventListener('click', () => {
        if (carrinho.length === 0) return;
        mostrarResumoPedido();
        modalCarrinho.style.display = 'none';
        modalPagamento.style.display = 'block';
      });
    }
    
    // Formatação de campos
    const numeroCartao = document.getElementById('numeroCartao');
    const validade = document.getElementById('validade');
    
    if (numeroCartao) {
      numeroCartao.addEventListener('input', formatarNumeroCartao);
    }
    
    if (validade) {
      validade.addEventListener('input', formatarValidade);
    }
    
    // Formas de pagamento
    const formasPagamento = document.querySelectorAll('input[name="forma_pagamento"]');
    const camposCartao = document.getElementById('camposCartao');
    const codigoPix = document.getElementById('codigoPix');
    
    // Função para atualizar a exibição dos campos de pagamento
    function atualizarCamposPagamento() {
      const formaSelecionada = document.querySelector('input[name="forma_pagamento"]:checked');
      if (!formaSelecionada) return;
      
      if (camposCartao) {
        camposCartao.style.display = (formaSelecionada.value === 'credito' || formaSelecionada.value === 'debito') ? 'block' : 'none';
      }
      
      if (codigoPix) {
        codigoPix.style.display = formaSelecionada.value === 'pix' ? 'block' : 'none';
      }
    }
    
    // Adicionar evento de mudança para as formas de pagamento
    formasPagamento.forEach(forma => {
      forma.addEventListener('change', atualizarCamposPagamento);
    });
    
    // Inicializar campos de pagamento
    if (formasPagamento.length > 0) {
      atualizarCamposPagamento();
    }
  }
  
  // Formatar número do cartão
  function formatarNumeroCartao(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
  }
  
  // Formatar validade
  function formatarValidade(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
  }
  
  // Atualizar contador do carrinho
  function atualizarContadorCarrinho() {
    const contador = document.querySelector('.cart-count');
    if (contador) {
      const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
      contador.textContent = totalItens;
      contador.style.display = totalItens > 0 ? 'block' : 'none';
    }
  }
  
  // Renderizar carrinho
  function renderizarCarrinho() {
    if (!carrinhoItens) return;
    
    if (carrinho.length === 0) {
      carrinhoItens.innerHTML = '<div class="carrinho-vazio">Seu carrinho está vazio</div>';
      if (carrinhoTotal) carrinhoTotal.textContent = 'R$ 0,00';
      if (finalizarCompraBtn) finalizarCompraBtn.disabled = true;
      return;
    }
    
    let html = '';
    let total = 0;
    
    carrinho.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;
      
      html += `
        <div class="carrinho-item">
          <img src="${item.imagem}" alt="${item.nome}" class="carrinho-item-img">
          <div class="carrinho-item-detalhes">
            <h4>${item.nome}</h4>
            <p class="preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
            <div class="quantidade">
              <button onclick="atualizarQuantidade(${index}, ${item.quantidade - 1})" ${item.quantidade <= 1 ? 'disabled' : ''}>-</button>
              <span>${item.quantidade}</span>
              <button onclick="atualizarQuantidade(${index}, ${item.quantidade + 1})">+</button>
            </div>
          </div>
          <button class="remover-item" onclick="removerItem(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });
    
    carrinhoItens.innerHTML = html;
    if (carrinhoTotal) carrinhoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (finalizarCompraBtn) finalizarCompraBtn.disabled = false;
    
    // Salvar carrinho no localStorage
    salvarCarrinho();
  }
  
  // Mostrar resumo do pedido
  function mostrarResumoPedido() {
    if (!resumoItens || !resumoTotal) return;
    
    let html = '';
    let total = 0;
    
    carrinho.forEach(item => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;
      
      html += `
        <div class="resumo-item">
          <span>${item.quantidade}x ${item.nome}</span>
          <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
      `;
    });
    
    resumoItens.innerHTML = html;
    resumoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
  
  // Atualizar quantidade de um item
  window.atualizarQuantidade = function(index, novaQuantidade) {
    if (novaQuantidade < 1) return;
    
    carrinho[index].quantidade = novaQuantidade;
    renderizarCarrinho();
    atualizarContadorCarrinho();
    
    // Mostrar notificação se a quantidade for reduzida a zero
    if (novaQuantidade === 0) {
      mostrarNotificacao('Item removido do carrinho');
    }
  };
  
  // Mostrar notificação
  function mostrarNotificacao(mensagem, tipo = 'success') {
    if (!toast) return;
    
    const toastContent = `
      <div class="toast-content">
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <div class="message">
          <span class="text">${mensagem}</span>
        </div>
      </div>
      <i class="fa-solid fa-xmark close-toast"></i>
      <div class="progress"></div>
    `;
    
    toast.innerHTML = toastContent;
    toast.className = `toast ${tipo} active`;
    
    // Fechar automaticamente após 3 segundos
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
  
  // Salvar carrinho no localStorage
  function salvarCarrinho() {
    localStorage.setItem('cart', JSON.stringify(carrinho));
  }
  
  // Remover item do carrinho
  window.removerItem = function(index) {
    carrinho.splice(index, 1);
    renderizarCarrinho();
    atualizarContadorCarrinho();
    mostrarNotificacao('Item removido do carrinho');
  };

  // Adicionar item ao carrinho
  window.adicionarAoCarrinho = function(produto) {
    // Garante que o carrinho aceite vários tipos de flor
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      // Adiciona novo tipo de flor ao carrinho
      carrinho.push({
        ...produto,
        quantidade: 1
      });
    }

    renderizarCarrinho();
    atualizarContadorCarrinho();
    mostrarNotificacao(produto.nome ? produto.nome + ' adicionado ao carrinho' : 'Item adicionado ao carrinho');

    // Abrir o carrinho automaticamente
    if (modalCarrinho) {
      modalCarrinho.style.display = 'block';
    }
    // Atualiza o localStorage para persistência entre páginas
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  };

  // Finalizar compra
  window.finalizarCompra = function(e) {
    if (e) e.preventDefault();
    
    // Exibir o modal de pagamento
    if (modalPagamento) {
      // Atualizar resumo do pedido
      mostrarResumoPedido();
      
      // Mostrar o modal
      modalPagamento.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Configurar o formulário de pagamento
      const formPagamento = document.getElementById('formPagamento');
      if (formPagamento) {
        formPagamento.onsubmit = processarPagamento;
      }
    }
  };
  
  // Processar pagamento
  function processarPagamento(e) {
    e.preventDefault();
    
    const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked');
    
    if (!formaPagamento) {
      mostrarNotificacao('Selecione uma forma de pagamento', 'error');
      return;
    }
    
    // Validar dados do cartão se for a forma de pagamento
    if (formaPagamento.value === 'credito' || formaPagamento.value === 'debito') {
      const numeroCartao = document.getElementById('numeroCartao').value.replace(/\s+/g, '');
      const validade = document.getElementById('validade').value;
      const cvv = document.getElementById('cvv').value;
      const nomeTitular = document.getElementById('nomeTitular').value.trim();
      const cpfTitular = document.getElementById('cpfTitular').value.replace(/\D/g, '');
      
      if (numeroCartao.length !== 16) {
        mostrarNotificacao('Número do cartão inválido', 'error');
        return;
      }
      
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
        mostrarNotificacao('Data de validade inválida (use o formato MM/AA)', 'error');
        return;
      }
      
      if (cvv.length < 3) {
        mostrarNotificacao('CVV inválido', 'error');
        return;
      }
      
      if (nomeTitular.length < 3) {
        mostrarNotificacao('Nome do titular inválido', 'error');
        return;
      }
      
      if (cpfTitular.length !== 11) {
        mostrarNotificacao('CPF inválido', 'error');
        return;
      }
    }
    
    // Desabilitar botão de submit
    const submitBtn = document.querySelector('#formPagamento button[type="submit"]');
    if (submitBtn) {
      const btnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
      
      // Simular processamento
      setTimeout(() => {
        // Limpar carrinho
        carrinho = [];
        salvarCarrinho();
        atualizarContadorCarrinho();
        
        // Fechar modais
        if (modalCarrinho) modalCarrinho.style.display = 'none';
        if (modalPagamento) modalPagamento.style.display = 'none';
        
        // Mostrar mensagem de agradecimento
        mostrarMensagemAgradecimento();
        
        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnText;
      }, 2000);
    }
  }
  }
  
  // Mostrar mensagem de agradecimento
  function mostrarMensagemAgradecimento() {
    const mensagem = document.createElement('div');
    mensagem.style.position = 'fixed';
    mensagem.style.top = '0';
    mensagem.style.left = '0';
    mensagem.style.width = '100%';
    mensagem.style.height = '100%';
    mensagem.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    mensagem.style.display = 'flex';
    mensagem.style.justifyContent = 'center';
    mensagem.style.alignItems = 'center';
    mensagem.style.zIndex = '10000';
    
    mensagem.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 90%; width: 400px;">
        <div style="font-size: 4em; color: #4CAF50; margin-bottom: 20px;">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="margin-top: 0; color: #333;">Obrigado pela sua compra!</h2>
        <p style="color: #666; margin-bottom: 25px;">Seu pedido foi recebido com sucesso.</p>
        <p style="color: #666; margin-bottom: 25px;">Você receberá uma confirmação por e-mail em breve.</p>
        <button onclick="window.location.href='index.html'" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.3s;
        ">
          <i class="fas fa-home"></i> Voltar à Página Inicial
        </button>
      </div>
    `;
    
    document.body.appendChild(mensagem);
    document.body.style.overflow = 'hidden';
  }
  
  // Inicializar
  init();
});