import sift from 'sift'
import dotProp from 'dot-prop'
import rdfExt from 'rdf-ext'
import N3Parser from 'rdf-parser-n3'
import rdfFetch from 'rdf-fetch-lite'
import formatsCommon from 'rdf-formats-common'
import stringToStream from 'string-to-stream'
import Readable from 'readable-stream'
import RdfXmlParser from 'rdf-parser-rdfxml'
import rdflib from 'rdflib'
import TripleToQuadTransform from 'rdf-transform-triple-to-quad'


export default class SemantiTableSV extends HTMLElement {

  constructor() {
    super();
    this.subscriptions = [];
    this.cols = ['title', 'http://www.w3.org/2000/01/rdf-schema#label', 'website'];
    this.taxonomyFilter = [];
  }



  setChannel(channel) {

    // let formats = new rdfExt.Parsers({
    //   'text/turtle': N3Parser
    // })

    //    console.log('parsers', formats.parsers);

    this.channel = channel;
    // this.subscriptions.push(channel.subscribe("table/skos/filter", (data, envelope) => {
    //   //console.log('table/skos/filter', data);
    //   this.taxonomyFilter = [data];
    //   this.renderTable();
    // }));
    this.subscriptions.push(channel.subscribe("table/items/set", (data, envelope) => {
      //console.log('table/skos/filter', data);
      console.log('table/items/set',data);
      this.data = data.data;
      let ontology;
      data.webTripleStore.getALL().then(ontology=>{
        console.log(ontology);
        this.renderTable();
        this.stopLoading();
      }).catch(e=>{
        console.error(e);
      })

    }));


    this.subscriptions.push(channel.subscribe("table/ontology/set", (data, envelope) => {
      // this.resolveSemanticContext(data).then(results => {
      //   console.log(results);
      // });
      console.log('Ontology', data);


    }));
    this.subscriptions.push(channel.subscribe("table/items/loading", (data, envelope) => {
      this.cleanTable();
      this.startLoading();
    }));

  }
  startLoading() {
    this.shadowRoot.querySelector('.loader').classList.remove('hide');
  }
  stopLoading() {
    this.shadowRoot.querySelector('.loader').classList.add('hide');
  }
  cleanTable() {
    let tablebody = this.shadowRoot.querySelector('#table tbody');
    while (tablebody.firstChild) {
      tablebody.removeChild(tablebody.firstChild);
    }
  }
  renderTable() {

    let tablebody = this.shadowRoot.querySelector('#table tbody');
    let filteredData;
    //console.log('filter',this.taxonomyFilter.map(r => r['@id']));
    let realFilter = this.taxonomyFilter.map(r => r['@id'])
    if (this.taxonomyFilter.length > 0) {
      //console.log('ALLO1');
      // filteredData = sift({
      //   'taxonomy.@id': {
      //     '$in': this.taxonomyFilter.map(r => r['@id'])
      //   }
      // }, this.data);
      filteredData = this.data.filter(r => {
        return r.taxonomy.filter(t => {
          return realFilter.filter(f => {
            return t['@id'].indexOf(f) > 0
          }).length > 0;
        }).length > 0
      });
    } else {
      //console.log('ALLO2');
      filteredData = this.data;
    }
    //console.log(filteredData);
    for (let record of filteredData) {
      let tr = document.createElement("tr");
      tr.item = record;
      for (let col of this.cols) {

        console.log('dotProp.get(record, col)',dotProp.get(record, col.replace(/\./g, '\\.')),record,col.replace(/\./g, '\\.'));
        let displayValue= dotProp.get(record, col.replace(/\./g, '\\.'));
        if(displayValue!=undefined &&  !(typeof(displayValue) == 'string' || displayValue instanceof String)){
          if(displayValue['@value']!=undefined){
            displayValue=displayValue['@value'];
          }
        }
        let td = document.createElement("td");
        let text = document.createTextNode(displayValue);
        td.appendChild(text);
        tr.appendChild(td);
      }
      //console.log(tr);
      tr.addEventListener('click', e => {
        this.channel.publish('table/item/select', record);
      })
      tablebody.appendChild(tr)
    }
  }


  connectedCallback() {
    let tablebody = this.shadowRoot.querySelector('#table thead');
    //this.shadowRoot.querySelector('.loader').classList.add('hide');
    let tr = document.createElement("tr");
    for (let col of this.cols) {
      let th = document.createElement("th");
      let text = document.createTextNode(col);
      th.appendChild(text);
      tr.appendChild(th);
    }
    tablebody.appendChild(tr);

    // fetch('https://semantic-bus.org/data/api/PWA_Bounds?bounds=-2.55981%2C44.49651%2C3.31787%2C47.86846%3B&boundsJson=%5B%7B%22_southWest%22%3A%7B%22lat%22%3A44.49651%2C%22lng%22%3A-2.55981%7D%2C%22_northEast%22%3A%7B%22lat%22%3A47.86846%2C%22lng%22%3A3.31787%7D%7D%2C%7B%22_southWest%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%2C%22_northEast%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%7D%2C%7B%22_southWest%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%2C%22_northEast%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%7D%2C%7B%22_southWest%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%2C%22_northEast%22%3A%7B%22lat%22%3A0%2C%22lng%22%3A0%7D%7D%5D&categories=', {
    //     mode: 'cors'
    //   })
    //   .then(function(response) {
    //     return response.json();
    //   })
    //   .then((data) => {
    //     this.data = data.data;
    //     this.renderTable();
    //   })
    //   .catch(function(error) {
    //     log('Request failed', error)
    //   });
  }
}
