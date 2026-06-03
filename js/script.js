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

  const letterPattern = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ’'\s]+$/u;

  const errorMap = {
      fullName: 'Введіть своє ім’я, тільки літери.',
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
});