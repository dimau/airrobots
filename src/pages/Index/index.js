import "../../widgets/Promo/promo";
import "../../widgets/CaptureForm/captureForm";
import { Modal } from "../../widgets/Modal/modal";

/**** Initialize Modal Window ****/
const modal = new Modal({
  linkAttributeName: 'data-modal',
  beforeOpen: () => {
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
  },
  afterClose: () => {
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";
  },
});

/*** Clearing input fields after submitting ***/
const modalInputs = document.querySelectorAll(".modal__input");
const submitFormButtons = document.querySelectorAll(".modal__submit-button");
for (const button of submitFormButtons) {
  button.addEventListener('click', () => {
    for (const input of modalInputs) {
      input.value = "";
    }
  });
}