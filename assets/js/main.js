var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value);
var __publicField = (obj, key, value) =>
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function createStore(reducer, preloadedState) {
  let state = preloadedState;
  const listeners = /* @__PURE__ */ new Set();
  function getState() {
    return state;
  }
  function subscribe(listener) {
    listeners.add(listener);
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }
  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
  }
  dispatch({ type: "@@redux/INIT" });
  return { dispatch, subscribe, getState };
}
const initialState = {
  cart: [],
};
function appReducer(state, action) {
  switch (action.type) {
    case "cart/addItem":
      return action.payload
        ? { ...state, cart: [...state.cart, action.payload] }
        : state;
    case "cart/setQuantity":
      return action.payload
        ? {
            ...state,
            cart: state.cart.map((item) =>
              item.id === action.payload.id
                ? {
                    ...item,
                    quantity: Math.max(
                      item.quantity + action.payload.quantity,
                      1
                    ),
                  }
                : item
            ),
          }
        : state;
    case "cart/removeItem":
      return action.payload
        ? {
            ...state,
            cart: state.cart.filter((item) => item.id !== action.payload.id),
          }
        : state;
    default:
      return state;
  }
}
const store = createStore(appReducer, initialState);
class MainMenu extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "toggleElems");
    __publicField(this, "panelElem");
    __publicField(this, "overlayElem");
    __publicField(this, "isVisible");
    __publicField(this, "lastFocusedElem");
    this.toggleElems = null;
    this.panelElem = null;
    this.overlayElem = null;
    this.isVisible = false;
    this.lastFocusedElem = null;
    this.clickEventHandler = this.clickEventHandler.bind(this);
    this.keyupEventHandler = this.keyupEventHandler.bind(this);
  }
  connectedCallback() {
    this.toggleElems = this.querySelectorAll('[data-main-menu="toggle"]');
    if (!this.toggleElems) throw new Error("Toggle elements not found");
    this.overlayElem = this.querySelector('[data-main-menu="overlay"]');
    if (!this.overlayElem) throw new Error("Overlay element not found");
    this.panelElem = this.querySelector('[data-main-menu="panel"]');
    if (!this.panelElem) throw new Error("Panel element not found");
    this.addEventListener("click", this.clickEventHandler);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.clickEventHandler);
    document.removeEventListener("keyup", this.keyupEventHandler);
  }
  setToggleAttributes() {
    var _a;
    const label = this.isVisible ? "Close menu" : "Open menu";
    (_a = this.toggleElems) == null
      ? void 0
      : _a.forEach((elem) => {
          elem.ariaLabel = label;
          elem.ariaExpanded = String(this.isVisible);
        });
  }
  clickEventHandler(e) {
    const target = e.target;
    const attr = target.getAttribute("data-main-menu");
    if (attr === "toggle") {
      this.toggle();
    }
  }
  keyupEventHandler(e) {
    if (e.key === "Escape") {
      this.hide();
    }
  }
  show() {
    var _a;
    this.lastFocusedElem = document.activeElement;
    this.isVisible = true;
    document.addEventListener("keyup", this.keyupEventHandler);
    this.setToggleAttributes();
    (_a = this.overlayElem) == null
      ? void 0
      : _a.classList.add("main-menu__overlay--visible");
    requestAnimationFrame(() => {
      var _a2, _b;
      (_a2 = this.panelElem) == null
        ? void 0
        : _a2.classList.add("main-menu__panel--visible");
      const firstAnchor =
        (_b = this.panelElem) == null ? void 0 : _b.querySelector("a");
      firstAnchor == null ? void 0 : firstAnchor.focus();
    });
  }
  hide() {
    var _a, _b;
    this.isVisible = false;
    document.removeEventListener("keyup", this.keyupEventHandler);
    this.setToggleAttributes();
    (_a = this.overlayElem) == null
      ? void 0
      : _a.addEventListener(
          "transitionend",
          () => {
            var _a2;
            (_a2 = this.overlayElem) == null
              ? void 0
              : _a2.classList.remove("main-menu__overlay--visible");
            if (this.lastFocusedElem instanceof HTMLElement) {
              this.lastFocusedElem.focus();
            }
          },
          { once: true }
        );
    (_b = this.panelElem) == null
      ? void 0
      : _b.classList.remove("main-menu__panel--visible");
  }
  toggle() {
    this.isVisible ? this.hide() : this.show();
  }
}
const productImg = "./assets/img/image-product-1-thumbnail.jpg";
class MiniCart extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "unsubscribeFromStore", null);
    __publicField(this, "itemElems", null);
    __publicField(this, "badgeElem", null);
    this.clickHandler = this.clickHandler.bind(this);
    this.storeCallback = this.storeCallback.bind(this);
  }
  connectedCallback() {
    this.itemElems = this.querySelector("[data-mini-cart='main']");
    this.badgeElem = this.querySelector("[data-mini-cart='quantity']");
    if (!this.badgeElem)
      throw new Error("MiniCart: Baddge DOM element missing");
    if (!this.itemElems)
      throw new Error("MiniCart: ItemElems DOM element missing");
    this.unsubscribeFromStore = store.subscribe(this.storeCallback);
    this.storeCallback();
    this.addEventListener("click", this.clickHandler);
  }
  disconnectedCallback() {
    var _a;
    this.removeEventListener("click", this.clickHandler);
    (_a = this.unsubscribeFromStore) == null ? void 0 : _a.call(this);
  }
  clickHandler(e) {
    const target = e.target;
    const action = target.getAttribute("data-mini-cart");
    switch (action) {
      case "remove":
        this.removeItem(target.getAttribute("data-mini-cart-item"));
        break;
    }
  }
  storeCallback() {
    var _a;
    const itemCount = store.getState().cart.length;
    this.badgeElem.innerText = itemCount > 0 ? `${itemCount}` : "";
    (_a = this.badgeElem) == null
      ? void 0
      : _a.setAttribute(
          "data-badge-value",
          `${itemCount > 0 ? `${itemCount}` : ""}`
        );
    this.render();
  }
  removeItem(id) {
    console.log("ID IS", id);
    store.dispatch({ type: "cart/removeItem", payload: { id } });
  }
  render() {
    if (!this.itemElems) return;
    const itemsHtml = store
      .getState()
      .cart.map((item) => this.renderItem(item))
      .join("");
    const checkoutHtml = store.getState().cart.length
      ? `<ul class="mini-cart-items__list">${itemsHtml}</ul><a href="#checkout" title="Checkout" aria-label="Checkout" class="btn btn--lg btn--primary mini-cart__checkout-btn">Checkout</a>`
      : `<span class="mini-cart__no-items">Your cart is empty.</span>`;
    this.itemElems.innerHTML = checkoutHtml;
  }
  renderItem(item) {
    const totalPrice = (item.quantity * item.price).toFixed(2);
    return `
      <li class="mini-cart__item">
        <figure class="mini-cart__item-fig">
          <img src="${productImg}" alt="Thumbnail of ${
      item.title
    }" width="176" height="176" />
        </figure>
        <div class="mini-cart__item-info">
          <a href="#fall-limited-edition-sneakers" class="mini-cart__item-link">
            <span class="mini-cart__item-title">${item.title}</span>
            <div class="mini-cart__item-price">
              <span class="mini-cart__price">
                <span class="mini-cart__price-currency">$</span>
                <span class="mini-cart__price-value">${item.price.toFixed(
                  2
                )}</span>
              </span>
              <span class="mini-cart__item-qty">
                <span class="mini-cart__item-qty-sep">x</span>
                <span class="mini-cart__item-qty-value">${item.quantity}</span>
              </span>
              <span class="mini-cart__price mini-cart__price--total">
                <span class="mini-cart__price-currency">$</span>
                <span class="mini-cart__price-value">${totalPrice}</span>
              </span>
            </div>
          </a>
        </div>
        <button data-mini-cart="remove" data-mini-cart-item="${
          item.id
        }" class="mini-cart__item-btn" 
          type="button" title="Remove item" aria-label="Remove item">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" vieBox="0 0 14 14">
            <use href="#icon-trash" />
          </svg>
        </button>
      </li>
    `;
  }
}
class ProductGallery extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "mainImgElem", null);
    __publicField(this, "thumbElems", []);
    __publicField(this, "currentIndex", 0);
    this.handleClick = this.handleClick.bind(this);
  }
  connectedCallback() {
    this.mainImgElem = this.querySelector('[data-product-gallery="main-img"]');
    this.thumbElems = Array.from(
      this.querySelectorAll('[data-product-gallery="thumb"]')
    );
    this.showNext = this.showNext.bind(this);
    this.showPrev = this.showPrev.bind(this);
    this.updateGallery(this.currentIndex);
    if (this.getAttribute("inModal")) {
      alert("ya wanna sho me in modal?");
    }
    this.addEventListener("click", this.handleClick);
  }
  disconnectedCallback() {
    console.log("BYE");
    this.removeEventListener("click", this.handleClick);
  }
  handleClick(e) {
    var _a, _b;
    const target = e.target.closest("[data-product-gallery]");
    if (e.target === this.mainImgElem) {
      const modal = this.querySelector("modal-window");
      if (!modal) return;
      const modalGallery = document.createElement("product-gallery");
      modalGallery.setAttribute("inModal", "");
      const gallery =
        (_a = this.querySelector("[data-product-gallery='main']")) == null
          ? void 0
          : _a.cloneNode(true);
      modal.setContent(gallery);
      modal.appendChild(modalGallery);
      modal.addEventListener(
        "modal-window.hide",
        () => {
          modal.clearContent();
        },
        { once: true }
      );
      modal.show();
    }
    if (!target) return;
    const attr = target.getAttribute("data-product-gallery");
    if (!attr) return;
    switch (attr) {
      case "next":
        this.showNext();
        break;
      case "prev":
        this.showPrev();
        break;
      case "thumb":
        const index = this.thumbElems.indexOf(target);
        if (index !== -1) {
          this.updateGallery(index);
        }
        break;
      case "modal":
        console.log("so you wanna modal, huh");
        (_b = this.querySelector("dialog")) == null ? void 0 : _b.show();
        break;
    }
  }
  showPrev() {
    const newIndex =
      (this.currentIndex - 1 + this.thumbElems.length) % this.thumbElems.length;
    this.updateGallery(newIndex);
  }
  showNext() {
    const newIndex = (this.currentIndex + 1) % this.thumbElems.length;
    this.updateGallery(newIndex);
  }
  updateGallery(index) {
    if (index === this.currentIndex) return;
    const selectedBtn = this.thumbElems[index];
    const selectedImg = selectedBtn.querySelector("img");
    if (!selectedImg || !this.mainImgElem) return;
    this.mainImgElem.src = selectedImg.src;
    this.mainImgElem.alt = `Main view of ${selectedImg.alt.replace(
      "Thumbnail of ",
      ""
    )}`;
    this.thumbElems.forEach((btn, i) => {
      const isActive = i === index;
      btn.ariaCurrent = isActive ? "true" : "false";
    });
    this.currentIndex = index;
  }
}
class ModalWindow extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "dialogElem");
    __publicField(this, "expanded", false);
    __publicField(this, "previousActiveElement", null);
    this.dialogElem = null;
    this.clickHandler = this.clickHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
  }
  connectedCallback() {
    this.dialogElem = this.querySelector("[data-modal-window='dialog']");
    if (!this.dialogElem) throw Error("Dialog element not found.");
    this.previousActiveElement = document.activeElement;
    this.addEventListener("click", this.clickHandler);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.clickHandler);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      `Attribute ${name} has changed form ${oldValue} to ${newValue}`
    );
  }
  clickHandler(e) {
    const target = e.target;
    const attr = target.getAttribute("data-modal-window");
    if (!target || target === this.dialogElem) {
      this.lightDismissHandler(e);
      return;
    }
    if (attr === "toggle") {
      !this.expanded ? this.show() : this.hide();
    }
  }
  keydownHandler(e) {
    if (e.key === "Tab") this.trapFocus(e);
  }
  setToggleAttributes() {
    this.querySelectorAll("[data-modal-window='toggle']").forEach((elem) => {
      elem.ariaExpanded = `${this.expanded}`;
    });
  }
  lightDismissHandler(e) {
    const rect = this.dialogElem.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) this.hide();
  }
  trapFocus(e) {
    var _a;
    const focusableElements =
      (_a = this.dialogElem) == null
        ? void 0
        : _a.querySelectorAll("a[href], button, textarea, input, select");
    if (!focusableElements) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
  positionDialog(anchor, dialog) {
    const anchorRect = anchor.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = anchorRect.left + anchorRect.width / 2 - dialogRect.width / 2;
    const minLeft = 16;
    const maxLeft = viewportWidth - dialogRect.width - 16;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    let top = anchorRect.bottom;
    const minTop = 16;
    const maxTop = viewportHeight - dialogRect.height - 16;
    top = Math.max(minTop, Math.min(top, maxTop));
    dialog.style.setProperty("--dialog-x", `${Math.floor(left)}px`);
    dialog.style.setProperty("--dialog-y", `${Math.floor(top)}px`);
    dialog.classList.add("modal-window__dialog--anchored");
  }
  emit(type) {
    this.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed: true })
    );
  }
  setContent(html) {
    if (!this.dialogElem) return;
    if (typeof html === "string") {
      this.dialogElem.innerHTML = html;
    } else if (html instanceof Node) {
      this.dialogElem.appendChild(html);
    }
  }
  clearContent() {
    if (!this.dialogElem) return;
    this.dialogElem.innerHTML = "";
  }
  show() {
    var _a, _b;
    this.expanded = true;
    (_a = this.dialogElem) == null
      ? void 0
      : _a.addEventListener("keydown", this.keydownHandler);
    this.dialogElem.addEventListener("cancel", () => this.hide(), {
      once: true,
    });
    this.setToggleAttributes();
    (_b = this.dialogElem) == null ? void 0 : _b.showModal();
    const anchorId = this.getAttribute("anchor");
    if (anchorId && anchorId !== "") {
      const anchorElem = document.getElementById(anchorId);
      anchorElem && this.positionDialog(anchorElem, this.dialogElem);
    }
    this.emit("modal-window.show");
  }
  hide() {
    var _a, _b;
    this.expanded = false;
    (_a = this.dialogElem) == null
      ? void 0
      : _a.removeEventListener("keydown", this.keydownHandler);
    this.setToggleAttributes();
    (_b = this.previousActiveElement) == null ? void 0 : _b.focus();
    this.dialogElem.close();
    this.emit("modal-window.hide");
  }
}
__publicField(ModalWindow, "observedAttributes", ["anchor"]);
class ProductQuantity extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "outputElem", null);
    __publicField(this, "unsubscribeFromStore", null);
    this.storeCallback = this.storeCallback.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
  }
  connectedCallback() {
    this.outputElem = this.querySelector("[data-product-quantity='output']");
    if (!this.outputElem) throw new Error("Output DOM element missing");
    this.unsubscribeFromStore = store.subscribe(this.storeCallback);
    this.render();
    this.addEventListener("click", this.clickHandler);
  }
  disconnectedCallback() {
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
    }
    this.removeEventListener("click", this.clickHandler);
  }
  storeCallback() {
    this.render();
  }
  render() {
    const item = this.getFirstItemFromCart();
    if (this.outputElem) {
      this.outputElem.textContent = item ? String(item.quantity) : "0";
    }
  }
  clickHandler(e) {
    const target = e.target;
    const action = target.getAttribute("data-product-quantity");
    if (action === "increment") {
      this.changeProductQuantityBy(1);
    } else if (action === "decrement") {
      this.changeProductQuantityBy(-1);
    }
  }
  getFirstItemFromCart() {
    return store.getState().cart[0];
  }
  changeProductQuantityBy(delta) {
    const item = this.getFirstItemFromCart();
    if (!item) return;
    store.dispatch({
      type: "cart/setQuantity",
      payload: { id: item.id, quantity: delta },
    });
  }
}
window.customElements.define("product-gallery", ProductGallery);
window.customElements.define("main-menu", MainMenu);
window.customElements.define("mini-cart", MiniCart);
window.customElements.define("modal-window", ModalWindow);
window.customElements.define("product-quantity", ProductQuantity);
document
  .querySelector("#product-add-to-cart-btn")
  .addEventListener("click", () => {
    store.dispatch({
      type: "cart/addItem",
      payload: {
        title: "Fall Limited Edition Sneakers",
        id: "test-id-" + store.getState().cart.length + 1,
        quantity: 1,
        price: 125,
      },
    });
  });
