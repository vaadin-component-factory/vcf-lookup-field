declare const LookupField_base: import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/component-base/src/slot-styles-mixin.js").SlotStylesMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/component-base/src/dir-mixin.js").DirMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/component-base/src/element-mixin").ElementMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/vaadin-themable-mixin/vaadin-theme-detection-mixin").ThemeDetectionMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/vaadin-themable-mixin").ThemableMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/vaadin-themable-mixin/vaadin-theme-property-mixin.js").ThemePropertyMixinClass> & typeof PolymerElement;
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
export class LookupField extends LookupField_base {
    static get template(): HTMLTemplateElement;
    static get is(): string;
    static get version(): string;
    static get properties(): {
        header: {
            type: StringConstructor;
            observer: string;
        };
        label: {
            type: StringConstructor;
            observer: string;
        };
        /**
         * A full set of items to filter the visible options from.
         * The items can be of either `String` or `Object` type.
         * @type {!Array<string> | undefined}
         */
        items: Array<string> | undefined;
        _filterdata: {
            type: StringConstructor;
            observer: string;
        };
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
        itemLabelPath: string;
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
        itemValuePath: string;
        /**
         * @type {Boolean}
         */
        modeless: boolean;
        /**
         * @type {Boolean}
         */
        draggable: boolean;
        /**
         * @type {Boolean}
         */
        resizable: boolean;
        /**
         * @type {Boolean}
         */
        defaultselectdisabled: boolean;
        createhidden: {
            type: BooleanConstructor;
            value: boolean;
        };
        /**
         * @type {Boolean}
         */
        programselectdisabled: boolean;
        selectdisabled: {
            type: BooleanConstructor;
            computed: string;
        };
        hasselected: {
            type: BooleanConstructor;
            computed: string;
        };
        /**
         * @type {Boolean}
         */
        required: boolean;
        /**
         * @type {Boolean}
         */
        readonly: boolean;
        disabled: {
            type: BooleanConstructor;
            reflectToAttribute: boolean;
            observer: string;
        };
        buttondisabled: {
            type: BooleanConstructor;
            computed: string;
            observer: string;
        };
        /**
         * True when the wrapped field is invalid.
         *
         * Reflected so that `:host([invalid])` can tint the search button. The
         * field owns this state: setting it here forwards it, and the field
         * changing it on its own updates the host.
         * @type {Boolean}
         */
        invalid: boolean;
        /**
         * The error message the field shows while it is invalid.
         * @attr {string} error-message
         * @type {String}
         */
        errorMessage: string;
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
        manualValidation: boolean;
        /**
         * @deprecated `has-error-message` is a read-only state attribute that a
         * Vaadin field sets on itself once its error node has content, so setting
         * it here does nothing. Use `errorMessage` instead.
         * @type {String}
         */
        hasErrorMessage: string;
        /**
         * @type {String}
         */
        theme: string;
        multiSelect: {
            type: BooleanConstructor;
            value: boolean;
            reflectToAttribute: boolean;
        };
        /**
         * The object used to localize this component.
         * For changing the default localization, change the entire
         * _i18n_ object or just the property you want to modify.
         */
        i18n: {
            type: ObjectConstructor;
            observer: string;
            value: () => {
                select: string;
                cancel: string;
                search: string;
                searcharialabel: string;
                headerprefix: string;
                headerpostfix: string;
                emptyselection: string;
                create: string;
            };
        };
    };
    /**
     * Value writes that arrive before a field has been adopted. Flushed by
     * `__setField`. This is the only state the host holds on the field's behalf.
     */
    __pendingField: {};
    __onSelectItemsChangedBinded: any;
    __onActiveItemChangedBinded: any;
    _observer: FlattenedNodesObserver;
    ready(): void;
    _filter: any;
    _selected: any;
    _forceFooterRerender: boolean;
    _forceHeaderRerender: boolean;
    set value(arg: string);
    /**
     * The value of the wrapped field. `undefined` when the field has no `value`,
     * which is the case for `vaadin-multi-select-combo-box`.
     * @type {string | undefined}
     */
    get value(): string;
    set selectedItem(arg: any);
    /**
     * The item selected in the wrapped field.
     * @type {Object | string | undefined}
     */
    get selectedItem(): any;
    set selectedItems(arg: any[]);
    /**
     * The items selected in the wrapped field, for a multi-select field.
     * @type {Array | undefined}
     */
    get selectedItems(): any[];
    /**
     * The field in the `field` slot, generated or slotted. The documented way to
     * reach the parts of its API the lookup field does not mirror.
     * @return {HTMLElement}
     */
    get field(): HTMLElement;
    /** @private */
    private __readField;
    /** @private */
    private __writeField;
    /**
     * Applies the value writes that arrived before a field was available. Only
     * properties the field actually has are written, so a value buffered for a
     * single-select field is not forced onto a multi-select one.
     * @private
     */
    private __flushPendingField;
    /**
     * Validates the wrapped field and sets its `invalid` state from the result,
     * which the host mirrors. Returns true when there is no field to validate, so
     * that slotting something that is not a Vaadin field cannot throw.
     * @return {boolean} True if the value is valid.
     */
    validate(): boolean;
    /**
     * Returns true if the wrapped field satisfies its constraints, without
     * touching its invalid state.
     * @return {boolean}
     */
    checkValidity(): boolean;
    /**
     * Adopts a field: detaches the listeners from the one being replaced, applies
     * the buffered and host-held state, and subscribes to the notifications that
     * keep the host in step with it.
     *
     * Calling it again with the same field does nothing, which matters because the
     * flattened-nodes observer re-reports the field `ready()` has already handled.
     * @private
     */
    private __setField;
    _field: any;
    /** @private */
    private __attachFieldListeners;
    _filterValue: any;
    __fieldListeners: {
        'filter-changed': (e: any) => void;
    };
    /** @private */
    private __detachFieldListeners;
    /**
     * Copies a state property from the field onto the host.
     *
     * The equality check is what breaks the cycle: the observer that would push the
     * value straight back finds the field already agrees and writes nothing.
     * @private
     */
    private __syncFromField;
    _createComboBox(): void;
    __generatedField: import("@vaadin/combo-box/src/vaadin-combo-box.js").ComboBox<any>;
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
    private _forwardFieldState;
    /**
     * Copies the host theme onto a generated child. `theme` is an attribute on
     * both the combo box and the dialog, so an unset host theme has to remove it
     * rather than write the string "undefined".
     * @private
     */
    private __forwardTheme;
    /**
     * Mirrors the host state onto the generated search button. Called from the
     * observers of everything it depends on, so a change after initialization
     * reaches the button too.
     * @private
     */
    private __updateSearchButton;
    /**
     * Mirrors the host state onto the generated dialog. Called from the observers
     * of everything it depends on, so a change after initialization reaches the
     * dialog too.
     * @private
     */
    private __updateDialog;
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
    private __updateDialogHeaderTitle;
    /**
     * Puts the `lookup-grid` label back once the dialog has processed a cleared
     * `headerTitle`, which removes the `aria-label` the title had replaced.
     * @private
     */
    private __restoreDialogAriaLabel;
    /** @private */
    private __i18nChanged;
    /** @private */
    private __themeChanged;
    /**
     * Forwards the item paths and keeps the generated grid column pointing at the
     * label path.
     * @private
     */
    private __itemPathsChanged;
    _createSearchButton(): void;
    _searchButton: import("@vaadin/button/src/vaadin-button.js").Button;
    _createDialog(): void;
    _dialog: import("@vaadin/dialog/src/vaadin-dialog.js").Dialog;
    /**
     * The default grid, shown when nothing is slotted into the `grid` slot. Its
     * single column follows `itemLabelPath`.
     * @private
     */
    private _createGrid;
    __generatedGrid: import("@vaadin/grid/src/vaadin-grid.js").Grid<any>;
    __generatedGridColumn: import("@vaadin/grid/src/vaadin-grid-column.js").GridColumn<any>;
    /**
     * The default search field of the dialog, shown when nothing is slotted into
     * the `filter` slot.
     *
     * Only the generated filter drives `_filterdata` and the grid: a slotted one
     * is assumed to bring its own filtering, which is how Flow's custom filter
     * works.
     * @private
     */
    private _createFilter;
    _filterdata: any;
    __generatedFilter: import("@vaadin/text-field/src/vaadin-text-field.js").TextField;
    /** @private */
    private _createSelected;
    /** @private */
    private __updateFilter;
    /**
     * Keeps the generated filter showing the current filter text, so that the text
     * seeded from the field when the dialog opens appears in the search box.
     * @private
     */
    private __filterdataChanged;
    /** @private */
    private __updateGridItems;
    /**
     * The single place where `_grod` is assigned, so the selection listeners
     * always follow the current grid.
     * @private
     */
    private __setGrid;
    _grod: any;
    focus(): void;
    __onSelectItem(event: any): void;
    __onSelectChanged(event: any): void;
    _grodSelectedItem: any;
    programselectdisabled: boolean;
    set _grid(arg: any);
    _gridPro: any;
    _customStopEdit(shouldCancel: any, shouldRestoreFocus: any): void;
    _hasFocusCallback: boolean;
    /** @private */
    private __onDomChange;
    _dialogHeader: any;
    _dialogFooter: any;
    computeselectdisabled(defaultselectdisabled: any, programselectdisabled: any): any;
    computehasselected(programselectdisabled: any): boolean;
    computebuttondisabled(readonly: any, disabled: any): any;
    __filterGrid(event: any): void;
    filterItems(items: any, filterData: any): any;
    /** @private */
    private __searchKeydown;
    /** @private */
    private __open;
    /** @private */
    private __close;
    /** @private */
    private __create;
    /** @private */
    private __select;
    _getItemLabel(item: any): any;
    _itemsChanged(): void;
}
import { PolymerElement } from "@polymer/polymer/polymer-element";
import { FlattenedNodesObserver } from "@polymer/polymer/lib/utils/flattened-nodes-observer.js";
export {};
//# sourceMappingURL=vcf-lookup-field.d.ts.map