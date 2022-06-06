$( document ).ready(function() {
  // Run code
  const year = new Date().getFullYear();
  console.log(year);
  $(".year").text(year);
});
