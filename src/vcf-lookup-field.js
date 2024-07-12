import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '@vaadin/dialog';
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
        vaadin-combo-box {
          width: 100%;
          min-width: 0;
        }
        vaadin-button.search-button {
          margin-left: var(--lumo-space-xs);
          flex: 0 0 auto;
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
        :host([theme~="full-width"]) vaadin-combo-box::part(input-field) {
          margin-inline-end: var(--lumo-size-m);
        }
        :host([theme~='full-width']) vaadin-button.search-button {
          margin-inline-start: calc(var(--lumo-space-xs) + (var(--lumo-size-m) * -1));
        }
        :host([theme~='integrated'][theme~='full-width']) vaadin-button.search-button {
          margin-inline-start: calc((var(--lumo-size-m) * -1));
        }
        :host([readonly]) vaadin-button.search-button {
          background-color: transparent;
          border: 1px dashed var(--lumo-contrast-30pct);
        }
        :host([invalid]) vaadin-button.search-button {
          color: var(--lumo-error-text-color);
          background-color: var(--lumo-error-color-10pct);
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
          on-keydown="__searchKeydown"
          aria-label="[[i18n.searcharialabel]]"
          disabled$="[[buttondisabled]]"
        >
          <vaadin-icon icon="vaadin:search"></vaadin-icon>
        </vaadin-button>

        <vaadin-dialog
          aria-label="lookup-grid"
          id="dialog"
          header-title="[[i18n.headerprefix]] {{header}} [[i18n.headerpostfix]]"
          theme$="[[theme]]"
          modeless$="[[modeless]]"
          draggable$="[[draggable]]"
          resizable$="[[resizable]]"
          no-close-on-outside-click
        >
          <footer id="dialogfooter">
            <vaadin-button
              slot="footer"
              on-click="__create"
              hidden$="[[createhidden]]"
              style="margin-inline-end: auto;"
              has-selected$="[[hasselected]]"
            >
              [[i18n.create]]
            </vaadin-button>
            <vaadin-button slot="footer" on-click="__close" has-selected$="[[hasselected]]">
              [[i18n.cancel]]
            </vaadin-button>
            <vaadin-button
              slot="footer"
              id="selectbtn"
              theme="primary"
              on-click="__select"
              has-selected$="[[hasselected]]"
            >
              [[i18n.select]]
            </vaadin-button>
          </footer>
          <div id="dialogmain"></div>
        </vaadin-dialog>

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
    if (this.$.gridSlot.assignedNodes()[0]) {
      this._grod = this.$.gridSlot.assignedNodes()[0];
    } else {
      this._grod = this.$.gridSlot.firstElementChild;
    }
    if (this.$.filterSlot.assignedNodes()[0]) {
      this._filter = this.$.filterSlot.assignedNodes()[0];
    } else {
      this._filter = this.$.filterSlot.firstElementChild;
    }
    if (this.$.fieldSlot.assignedNodes()[0]) {
      this._field = this.$.fieldSlot.assignedNodes()[0];
    } else {
      this._field = this.$.fieldSlot.firstElementChild;
    }

    if (this.$.selectedSlot.assignedNodes()[0]) {
      this._selected = this.$.selectedSlot.assignedNodes()[0];
    } else {
      this._selected = this.$.selectedSlot.firstElementChild;
    }

    if (this._grod) {
      this._grod.addEventListener('active-item-changed', this.__onActiveItemChangedBinded);
      this._grod.addEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
    }

    if (this._field) {
      this._field.addEventListener('filter-changed', e => {
        this._filterValue = e.detail.value;
      });
    }

    this.$.dialog.footerRenderer = root => {
      if (root.firstElementChild && !this._forceFooterRerender) {
        return;
      }
      this._forceFooterRerender = false;

      if (this._dialogFooter) {
        root.replaceChildren(this._dialogFooter);
      } else {
        Array.from(this.$.dialogfooter.children).forEach(child => {
          root.appendChild(child);
        });
      }
    };

    this.$.dialog.headerRenderer = (root, dialog) => {
      if (root.firstElementChild && !this._forceHeaderRerender) {
        return;
      }
      this._forceHeaderRerender = false;

      if (this._dialogHeader) {
        root.replaceChildren(this._dialogHeader);
        dialog.headerTitle = null;
      }
    };

    /**
     * fill the dialog content because template in template is not working well
     */
    this.$.dialog.renderer = root => {
      if (root.firstElementChild) {
        return;
      }
      if (!root.enterKeydown) {
        const keydown = e => {
          if (e.keyCode == 13) {
            this.__select();
          }
        };
        root.addEventListener('keydown', keydown);
        root.enterKeydown = keydown;
      }
      root.appendChild(this.$.dialogmain);
      this.$.dialogmain.appendChild(this._filter);
      this.$.dialogmain.appendChild(this._grod);
      this.$.dialogmain.appendChild(this._selected);
    };

    this.$.dialog.addEventListener('opened-changed', e => {
      // dialog closed
      if (!e.detail.value) {
        if (typeof this._gridPro != 'undefined') {
          // we're in a GridPro -> it's now ok to close the editor
          this._gridPro._dialogOpen = false;
        }
        setTimeout(() => {
          this._field.focus();
          this._field.setAttribute('focus-ring', true);
        }, 10);
      }
      // dialog opened
      else {
        if (typeof this._gridPro != 'undefined') {
          // we're in a GridPro -> update the _dialogOpen status so editor won't close
          this._gridPro._dialogOpen = true;
        }
        this.$.lookupFieldFilter.focus();
        this.$.lookupFieldFilter.setAttribute('focus-ring', true);
      }
    });
  }

  focus() {
    setTimeout(() => {
      this._field.focusElement.focus();
      this._field.focusElement.select();
    }, 100);
  }

  __onSelectItem(event) {
    const item = event.detail.value;
    this._grod.selectedItems = item ? [item] : [];
  }

  __onSelectChanged(event) {
    this._grodSelectedItem = [...event.detail.value];
    if (event.detail.value.length > 0) {
      this.programselectdisabled = false;
    } else {
      this.programselectdisabled = true;
    }
  }

  set _grid(grid) {
    // GridPro sets a "_grid" property to the editor field when the field is entered
    if (grid && 'VAADIN-GRID-PRO' === grid.tagName) {
      // override the _stopEdit function (if it hasn't been done already) so that opening
      // the lookup field's dialog doesn't close the GridPro editor
      if (typeof this._gridPro == 'undefined') {
        this._gridPro = grid;
        grid._editor = this;
        // store the old _stopEdit function
        grid._oldStopEdit = grid._stopEdit;
        // override the _stopEdit function
        grid._stopEdit = this._customStopEdit.bind(grid);

        this._field.addEventListener('keydown', e => {
          if (e.shiftKey == false && e.keyCode == 9) {
            e.stopPropagation();
            grid._hasFocusCallback = true;
            grid._focusCallback = () => {
              this.$.searchButton.focus();
              this.$.searchButton.setAttribute('focus-ring', true);
            };
            this.$.searchButton.focus();
          }
        });
        this.$.searchButton.addEventListener('keydown', e => {
          if (e.shiftKey == true && e.keyCode == 9) {
            e.stopPropagation();
            grid._hasFocusCallback = true;
            grid._focusCallback = () => {
              this._field.focus();
              this._field.setAttribute('focus-ring', true);
            };
            this._field.focus();
          } else if (typeof this._gridPro != 'undefined' && e.keyCode == 9) {
            this._gridPro._switchEditCell(e);
          }
        });
      }
    }
  }

  _customStopEdit(shouldCancel, shouldRestoreFocus) {
    if (this._hasFocusCallback) {
      this._hasFocusCallback = false;
      this._focusCallback();
      return;
    }
    // if the editor dialog is open, don't stop editing in GridPro
    if (this._dialogOpen) {
      return;
    }
    // otherwise fall back to the original _stopEdit
    this._oldStopEdit(shouldCancel, shouldRestoreFocus);
  }

  /** @private */
  __onDomChange(nodes) {
    const that = this;
    nodes.forEach(node => {
      if (node.getAttribute) {
        if (node.getAttribute('slot') == 'grid' && this._grod) {
          this._grod.removeEventListener('active-item-changed', this.__onActiveItemChangedBinded);
          this._grod.removeEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
          this._grod = node;
          this._grod.addEventListener('active-item-changed', this.__onActiveItemChangedBinded);
          this._grod.addEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
        } else if (node.getAttribute('slot') == 'field') {
          this._field = node;
          this._field.style.flexGrow = 1;
          this._field.addEventListener('filter-changed', function(e) {
            that._filterValue = e.detail.value;
          });
        } else if (node.getAttribute('slot') == 'dialog-header') {
          this._dialogHeader = node;
          this._forceHeaderRerender = true;
        } else if (node.getAttribute('slot') == 'dialog-footer') {
          this._dialogFooter = node;
          this._forceFooterRerender = true;
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
      if (this._grod) {
        this._grod.items = this.filterItems(this.items, event.detail.value);
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
  __searchKeydown(event) {
    /**
     * Stop propagation of enter key events when search button is focused
     * so GridPro won't change lines. Don't stop propagation in other situations
     * in case this inteferes with other desired behavior.
     */
    let preventPropagation = false;
    ['vaadin-grid', 'vaadin-grid-pro'].forEach(el => {
      const isAncestor = this.closest(el);
      if (isAncestor) preventPropagation = true;
    });
    if (preventPropagation) event.stopPropagation();
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
      this._grod.selectedItems = item ? [item] : [];
      this._grodSelectedItem = item;
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
    if (this.$server) {
      this.$server.copyFieldValueFromGrid();
    } else {
      var that = this;
      const item = this._grodSelectedItem;
      const selectedItem = Array.isArray(item) ? item[0] : item;
      if (selectedItem) {
        this._field.selectedItem = selectedItem;
        this.$.dialog.opened = false;
      } else {
        this.$.notification.renderer = function(root, notification) {
          root.textContent = that.i18n.emptyselection;
        };
        this.$.notification.open();
      }
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
    return '23.3.3';
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
