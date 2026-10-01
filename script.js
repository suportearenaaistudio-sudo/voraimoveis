const body = document.body;
const toast = document.querySelector('#toast');
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

if (!document.querySelector('.skip-link')) {
  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = '#conteudo';
  skipLink.textContent = 'Saltar para o conteúdo';
  body.prepend(skipLink);
}
document.querySelector('main')?.setAttribute('id', 'conteudo');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.classList.toggle('is-open');
  mainNav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  body.classList.toggle('menu-open', isOpen);
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('is-open');
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  });
});

const savedStorageKey = 'vora-saved-properties';
let savedPropertyIds = [];
try {
  savedPropertyIds = JSON.parse(localStorage.getItem(savedStorageKey) || '[]');
  if (!Array.isArray(savedPropertyIds)) savedPropertyIds = [];
} catch {
  savedPropertyIds = [];
}

const getPropertyId = (button) => {
  const label = button.dataset.property || button.getAttribute('aria-label')?.replace(/^Guardar\s+/i, '').trim() || '';
  return label.replace(/^Apartamento\s+/i, '');
};
const syncSavedUI = () => {
  document.querySelectorAll('.saved-count').forEach((count) => { count.textContent = savedPropertyIds.length; });
  document.querySelectorAll('.favorite-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(savedPropertyIds.includes(getPropertyId(button))));
  });
};

document.querySelectorAll('.favorite-button').forEach((button) => {
  button.addEventListener('click', () => {
    const propertyId = getPropertyId(button);
    const isSaved = savedPropertyIds.includes(propertyId);
    savedPropertyIds = isSaved ? savedPropertyIds.filter((id) => id !== propertyId) : [...savedPropertyIds, propertyId];
    localStorage.setItem(savedStorageKey, JSON.stringify(savedPropertyIds));
    syncSavedUI();
    showToast(isSaved ? 'Imóvel removido dos guardados.' : 'Imóvel guardado entre as suas escolhas.');
  });
});
syncSavedUI();

const tabs = document.querySelectorAll('.search-tab');
let searchMode = 'Comprar';
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    searchMode = tab.dataset.mode;
    document.querySelector('#search-result-note').textContent = `${searchMode} · escolha os critérios para encontrar uma casa à sua medida.`;
  });
});

const searchForm = document.querySelector('#search-form');
const resultNote = document.querySelector('#search-result-note');
const emptyState = document.querySelector('#empty-state');
const clearSearch = document.querySelector('#clear-search');
const propertyCards = [...document.querySelectorAll('.property-card')];

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const location = document.querySelector('#location-input').value.trim().toLowerCase();
  const type = document.querySelector('#type-select').value;
  const price = document.querySelector('#price-select').value;
  let visibleCount = 0;

  propertyCards.forEach((card) => {
    const matchesLocation = !location || card.dataset.location.includes(location) || card.textContent.toLowerCase().includes(location);
    const matchesType = type === 'all' || card.dataset.type === type;
    const matchesPrice = price === 'all' || card.dataset.price === price;
    const visible = matchesLocation && matchesType && matchesPrice;
    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
  resultNote.textContent = visibleCount
    ? `${searchMode} · ${visibleCount} ${visibleCount === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}.`
    : `${searchMode} · ajustámos a pesquisa para si.`;
  if (clearSearch) clearSearch.hidden = false;
  document.querySelector('#imoveis').scrollIntoView({ behavior: scrollBehavior, block: 'start' });
});

clearSearch?.addEventListener('click', () => {
  searchForm.reset();
  propertyCards.forEach((card) => { card.style.display = ''; });
  emptyState.hidden = true;
  resultNote.textContent = '';
  clearSearch.hidden = true;
});

document.querySelector('.saved-link')?.addEventListener('click', () => {
  if (savedPropertyIds.length) {
    showToast(`${savedPropertyIds.length} ${savedPropertyIds.length === 1 ? 'imóvel guardado' : 'imóveis guardados'} neste dispositivo.`);
  } else {
    showToast('Ainda não guardou nenhum imóvel. Explore as nossas escolhas.');
  }
});

document.querySelector('#newsletter-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const note = document.querySelector('#newsletter-note');
  note.textContent = 'Está dentro — até breve.';
  input.value = '';
  showToast('Obrigado. A próxima carta vai encontrar o seu email.');
});

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const note = document.querySelector('#contact-note');
  note.textContent = 'Recebemos a sua mensagem. Respondemos em menos de 24 horas.';
  form.reset();
  showToast('Mensagem recebida — até já.');
});

propertyCards.forEach((card) => {
  const destination = card.querySelector('.property-open')?.href;
  if (!destination) return;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', `Ver detalhes de ${card.querySelector('h3')?.textContent || 'imóvel'}`);
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, input, select')) return;
    window.location.href = destination;
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = destination;
    }
  });
});

const testimonials = [
  { quote: 'Não nos mostraram apenas casas. Fizeram-nos perguntas até perceberem como queríamos viver.', name: 'Inês & Miguel', meta: 'Mudaram-se para a Comporta em 2023' },
  { quote: 'A VORA percebeu o que procurávamos antes de nós. A casa certa apareceu quando deixámos de procurar qualquer casa.', name: 'Rita & João', meta: 'Encontraram o seu lugar em Lisboa' },
  { quote: 'Transparência, calma e um cuidado raro em cada detalhe. Foi uma compra, mas sentiu-se como uma conversa.', name: 'Marta Silva', meta: 'Comprou no Douro em 2024' },
];
let testimonialIndex = 0;
const testimonialNext = document.querySelector('#testimonial-next');
const renderTestimonial = () => {
  const current = testimonials[testimonialIndex];
  const quote = document.querySelector('#testimonial-quote');
  const name = document.querySelector('#testimonial-name');
  const meta = document.querySelector('#testimonial-meta');
  const position = document.querySelector('#testimonial-current');
  if (!quote || !name || !meta || !position) return;
  quote.textContent = current.quote;
  name.textContent = current.name;
  meta.textContent = current.meta;
  position.textContent = String(testimonialIndex + 1).padStart(2, '0');
};
testimonialNext?.addEventListener('click', () => {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  const testimonialInner = document.querySelector('.testimonial-inner');
  if (!testimonialInner || reduceMotion) {
    renderTestimonial();
    return;
  }
  testimonialInner.classList.add('is-changing');
  window.setTimeout(() => {
    renderTestimonial();
    testimonialInner.classList.remove('is-changing');
  }, 180);
});

const revealElements = document.querySelectorAll('.intro-section, .listings-section, .places-section, .testimonial-section, .contact-section');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revealElements.forEach((element) => revealObserver.observe(element));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  });
});
