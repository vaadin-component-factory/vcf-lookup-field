import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-dialog';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter';
import '@polymer/iron-icon';
import '@vaadin/vaadin-icons';

/**
 * `<vcf-element>` [element-description]
 *
 * ```html
 * <vcf-element></vcf-element>
 * ```
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|-------------
 * `--vcf-element-property` | Example custom property | `unset`
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `part` | Example part
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `attribute` | Example styling attribute | :host
 *
 * @memberof Vaadin
 * @mixes ElementMixin
 * @mixes ThemableMixin
 * @demo demo/index.html
 */

class VcfLookupField extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        .root {
          display: inline-block;
        }
      </style>
      <div class="root">
        <slot name="field">
          <vaadin-combo-box
            id="field"
            clear-button-visible
            allow-custom-value
            items="{{items}}"
            item-label-path="{{itemLabelPath}}"
            item-value-path="{{itemValuePath}}"
          ></vaadin-combo-box>
        </slot>
        <vaadin-button theme="icon" on-click="__open">
          <iron-icon icon="vaadin:search"></iron-icon>
        </vaadin-button>
        <vaadin-dialog aria-label="lookup-grid" id="dialog" theme="lookup-dialog" modeless$="[[modeless]]">
          <slot name="grid">
            <vaadin-grid id="grid" items="[[filterItems(items, _filterdata)]]">
              <vaadin-grid-column path="name" path="{{itemLabelPath}}"></vaadin-grid-column>
            </vaadin-grid>
          </slot>
          <div id="dialogcontent" class="lookup-field-dialog-content">
            <section style="display: flex; flex-direction: column;">
              <header class="draggable">{{title}}</header>
              <main id="main" style="overflow: auto;">
                <vaadin-text-field
                  id="filter"
                  class="lookup-field-filter"
                  style="width:100%;"
                  tabindex="0"
                  label="Search"
                  on-value-changed="__filterGrid"
                  clear-button-visible
                >
                  <iron-icon icon="lumo:search" slot="suffix"></iron-icon>
                </vaadin-text-field>
              </main>
              <footer>
                <vaadin-button
                  id="selectbtn"
                  theme="primary"
                  disabled
                  aria-disabled="true"
                  role="button"
                  on-click="__select"
                >
                  Select
                </vaadin-button>
                <vaadin-button tabindex="0" role="button" on-click="__close" theme="tertiary">
                  Cancel
                </vaadin-button>
              </footer>
            </section>
          </div>
        </vaadin-dialog>
      </div>
    `;
  }

  constructor() {
    super();
    this._observer = new FlattenedNodesObserver(this, info => {
      this.__onDomChange(info.addedNodes);
    });
  }

  ready() {
    super.ready();
    this._grid = this.$.grid;
    this._field = this.$.field;
    const that = this;

    if (this.$.grid) {
      this.$.grid.addEventListener('active-item-changed', e => {
        const item = e.detail.value;
        if (item) {
          that.$.selectbtn.removeAttribute('disabled');
        } else {
          that.$.selectbtn.setAttribute('disabled', 'disabled');
        }
        that._grid.selectedItems = item ? [item] : [];
        that._gridSelectedItem = item;
      });
    }

    if (this.$.field) {
      this.$.field.addEventListener('filter-changed', function(e) {
        that._filterValue = e.detail.value;
      });
    }
    /**
     * fill the dialog content with the grid in the slot
     */
    this.$.dialog.renderer = function(root, dialog) {
      if (root.firstElementChild) {
        return;
      }
      that.$.main.appendChild(that._grid);
      root.appendChild(that.$.dialogcontent);
    };
  }

  __onSelectItem(event) {
    const item = event.detail.value;
    if (item) {
      this.$.selectbtn.removeAttribute('disabled');
    } else {
      this.$.selectbtn.setAttribute('disabled', 'disabled');
    }
    this._gridSelectedItem = item;
  }

  /** @private */
  __onDomChange(nodes) {
    const that = this;
    nodes.forEach(node => {
      if (node.getAttribute) {
        if (node.getAttribute('slot') == 'grid') {
          this._grid = node;
          this._grid.addEventListener('active-item-changed', e => {
            const item = e.detail.value;
            if (item) {
              that.$.selectbtn.removeAttribute('disabled');
            } else {
              that.$.selectbtn.setAttribute('disabled', 'disabled');
            }
            that._gridSelectedItem = item;
          });
        } else if (node.getAttribute('slot') == 'field') {
          this._field = node;
          this._field.addEventListener('filter-changed', function(e) {
            that._filterValue = e.detail.value;
          });
        }
      }
    });
  }

  __filterGrid(event) {
    if (this.$server) {
      this.$server.filterGrid(this.$.filter.value);
    } else {
      // todo jcg
      this._filterdata = this.$.filter.value;
    }
  }

  filterItems(items, filterData) {
    if (items) {
      return items.filter(item => this._getItemLabel(item.toLowerCase()).includes(filterData.toLowerCase()));
    } else {
      return [];
    }
  }

  /** @private */
  __open() {
    this.$.dialog.opened = true;
    this.$.filter.value = this._field.inputElement.value;
    if (this.$server) {
      this.$server.copyFieldValueToGrid();
    } else {
      const item = this._field.selectedItem;
      this._grid.selectedItems = item ? [item] : [];
      this._gridSelectedItem = item;
    }
  }
  /** @private */
  __close() {
    this.$.dialog.opened = false;
  }
  /** @private */
  __select() {
    if (this.$server) {
      this.$server.copyFieldValueFromGrid();
    } else {
      this._field.selectedItem = this._gridSelectedItem;
    }

    this.$.dialog.opened = false;
  }

  _getItemLabel(item) {
    let label = item && this.itemLabelPath ? this.get(this.itemLabelPath, item) : undefined;
    if (label === undefined) {
      label = item ? item.toString() : '';
    }
    return label;
  }

  _itemsChanged() {
    if (this._field) {
      this._field.items = this.items;
    }
    /* if (this._grid) {
      this._grid.items = this.items;
    }*/
  }

  static get is() {
    return 'vcf-lookup-field';
  }

  static get version() {
    return '1.0.0';
  }

  static get properties() {
    return {
      title: {
        type: String
      },
      /**
       * A full set of items to filter the visible options from.
       * The items can be of either `String` or `Object` type.
       * @type {!Array<string> | undefined}
       */
      items: {
        type: Array,
        observer: '_itemsChanged'
      },

      _filterdata: {
        type: String
      },
      /**
       * Path for label of the item. If `items` is an array of objects, the
       * `itemLabelPath` is used to fetch the displayed string label for each
       * item.
       *
       * The item label is also used for matching items when processing user
       * input, i.e., for filtering and selecting items.
       *
       * When using item templates, the property is still needed because it is used
       * for filtering, and for displaying the selected item value in the input box.
       * @attr {string} item-label-path
       * @type {string}
       */
      itemLabelPath: {
        type: String,
        value: 'label'
      },

      /**
       * Path for the value of the item. If `items` is an array of objects, the
       * `itemValuePath:` is used to fetch the string value for the selected
       * item.
       *
       * The item value is used in the `value` property of the combo box,
       * to provide the form value.
       * @attr {string} item-value-path
       * @type {string}
       */
      itemValuePath: {
        type: String,
        value: 'value'
      },

      /**
       * @type {Boolean}
       */
      modeless: Boolean
    };
  }
}

customElements.define(VcfLookupField.is, VcfLookupField);

/**
 * @namespace Vaadin
 */
window.Vaadin.VcfLookupField = VcfLookupField;
