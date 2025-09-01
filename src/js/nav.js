document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.querySelector('.site-list__burger');
  const navList = document.querySelector('.site-list');
  const imgMenu = document.querySelector('.img-menu');
  const welcomeBlock = document.querySelector('.welcome');

  toggleButton.addEventListener("click", function () {
    navList.classList.toggle("site-list--open");
    navList.classList.toggle("site-list--close");

    imgMenu.classList.toggle("img-menu--open");
    imgMenu.classList.toggle("img-menu--close");

    toggleButton.classList.toggle("active");
  });

  welcomeBlock.addEventListener("click", function () {
    if (navList.classList.contains("site-list--open")) {
      navList.classList.remove("site-list--open");
      navList.classList.add("site-list--close");

      imgMenu.classList.remove("img-menu--open");
      imgMenu.classList.add("img-menu--close");

      toggleButton.classList.remove("active");
    }
  });
});
