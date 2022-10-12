import { html, LitElement, css } from 'lit';

import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '@vaadin/button';
import '@vaadin/combo-box';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-filter';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/notification/vaadin-notification';
import '@vaadin/text-field';
import '@vaadin/dialog';
import '@vaadin/vertical-layout';

/**
 * `<vcf-lookup-field>` [element-description]
 *
 * ```html
 * <vcf-lookup-field></vcf-lookup-field>
 * ```
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|-------------
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
export class LookupField extends ElementMixin(ThemableMixin(LitElement)) {
  static get styles() {
    return [
      css`
        :host {
          display: inline-block;
        }
        .container {
          width: 100%;
          display: inline-flex;
          align-items: baseline;
        }
        vaadin-combo-box {
          width: 100%;
          min-width: 0;
        }
        vaadin-button.search-button {
          margin-left: var(--lumo-space-xs);
          flex: 0 0 auto;
        }
        .enhanced-dialog-footer {
          display: flex;
        }
        :host([theme~='integrated']) .container {
          align-items: flex-end;
        }
        :host([theme~='integrated']) vaadin-combo-box::part(input-field) {
          border-radius: var(--lumo-border-radius-s) 0 0 var(--lumo-border-radius-s);
        }
        :host([theme~='integrated']) .search-button {
          margin-left: 0;
          border-radius: 0 var(--lumo-border-radius-s) var(--lumo-border-radius-s) 0;
        }
        :host([readonly]) vaadin-button.search-button {
          background-color: transparent;
          border: 1px dashed var(--lumo-contrast-30pct);
        }
        :host([invalid]) vaadin-button.search-button {
          color: var(--lumo-error-text-color);
          background-color: var(--lumo-error-color-10pct);
        }
      `
    ];
  }
  render() {
    return html`
      <vaadin-horizontal-layout class="container">
        <slot name="field" id="fieldSlot">
          <vaadin-combo-box
            clear-button-visible
            allow-custom-value
            .items="${this.items}"
            @items-changed="${e => (this.items = e.target.value)}"
            .item-label-path="${this.itemLabelPath}"
            @item-label-path-changed="${e => (this.itemLabelPath = e.target.value)}"
            .item-value-path="${this.itemValuePath}"
            @item-value-path-changed="${e => (this.itemValuePath = e.target.value)}"
            required="${this.required}"
            readonly="${this.readonly}"
          ></vaadin-combo-box>
        </slot>

        <vaadin-button
          id="searchButton"
          class="search-button"
          theme="icon"
          @click="${this.__open}"
          .aria-label="${this.i18n ? this.i18n.searcharialabel : undefined}"
          disabled="${this.buttondisabled()}"
        >
          <vaadin-icon icon="vaadin:search"></vaadin-icon>
        </vaadin-button>

        <vaadin-dialog
          aria-label="lookup-grid"
          id="dialog"
          no-close-on-outside-click
          .header-title="${(this.i18n && this.i18n.headerprefix ? this.i18n.headerprefix : '') +
            ' ' +
            (this.header ? this.header : '') +
            ' ' +
            (this.i18n && this.i18n.headerpostfix ? this.i18n.headerpostfix : '')}"
          theme="${this.theme}"
          modeless="${this.modeless}"
          draggable="${this.draggable}"
          resizable="${this.resizable}"
        >
          <vaadin-vertical-layout id="dialogmain" theme="spacing" style="height: 100%;"></vaadin-vertical-layout>
        </vaadin-dialog>

        <slot name="grid" style="display:none;" id="gridSlot">
          <vaadin-grid .items="${this.filterItems(this.items, this._filterdata)}">
            <vaadin-grid-column path="name" path="{{itemLabelPath}}"></vaadin-grid-column>
          </vaadin-grid>
        </slot>

        <slot name="filter" style="display:none;" id="filterSlot">
          <vaadin-text-field
            id="lookupFieldFilter"
            class="lookup-field-filter"
            style="width:100%;"
            tabindex="0"
            clear-button-visible
            .label="${this.i18n ? this.i18n.search : undefined}"
            @value-changed="${e => (this._filterdata = e.target.value)}"
            .value="${this._filterdata}"
          >
            <vaadin-icon icon="lumo:search" slot="suffix"></vaadin-icon>
          </vaadin-text-field>
        </slot>

        <slot name="footer" style="display:none;" id="footerSlot">
          <vaadin-horizontal-layout theme="spacing-s">
            <vaadin-button
              id="selectbtn"
              theme="primary"
              role="button"
              disabled="${this.selectdisabled}"
              aria-disabled="${this.selectdisabled}"
              @click="${this.__select}"
            >
              ${this.i18n ? this.i18n.select : undefined}
            </vaadin-button>
            <vaadin-button tabindex="0" role="button" theme="tertiary" @click="${this.__close}">
              ${this.i18n ? this.i18n.cancel : undefined}
            </vaadin-button>
            <div style="flex-grow: 1;"></div>
            <vaadin-button
              tabindex="0"
              role="button"
              theme="tertiary"
              @click="${this.__create}"
              ?hidden="${this.createhidden}"
            >
              ${this.i18n ? this.i18n.create : undefined}
            </vaadin-button>
          </vaadin-horizontal-layout>
        </slot>

        <slot name="selected" style="display:none;" id="selectedSlot">
          <div></div>
        </slot>

        <vaadin-notification id="notification" position="top-center">
          <template>
            <div>${this.i18n ? this.i18n.emptyselection : undefined}</div>
          </template>
        </vaadin-notification>
      </vaadin-horizontal-layout>
    `;
  }

  constructor() {
    super();
    this.__onSelectItemsChangedBinded = this.__onSelectChanged.bind(this);
    this.__onActiveItemChangedBinded = this.__onSelectItem.bind(this);
    this._observer = new FlattenedNodesObserver(this, info => {
      this.__onDomChange(info.addedNodes);
    });
    this.disabled = false;
    this.readonly = false;
    this.itemLabelPath = 'label';
    this.itemValuePath = 'value';
    this.defaultselectdisabled = true;
    this.createhidden = true;
    this.programselectdisabled = true;
    this.theme = 'lookup-dialog';
    this.i18n = {
      select: 'Select',
      cancel: 'Cancel',
      search: 'Search',
      searcharialabel: 'Click to open the search dialog',
      headerprefix: '',
      headerpostfix: '',
      emptyselection: 'Please select an item.',
      create: 'Create new'
    };
  }

  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this._grid = this.renderRoot.querySelector('#gridSlot').firstElementChild;
    this._filter = this.renderRoot.querySelector('#filterSlot').firstElementChild;
    this._footer = this.renderRoot.querySelector('#footerSlot').firstElementChild;
    this._field = this.renderRoot.querySelector('#fieldSlot').firstElementChild;
    this._selected = this.renderRoot.querySelector('#selectedSlot').firstElementChild;
    const that = this;

    if (this._grid) {
      this._grid.addEventListener('active-item-changed', this.__onActiveItemChangedBinded);
      this._grid.addEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
    }

    if (this._field) {
      this._field.addEventListener('filter-changed', function(e) {
        that._filterValue = e.detail.value;
      });
    }

    /**
     * fill the dialog content because template in template is not working well
     */
    this.renderRoot.querySelector('#dialog').renderer = function(root, dialog) {
      if (root.firstElementChild) {
        return;
      }
      if (that._dialogHeader) {
        root.appendChild(that.$.dialogheader);
        while (that.$.dialogheader.firstChild) {
          that.$.dialogheader.removeChild(that.$.dialogheader.lastChild);
        }
        that.$.dialogheader.appendChild(that._dialogHeader);
      } else if (that.header) {
        root.appendChild(that.$.dialogheader);
      }
      root.appendChild(that.$.dialogmain);
      that.$.dialogmain.appendChild(that._filter);
      that.$.dialogmain.appendChild(that._grid);
      that.$.dialogmain.appendChild(that._selected);
      that.$.dialogmain.appendChild(that._footer);

      root.appendChild(that.$.dialogfooter);
      if (that._dialogFooter) {
        while (that.$.dialogfooter.firstChild) {
          that.$.dialogfooter.removeChild(that.$.dialogfooter.lastChild);
        }
        that.$.dialogfooter.appendChild(that._dialogFooter);
      }
    };
    this.renderRoot.querySelector('#dialog').addEventListener('opened-changed', e => {
      // dialog close
      if (!e.detail.value) {
        setTimeout(() => {
          this.renderRoot.querySelector('#searchButton').focus();
          this.renderRoot.querySelector('#searchButton').setAttribute('focus-ring', true);
        }, 10);
      }
    });
  }

  __opendialog() {
    this.renderRoot.querySelector('#basic').opened = true;
  }

  __onSelectItem(event) {
    const item = event.detail.value;
    this._grid.selectedItems = item ? [item] : [];
  }

  __onSelectChanged(event) {
    this._gridSelectedItem = [...event.detail.value];
    if (event.detail.value.length > 0) {
      this.programselectdisabled = false;
    } else {
      this.programselectdisabled = true;
    }
  }

  /** @private */
  __onDomChange(nodes) {
    const that = this;
    nodes.forEach(node => {
      if (node.getAttribute) {
        if (node.getAttribute('slot') == 'grid') {
          this._grid.removeEventListener('active-item-changed', this.__onActiveItemChangedBinded);
          this._grid.removeEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
          this._grid = node;
          this._grid.addEventListener('active-item-changed', this.__onActiveItemChangedBinded);
          this._grid.addEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
        } else if (node.getAttribute('slot') == 'field') {
          this._field = node;
          this._field.style.flexGrow = 1;
          this._field.addEventListener('filter-changed', function(e) {
            that._filterValue = e.detail.value;
          });
        } else if (node.getAttribute('slot') == 'dialog-header') {
          this._dialogHeader = node;
        } else if (node.getAttribute('slot') == 'dialog-footer') {
          this._dialogFooter = node;
        } else if (node.getAttribute('slot') == 'filter') {
          this._filter = node;
        } else if (node.getAttribute('slot') == 'selected') {
          this._selected = node;
        }
      }
    });
  }

  computeselectdisabled(defaultselectdisabled, programselectdisabled) {
    return defaultselectdisabled && programselectdisabled;
  }

  computehasselected(programselectdisabled) {
    return !programselectdisabled;
  }

  computebuttondisabled(readonly, disabled) {
    return readonly || disabled;
  }

  __filterGrid(event) {
    if (this.$server) {
      this.$server.filterGrid(event.detail.value);
    } else {
      if (this._grid) {
        this._grid.items = this.filterItems(this.items, event.detail.value);
      }
    }
  }

  filterItems(items, filterData) {
    if (items && filterData) {
      return items.filter(item =>
        this._getItemLabel(item)
          .toLowerCase()
          .includes(filterData.toLowerCase())
      );
    } else {
      return items;
    }
  }

  /** @private */
  __open() {
    this.renderRoot.querySelector('#dialog').opened = true;
    setTimeout(() => {
      this.renderRoot.querySelector('#lookupFieldFilter').setAttribute('focus-ring', true);
      this.renderRoot.querySelector('#lookupFieldFilter').focus();
    }, 10);

    if (this.$server) {
      this.$server.copyFieldValueToGrid();
      this.$server.filterGrid(this._filterdata);
    } else {
      this._filterdata = this._field.inputElement.value;
      const item = this._field.selectedItem;
      this._grid.selectedItems = item ? [item] : [];
      this._gridSelectedItem = item;
      if (item) {
        this.programselectdisabled = false;
      } else {
        this.programselectdisabled = true;
      }
    }
  }
  /** @private */
  __close() {
    this.renderRoot.querySelector('#dialog').opened = false;
  }
  /** @private */
  __create() {
    this.dispatchEvent(new CustomEvent('vcf-lookup-field-create-item-event'));
  }
  /** @private */
  __select() {
    if (this.programselectdisabled) {
      if (this.$server) {
        this.$server.openErrorNotification();
      } else {
        this.renderRoot.querySelector('#notification').open();
      }
    } else {
      if (this.$server) {
        this.$server.copyFieldValueFromGrid();
      } else {
        const item = this._gridSelectedItem;
        const selectedItem = Array.isArray(item) ? item[0] : item;
        this._field.selectedItem = selectedItem;
      }

      this.renderRoot.querySelector('#dialog').opened = false;
    }
  }

  _getItemLabel(item) {
    const itemLabelPath = this._field.itemLabelPath;
    let label = item && itemLabelPath ? this.get(itemLabelPath, item) : undefined;
    if (label === undefined) {
      label = item ? item.toString() : '';
    }
    return label;
  }

  _itemsChanged() {
    if (this._field) {
      this._field.items = this.items;
    }
  }

  static get is() {
    return 'vcf-lookup-field';
  }

  static get version() {
    return '23.1.2';
  }

  static get properties() {
    return {
      header: {
        type: String
      },

      /**
       * A full set of items to filter the visible options from.
       * The items can be of either `String` or `Object` type.
       * @type {!Array<string> | undefined}
       */
      items: {
        type: Array
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
        type: String
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
        type: String
      },

      /**
       * @type {Boolean}
       */
      modeless: Boolean,

      /**
       * @type {Boolean}
       */
      draggable: Boolean,

      /**
       * @type {Boolean}
       */
      resizable: Boolean,

      /**
       * @type {Boolean}
       */
      defaultselectdisabled: {
        type: Boolean
      },

      createhidden: {
        type: Boolean
      },
      /**
       * @type {Boolean}
       */
      programselectdisabled: {
        type: Boolean
      },

      selectdisabled: {
        type: Boolean
      },

      hasselected: {
        type: Boolean
      },

      /**
       * @type {Boolean}
       */
      required: Boolean,

      /**
       * @type {Boolean}
       */
      readonly: {
        type: Boolean,
        reflect: true
      },

      disabled: {
        type: Boolean,
        reflect: true
      },

      buttondisabled: {
        type: Boolean
      },

      /**
       * @type {Boolean}
       */
      invalid: {
        type: Boolean,
        reflect: true
      },

      /**
       * @type {String}
       */
      theme: {
        type: String
      },

      /**
       * The object used to localize this component.
       * For changing the default localization, change the entire
       * _i18n_ object or just the property you want to modify.
       */
      i18n: {
        type: Object
      }
    };
  }
  get selectdisabled() {
    return this.computeselectdisabled(this.defaultselectdisabled, this.programselectdisabled);
  }
  get hasselected() {
    return this.computehasselected(this.programselectdisabled);
  }
  // @property
  get buttondisabled() {
    return this.computebuttondisabled(this.readonly, this.disabled);
  }
  set items(newValue) {
    const oldValue = this.items;
    this._items = newValue;
    if (oldValue !== newValue) {
      this._itemsChanged(newValue, oldValue);
      this.requestUpdate('items', oldValue, this.constructor.properties.items);
    }
  }
  get items() {
    return this._items;
  }
}

customElements.define(LookupField.is, LookupField);

/**
 * @namespace Vaadin
 */
window.Vaadin.VcfLookupField = LookupField;
