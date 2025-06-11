// Carrinho de compras removido para nova implementação.
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para configurar os botões de filtro
function configurarBotoesFiltro() {
  const botoesFiltro = document.querySelectorAll('.btn-group .btn');
  
  botoesFiltro.forEach(botao => {
    // Adicionar evento de clique
    botao.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover a classe active de todos os botões
      botoesFiltro.forEach(b => b.classList.remove('active'));
      
      // Adicionar a classe active ao botão clicado
      this.classList.add('active');
      
      // Aqui você pode adicionar a lógica de filtragem
      const filtro = this.textContent.trim();
      console.log('Filtrando por:', filtro);
      // Adicione a lógica de filtragem aqui
    });
  });
  
  // Ativar o primeiro botão por padrão
  if (botoesFiltro.length > 0) {
    botoesFiltro[0].classList.add('active');
  }
}

// Elementos do DOM
const carrinhoItens = document.getElementById('carrinhoItens');
const carrinhoTotal = document.getElementById('carrinhoTotal');
const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
const resumoPedido = document.getElementById('resumoPedido');
const resumoTotal = document.getElementById('resumoTotal');
let dadosCartao = null;
let formaPagamento = [];
let confirmarPagamentoBtn = null;

// Inicializar elementos após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
  dadosCartao = document.getElementById('dadosCartao');
  formaPagamento = document.querySelectorAll('input[name="formaPagamento"]');
  confirmarPagamentoBtn = document.getElementById('confirmarPagamentoBtn');
  
  // Inicializar outros componentes
  atualizarLinkAtivo();
  if (typeof configurarBotoesFiltro === 'function') {
    configurarBotoesFiltro();
  }
  
  renderizarCarrinho();
  
  // Configurar eventos de forma de pagamento
  if (formaPagamento.length > 0) {
    formaPagamento.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (!dadosCartao) return;
        
        if (e.target.value === 'credito' || e.target.value === 'debito') {
          dadosCartao.classList.remove('d-none');
        } else {
          dadosCartao.classList.add('d-none');
        }
      });
    });
  }
});

// Função para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
  const contador = document.querySelector('.nav-cart .badge');
  if (contador) {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    contador.textContent = totalItens;
    // Mostrar/ocultar o badge baseado na quantidade de itens
    if (totalItens > 0) {
      contador.classList.add('bg-danger');
    } else {
      contador.classList.remove('bg-danger');
    }
  }
  
  if (finalizarCompraBtn) {
    finalizarCompraBtn.disabled = totalItens === 0;
  }
}

// Função para atualizar o link ativo da navegação
function atualizarLinkAtivo() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === '' && linkHref === 'index.html') ||
        (currentPage === 'index.html' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Renderizar itens do carrinho
function renderizarCarrinho() {
  if (!carrinhoItens) return;
  
  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p class="text-muted text-center my-5">Seu carrinho está vazio</p>';
    if (carrinhoTotal) carrinhoTotal.textContent = 'R$ 0,00';
    // Desabilitar botão de finalizar compra se o carrinho estiver vazio
    if (finalizarCompraBtn) {
      finalizarCompraBtn.disabled = true;
      finalizarCompraBtn.classList.add('disabled');
    }
    return;
  }
  
  let html = '';
  let total = 0;
  
  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    
    html += `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-4">
            <img src="${item.imagem}" class="img-fluid rounded-start" alt="${item.nome}">
          </div>
          <div class="col-8">
            <div class="card-body p-2">
              <h6 class="card-title mb-1">${item.nome}</h6>
              <p class="card-text mb-1">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary" onclick="atualizarQuantidade(${index}, ${item.quantidade - 1})">-</button>
                <span class="mx-2">${item.quantidade}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="atualizarQuantidade(${index}, ${item.quantidade + 1})">+</button>
                <button class="btn btn-sm btn-outline-danger ms-auto" onclick="removerItem(${index})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  carrinhoItens.innerHTML = html;
  if (carrinhoTotal) carrinhoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  
  // Habilitar botão de finalizar compra se houver itens
  if (finalizarCompraBtn) {
    finalizarCompraBtn.disabled = false;
    finalizarCompraBtn.classList.remove('disabled');
  }
  
  // Atualizar contador do carrinho
  atualizarContadorCarrinho();
  
  // Salvar carrinho no localStorage
  salvarCarrinho();
}

// Atualizar quantidade de um item
function atualizarQuantidade(index, quantidade) {
  carrinho[index].quantidade += quantidade;
  
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  
  renderizarCarrinho();
}

// Remover item do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  renderizarCarrinho();
}

// Salvar carrinho no localStorage
function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Adicionar ao carrinho (chamado ao clicar em "Comprar" nos produtos)
function adicionarAoCarrinho(produto) {
  const itemExistente = carrinho.find(item => item.id === produto.id);
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }
  
  renderizarCarrinho();
  
  // Mostrar notificação
  const toast = new bootstrap.Toast(document.getElementById('toastAdicionado'));
  toast.show();
}

// Finalizar compra
function configurarFinalizarCompra() {
  const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
  const resumoPedido = document.getElementById('resumoPedido');
  const resumoTotal = document.getElementById('resumoTotal');
  
  if (finalizarCompraBtn) {
    finalizarCompraBtn.addEventListener('click', function() {
      console.log('Botão de finalizar compra clicado');
      // Atualizar resumo do pedido
      if (!resumoPedido || !resumoTotal) {
        console.error('Elementos do resumo não encontrados');
        return;
      }
      
      // Verificar se há itens no carrinho
      if (carrinho.length === 0) {
        alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
        return;
      }
      
      resumoPedido.innerHTML = '';
      let total = 0;
      
      carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between mb-2';
        itemElement.innerHTML = `
          <span>${item.quantidade}x ${item.nome}</span>
          <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        `;
        resumoPedido.appendChild(itemElement);
      });
      
      // Aplicar desconto para PIX
      const formaSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
      if (formaSelecionada && formaSelecionada.value === 'pix') {
        const desconto = total * 0.05; // 5% de desconto
        total -= desconto;
        const descontoElement = document.createElement('div');
        descontoElement.className = 'd-flex justify-content-between text-success mt-2';
        descontoElement.innerHTML = `
          <span>Desconto PIX (5%)</span>
          <span>-R$ ${desconto.toFixed(2).replace('.', ',')}</span>
        `;
        resumoPedido.appendChild(descontoElement);
      }
      
      resumoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
      
      // Mostrar modal de pagamento
      const modalElement = document.getElementById('modalPagamento');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Modal de pagamento não encontrado');
      }
    });
  }
}

// Chamar a função de configuração quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  configurarFinalizarCompra();
});

// A lógica de mostrar/ocultar campos do cartão foi movida para o evento DOMContentLoaded

// Configurar evento do botão de confirmar pagamento
function configurarConfirmacaoPagamento() {
  const confirmarPagamentoBtn = document.getElementById('confirmarPagamentoBtn');
  const dadosCartao = document.getElementById('dadosCartao');
  
  if (confirmarPagamentoBtn) {
    confirmarPagamentoBtn.addEventListener('click', function() {
      // Validar forma de pagamento selecionada
      const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
      
      if (!formaPagamentoSelecionada) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
      }
      
      // Se for cartão, validar dados do cartão
      if ((formaPagamentoSelecionada.value === 'credito' || formaPagamentoSelecionada.value === 'debito') && dadosCartao) {
        const numeroCartao = document.getElementById('numeroCartao')?.value || '';
        const nomeTitular = document.getElementById('nomeTitular')?.value || '';
        const validade = document.getElementById('validade')?.value || '';
        const cvv = document.getElementById('cvv')?.value || '';
        
        if (!numeroCartao || !nomeTitular || !validade || !cvv) {
          alert('Por favor, preencha todos os dados do cartão.');
          return;
        }
        
        // Validar formato do número do cartão (apenas dígitos, 13 a 16 dígitos)
        if (!/^\d{13,16}$/.test(numeroCartao.replace(/\s+/g, ''))) {
          alert('Número do cartão inválido. Deve conter entre 13 e 16 dígitos.');
          return;
        }
        
        // Validar data de validade (MM/AA)
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(validade)) {
          alert('Data de validade inválida. Use o formato MM/AA.');
          return;
        }
        
        // Validar CVV (3 ou 4 dígitos)
        if (!/^\d{3,4}$/.test(cvv)) {
          alert('CVV inválido. Deve conter 3 ou 4 dígitos.');
          return;
        }
      }
      
      // Exibir mensagem de sucesso personalizada
      const mensagemSucesso = `
        <div class="text-center p-4">
          <i class="fas fa-check-circle text-success display-4 mb-3"></i>
          <h3 class="text-success">Compra Finalizada com Sucesso!</h3>
          <p class="lead">Suas flores já estão sendo preparadas com muito carinho para o envio.</p>
          <p>Obrigado por comprar na nossa floricultura! 💐</p>
          <p class="small text-muted">Um e-mail de confirmação foi enviado para você.</p>
        </div>
      `;
      
      // Substituir conteúdo do modal pela mensagem de sucesso
      const modalBody = document.querySelector('#modalPagamento .modal-body');
      if (modalBody) {
        modalBody.innerHTML = mensagemSucesso;
        
        // Atualizar botão de fechar
        const footerModal = document.querySelector('#modalPagamento .modal-footer');
        if (footerModal) {
          footerModal.innerHTML = `
            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
              <i class="fas fa-check me-2"></i>Entendido
            </button>
          `;
        }
        
        // Limpar carrinho após 3 segundos
        setTimeout(() => {
          carrinho = [];
          if (typeof salvarCarrinho === 'function') salvarCarrinho();
          if (typeof renderizarCarrinho === 'function') renderizarCarrinho();
          if (typeof atualizarContadorCarrinho === 'function') atualizarContadorCarrinho();
          
          // Fechar modal após 5 segundos
          setTimeout(() => {
            const modalElement = document.getElementById('modalPagamento');
            if (modalElement) {
              const modal = bootstrap.Modal.getInstance(modalElement);
              if (modal) modal.hide();
              
              // Recarregar o conteúdo original do modal após fechar
              setTimeout(() => {
                location.reload();
              }, 500);
            }
          }, 5000);
        }, 3000);
      }
    });
  }
}

// Chamar as funções de configuração quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  configurarFinalizarCompra();
  configurarConfirmacaoPagamento();
  
  // Configurar eventos para mostrar/ocultar campos do cartão
  const formaPagamentoCartao = document.getElementById('formaCartao');
  const formaPagamentoPix = document.getElementById('formaPix');
  const dadosCartao = document.getElementById('dadosCartao');
  
  if (formaPagamentoCartao && formaPagamentoPix && dadosCartao) {
    // Mostrar campos do cartão se cartão de crédito/débito estiver selecionado
    function atualizarCamposPagamento() {
      if (formaPagamentoCartao.checked) {
        dadosCartao.style.display = 'block';
      } else if (formaPagamentoPix.checked) {
        dadosCartao.style.display = 'none';
      }
    }
    
    // Adicionar eventos de mudança
    formaPagamentoCartao.addEventListener('change', atualizarCamposPagamento);
    formaPagamentoPix.addEventListener('change', atualizarCamposPagamento);
    
    // Inicializar estado
    atualizarCamposPagamento();
  }
});

// A função de inicialização foi movida para junto da declaração dos elementos do DOM

// Exemplo de como adicionar um produto (substitua pelos seus produtos reais)
/*
const produtoExemplo = {
  id: 1,
  nome: 'Rosa Vermelha',
  preco: 29.90,
  imagem: 'imagens/arranjo-rosas-vermelhas.jpg'
};

// Chamar assim para adicionar ao carrinho:
// adicionarAoCarrinho(produtoExemplo);
*/

// Funções de interação do site

// Animação de scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Formulário de contato
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simula envio do formulário
        const formData = new FormData(this);
        console.log('Dados do formulário:', Object.fromEntries(formData));
        
        // Exibe mensagem de sucesso
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.reset();
    });
}

// Efeito de hover nos cards de produtos
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Animação de carrossel automático
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Navegação numérica do carrossel
document.addEventListener('DOMContentLoaded', function() {
  const carouselNavLinks = document.querySelectorAll('.flex-control-paging a');
  
  if (carouselNavLinks.length > 0) {
    // Adiciona evento de clique para cada link de navegação
    carouselNavLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove a classe ativa de todos os links
        carouselNavLinks.forEach(item => {
          item.classList.remove('flex-active');
        });
        
        // Adiciona a classe ativa ao link clicado
        this.classList.add('flex-active');
        
        // Obtém o alvo do carrossel e o índice do slide
        const target = this.getAttribute('data-bs-target');
        const slideIndex = parseInt(this.getAttribute('data-bs-slide-to'));
        
        // Ativa o slide correspondente
        if (target) {
          const carousel = document.querySelector(target);
          if (carousel) {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) {
              bsCarousel.to(slideIndex);
            }
          }
        }
      });
    });
    
    // Atualiza a navegação quando o slide mudar
    document.querySelectorAll('.carousel').forEach(carousel => {
      carousel.addEventListener('slid.bs.carousel', function (e) {
        const navLinks = this.querySelectorAll('.flex-control-paging a');
        
        navLinks.forEach((link, index) => {
          if (index === e.to) {
            link.classList.add('flex-active');
          } else {
            link.classList.remove('flex-active');
          }
        });
      });
    });
  }
});

// Avança o carrossel a cada 5 segundos
setInterval(nextSlide, 5000);

// Efeito de fade in ao rolar a página
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});

// Efeito de carregamento da página
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Função para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Adicionar validação ao formulário de contato
if (contactForm) {
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
}