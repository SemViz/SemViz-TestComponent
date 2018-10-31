import $ from 'jquery';
import jstree from 'jstree';
import jstreeCSS from 'jstree/dist/themes/default/style.css';
import sift from 'sift'

export default class SkosTreeSV extends HTMLElement {

  constructor() {
    super();
    this.subscriptions = [];

  }

  setChannel(channel) {
    //console.log('setChannel');
    this.channel = channel;
    this.subscriptions.push(channel.subscribe("tree/items/set", (data, envelope) => {
      //console.log('tree/items/set', data);
      this.data = data.data;
      data.webTripleStore.getALL().then(ontology => {
        console.log("ontology", ontology);
      });
      this.renderTree();
      this.stopLoading();
    }));
    this.subscriptions.push(channel.subscribe("tree/items/loading", (data, envelope) => {
      this.startLoading();
    }));
    this.initSelect();
  }
  initSelect() {
    //console.log('ALLO0');
    if (this.jstree != undefined && this.channel != undefined) {
      //console.log('ALLO1');
      this.jstree.on("select_node.jstree", (e, node) => {
        //console.log('SELECT', node);
        this.channel.publish('tree/item/select', {
          concept: [node.node.data]
        })
      });
    }
  }
  buildJsTreeRoot(sourceList) {
    let tree = this.buildJsTree(
      sourceList.filter(r => r['http://www.w3.org/2004/02/skos/core#broader'] == undefined),
      sourceList.filter(r => r['http://www.w3.org/2004/02/skos/core#broader'] != undefined)
    );
    //console.log(tree);
    return tree;
  }
  buildJsTree(sourceList, pool, isNotFirst) {
    let nodeList = [];
    for (let item of sourceList) {
      let node = {
        text: item['http://www.w3.org/2004/02/skos/core#prefLabel'],
        data: item,
        children: []
      }
      let children = pool.filter(r => r['http://www.w3.org/2004/02/skos/core#broader']['@id'] == item['@id']);
      pool = sift({
          '@id': {
            '$nin': children.map(r => r['@id'])
          }
        },
        pool
      );
      if (children.length > 0) {
        node.children = this.buildJsTree(children, pool, true);
      } else {
        node.children = [];
      }
      nodeList.push(node);
    }
    return nodeList;
  }

  renderTree() {
    if (this.jstree && this.data) {

      let nodeGraph = this.buildJsTreeRoot(this.data);

      this.jstree.jstree(true).settings.core.data = nodeGraph;
      this.jstree.jstree(true).refresh();
    }

  }

  startLoading() {
    this.shadowRoot.querySelector('.loader').classList.remove('hide');
  }
  stopLoading() {
    //console.log('STOP LOADING');
    this.shadowRoot.querySelector('.loader').classList.add('hide');
  }

  connectedCallback() {
    let properties = this.querySelectorAll('property');
    // console.log("jstree", jstree);
    // console.log("jstreeCSS", jstreeCSS.toString());

    //console.log(properties);
    $(() => {
      const jsTreeStyle = document.createElement('style');
      jsTreeStyle.type = 'text/css';
      jsTreeStyle.appendChild(document.createTextNode(jstreeCSS.toString()))
      $(this.shadowRoot).append(jsTreeStyle);
      $(this.shadowRoot).find('#container').jstree({
        'core': {
          //data: treeData,
          themes: {
            icons: false,
            dots: false
          },
          check_callback: true
        }
      });
      this.jstree = $(this.shadowRoot).find('#container')
      this.initSelect();
      this.renderTree();
    });


  }
}
