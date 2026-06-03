document.addEventListener('DOMContentLoaded', () => {

  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
      const submitBtn = contactForm.querySelector('.btn-primary');
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      submitBtn.addEventListener('click', (e) => {
          e.preventDefault();

          if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
              alert('Будь ласка, заповніть усі обов’язкові поля (Ім’я, Email та Повідомлення)!');
              return;
          }

          submitBtn.textContent = 'Надіслано успішно! ✓';
          submitBtn.classList.remove('btn-primary');
          submitBtn.classList.add('btn-success');
          submitBtn.disabled = true;
          setTimeout(() => {
              contactForm.querySelectorAll('input, textarea').forEach(input => input.value = '');
              submitBtn.textContent = 'Надіслати';
              submitBtn.classList.remove('btn-success');
              submitBtn.classList.add('btn-primary');
              submitBtn.disabled = false;
          }, 3000);
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