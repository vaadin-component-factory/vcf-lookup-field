import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin';
import { SlotStylesMixin } from '@vaadin/component-base';
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
import { ThemeDetectionMixin } from '@vaadin/vaadin-themable-mixin/vaadin-theme-detection-mixin';
import '../theme/base/vcf-lookup-field-styles.js';

/**
 * Host state mirrored onto whatever field sits in the `field` slot.
 *
 * The host keeps no copy of the value, so this list is deliberately limited to
 * the state a caller can still set on the host directly -- from markup, or from
 * the server in a Flow application.
 */
const FIELD_STATE_PROPS = ['invalid', 'errorMessage', 'required', 'readonly', 'disabled', 'label', 'manualValidation'];

/**
 * The value-ish properties the host reads straight from the field.
 *
 * `vaadin-combo-box` has `value` and `selectedItem`; `vaadin-multi-select-combo-box`
 * has only `selectedItems` and no `value` at all. Reading through means the host
 * reports exactly what the field it wraps actually has, with no translation layer
 * that could fall out of step with it.
 */
const FIELD_VALUE_PROPS = ['value', 'selectedItem', 'selectedItems'];

/**
 * Field notifications re-dispatched from the host.
 *
 * The Vaadin fields are Lit elements and `PolylitMixin` fires these non-bubbling,
 * so a listener on `<vcf-lookup-field>` would never see them otherwise.
 */
const FIELD_NOTIFY_EVENTS = [
  'value-changed',
  'selected-item-changed',
  'selected-items-changed',
  'invalid-changed',
  'validated'
];

/**
 * `<vcf-lookup-field>` [element-description]
 *
 * ```html
 * <vcf-lookup-field></vcf-lookup-field>
 * ```
 *
 * ### Value
 *
 * The lookup field is a decorator around the field in its `field` slot: it keeps
 * no copy of the value or the selection. `value`, `selectedItem` and
 * `selectedItems` read and write the slotted field directly, so the two can never
 * disagree. Which of them is meaningful depends on the field being wrapped -- a
 * `vaadin-multi-select-combo-box` has `selectedItems` but no `value`.
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

export class LookupField extends SlotStylesMixin(ElementMixin(ThemeDetectionMixin(ThemableMixin(PolymerElement)))) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
          --search-button-field-gap: var(--vaadin-gap-xs);
        }
        :host([data-application-theme='lumo']) {
          --search-button-field-gap: 0.25rem;
          --search-button-width: 2.6rem;
          --readonly-search-button-border: 1px dashed
            var(--lumo-contrast-30pct, var(--vaadin-input-field-border-color, var(--vaadin-border-color)));
          --invalid-state-button-color: var(--lumo-error-text-color, inherit);
          --invalid-state-button-backgroud-color: var(--lumo-error-color-10pct, hsla(3, 82%, 59%, 0.1));
        }
        .container {
          width: 100%;
          display: inline-flex;
          align-items: baseline;
        }
        ::slotted(vaadin-combo-box) {
          width: 100%;
          min-width: 0;
        }
        ::slotted(vaadin-button.search-button) {
          margin-left: var(--search-button-field-gap);
          flex: 0 0 auto;
          width: var(--search-button-width);
        }
        :host([theme~='integrated']) ::slotted(.search-button) {
          margin-left: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        :host([theme~='integrated']:not([data-application-theme='lumo'])) ::slotted(.search-button) {
          border-left-width: 0;
        }
        :host([theme~='full-width']) ::slotted(vaadin-button.search-button) {
          margin-inline-start: calc(var(--search-button-field-gap) + (var(--search-button-width) * -1));
        }
        :host([theme~='integrated'][theme~='full-width']) ::slotted(vaadin-button.search-button) {
          margin-inline-start: calc((var(--search-button-width) * -1));
        }
        :host([readonly]) ::slotted(vaadin-button.search-button) {
          background-color: transparent;
          border: var(--readonly-search-button-border);
        }
        :host([invalid]) ::slotted(vaadin-button.search-button) {
          color: var(--invalid-state-button-color);
          background-color: var(--invalid-state-button-backgroud-color);
        }
      </style>

      <vaadin-horizontal-layout class="container" part="container">
        <slot name="field" id="fieldSlot">
          <!-- combo box will be created here -->
        </slot>

        <slot name="search-button-slot"></slot>

        <slot name="dialog-slot"></slot>

        <footer id="dialogfooter" style="display:none">
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
            disabled$="[[selectdisabled]]"
            aria-disabled$="[[selectdisabled]]"
          >
            [[i18n.select]]
          </vaadin-button>
        </footer>

        <!--
          The dialog content lives in the light DOM. The defaults below are built
          imperatively so that the generated elements and the slotted ones travel
          the exact same path into the dialog.
        -->
        <slot name="grid" style="display:none;" id="gridSlot"></slot>

        <slot name="filter" style="display:none;" id="filterSlot"></slot>

        <slot name="selected" style="display:none;" id="selectedSlot"></slot>

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

  // @ts-expect-error overriding property from `SlotStylesMixinClass`
  get slotStyles() {
    const tag = this.localName;

    return [
      `
        ${tag}::part(lookup-field-dialog-content) {
          display: flex;
          flex-direction: column;
          gap: var(--vaadin-gap-s);
        }
    `
    ];
  }

  constructor() {
    super();
    /**
     * Value writes that arrive before a field has been adopted. Flushed by
     * `__setField`. This is the only state the host holds on the field's behalf.
     */
    this.__pendingField = {};
    this.__onSelectItemsChangedBinded = this.__onSelectChanged.bind(this);
    this.__onActiveItemChangedBinded = this.__onSelectItem.bind(this);
    this._observer = new FlattenedNodesObserver(this, info => {
      this.__onDomChange(info.addedNodes, info.removedNodes);
    });
  }

  ready() {
    super.ready();

    // Check for slotted custom field BEFORE creating one programmatically
    const slottedField = this.$.fieldSlot.assignedNodes()[0];
    if (slottedField) {
      this.__setField(slottedField);
    } else {
      // Only create combo box if no slotted field exists
      this._createComboBox();
    }

    this._createSearchButton();
    this._createDialog();

    this.__setGrid(this.$.gridSlot.assignedNodes()[0] || this._createGrid());
    this._filter = this.$.filterSlot.assignedNodes()[0] || this._createFilter();
    this._selected = this.$.selectedSlot.assignedNodes()[0] || this._createSelected();

    this._dialog.footerRenderer = root => {
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

    this._dialog.headerRenderer = (root, dialog) => {
      if (root.firstElementChild && !this._forceHeaderRerender) {
        return;
      }
      this._forceHeaderRerender = false;

      if (this._dialogHeader) {
        root.replaceChildren(this._dialogHeader);
        dialog.headerTitle = null;
        this.__restoreDialogAriaLabel();
      }
    };

    /**
     * fill the dialog content because template in template is not working well
     */
    this._dialog.renderer = root => {
      if (root.firstElementChild) {
        return;
      }
      if (!root.enterKeydown) {
        const keydown = e => {
          if (e.keyCode == 13 && !this.selectdisabled) {
            this.__select();
          }
        };
        root.addEventListener('keydown', keydown);
        root.enterKeydown = keydown;
      }
      const content = document.createElement('div');
      content.setAttribute('part', 'lookup-field-dialog-content');
      content.appendChild(this._filter);
      content.appendChild(this._grod);
      content.appendChild(this._selected);
      root.appendChild(content);
    };

    this._dialog.addEventListener('opened-changed', e => {
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
        this._filter.focus();
        this._filter.setAttribute('focus-ring', true);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Value: read straight through to the field, never stored on the host *
   * ------------------------------------------------------------------ */

  /**
   * The value of the wrapped field. `undefined` when the field has no `value`,
   * which is the case for `vaadin-multi-select-combo-box`.
   * @type {string | undefined}
   */
  get value() {
    return this.__readField('value');
  }

  set value(value) {
    this.__writeField('value', value);
  }

  /**
   * The item selected in the wrapped field.
   * @type {Object | string | undefined}
   */
  get selectedItem() {
    return this.__readField('selectedItem');
  }

  set selectedItem(value) {
    this.__writeField('selectedItem', value);
  }

  /**
   * The items selected in the wrapped field, for a multi-select field.
   * @type {Array | undefined}
   */
  get selectedItems() {
    return this.__readField('selectedItems');
  }

  set selectedItems(value) {
    this.__writeField('selectedItems', value);
  }

  /**
   * The field in the `field` slot, generated or slotted. The documented way to
   * reach the parts of its API the lookup field does not mirror.
   * @return {HTMLElement}
   */
  get field() {
    return this._field;
  }

  /** @private */
  __readField(prop) {
    return this._field ? this._field[prop] : this.__pendingField[prop];
  }

  /** @private */
  __writeField(prop, value) {
    if (this._field) {
      this._field[prop] = value;
    } else {
      this.__pendingField[prop] = value;
    }
  }

  /**
   * Applies the value writes that arrived before a field was available. Only
   * properties the field actually has are written, so a value buffered for a
   * single-select field is not forced onto a multi-select one.
   * @private
   */
  __flushPendingField() {
    const field = this._field;
    FIELD_VALUE_PROPS.forEach(prop => {
      if (this.__pendingField[prop] !== undefined && prop in field) {
        field[prop] = this.__pendingField[prop];
      }
    });
    this.__pendingField = {};
  }

  /**
   * Validates the wrapped field and sets its `invalid` state from the result,
   * which the host mirrors. Returns true when there is no field to validate, so
   * that slotting something that is not a Vaadin field cannot throw.
   * @return {boolean} True if the value is valid.
   */
  validate() {
    const field = this._field;
    return !field || typeof field.validate !== 'function' ? true : field.validate();
  }

  /**
   * Returns true if the wrapped field satisfies its constraints, without
   * touching its invalid state.
   * @return {boolean}
   */
  checkValidity() {
    const field = this._field;
    return !field || typeof field.checkValidity !== 'function' ? true : field.checkValidity();
  }

  /* ------------------------------------------------ *
   * The single place where `_field` is assigned       *
   * ------------------------------------------------ */

  /**
   * Adopts a field: detaches the listeners from the one being replaced, applies
   * the buffered and host-held state, and subscribes to the notifications that
   * keep the host in step with it.
   *
   * Calling it again with the same field does nothing, which matters because the
   * flattened-nodes observer re-reports the field `ready()` has already handled.
   * @private
   */
  __setField(field) {
    if (this._field === field) {
      return;
    }
    this.__detachFieldListeners();
    this._field = field;
    if (!field) {
      return;
    }

    // State and items first, so that a buffered value is applied to a field
    // that already knows the items it has to resolve that value against.
    this._forwardFieldState();
    this._itemsChanged();
    this.__flushPendingField();
    this.__attachFieldListeners(field);
  }

  /** @private */
  __attachFieldListeners(field) {
    const listeners = {
      'filter-changed': e => {
        this._filterValue = e.detail.value;
      }
    };

    FIELD_NOTIFY_EVENTS.forEach(type => {
      listeners[type] = e => {
        if (type === 'invalid-changed') {
          this.__syncFromField('invalid', !!e.detail.value);
        }
        this.dispatchEvent(new CustomEvent(type, { detail: e.detail }));
      };
    });

    Object.keys(listeners).forEach(type => field.addEventListener(type, listeners[type]));
    this.__fieldListeners = listeners;
  }

  /** @private */
  __detachFieldListeners() {
    const field = this._field;
    if (!field || !this.__fieldListeners) {
      return;
    }
    Object.keys(this.__fieldListeners).forEach(type => field.removeEventListener(type, this.__fieldListeners[type]));
    this.__fieldListeners = null;
  }

  /**
   * Copies a state property from the field onto the host.
   *
   * The equality check is what breaks the cycle: the observer that would push the
   * value straight back finds the field already agrees and writes nothing.
   * @private
   */
  __syncFromField(prop, value) {
    if (this[prop] === value) {
      return;
    }
    this[prop] = value;
  }

  _createComboBox() {
    const comboBox = document.createElement('vaadin-combo-box');
    comboBox.setAttribute('slot', 'field');
    comboBox.setAttribute('clear-button-visible', '');
    comboBox.setAttribute('allow-custom-value', '');

    this.__generatedField = comboBox;
    this.appendChild(comboBox);

    // The same path a slotted field takes, so the state applied here and the
    // state applied by a later change cannot drift apart.
    this.__setField(comboBox);
  }

  /**
   * Mirrors the host state onto the field so the lookup renders its invalid
   * border and error message like any other Vaadin field. Called from every
   * state observer, so a change after initialization reaches the field too.
   *
   * Properties the host never received are left alone, otherwise adopting a
   * slotted field would wipe the state it was declared with. Properties the
   * field already agrees with are left alone too, which is what keeps an update
   * that arrived *from* the field from being pushed straight back at it.
   *
   * The item paths and the theme always have a value on the host, so they are
   * only pushed onto the combo box this element generated. A slotted field
   * keeps the ones it was declared with.
   * @private
   */
  _forwardFieldState() {
    const field = this._field;
    if (!field) {
      return;
    }
    FIELD_STATE_PROPS.forEach(prop => {
      if (this[prop] !== undefined && field[prop] !== this[prop]) {
        field[prop] = this[prop];
      }
    });
    if (field === this.__generatedField) {
      field.itemLabelPath = this.itemLabelPath;
      field.itemValuePath = this.itemValuePath;
      this.__forwardTheme(field);
    }
  }

  /**
   * Copies the host theme onto a generated child. `theme` is an attribute on
   * both the combo box and the dialog, so an unset host theme has to remove it
   * rather than write the string "undefined".
   * @private
   */
  __forwardTheme(element) {
    if (this.theme == null) {
      element.removeAttribute('theme');
    } else {
      element.setAttribute('theme', this.theme);
    }
  }

  /**
   * Mirrors the host state onto the generated search button. Called from the
   * observers of everything it depends on, so a change after initialization
   * reaches the button too.
   * @private
   */
  __updateSearchButton() {
    const button = this._searchButton;
    if (!button) {
      return;
    }
    button.disabled = !!this.buttondisabled;
    const searchAriaLabel = (this.i18n || {}).searcharialabel;
    if (searchAriaLabel) {
      button.setAttribute('aria-label', searchAriaLabel);
    } else {
      button.removeAttribute('aria-label');
    }
  }

  /**
   * Mirrors the host state onto the generated dialog. Called from the observers
   * of everything it depends on, so a change after initialization reaches the
   * dialog too.
   * @private
   */
  __updateDialog() {
    const dialog = this._dialog;
    if (!dialog) {
      return;
    }
    this.__updateDialogHeaderTitle();
    this.__forwardTheme(dialog);
    dialog.modeless = !!this.modeless;
    dialog.draggable = !!this.draggable;
    dialog.resizable = !!this.resizable;
  }

  /**
   * Builds the dialog title out of the i18n prefix, the header and the i18n
   * postfix, skipping the parts that are empty.
   *
   * `vaadin-dialog` copies `headerTitle` onto its `aria-label`, so a title made
   * only of the separators used to leave the dialog with a whitespace-only
   * accessible name. Without a title the dialog keeps the `lookup-grid` label
   * `_createDialog` gave it.
   * @private
   */
  __updateDialogHeaderTitle() {
    const dialog = this._dialog;
    const { headerprefix, headerpostfix } = this.i18n || {};
    const title = [headerprefix, this.header, headerpostfix].filter(part => part).join(' ');

    // A slotted `dialog-header` renders the header itself and clears the title.
    if (title && !this._dialogHeader) {
      dialog.headerTitle = title;
    } else if (dialog.headerTitle) {
      dialog.headerTitle = null;
      this.__restoreDialogAriaLabel();
    }
  }

  /**
   * Puts the `lookup-grid` label back once the dialog has processed a cleared
   * `headerTitle`, which removes the `aria-label` the title had replaced.
   * @private
   */
  __restoreDialogAriaLabel() {
    const dialog = this._dialog;
    const restore = () => {
      if (!dialog.headerTitle) {
        dialog.setAttribute('aria-label', 'lookup-grid');
      }
    };
    if (dialog.updateComplete) {
      dialog.updateComplete.then(restore);
    } else {
      restore();
    }
  }

  /** @private */
  __i18nChanged() {
    this.__updateSearchButton();
    this.__updateDialog();
    this.__updateFilter();
  }

  /** @private */
  __themeChanged() {
    this._forwardFieldState();
    this.__updateDialog();
  }

  /**
   * Forwards the item paths and keeps the generated grid column pointing at the
   * label path.
   * @private
   */
  __itemPathsChanged() {
    this._forwardFieldState();
    if (this.__generatedGridColumn) {
      this.__generatedGridColumn.path = this.itemLabelPath;
    }
  }

  _createSearchButton() {
    const icon = document.createElement('vaadin-icon');
    icon.setAttribute('icon', 'vaadin:search');

    const button = document.createElement('vaadin-button');
    button.setAttribute('slot', 'search-button-slot');
    button.setAttribute('id', 'searchButton');
    button.classList.add('search-button');
    button.setAttribute('theme', 'icon');

    button.addEventListener('click', () => {
      this.__open();
    });
    button.addEventListener('keydown', event => {
      this.__searchKeydown(event);
    });

    button.appendChild(icon);
    this._searchButton = button;
    this.appendChild(button);

    this.__updateSearchButton();
  }

  _createDialog() {
    const dialog = document.createElement('vaadin-dialog');
    dialog.setAttribute('slot', 'dialog-slot');
    dialog.setAttribute('aria-label', 'lookup-grid');
    dialog.setAttribute('id', 'dialog');
    dialog.setAttribute('no-close-on-outside-click', '');

    this._dialog = dialog;
    this.appendChild(dialog);

    this.__updateDialog();
  }

  /**
   * The default grid, shown when nothing is slotted into the `grid` slot. Its
   * single column follows `itemLabelPath`.
   * @private
   */
  _createGrid() {
    const grid = document.createElement('vaadin-grid');
    grid.setAttribute('slot', 'grid');
    const column = document.createElement('vaadin-grid-column');
    column.path = this.itemLabelPath;
    grid.appendChild(column);

    this.__generatedGrid = grid;
    this.__generatedGridColumn = column;
    // Into the light DOM, like a slotted grid: the `grid` slot is hidden, and
    // being connected is what lets the element run its update cycle before the
    // dialog renderer moves it into the overlay.
    this.appendChild(grid);
    this.__updateGridItems();
    return grid;
  }

  /**
   * The default search field of the dialog, shown when nothing is slotted into
   * the `filter` slot.
   *
   * Only the generated filter drives `_filterdata` and the grid: a slotted one
   * is assumed to bring its own filtering, which is how Flow's custom filter
   * works.
   * @private
   */
  _createFilter() {
    const filter = document.createElement('vaadin-text-field');
    filter.setAttribute('slot', 'filter');
    filter.setAttribute('id', 'lookupFieldFilter');
    filter.setAttribute('tabindex', '0');
    filter.classList.add('lookup-field-filter');
    filter.style.width = '100%';
    filter.clearButtonVisible = true;

    const icon = document.createElement('vaadin-icon');
    icon.setAttribute('icon', 'vaadin:search');
    icon.setAttribute('slot', 'suffix');
    filter.appendChild(icon);

    filter.addEventListener('value-changed', e => {
      if (this._filterdata !== e.detail.value) {
        this._filterdata = e.detail.value;
      }
      this.__filterGrid(e);
    });

    this.__generatedFilter = filter;
    this.appendChild(filter);
    this.__updateFilter();
    return filter;
  }

  /** @private */
  _createSelected() {
    const selected = document.createElement('div');
    selected.setAttribute('slot', 'selected');
    this.appendChild(selected);
    return selected;
  }

  /** @private */
  __updateFilter() {
    const filter = this.__generatedFilter;
    if (!filter) {
      return;
    }
    filter.label = (this.i18n || {}).search;
  }

  /**
   * Keeps the generated filter showing the current filter text, so that the text
   * seeded from the field when the dialog opens appears in the search box.
   * @private
   */
  __filterdataChanged(filterdata) {
    const filter = this.__generatedFilter;
    const value = filterdata == null ? '' : filterdata;
    if (filter && filter.value !== value) {
      filter.value = value;
    }
  }

  /** @private */
  __updateGridItems() {
    if (this.__generatedGrid) {
      this.__generatedGrid.items = this.filterItems(this.items, this._filterdata);
    }
  }

  /**
   * The single place where `_grod` is assigned, so the selection listeners
   * always follow the current grid.
   * @private
   */
  __setGrid(grid) {
    if (this._grod === grid) {
      return;
    }
    if (this._grod) {
      this._grod.removeEventListener('active-item-changed', this.__onActiveItemChangedBinded);
      this._grod.removeEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
    }
    this._grod = grid;
    if (grid) {
      grid.addEventListener('active-item-changed', this.__onActiveItemChangedBinded);
      grid.addEventListener('selected-items-changed', this.__onSelectItemsChangedBinded);
    }
  }

  focus() {
    setTimeout(() => {
      this._field.focusElement.focus();
      this._field.focusElement.select();
    }, 100);
  }

  __onSelectItem(event) {
    if (this.multiSelect) {
      return;
    }
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
              this._searchButton.focus();
              this._searchButton.setAttribute('focus-ring', true);
            };
            this._searchButton.focus();
          }
        });
        this._searchButton.addEventListener('keydown', e => {
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
  __onDomChange(addedNodes, removedNodes) {
    // Removals first: a replacement reports the old and the new node together,
    // and the old one has to let go of its listeners before the new one is
    // adopted.
    //
    // Only the field is handled here. The grid, the filter and the selected
    // element are reported as removed when the dialog renderer moves them into
    // the overlay, which is not a removal at all; the field stays in its slot,
    // so a removal there is always real.
    (removedNodes || []).forEach(node => {
      if (node === this._field) {
        this.__setField(null);
      }
    });

    addedNodes.forEach(node => {
      if (node.getAttribute) {
        if (node.getAttribute('slot') == 'grid') {
          this.__setGrid(node);
        } else if (node.getAttribute('slot') == 'field') {
          node.style.flexGrow = 1;
          this.__setField(node);
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
    this._dialog.opened = true;
    setTimeout(() => {
      this._filter.setAttribute('focus-ring', true);
      this._filter.focus();
    }, 10);

    if (this.$server) {
      this.$server.copyFieldValueToGrid();
      this.$server.filterGrid(this._filterdata);
    } else {
      this._filterdata = this._field.inputElement.value;
      const item = this._field.selectedItem;
      if (!this.multiSelect) {
        this._grod.selectedItems = item ? [item] : [];
        this._grodSelectedItem = item;
      }
      if (item) {
        this.programselectdisabled = false;
      } else {
        this.programselectdisabled = true;
      }
    }
  }
  /** @private */
  __close() {
    this._dialog.opened = false;
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
        this._dialog.opened = false;
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
    this.__updateGridItems();
  }

  static get is() {
    return 'vcf-lookup-field';
  }

  static get version() {
    return '7.0.0';
  }

  static get properties() {
    return {
      header: {
        type: String,
        observer: '__updateDialog'
      },

      label: {
        type: String,
        observer: '_forwardFieldState'
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
        type: String,
        observer: '__filterdataChanged'
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
        value: 'label',
        observer: '__itemPathsChanged'
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
        value: 'value',
        observer: '__itemPathsChanged'
      },

      /**
       * @type {Boolean}
       */
      modeless: {
        type: Boolean,
        observer: '__updateDialog'
      },

      /**
       * @type {Boolean}
       */
      draggable: {
        type: Boolean,
        observer: '__updateDialog'
      },

      /**
       * @type {Boolean}
       */
      resizable: {
        type: Boolean,
        observer: '__updateDialog'
      },

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
      required: {
        type: Boolean,
        observer: '_forwardFieldState'
      },

      /**
       * @type {Boolean}
       */
      readonly: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_forwardFieldState'
      },

      disabled: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_forwardFieldState'
      },

      buttondisabled: {
        type: Boolean,
        computed: 'computebuttondisabled(readonly, disabled)',
        observer: '__updateSearchButton'
      },

      /**
       * True when the wrapped field is invalid.
       *
       * Reflected so that `:host([invalid])` can tint the search button. The
       * field owns this state: setting it here forwards it, and the field
       * changing it on its own updates the host.
       * @type {Boolean}
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_forwardFieldState'
      },

      /**
       * The error message the field shows while it is invalid.
       * @attr {string} error-message
       * @type {String}
       */
      errorMessage: {
        type: String,
        observer: '_forwardFieldState'
      },

      /**
       * Set to true to stop the field running its own constraint validation, so
       * that an `invalid` state and an error message set from outside survive a
       * blur, a keystroke or a constraint change.
       *
       * Deliberately has no default: forwarding an explicit `false` would switch
       * off the manual validation mode a Flow application has already turned on.
       * @attr {boolean} manual-validation
       * @type {Boolean}
       */
      manualValidation: {
        type: Boolean,
        observer: '_forwardFieldState'
      },

      /**
       * @deprecated `has-error-message` is a read-only state attribute that a
       * Vaadin field sets on itself once its error node has content, so setting
       * it here does nothing. Use `errorMessage` instead.
       * @type {String}
       */
      hasErrorMessage: {
        type: String
      },

      /**
       * @type {String}
       */
      theme: {
        type: String,
        value: 'lookup-dialog',
        observer: '__themeChanged'
      },

      multiSelect: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * The object used to localize this component.
       * For changing the default localization, change the entire
       * _i18n_ object or just the property you want to modify.
       */
      i18n: {
        type: Object,
        observer: '__i18nChanged',
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
