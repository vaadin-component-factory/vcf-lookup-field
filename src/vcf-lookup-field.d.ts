declare const LookupField_base: import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/component-base/src/dir-mixin").DirMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/component-base/src/element-mixin").ElementMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/vaadin-themable-mixin").ThemableMixinClass> & import("@open-wc/dedupe-mixin").Constructor<import("@vaadin/vaadin-themable-mixin/vaadin-theme-property-mixin").ThemePropertyMixinClass> & typeof LitElement;
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
export class LookupField extends LookupField_base {
    static get styles(): import("lit").CSSResult[];
    static get is(): string;
    static get version(): string;
    static get properties(): {
        header: {
            type: StringConstructor;
        };
        /**
         * A full set of items to filter the visible options from.
         * The items can be of either `String` or `Object` type.
         * @type {!Array<string> | undefined}
         */
        items: Array<string> | undefined;
        _filterdata: {
            type: StringConstructor;
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
        };
        /**
         * @type {Boolean}
         */
        programselectdisabled: boolean;
        selectdisabled: {
            type: BooleanConstructor;
        };
        hasselected: {
            type: BooleanConstructor;
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
            reflect: boolean;
        };
        buttondisabled: {
            type: BooleanConstructor;
        };
        /**
         * @type {Boolean}
         */
        invalid: boolean;
        /**
         * @type {String}
         */
        theme: string;
        /**
         * The object used to localize this component.
         * For changing the default localization, change the entire
         * _i18n_ object or just the property you want to modify.
         */
        i18n: {
            type: ObjectConstructor;
        };
    };
    render(): import("lit-html").TemplateResult<1>;
    set items(arg: any);
    get items(): any;
    itemLabelPath: string;
    itemValuePath: string;
    _filterdata: any;
    __onSelectItemsChangedBinded: any;
    __onActiveItemChangedBinded: any;
    _observer: FlattenedNodesObserver;
    disabled: boolean;
    readonly: boolean;
    defaultselectdisabled: boolean;
    createhidden: boolean;
    programselectdisabled: boolean;
    i18n: {
        select: string;
        cancel: string;
        search: string;
        searcharialabel: string;
        headerprefix: string;
        headerpostfix: string;
        emptyselection: string;
        create: string;
    };
    firstUpdated(_changedProperties: any): void;
    _grid: any;
    _filter: any;
    _footer: Element;
    _field: any;
    _selected: any;
    __opendialog(): void;
    __onSelectItem(event: any): void;
    __onSelectChanged(event: any): void;
    _gridSelectedItem: any;
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
    private __open;
    /** @private */
    private __close;
    /** @private */
    private __create;
    /** @private */
    private __select;
    _getItemLabel(item: any): any;
    _itemsChanged(): void;
    get selectdisabled(): any;
    get hasselected(): boolean;
    get buttondisabled(): any;
    _items: any;
}
import { LitElement } from "lit-element/lit-element";
import { FlattenedNodesObserver } from "@polymer/polymer/lib/utils/flattened-nodes-observer.js";
export {};
//# sourceMappingURL=vcf-lookup-field.d.ts.map