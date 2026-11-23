// Interactive client-side enhancements
function fillCredentials(username, password) {
  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');
  
  if (userInput && passInput) {
    userInput.value = username;
    passInput.value = password;

    // Highlight input fields briefly
    userInput.focus();
    userInput.style.borderColor = '#6366f1';
    passInput.style.borderColor = '#6366f1';
    setTimeout(() => {
      userInput.style.borderColor = '';
      passInput.style.borderColor = '';
    }, 600);
  }
}

// Password visibility toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
      } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
      }
    });
  }
});
