/*** Clearing input fields after submitting ***/
document.querySelector(".capture-form__submit-button").addEventListener('click', () => {
  document.querySelector(".capture-form__phone-input").value = "";
});