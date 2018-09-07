import $ from 'jquery';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';
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
      //console.log('table/skos/filter', data);
      this.data = data;
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
  buildJsTree(sourceList, pool) {

    let nodeList = [];
    while (sourceList.length > 0) {
      let item = sourceList.shift();
      pool = sift({
        '@id': {
          $ne: item['@id']
        }
      }, pool);
      let node = {
        text: item.prefLabel,
        data: item,
        children: []
      }

      let children = sift({
        broader: item['@id']
      }, pool);

      let buildTreeResult = this.buildJsTree(children, pool)
      node.children = buildTreeResult.tree;
      pool = buildTreeResult.pool;

      nodeList.push(node);
      sourceList = sift({
        '@id': {
          '$in': pool.map(r => r['@id'])
        }
      }, sourceList);

    }

    // for (let child of children) {//   node.children.push(this.buildJsTree(child));
    // }
    //console.log('BUILD4', node);
    return {
      tree: nodeList,
      pool: pool
    };
  }

  renderTree() {
    if (this.jstree && this.data) {

      let nodeGraph = this.buildJsTree(this.data, this.data);

      this.jstree.jstree(true).settings.core.data = nodeGraph.tree;
      this.jstree.jstree(true).refresh();
    }

  }

  startLoading(){
    this.shadowRoot.querySelector('.loader').classList.remove('hide');
  }
  stopLoading(){
    //console.log('STOP LOADING');
    this.shadowRoot.querySelector('.loader').classList.add('hide');
  }

  connectedCallback() {

    $(() => {
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
