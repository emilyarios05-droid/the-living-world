const route = window.location.pathname.replace(/\/+$/, '') || '/';

if (route === '/reset-password') {
  void import('./reset-password.js');
} else {
  void import('./main.js');
}
