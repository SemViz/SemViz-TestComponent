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
    this.cols = ['title', 'label.@value', 'website'];
    this.taxonomyFilter = [];
  }

  setChannel(channel) {

    // let formats = new rdfExt.Parsers({
    //   'text/turtle': N3Parser
    // })
    let formats = formatsCommon();
    console.log('parsers', formats.parsers);

    this.channel = channel;
    // this.subscriptions.push(channel.subscribe("table/skos/filter", (data, envelope) => {
    //   //console.log('table/skos/filter', data);
    //   this.taxonomyFilter = [data];
    //   this.renderTable();
    // }));
    this.subscriptions.push(channel.subscribe("table/items/set", (data, envelope) => {
      //console.log('table/skos/filter', data);
      this.data = data;
      this.renderTable();
      this.stopLoading();
    }));
    this.subscriptions.push(channel.subscribe("table/ontology/set", (data, envelope) => {
      //console.log('Ontology', data);
      for (let key in data) {
        let value = data[key];

        if (typeof(value) == 'string' || value instanceof String) {
          //console.log(value, value.indexOf("@base"));
          if (key.indexOf("@base") == -1) {
            //console.log('fetch ontology', value);
            //'https://cors.io/?https://api.webuntis.dk/api/status';
            let corsUrl = 'https://cors-anywhere.herokuapp.com/' + value;
            //console.log(corsUrl);
            let contentType;
            fetch(corsUrl, {
                method: 'GET',
                //mode: 'no-cors',
                mode: 'cors',
              })
              .then(function(response) {
                //console.log('Ontology response',response,response.text());
                //console.log('Content-Type',value,response.headers.get('Content-Type'));
                let contentTypeFull = response.headers.get('Content-Type');
                //let splitIndex = contentTypeFull.split(';')
                contentType = contentTypeFull.split(';')[0];
                return response.text();
              })
              .then((data) => {
                //console.log('Ontology response',value,contentType, data);
                let parser = formats.parsers[contentType];
                let quads = [];
                // let quadStream = new Readable({
                //   objectMode: true,
                //   read: () => {}
                // });
                //let quadStream = new Readable();
                if (parser != undefined) {
                  //let quadStream =
                  // let iteration2=0;
                  let quadStream = parser.import(stringToStream(data));
                  quadStream.on('data', (quad) => {
                    //console.log('tripleToQuad data',quad);
                  })
                  let serializerJsonLd = formats.serializers['application/ld+json'];
                  let jsonLdStream = serializerJsonLd.import(quadStream);
                  let jsonLdString = "";
                  jsonLdStream.on('data', (data) => {
                    jsonLdString = jsonLdString.concat(data);
                    // console.log('streamJsonLD data',JSON.parse(data));
                  }).on('end', () => {
                    let jsonLdObjet = JSON.parse(jsonLdString)
                    console.log('JsonLd Ontology', value,contentType, jsonLdObjet);
                  }).on('error', () => {
                    console.log('ERROR');
                  })
                } else {
                  if (contentType == 'application/rdf+xml') {

                    let RDFparser = new RdfXmlParser();

                    let tripleToQuad = new TripleToQuadTransform();

                    // let quads = [];
                    // tripleToQuad.on('data', (quad) => {
                    //   quads.push(quad)
                    // }).on('end', () => {
                    //   //console.log('tripleToQuad end',quads);
                    //
                    // })

                    let serializerJsonLd = formats.serializers['application/ld+json'];
                    let jsonLdStream = serializerJsonLd.import(tripleToQuad);
                    let jsonLdString = "";
                    jsonLdStream.on('data', (data) => {
                      jsonLdString = jsonLdString.concat(data);
                      //console.log('streamJsonLD data', JSON.parse(data));
                    }).on('end', () => {
                      let jsonLdObjet = JSON.parse(jsonLdString)
                      console.log('JsonLd Ontology', value,contentType, jsonLdObjet);
                    }).on('error', (err) => {
                      console.log('ERROR',err);
                    })


                    RDFparser.stream(data).on('data', (triple) => {
                      let newTriple={};
                      let object={};
                      object.value= triple.object.nominalValue;
                      if(triple.object.datatype!=undefined){
                        object.datatype={value:triple.object.datatype.nominalValue}
                      }
                      if(triple.object.language!=undefined){
                        object.language=triple.language;
                      }
                      newTriple.object=object;
                      newTriple.predicate={value:triple.predicate.nominalValue};
                      newTriple.subject={value:triple.subject.nominalValue};
                      //jsonLdString = jsonLdString.concat(data);
                      // console.log('tripleToQuad triple',triple,newTriple);
                      tripleToQuad.write(newTriple);
                    }).on('readable', () => {
                      tripleToQuad.end();
                    })


                  } else {
                    console.warn('No parser for contentType', value, contentType);
                  }
                }
              })
              .catch(function(error) {
                console.error('Request failed', value, error)
              });
          }

        }
      }

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

        //console.log('dotProp.get(record, col)',dotProp.get(record, col),record,col);
        let td = document.createElement("td");
        let text = document.createTextNode(dotProp.get(record, col));
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
