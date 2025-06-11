// Menu Mobile
document.addEventListener('DOMContentLoaded', function() {
  // Criar botão do menu mobile
  const header = document.querySelector('.header .container');
  const menuToggle = document.createElement('div');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  header.appendChild(menuToggle);
  
  // Toggle do menu
  const navMenu = document.querySelector('.nav-menu');
  menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });
  
  // Fechar menu ao clicar em um link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Carrossel
  let currentSlide = 0;
  let isAnimating = false;
  const carousel = document.querySelector('.carousel-container');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = slides.length;
  const animationDuration = 800; // ms
  
  // Inicializar acessibilidade
  if (carousel) {
    // Adiciona role="region" e aria-label ao carrossel
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Carrossel de destaques');
    
    // Adiciona atributos ARIA aos slides
    slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${index + 1} de ${totalSlides}`);
      if (index !== 0) {
        slide.setAttribute('aria-hidden', 'true');
        slide.setAttribute('tabindex', '-1');
      } else {
        slide.setAttribute('aria-hidden', 'false');
      }
    });
    
    // Adiciona atributos ARIA aos dots
    dots.forEach((dot, index) => {
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
      dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    });
    
    // Adiciona atributos ARIA aos botões de navegação
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn && nextBtn) {
      prevBtn.setAttribute('aria-label', 'Slide anterior');
      nextBtn.setAttribute('aria-label', 'Próximo slide');
    }
  }
  
  // Inicializar primeiro slide
  showSlide(currentSlide, false);
  
  // Navegação por dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAnimating && index !== currentSlide) {
        showSlide(index);
        resetTimer();
      }
    });
  });
  
  // Botões de navegação
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAnimating) {
        showSlide(currentSlide - 1);
        resetTimer();
      }
    });
    
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAnimating) {
        showSlide(currentSlide + 1);
        resetTimer();
      }
    });
  }
  
  // Navegação por teclado
  document.addEventListener('keydown', (e) => {
    // Só processa se o foco estiver dentro do carrossel
    if (!carousel.contains(document.activeElement) && document.activeElement !== carousel) {
      return;
    }
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (!isAnimating) {
          showSlide(currentSlide - 1);
          resetTimer();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (!isAnimating) {
          showSlide(currentSlide + 1);
          resetTimer();
        }
        break;
        
      case 'Home':
        e.preventDefault();
        if (!isAnimating && currentSlide !== 0) {
          showSlide(0);
          resetTimer();
        }
        break;
        
      case 'End':
        e.preventDefault();
        if (!isAnimating && currentSlide !== totalSlides - 1) {
          showSlide(totalSlides - 1);
          resetTimer();
        }
        break;
        
      case ' ':
      case 'Enter':
        // Permite ativação de links dentro do slide
        if (document.activeElement === slides[currentSlide]) {
          e.preventDefault();
          const link = slides[currentSlide].querySelector('a');
          if (link) {
            link.click();
          }
        }
        break;
    }
  });
  
  // Função para mostrar slide específico
  function showSlide(index, animate = true) {
    // Se já está animando, não faz nada
    if (isAnimating) return;
    
    // Atualiza o índice do slide atual
    const prevSlide = currentSlide;
    currentSlide = (index + totalSlides) % totalSlides;
    
    // Se for o mesmo slide, não faz nada
    if (prevSlide === currentSlide) return;
    
    isAnimating = true;
    
    // Remove a classe active e atualiza atributos ARIA do slide atual
    slides[prevSlide].classList.remove('active');
    slides[prevSlide].setAttribute('aria-hidden', 'true');
    slides[prevSlide].setAttribute('tabindex', '-1');
    dots[prevSlide].classList.remove('active');
    dots[prevSlide].setAttribute('aria-pressed', 'false');
    
    // Adiciona a classe active e atualiza atributos ARIA do novo slide
    const currentSlideElement = slides[currentSlide];
    currentSlideElement.classList.add('active');
    currentSlideElement.setAttribute('aria-hidden', 'false');
    currentSlideElement.removeAttribute('tabindex');
    
    // Atualiza os dots
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-pressed', 'true');
    
    // Foca no slide atual para leitores de tela
    currentSlideElement.focus();
    
    // Se não for para animar, retorna imediatamente
    if (!animate) {
      isAnimating = false;
      return;
    }
    
    // Aguarda o término da animação
    setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  }
  
  // Troca automática de slides
  let slideInterval = setInterval(nextSlide, 5000);
  
  function nextSlide() {
    if (!isAnimating) {
      showSlide(currentSlide + 1);
    }
  }
  
  function resetTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  // Pausar carrossel ao interagir
  if (carousel) {
    // Pausa ao passar o mouse
    carousel.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });
    
    // Retoma ao remover o mouse
    carousel.addEventListener('mouseleave', () => {
      resetTimer();
    });
    
    // Pausa ao tocar em dispositivos touch
    carousel.addEventListener('touchstart', () => {
      clearInterval(slideInterval);
    });
    
    // Permite navegar arrastando em dispositivos touch
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50; // Mínimo de pixels para considerar um swipe
      
      if (touchEndX < touchStartX - swipeThreshold && !isAnimating) {
        // Swipe para a esquerda - próximo slide
        showSlide(currentSlide + 1);
        resetTimer();
      } else if (touchEndX > touchStartX + swipeThreshold && !isAnimating) {
        // Swipe para a direita - slide anterior
        showSlide(currentSlide - 1);
        resetTimer();
      }
    }
  }
  
  // Animação ao rolar a página
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('animate');
      }
    });
  };
  
  // Adiciona evento de scroll
  window.addEventListener('scroll', animateOnScroll);
  
  // Executa uma vez ao carregar a página
  animateOnScroll();
});

// Função para adicionar itens ao carrinho
function adicionarAoCarrinho(produto) {
  // Verifica se já existe um carrinho no localStorage
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  
  // Verifica se o produto já está no carrinho
  const produtoExistente = carrinho.find(item => item.id === produto.id);
  
  if (produtoExistente) {
    // Se o produto já existe, incrementa a quantidade
    produtoExistente.quantidade += 1;
  } else {
    // Se não existe, adiciona o produto ao carrinho
    produto.quantidade = 1;
    carrinho.push(produto);
  }
  
  // Atualiza o carrinho no localStorage
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  
  // Atualiza o contador do carrinho
  atualizarContadorCarrinho();
  
  // Exibe mensagem de sucesso
  exibirNotificacao('Produto adicionado ao carrinho!');
}

// Função para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  
  const contador = document.querySelector('.cart-count');
  if (contador) {
    contador.textContent = totalItens;
    contador.style.display = totalItens > 0 ? 'flex' : 'none';
  }
}

// Função para exibir notificações
function exibirNotificacao(mensagem) {
  // Cria o elemento da notificação
  const notificacao = document.createElement('div');
  notificacao.className = 'notificacao';
  notificacao.textContent = mensagem;
  
  // Adiciona a notificação ao corpo do documento
  document.body.appendChild(notificacao);
  
  // Adiciona a classe para animar a entrada
  setTimeout(() => {
    notificacao.classList.add('show');
  }, 100);
  
  // Remove a notificação após 3 segundos
  setTimeout(() => {
    notificacao.classList.remove('show');
    
    // Remove o elemento após a animação de saída
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, 3000);
}

// Inicializa o contador do carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  atualizarContadorCarrinho();
});
