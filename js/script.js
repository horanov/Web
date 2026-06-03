document.addEventListener('DOMContentLoaded', () => {

  const contactForm = document.querySelector('.contact-form');
  const orderForm = document.getElementById('order-form');
  const genreSelect = document.getElementById('genre');
  const formatOptions = document.getElementById('format-options');
  const previewImage = document.getElementById('genre-preview');
  const previewTitle = document.getElementById('preview-title');
  const previewDescription = document.getElementById('preview-description');
  const resultSummary = document.getElementById('result-summary');

  const genreData = {
      ukrainian: {
          title: 'Українська класика',
          description: 'Ніжна і мудра література з рідного краю.',
          image: 'images/genre-ukr.svg',
          formats: [
              { value: 'paper', label: 'Паперова книга' },
              { value: 'ebook', label: 'Електронна книга' }
          ]
      },
      foreign: {
          title: 'Зарубіжна класика',
          description: 'Всесвітні бестселери, які читають у всьому світі.',
          image: 'images/genre-foreign.svg',
          formats: [
              { value: 'paper', label: 'Паперова книга' },
              { value: 'audio', label: 'Аудіокнига' }
          ]
      },
      fantasy: {
          title: 'Фантастика',
          description: 'Магія, пригоди та нові світи для уяви.',
          image: 'images/genre-fantasy.svg',
          formats: [
              { value: 'ebook', label: 'Електронна книга' },
              { value: 'audio', label: 'Аудіокнига' }
          ]
      },
      psychology: {
          title: 'Психологія',
          description: 'Корисні поради для розвитку особистості та емоційного інтелекту.',
          image: 'images/genre-psychology.svg',
          formats: [
              { value: 'paper', label: 'Паперова книга' },
              { value: 'ebook', label: 'Електронна книга' }
          ]
      }
  };

  const letterPattern = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ\s]+$/u;

  const errorMap = {
      fullName: 'Введіть своє ім\'я, тільки літери.',
      bookTitle: 'Введіть назву книги, тільки літери.',
      genre: 'Оберіть жанр.',
      format: 'Оберіть формат книги.'
  };

  const clearErrors = () => {
      document.querySelectorAll('.error-message').forEach(error => {
          error.textContent = '';
      });
  };

  const updatePreview = (genreKey) => {
      const selectedGenre = genreData[genreKey] || genreData.ukrainian;
      previewImage.src = selectedGenre.image;
      previewImage.alt = selectedGenre.title;
      previewTitle.textContent = selectedGenre.title;
      previewDescription.textContent = selectedGenre.description;
  };

  const updateFormatOptions = (genreKey) => {
      formatOptions.innerHTML = '';
      const selectedGenre = genreData[genreKey] || genreData.ukrainian;

      selectedGenre.formats.forEach((format, index) => {
          const wrapper = document.createElement('label');
          wrapper.className = 'radio-option';

          const input = document.createElement('input');
          input.type = 'radio';
          input.name = 'format';
          input.value = format.value;
          input.id = `format-${format.value}`;
          if (index === 0) {
              input.checked = true;
          }

          const span = document.createElement('span');
          span.textContent = format.label;

          wrapper.appendChild(input);
          wrapper.appendChild(span);
          formatOptions.appendChild(wrapper);
      });
  };

  const validateField = (name, value) => {
      if (!value.trim()) {
          return errorMap[name];
      }

      if ((name === 'fullName' || name === 'bookTitle') && !letterPattern.test(value.trim())) {
          return errorMap[name];
      }

      return '';
  };

  const validateForm = () => {
      clearErrors();
      const formData = new FormData(orderForm);
      let isValid = true;

      ['fullName', 'bookTitle'].forEach(name => {
          const value = formData.get(name) || '';
          const errorText = validateField(name, value);
          if (errorText) {
              isValid = false;
              document.getElementById(`error-${name}`).textContent = errorText;
          }
      });

      if (!formData.get('genre')) {
          isValid = false;
          document.getElementById('error-genre').textContent = errorMap.genre;
      }

      if (!formData.get('format')) {
          isValid = false;
          document.getElementById('error-format').textContent = errorMap.format;
      }

      return isValid;
  };

  const buildResult = () => {
      const formData = new FormData(orderForm);
      const extras = formData.getAll('extras');
      const selectedGenre = genreData[formData.get('genre')];
      const selectedFormatValue = formData.get('format');
      const formatLabel = selectedGenre.formats.find(item => item.value === selectedFormatValue)?.label || selectedFormatValue;

      resultSummary.innerHTML = `
          <h4>Ваше замовлення</h4>
          <div class="result-row"><strong>ПІБ:</strong> ${formData.get('fullName')}</div>
          <div class="result-row"><strong>Книга:</strong> ${formData.get('bookTitle')}</div>
          <div class="result-row"><strong>Жанр:</strong> ${selectedGenre.title}</div>
          <div class="result-row"><strong>Формат:</strong> ${formatLabel}</div>
          <div class="result-row"><strong>Опції:</strong> ${extras.length ? extras.join(', ') : 'немає'}</div>
          <button id="reset-button" class="btn btn-primary">Заповнити ще раз</button>
      `;
  };

  if (orderForm) {
      updateFormatOptions('ukrainian');
      updatePreview('ukrainian');

      genreSelect.addEventListener('change', event => {
          updateFormatOptions(event.target.value);
          updatePreview(event.target.value);
      });

      orderForm.addEventListener('submit', event => {
          event.preventDefault();
          if (!validateForm()) {
              return;
          }

          orderForm.classList.add('hidden');
          buildResult();
          resultSummary.classList.remove('hidden');
      });

      resultSummary.addEventListener('click', event => {
          if (event.target.id !== 'reset-button') {
              return;
          }

          resultSummary.classList.add('hidden');
          orderForm.reset();
          updateFormatOptions('ukrainian');
          updatePreview('ukrainian');
          clearErrors();
          orderForm.classList.remove('hidden');
      });
  }

  const priceRange = document.querySelector('.filter-group input[type="range"]');
  const bookCards = document.querySelectorAll('.book-card');
  const catalogCount = document.querySelector('.catalog-count strong');

  if (priceRange && bookCards.length > 0) {
      const priceLabel = priceRange.nextElementSibling;

      const updatePriceFilter = (maxPrice) => {
          let visibleCount = 0;
          bookCards.forEach(card => {
              const priceAttr = card.dataset.price;
              const bookPriceText = priceAttr || card.querySelector('.book-price')?.textContent || '';
              const bookPrice = parseInt(bookPriceText.replace(/[^\d]/g, ''), 10);

              if (!isNaN(bookPrice) && bookPrice <= maxPrice) {
                  card.style.display = 'flex';
                  visibleCount++;
              } else {
                  card.style.display = 'none';
              }
          });

          if (catalogCount) {
              catalogCount.textContent = visibleCount;
          }
      };

      const updatePriceLabel = (value) => {
          const maxPrice = parseInt(value, 10);
          priceLabel.textContent = `до ₴ ${maxPrice}`;
          updatePriceFilter(maxPrice);
      };

      priceRange.addEventListener('input', (e) => {
          updatePriceLabel(e.target.value);
      });

      updatePriceLabel(priceRange.value);
  }

  // ── AJAX SECTION ──
  const searchInput = document.getElementById('search-input');
  const ajaxGenreFilter = document.getElementById('ajax-genre-filter');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const applyBtn = document.getElementById('apply-filters');
  const resetBtn = document.getElementById('reset-filters');
  const loadingSpinner = document.getElementById('loading-spinner');
  const resultsGrid = document.getElementById('results-grid');
  const errorMessage = document.getElementById('error-message');
  const emptyMessage = document.getElementById('empty-message');

  let allBooks = [];

  const mockBooks = [
    {
      id: 1,
      title: 'Кобзар',
      author: 'Тарас Шевченко',
      genre: 'ukrainian',
      genreName: 'Українська класика',
      price: 280,
      description: 'Визначний твір української поезії'
    },
    {
      id: 2,
      title: 'Лісова пісня',
      author: 'Леся Українка',
      genre: 'ukrainian',
      genreName: 'Українська класика',
      price: 240,
      description: 'Драматична поема про природу та людину'
    },
    {
      id: 3,
      title: 'Місто',
      author: 'Валеріян Підмогильський',
      genre: 'ukrainian',
      genreName: 'Українська класика',
      price: 320,
      description: 'Роман про міське життя'
    },
    {
      id: 4,
      title: 'Тіні забутих предків',
      author: 'Михайло Коцюбинський',
      genre: 'ukrainian',
      genreName: 'Українська класика',
      price: 195,
      description: 'Магічна історія українських Карпат'
    },
    {
      id: 5,
      title: 'Моя сім\'я',
      author: 'Оксана Забужко',
      genre: 'foreign',
      genreName: 'Зарубіжна класика',
      price: 420,
      description: 'Сучасна проза про сім\'ю'
    },
    {
      id: 6,
      title: 'Грізний світ',
      author: 'J.R.R. Tolkien',
      genre: 'fantasy',
      genreName: 'Фантастика',
      price: 550,
      description: 'Епічна фентезі сага'
    },
    {
      id: 7,
      title: 'Психологія мас',
      author: 'Густав Лебон',
      genre: 'psychology',
      genreName: 'Психологія',
      price: 380,
      description: 'Дослідження масової психології'
    },
    {
      id: 8,
      title: 'Думки та почуття',
      author: 'Деніел Голман',
      genre: 'psychology',
      genreName: 'Психологія',
      price: 290,
      description: 'Емоційний інтелект у сучасному світі'
    },
    {
      id: 9,
      title: 'Гаррі Поттер',
      author: 'J.K. Rowling',
      genre: 'fantasy',
      genreName: 'Фантастика',
      price: 480,
      description: 'Магічна пригода'
    },
    {
      id: 10,
      title: 'Гордість і упередження',
      author: 'Jane Austen',
      genre: 'foreign',
      genreName: 'Зарубіжна класика',
      price: 350,
      description: 'Класичний роман про кохання'
    }
  ];

  const showLoading = () => {
    loadingSpinner.classList.add('active');
    resultsGrid.innerHTML = '';
    errorMessage.classList.add('hidden');
    emptyMessage.classList.add('hidden');
  };

  const hideLoading = () => {
    loadingSpinner.classList.remove('active');
  };

  const showError = (message) => {
    hideLoading();
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    resultsGrid.innerHTML = '';
    emptyMessage.classList.add('hidden');
  };

  const showEmpty = () => {
    hideLoading();
    emptyMessage.textContent = 'На жаль, книг за такими фільтрами не знайдено.';
    emptyMessage.classList.remove('hidden');
    resultsGrid.innerHTML = '';
    errorMessage.classList.add('hidden');
  };

  const fetchBooks = async (filters = {}) => {
    showLoading();

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      let filtered = [...allBooks];

      if (filters.search) {
        filtered = filtered.filter(book =>
          book.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.genre) {
        filtered = filtered.filter(book => book.genre === filters.genre);
      }

      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(book => book.price >= filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(book => book.price <= filters.maxPrice);
      }

      hideLoading();

      if (filtered.length === 0) {
        showEmpty();
        return;
      }

      displayBooks(filtered);
      errorMessage.classList.add('hidden');
      emptyMessage.classList.add('hidden');
    } catch (error) {
      showError('Помилка при завантаженні даних. Спробуйте ще раз.');
      console.error('Fetch error:', error);
    }
  };

  const displayBooks = (books) => {
    resultsGrid.innerHTML = books.map(book => `
      <div class="book-card-grid">
        <div class="card-header">
          <h3>${book.title}</h3>
          <span class="genre-badge">${book.genreName}</span>
        </div>
        <p class="card-author">Автор: ${book.author}</p>
        <p class="card-description">${book.description}</p>
        <div class="card-footer">
          <span class="price">₴ ${book.price}</span>
          <button class="btn-add-cart" data-id="${book.id}">До кошика</button>
        </div>
      </div>
    `).join('');
  };

  const getFiltersFromForm = () => {
    return {
      search: searchInput.value.trim(),
      genre: ajaxGenreFilter.value,
      minPrice: minPriceInput.value ? parseInt(minPriceInput.value) : undefined,
      maxPrice: maxPriceInput.value ? parseInt(maxPriceInput.value) : undefined
    };
  };

  const resetFilters = () => {
    searchInput.value = '';
    ajaxGenreFilter.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    fetchBooks({});
  };

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const filters = getFiltersFromForm();
      fetchBooks(filters);
    });

    resetBtn.addEventListener('click', resetFilters);

    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const filters = getFiltersFromForm();
        fetchBooks(filters);
      }, 500);
    });

    ajaxGenreFilter.addEventListener('change', () => {
      const filters = getFiltersFromForm();
      fetchBooks(filters);
    });

    allBooks = mockBooks;
    fetchBooks({});
  }
});
