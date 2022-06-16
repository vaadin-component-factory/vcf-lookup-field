import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '@vaadin-component-factory/vcf-enhanced-dialog';
import '@vaadin/button';
import '@vaadin/combo-box';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-filter';
import '@vaadin/horizontal-layout';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/notification/vaadin-notification';
import '@vaadin/text-field';

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
export class LookupField extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
        }
        .container {
          width: 100%;
          display: inline-flex;
          align-items: baseline;
        }
        .enhanced-dialog-footer {
          display: flex;
        }
      </style>

      <vaadin-horizontal-layout class="container">
        <slot name="field" id="fieldSlot">
          <vaadin-combo-box
            clear-button-visible
            allow-custom-value
            items="{{items}}"
            item-label-path="{{itemLabelPath}}"
            item-value-path="{{itemValuePath}}"
            required$="[[required]]"
            readonly$="[[readonly]]"
          ></vaadin-combo-box>
        </slot>

        <vaadin-button
          id="searchButton"
          class="search-button"
          theme="icon"
          on-click="__open"
          aria-label="[[i18n.searcharialabel]]"
          disabled$="[[buttondisabled]]"
        >
          <vaadin-icon icon="vaadin:search"></vaadin-icon>
        </vaadin-button>

        <vcf-enhanced-dialog
          aria-label="lookup-grid"
          id="dialog"
          theme$="[[theme]]"
          modeless$="[[modeless]]"
          draggable$="[[draggable]]"
          resizable$="[[resizable]]"
          no-close-on-outside-click
        >
          <header id="dialogheader" slot="header" class="draggable enhanced-dialog-header">
            <slot name="dialog-header">
              [[i18n.headerprefix]] {{header}} [[i18n.headerpostfix]]
            </slot>
          </header>

          <footer id="dialogfooter" slot="footer" class="enhanced-dialog-footer" has-selected$="[[hasselected]]">
            <vaadin-horizontal-layout theme="spacing-s">
              <vaadin-button
                id="selectbtn"
                theme="primary"
                disabled$="[[selectdisabled]]"
                aria-disabled$="[[selectdisabled]]"
                role="button"
                on-click="__select"
              >
                [[i18n.select]]
              </vaadin-button>
              <vaadin-button tabindex="0" role="button" on-click="__close" theme="tertiary">
                [[i18n.cancel]]
              </vaadin-button>
              <div style="flex-grow: 1;"></div>
              <vaadin-button tabindex="0" role="button" on-click="__create" theme="tertiary" hidden$="[[createhidden]]">
                [[i18n.create]]
              </vaadin-button>
            </vaadin-horizontal-layout>
          </footer>
          <div id="dialogmain" class="enhanced-dialog-content"></div>
        </vcf-enhanced-dialog>

        <slot name="grid" style="display:none;" id="gridSlot">
          <vaadin-grid items="[[filterItems(items, _filterdata)]]">
            <vaadin-grid-column path="name" path="{{itemLabelPath}}"></vaadin-grid-column>
          </vaadin-grid>
        </slot>

        <slot name="filter" style="display:none;" id="filterSlot">
          <vaadin-text-field
            id="lookupFieldFilter"
            class="lookup-field-filter"
            style="width:100%;"
            tabindex="0"
            label="[[i18n.search]]"
            on-value-changed="__filterGrid"
            clear-button-visible
            value="{{_filterdata}}"
          >
            <vaadin-icon icon="lumo:search" slot="suffix"></vaadin-icon>
          </vaadin-text-field>
        </slot>

        <slot name="selected" style="display:none;" id="selectedSlot">
          <div></div>
        </slot>

        <vaadin-notification id="notification" position="top-center">
          <template>
            <div>
              [[i18n.emptyselection]]
            </div>
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
  }

  ready() {
    super.ready();
    this._grid = this.$.gridSlot.firstElementChild;
    this._filter = this.$.filterSlot.firstElementChild;
    this._field = this.$.fieldSlot.firstElementChild;
    this._selected = this.$.selectedSlot.firstElementChild;
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
    this.$.dialog.renderer = function(root, dialog) {
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

      root.appendChild(that.$.dialogfooter);
      if (that._dialogFooter) {
        while (that.$.dialogfooter.firstChild) {
          that.$.dialogfooter.removeChild(that.$.dialogfooter.lastChild);
        }
        that.$.dialogfooter.appendChild(that._dialogFooter);
      }
    };
    this.$.dialog.addEventListener('opened-changed', e => {
      // dialog close
      if (!e.detail.value) {
        setTimeout(() => {
          this.$.searchButton.focus();
          this.$.searchButton.setAttribute('focus-ring', true);
        }, 10);
      }
    });
  }

  __opendialog() {
    this.$.basic.opened = true;
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
    this.$.dialog.opened = true;
    setTimeout(() => {
      this.$.lookupFieldFilter.setAttribute('focus-ring', true);
      this.$.lookupFieldFilter.focus();
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
    this.$.dialog.opened = false;
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
        this.$.notification.open();
      }
    } else {
      if (this.$server) {
        this.$server.copyFieldValueFromGrid();
      } else {
        const item = this._gridSelectedItem;
        const selectedItem = Array.isArray(item) ? item[0] : item;
        this._field.selectedItem = selectedItem;
      }

      this.$.dialog.opened = false;
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
    return '23.1.1';
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
        type: Boolean,
        value: true
      },

      createhidden: {
        type: Boolean,
        value: true
      },
      /**
       * @type {Boolean}
       */
      programselectdisabled: {
        type: Boolean,
        value: true
      },

      selectdisabled: {
        type: Boolean,
        computed: 'computeselectdisabled(defaultselectdisabled, programselectdisabled)'
      },

      hasselected: {
        type: Boolean,
        computed: 'computehasselected(programselectdisabled)'
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
        reflectToAttribute: true
      },

      disabled: {
        type: Boolean,
        reflectToAttribute: true
      },

      buttondisabled: {
        type: Boolean,
        computed: 'computebuttondisabled(readonly, disabled)'
      },

      /**
       * @type {Boolean}
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * @type {String}
       */
      theme: {
        type: String,
        value: 'lookup-dialog'
      },

      /**
       * The object used to localize this component.
       * For changing the default localization, change the entire
       * _i18n_ object or just the property you want to modify.
       */
      i18n: {
        type: Object,
        value: function() {
          return {
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
      }
    };
  }
}

customElements.define(LookupField.is, LookupField);

/**
 * @namespace Vaadin
 */
window.Vaadin.VcfLookupField = LookupField;
