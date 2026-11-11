import { ElementMixinClass } from '@vaadin/component-base/src/element-mixin.js';
import { ThemableMixinClass } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';

// Hand-written: the element declares its properties in `static get properties()`,
// which TypeScript cannot turn into instance members.

/** The texts of the lookup field. Assign only the ones to change; the rest keep their defaults. */
export interface LookupFieldI18n {
  /** The Select button. */
  select: string;
  /** The Cancel button. */
  cancel: string;
  /** The label of the dialog search field. */
  search: string;
  /** The accessible name of the search button. */
  searcharialabel: string;
  /** Put before `header` in the dialog title. */
  headerprefix: string;
  /** Put after `header` in the dialog title. */
  headerpostfix: string;
  /** The notification shown when Select is clicked with nothing selected. */
  emptyselection: string;
  /** The Create button. */
  create: string;
  /** The accessible name of the dialog when it has no title. */
  dialogarialabel: string;
}

/** Builds the grid or the search field of the dialog. Returning nothing keeps the default. */
export type LookupFieldRenderer<TItem = LookupFieldDefaultItem> = (
  lookupField: LookupField<TItem>
) => HTMLElement | null | undefined;

export type LookupFieldDefaultItem = any;

/** Re-dispatched from the field when its `value` changes. */
export type LookupFieldValueChangedEvent = CustomEvent<{ value: string }>;

/** Re-dispatched from the field when its `selectedItem` changes. */
export type LookupFieldSelectedItemChangedEvent<TItem> = CustomEvent<{ value: TItem | null | undefined }>;

/** Re-dispatched from a multi-select field when its `selectedItems` change. */
export type LookupFieldSelectedItemsChangedEvent<TItem> = CustomEvent<{ value: TItem[] }>;

/** Re-dispatched from the field when its `invalid` changes. */
export type LookupFieldInvalidChangedEvent = CustomEvent<{ value: boolean }>;

/** Re-dispatched from the field when it is validated. */
export type LookupFieldValidatedEvent = CustomEvent<{ valid: boolean }>;

/** Fired when the Create button is clicked, with the text in the dialog search field. */
export type LookupFieldCreateItemEvent = CustomEvent<{ filter: string }>;

export interface LookupFieldEventMap<TItem> extends HTMLElementEventMap {
  'value-changed': LookupFieldValueChangedEvent;
  'selected-item-changed': LookupFieldSelectedItemChangedEvent<TItem>;
  'selected-items-changed': LookupFieldSelectedItemsChangedEvent<TItem>;
  'invalid-changed': LookupFieldInvalidChangedEvent;
  validated: LookupFieldValidatedEvent;
  'create-item': LookupFieldCreateItemEvent;
  /** @deprecated Use `create-item`. */
  'vcf-lookup-field-create-item-event': LookupFieldCreateItemEvent;
}

/**
 * `<vcf-lookup-field>` is a field with a search button that opens a dialog, where the
 * user filters a grid of items and picks one, or several with `multi-select`.
 *
 * ```html
 * <vcf-lookup-field label="Fruit" item-label-path="name" item-value-path="id"></vcf-lookup-field>
 * ```
 *
 * The lookup field is a decorator around the field in its `field` slot: `value`,
 * `selectedItem` and `selectedItems` read and write that field directly.
 *
 * @fires value-changed - Re-dispatched from the field when its `value` changes.
 * @fires selected-item-changed - Re-dispatched from the field when its `selectedItem` changes.
 * @fires selected-items-changed - Re-dispatched from the field when its `selectedItems` change.
 * @fires invalid-changed - Re-dispatched from the field when its `invalid` changes.
 * @fires validated - Re-dispatched from the field when it is validated.
 * @fires create-item - Fired when the Create button is clicked, with the dialog filter text.
 * @fires vcf-lookup-field-create-item-event - Deprecated, use `create-item`.
 */
declare class LookupField<TItem = LookupFieldDefaultItem> extends HTMLElement {
  static readonly is: string;

  /** The version of the element, the same as the package version. */
  static readonly version: string;

  /** The text of the dialog title, between `i18n.headerprefix` and `i18n.headerpostfix`. */
  header: string | null | undefined;

  /** The label of the field. */
  label: string | null | undefined;

  /** The items to pick from, shown in the field and in the dialog grid. */
  items: TItem[] | undefined;

  /** Path to the label of an item, when `items` are objects. */
  itemLabelPath: string;

  /** Path to the value of an item, when `items` are objects. */
  itemValuePath: string;

  /** Builds the grid of the dialog in place of the default one. */
  gridRenderer: LookupFieldRenderer<TItem> | null | undefined;

  /** Builds the search field of the dialog in place of the default one. */
  filterRenderer: LookupFieldRenderer<TItem> | null | undefined;

  /** Lets the user interact with the page while the dialog is open. */
  modeless: boolean;

  /** Lets the user drag the dialog. */
  draggable: boolean;

  /** Lets the user resize the dialog. */
  resizable: boolean;

  /** Hides the Create button of the dialog. */
  createhidden: boolean;

  /** Keeps the Select button disabled. */
  defaultselectdisabled: boolean;

  /** True when the Select button is disabled. */
  readonly selectdisabled: boolean;

  /** True when an item is selected in the dialog. */
  readonly hasselected: boolean;

  /** True when the search button is disabled, because the field is read-only or disabled. */
  readonly buttondisabled: boolean;

  /** Lets several items be picked. Slot a `vaadin-multi-select-combo-box` as the field. */
  multiSelect: boolean;

  required: boolean;

  readonly: boolean;

  disabled: boolean;

  /** True when the field is invalid. The field owns this state. */
  invalid: boolean;

  /** The error message the field shows while it is invalid. */
  errorMessage: string | null | undefined;

  /** Stops the field running its own constraint validation. */
  manualValidation: boolean;

  /** The theme variants, such as `integrated` or `full-width`. */
  theme: string | null | undefined;

  /** The texts of the lookup field. A partial object is merged over the defaults. */
  get i18n(): LookupFieldI18n;
  set i18n(value: Partial<LookupFieldI18n> | null | undefined);

  /** The value of the field. `undefined` when the field has no `value`. */
  value: string | undefined;

  /** The item selected in the field. `undefined` when the field has no `selectedItem`. */
  selectedItem: TItem | null | undefined;

  /** The items selected in a multi-select field. `undefined` when the field has no `selectedItems`. */
  selectedItems: TItem[] | undefined;

  /**
   * The field in the `field` slot, generated or slotted. `undefined` until the
   * lookup field is first connected, and `null` after a slotted field is removed.
   */
  readonly field: HTMLElement | null | undefined;

  /** Validates the field and sets its `invalid` state. */
  validate(): boolean;

  /** Returns true if the field satisfies its constraints, without changing `invalid`. */
  checkValidity(): boolean;

  /** The items whose label contains `filter`, ignoring case. */
  filterItems(items: TItem[] | undefined, filter: string | null | undefined): TItem[] | undefined;

  addEventListener<K extends keyof LookupFieldEventMap<TItem>>(
    type: K,
    listener: (this: LookupField<TItem>, ev: LookupFieldEventMap<TItem>[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void;

  removeEventListener<K extends keyof LookupFieldEventMap<TItem>>(
    type: K,
    listener: (this: LookupField<TItem>, ev: LookupFieldEventMap<TItem>[K]) => void,
    options?: EventListenerOptions | boolean
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean
  ): void;
}

interface LookupField<TItem = LookupFieldDefaultItem> extends ElementMixinClass, ThemableMixinClass {}

declare global {
  interface HTMLElementTagNameMap {
    'vcf-lookup-field': LookupField;
  }
}

export { LookupField };
