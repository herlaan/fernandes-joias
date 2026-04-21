import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, User, ShoppingBag, ArrowUpRight, Star, Instagram, Facebook, Twitter } from 'lucide-react';

/**
 * Hook customizado de cursor com controle de performance (requestAnimationFrame)
 * e prevenção de execução em dispositivos móveis (touch/coarse pointers).
 */
function useCustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desativa o cursor customizado em dispositivos mobile para poupar processamento
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      animationFrameId = requestAnimationFrame(() => {
        if (dotRef.current && ringRef.current) {
          dotRef.current.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
          ringRef.current.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { dotRef, ringRef };
}

/**
 * Hook para gerenciar as animações on-scroll vinculando uma API nativa a React Refs,
 * garantindo ausência de memory leaks ou polling direto na DOM global.
 */
function useIntersectionReveal() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // Callback ref para anexar dinamicamente os nós aos elementos monitorados
  const setRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const currentRefs = revealRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, []);

  return setRevealRef;
}

const products = [
  { id: 1, img: 'https://images.unsplash.com/photo-1515562141207-7a8e7343e0d8?q=80&w=800&auto=format&fit=crop', badge: 'Novo', brand: 'Coleção Aurora', name: 'Brincos Solitaire Gota', price: 'R$ 14.500', delay: '' },
  { id: 2, img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop', badge: '', brand: 'Edição Limitada', name: 'Anel Diamante Negro', price: 'R$ 28.900', priceOld: 'R$ 32.000', delay: 'reveal-delay-1' },
  { id: 3, img: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop', badge: '', brand: 'Clássicos', name: 'Colar Pérola do Tahiti', price: 'R$ 9.200', delay: 'reveal-delay-2' },
  { id: 4, img: 'https://images.unsplash.com/photo-1614164185128-f4cb0ba88733?q=80&w=800&auto=format&fit=crop', badge: 'Best Seller', brand: 'Alta Relojoaria', name: 'Cronógrafo Royal Oak', price: 'R$ 98.000', delay: 'reveal-delay-3' },
  { id: 5, img: 'https://images.unsplash.com/photo-1573408301145-b98c3093b163?q=80&w=800&auto=format&fit=crop', badge: '', brand: 'Coleção Aurora', name: 'Pulseira Rígida Ouro 18K', price: 'R$ 21.300', delay: '' },
  { id: 6, img: 'https://images.unsplash.com/photo-1596704017254-9b121068fb20?q=80&w=800&auto=format&fit=crop', badge: '', brand: 'Casamento', name: 'Par de Alianças Eternidade', price: 'R$ 11.500', priceOld: 'R$ 13.000', delay: 'reveal-delay-1' },
  { id: 7, img: 'https://images.unsplash.com/photo-1620656798579-1984d9e87df5?q=80&w=800&auto=format&fit=crop', badge: '1 Peça Única', brand: 'Privilege', name: 'Gargantilha Esmeralda Real', price: 'R$ 145.000', delay: 'reveal-delay-2' },
  { id: 8, img: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=800&auto=format&fit=crop', badge: '', brand: 'Clássicos', name: 'Pingente Solitário', price: 'R$ 7.800', delay: 'reveal-delay-3' },
];

export default function App() {
  const { dotRef, ringRef } = useCustomCursor();
  const setRevealRef = useIntersectionReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    // Throttling scroll listener para evitar excessos de re-renderizações (gargalo React)
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Utilizado para inibir navegação em hashtags temporárias sem quebrar lint e navegação
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Custom Cursor */}
      <div id="cursor" aria-hidden="true">
        <div id="cursor-dot" ref={dotRef}></div>
        <div id="cursor-ring" ref={ringRef}></div>
      </div>

      {/* ── NAV ── */}
      <nav className={scrolled ? 'scrolled' : ''} aria-label="Navegação Principal">
        <div className="wrap nav-inner">
          <ul className="nav-links">
            <li><a href="/" onClick={handleAnchorClick}>Coleções</a></li>
            <li><a href="/" onClick={handleAnchorClick}>Lançamentos</a></li>
            <li><a href="/" onClick={handleAnchorClick}>Casamento</a></li>
            <li><a href="/" onClick={handleAnchorClick}>Maison</a></li>
          </ul>

          <div className="nav-logo">
            FERNANDES <span>Joias Finas</span>
          </div>

          <div className="nav-actions">
            <button aria-label="Buscar produtos">
              <Search aria-hidden="true" className="w-5 h-5" />
            </button>
            <button aria-label="Perfil do Usuário">
              <User aria-hidden="true" className="w-5 h-5" />
            </button>
            <button className="cart-badge" aria-label="Sacola de Compras com 2 itens">
              <ShoppingBag aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-bg" aria-hidden="true"></div>

        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1599643478514-4a888fccdf15?q=80&w=1600&auto=format&fit=crop" alt="Modelo feminina usando brinco e colar de ouro maciço" referrerPolicy="no-referrer" />
        </div>

        <div className="wrap" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div className="hero-content">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" aria-hidden="true"></div>
              <span>Nova Coleção 2026</span>
            </div>
            <h1 className="hero-title">O Fascínio da<br /><em>Realeza Tropical</em></h1>
            <p className="hero-subtitle">
              O esplendor do ouro polido artesanalmente encontra a intensidade das pedras preciosas brasileiras.
              Uma declaração majestosa de estilo e exclusividade absoluta.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" aria-label="Descobrir a coleção completa">
                <span>Descubra a Coleção</span>
              </button>
              <button className="btn-ghost" aria-label="Acessar Lookbook">
                Ver Lookbook <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="hero-scroll" aria-hidden="true">
            <div className="scroll-line"></div>
            <span className="scroll-text">Scrolar</span>
          </div>

          <div className="hero-stats" aria-label="Estatísticas da Joalheria">
            <div className="stat"><div className="stat-num">18K</div><div className="stat-label">Ouro Maciço</div></div>
            <div className="stat"><div className="stat-num">VVS1</div><div className="stat-label">Clareza Mínima</div></div>
          </div>
        </div>
      </div>

      <div className="ornament" aria-hidden="true">
        <div className="ornament-line"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line"></div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="categories" aria-labelledby="cat-heading">
        <div className="wrap">
          <div className="sec-header reveal" ref={setRevealRef}>
            <div className="sec-tag">Universo Fernandes</div>
            <h2 id="cat-heading" className="sec-title">Explore por <em>Design</em></h2>
            <p className="sec-desc">
              Cada categoria revela uma faceta distinta da nossa herança. Desde peças atemporais em diamante puro
              a ousadas combinações de gemas contemporâneas.
            </p>
          </div>
          <div className="cat-grid reveal reveal-delay-1" ref={setRevealRef}>
            {[
              { img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', name: 'Anéis', count: '+240 Peças', alt: 'Mão vestindo anéis minimalistas de ouro maciço' },
              { img: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop', name: 'Colares', count: '+180 Peças', alt: 'Colar de diamante polido pendurado' },
              { img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', name: 'Braceletes', count: '+95 Peças', alt: 'Braceletes incrustados com esmeraldas sobre folhas rústicas' },
              { img: 'https://images.unsplash.com/photo-1523268755815-fe7c372a0349?q=80&w=800&auto=format&fit=crop', name: 'Relógios', count: '+45 Peças', alt: 'Cronógrafo masculino de luxo sendo vestido' },
            ].map((cat) => (
              <div key={cat.name} className="cat-card" role="group" aria-label={`Categoria: ${cat.name}`}>
                <img src={cat.img} alt={cat.alt} className="cat-img" referrerPolicy="no-referrer" />
                <div className="cat-overlay" aria-hidden="true"></div>
                <div className="cat-content">
                  <h3 className="cat-name">{cat.name}</h3>
                  <span className="cat-count" aria-label={`${cat.count} disponíveis`}>{cat.count}</span>
                </div>
                <a href="/" onClick={handleAnchorClick} className="cat-arrow" aria-label={`Ver peças exclusivas de ${cat.name}`}>
                  <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="marquee-strip" aria-hidden="true">
        <div className="marquee-track">
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <div className="marquee-item">Alta Joalheria Brasileira</div>
              <div className="marquee-sep"></div>
              <div className="marquee-item">Ouro 18k Certificado</div>
              <div className="marquee-sep"></div>
              <div className="marquee-item">Gemas Éticas Naturais</div>
              <div className="marquee-sep"></div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL 1 ── */}
      <section className="editorial" aria-labelledby="ed1-heading">
        <div className="wrap">
          <div className="editorial-grid">
            <div className="editorial-img">
              <img src="https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=1200&auto=format&fit=crop" alt="Artesão mestre lapidando detalhadamente uma joia sobre bancada iluminada" referrerPolicy="no-referrer" />
            </div>
            <div className="editorial-content">
              <div className="editorial-inner reveal" ref={setRevealRef}>
                <div className="sec-tag">NOSSA HERANÇA</div>
                <h2 id="ed1-heading" className="editorial-title">Artesanato que <em>Transcende o Tempo</em></h2>
                <p className="editorial-body">
                  Nos nossos ateliês, cada joia ganha vida pelas mãos de mestres ourives.
                  Ao aliar técnicas seculares a designs vanguardistas, a Fernandes cria não apenas ornamentos,
                  mas relíquias familiares concebidas para a eternidade.
                </p>
                <button className="btn-ghost" aria-label="Conhecer o Ateliê de Artesanato">Conheça o Ateliê <ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button>
                <div className="editorial-sig" aria-hidden="true">Fernandes Joias</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="products" aria-labelledby="prod-heading">
        <div className="wrap">
          <div className="sec-header reveal" ref={setRevealRef}>
            <div className="sec-tag">Gabinete de Curiosidades</div>
            <h2 id="prod-heading" className="sec-title">Peças <em>Exclusivas</em></h2>
            <p className="sec-desc">Uma seleção meticulosa de obras-primas contemporâneas. Exclusividade absoluta para instantes inesquecíveis.</p>
          </div>
          <div className="prod-grid">
            {products.map((p) => (
              <div key={p.id} className={`prod-card reveal ${p.delay}`} ref={setRevealRef} role="article" aria-label={`Produto: ${p.name}`}>
                <div className="prod-img-wrap">
                  <img src={p.img} alt={`Exibição do produto ${p.name}`} referrerPolicy="no-referrer" />
                  {p.badge && <div className="prod-badge" aria-label="Destaque deste produto">{p.badge}</div>}
                  <div className="prod-actions">
                    <button className="prod-btn prod-btn-main" aria-label={`Adicionar ${p.name} ao carrinho`}>Adicionar</button>
                    <button className="prod-btn prod-btn-wish" aria-label={`Adicionar ${p.name} à lista de desejos`}>Lista de Desejos</button>
                  </div>
                </div>
                <div className="prod-info">
                  <h4 className="prod-brand">{p.brand}</h4>
                  <h3 className="prod-name">{p.name}</h3>
                  <div className="prod-price-row">
                    <span className="prod-price" aria-label={`Preço atual: ${p.price}`}>{p.price}</span>
                    {p.priceOld && <span className="prod-price-old" aria-label={`Preço original: ${p.priceOld}`}>{p.priceOld}</span>}
                  </div>
                  <div className="prod-stars" aria-label="Avaliado como 5 estrelas">
                    {[...Array(5)].map((_, i) => <Star key={i} aria-hidden="true" className="text-gold fill-gold" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }} className="reveal" ref={setRevealRef}>
            <button className="btn-ghost" aria-label="Navegar pelo catálogo completo de joias">Ver Todo o Catálogo <ArrowUpRight aria-hidden="true" className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL 2 ── */}
      <section className="editorial" aria-labelledby="ed2-heading">
        <div className="wrap">
          <div className="editorial-grid">
            <div className="editorial-content order-2 md:order-1">
              <div className="editorial-inner reveal" ref={setRevealRef}>
                <div className="sec-tag">CERTIFICAÇÃO DE EXCELÊNCIA</div>
                <h2 id="ed2-heading" className="editorial-title">Padrões de <em>Pureza Inatingíveis</em></h2>
                <p className="editorial-body">
                  Excedemos as normas da indústria de joalheria. Nossos especialistas avaliam pessoalmente cada gema,
                  recusando tudo o que não seja perfeito. Ao escolher uma peça Fernandes, você adquire a promessa de
                  uma imutabilidade valiosa e beleza transcendental.
                </p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} aria-label="Entender a certificação e os Quatro Cs"><span>Entenda os 4C's</span></button>
              </div>
            </div>
            <div className="editorial-img order-1 md:order-2">
              <img src="https://images.unsplash.com/photo-1629813134914-9980556db1e2?q=80&w=1200&auto=format&fit=crop" alt="Exibição em macro de diamantes lapidados cristalinos e brilhantes" referrerPolicy="no-referrer" style={{ filter: 'grayscale(0.5) contrast(1.1) brightness(0.8)' }} />
            </div>
          </div>
        </div>
      </section>

      <div className="ornament" aria-hidden="true">
        <div className="ornament-line"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line"></div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials" aria-labelledby="testi-heading">
        <div className="wrap">
          <div className="sec-header reveal" ref={setRevealRef}>
            <div className="sec-tag">Ecos de Elegância</div>
            <h2 id="testi-heading" className="sec-title">Vozes de <em>Distinção</em></h2>
          </div>
          <div className="testi-grid reveal" ref={setRevealRef}>
            {[
              { initial: 'C', name: 'Camila Vasconcelos', loc: 'São Paulo, SP', text: '"Acima de tudo, adquiri uma joia de arte. A precisão do acabamento me deixa maravilhada todos os dias. Exclusividade verdadeira."' },
              { initial: 'R', name: 'Rodrigo & Mariana', loc: 'Curitiba, PR', text: '"Para o meu casamento, queria algo que fosse além do ouro. A Fernandes nos entregou poesia em formato de alianças. Serviço impecável."' },
              { initial: 'M', name: 'Marcos Lazzotto', loc: 'Rio de Janeiro, RJ', text: '"Coleciono alta joalheria há anos. O colar da coleção Aurora é tranquilamente uma das peças mais arrebatadoras da minha coleção."' },
            ].map((t) => (
              <div key={t.name} className="testi-card" role="note" aria-label={`Relato do cliente ${t.name}`}>
                <div className="testi-quote" aria-hidden="true">"</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-avatar" aria-hidden="true">{t.initial}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-loc">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter" aria-labelledby="nl-heading">
        <div className="nl-badge" aria-hidden="true">FERNANDES</div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="sec-header reveal" style={{ marginBottom: '2rem' }} ref={setRevealRef}>
            <div className="sec-tag">O Culto ao Belo</div>
            <h2 id="nl-heading" className="sec-title">Acesso <em>Privilegiado</em></h2>
            <p className="sec-desc">Convites exclusivos, revelações antecipadas de coleções e curadoria editorial diretamente ao seu alcance.</p>
          </div>
          <div className="reveal reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} ref={setRevealRef}>
            <form className="nl-form" onSubmit={(e) => e.preventDefault()} role="search" aria-label="Inscrição em newsletter">
              <input type="email" className="nl-input" placeholder="Seu correio eletrônico" required aria-label="Digite o seu email para inscrição" />
              <button type="submit" className="nl-submit" aria-label="Inscrever email na newsletter">Inscrever</button>
            </form>
            <p className="nl-note">Respeitamos a sua privacidade absoluta.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer aria-label="Rodapé do site de informações e links secundários">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-col footer-brand">
              <div className="nav-logo" style={{ color: 'var(--off-white)' }} aria-hidden="true">
                FERNANDES <span style={{ color: 'var(--gold)' }}>Joias Finas</span>
              </div>
              <p>Concebendo uma estética inigualável. Uma verdadeira instituição brasileira de luxo e tradição ourivesaria.</p>
              <div className="footer-socials" aria-label="Redes sociais da Fernandes">
                <a href="/" onClick={handleAnchorClick} className="social-link" aria-label="Acessar Instagram da Fernandes"><Instagram aria-hidden="true" /></a>
                <a href="/" onClick={handleAnchorClick} className="social-link" aria-label="Acessar Facebook da Fernandes"><Facebook aria-hidden="true" /></a>
                <a href="/" onClick={handleAnchorClick} className="social-link" aria-label="Acessar Twitter da Fernandes"><Twitter aria-hidden="true" /></a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Descubra</h4>
              <ul>
                <li><a href="/" onClick={handleAnchorClick}>Maison Fernandes</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Coleções 2026</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Catálogo Geral</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Guias de Presente</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Diamantes Certificados</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Assistência</h4>
              <ul>
                <li><a href="/" onClick={handleAnchorClick}>Cuidados com a Joia</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Garantia Perpétua</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Envio e Rastreio</a></li>
                <li><a href="/" onClick={handleAnchorClick}>Trocas Artísticas</a></li>
              </ul>
            </div>
            <div className="footer-col footer-contact">
              <h4>Boutiques</h4>
              <p><strong>São Paulo</strong><br />Shopping Cidade Jardim, Térreo</p>
              <p><strong>Rio de Janeiro</strong><br />VillageMall, Piso L1</p>
              <div style={{ marginTop: '1.5rem' }}>
                <p><strong>Concierge:</strong><br />+55 (11) 3000-0000</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Fernandes Joias Finas. Criado com maestria.</p>
            <div className="payment-icons" aria-label="Formas de pagamento aceitas">
              <span className="pay-icon" aria-label="Visa">VISA</span>
              <span className="pay-icon" aria-label="Mastercard">MASTER</span>
              <span className="pay-icon" aria-label="American Express">AMEX</span>
              <span className="pay-icon" aria-label="Pix">PIX</span>
            </div>
            <p><a href="/" onClick={handleAnchorClick}>Termos de Uso</a>&nbsp;|&nbsp;<a href="/" onClick={handleAnchorClick}>Privacidade</a></p>
          </div>
        </div>
      </footer>
    </>
  );
}
