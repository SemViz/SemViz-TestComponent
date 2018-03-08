const currentDocument = document.currentScript.ownerDocument;
class TestComponent extends HTMLElement {
  constructor() {
    // If you define a constructor, always call super() first as it is required by the CE spec.
    super();

    // Setup a click listener on <user-card>
    this.addEventListener('click', e => {
      this.sayHello();
    });
  }

  sayHello() {
    console.log("Element was clicked!");
  }

  connectedCallback() {
    console.log('ALLO');
   const shadowRoot = this.attachShadow({mode: 'open'});

   // Select the template and clone it. Finally attach the cloned node to the shadowDOM's root.
   // Current document needs to be defined to get DOM access to imported HTML
   const template = currentDocument.querySelector('#testComponent-template');
   const instance = template.content.cloneNode(true);
   shadowRoot.appendChild(instance);
 }
}

customElements.define('test-component', TestComponent);
