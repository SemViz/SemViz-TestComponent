import sift from 'sift'
import dotProp from 'dot-prop'

export default class SemantiFormSV extends HTMLElement {

  constructor() {
    super();
    this.subscriptions = [];
    this.fields = ['label.@value', 'title', 'website','source.0'];
  }

  setChannel(channel) {
    this.channel = channel;
    this.subscriptions.push(channel.subscribe("form/item/loading", (data, envelope) => {
      this.cleanForm();
      this.startLoading();
    }));
    this.subscriptions.push(channel.subscribe("form/item/set", (data, envelope) => {
      //console.log('form/item/view', data);
      this.data = data;
      this.renderForm();
      this.stopLoading();
    }));
  }

  cleanForm(){
    let domToClean = this.shadowRoot.querySelector('#container');
    while (domToClean.firstChild) {
      domToClean.removeChild(domToClean.firstChild);
    }
  }
  startLoading(){
    this.shadowRoot.querySelector('.loader').classList.remove('hide');
  }
  stopLoading(){
    this.shadowRoot.querySelector('.loader').classList.add('hide');
  }

  renderForm() {

    let container = this.shadowRoot.querySelector('#container');
    //console.log(container,this.data);
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    for(let field of this.fields){
      let div = document.createElement('div');
      let divLabel = document.createElement('div');
      let label=document.createElement('label');
      divLabel.appendChild(label);
      div.appendChild(divLabel);
      let textLabel = document.createTextNode(field);
      label.appendChild(textLabel);
      let divSpan=document.createElement('div');
      let span= document.createElement('span');
      let textSpan = document.createTextNode(dotProp.get(this.data, field));
      span.appendChild(textSpan);
      divSpan.appendChild(span);
      div.appendChild(divSpan);
      container.appendChild(div);
    }
  }


  connectedCallback() {
    // this.shadowRoot.querySelector('#close').addEventListener('click',e=>{
    //   this.channel.publish('form/item/close', undefined);
    // })
  }
}
