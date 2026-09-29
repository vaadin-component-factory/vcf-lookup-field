# &lt;vcf-lookup-field&gt;

[![npm version](https://badgen.net/npm/v/@vaadin-component-factory/vcf-lookup-field)](https://www.npmjs.com/package/@vaadin-component-factory/vcf-lookup-field) [![Published on Vaadin Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadin-component-factoryvcf-lookup-field)

The Lookup field component allows you to search a specific record with either a combobox or a dialog with a grid view.

![lookup-field](https://user-images.githubusercontent.com/3392815/174095935-b001519e-3bdb-4aad-b01d-4ee8dc49f364.gif)

![lookup-field-dialog](https://user-images.githubusercontent.com/3392815/174095944-700f641d-111e-4a6d-9278-12b8793cea19.gif)

[Live demo ↗](https://vcf-lookup-field.netlify.app) | [API documentation ↗](https://vcf-lookup-field.netlify.app/api/#/elements/LookupField)

## Installation

Install `vcf-lookup-field`:

```sh
npm i @vaadin-component-factory/vcf-lookup-field --save
```

## Important information about versioning
**Component versions 23.x and 24.x were deprecated in order to follow Semanting Versioning practices. Please use latest version 3.x for Vaadin 23 and version 4/5.x for Vaadin 24.**  

## Compatibility

- Version 1.x.x -> Vaadin 14+
- Version 3.x.x -> Vaadin 23.x
- Version 4.x.x -> Vaadin 24.x
- Version 5.x.x -> Vaadin 24.x (improved accessibility)
- Version 6.x.x -> Vaadin 25.x
- Version 7.x.x -> Vaadin 25.x (the host wraps the slotted field, see [Migrating to 7.0.0](#migrating-to-700))

## Usage

Once installed, import it in your application:

```js
import '@vaadin-component-factory/vcf-lookup-field';
```

Add `<vcf-lookup-field>` element to the page.

```html
<vcf-lookup-field></vcf-lookup-field>
```

### Customising the field

The recommended way to customise the field is to slot your own combo box and configure it
through its own API. The lookup field has no property for things like the placeholder, the
helper text or an item renderer, and it does not need one:

```html
<vcf-lookup-field>
  <vaadin-combo-box
    slot="field"
    label="Country"
    placeholder="Search a country"
    item-label-path="name"
    item-value-path="code"
  ></vaadin-combo-box>
</vcf-lookup-field>
```

`itemLabelPath`, `itemValuePath` and `theme` on `<vcf-lookup-field>` only apply to the combo box
it generates when nothing is slotted. A slotted field keeps the ones it was declared with.

### Customising the dialog content

The dialog shows a filter, a grid and a selected area. Each has a default. You can replace the
grid and the filter in two ways:

- Slot your own element into the `grid` or `filter` slot.
- Set `gridRenderer` or `filterRenderer`, a function that receives the lookup field and returns
  the element to use. Returning nothing keeps the default.

```js
lookupField.gridRenderer = lookupField => {
  const grid = document.createElement('vaadin-grid');
  grid.items = lookupField.items;
  // add columns...
  return grid;
};
```

Slotted content takes precedence over a renderer, and a renderer over the default. The renderer
runs when the lookup field initializes, before the dialog can open, and again whenever you set
a new one. A rendered element is treated like a slotted one:

- The lookup field does not set the items of a rendered grid, and does not update them when
  `items` changes. Set them from the renderer. While the default filter is in use, typing in it
  still replaces the grid items with the matching `items`. In a Flow application it filters on
  the server instead.
- A rendered filter does not filter anything by itself. Listen to it and set the grid items.

`lookupField.items` and `lookupField.filterItems(items, text)` help with both.

## Migrating to 7.0.0

In 7.0.0, `<vcf-lookup-field>` became a decorator over the field in its `field` slot. It no
longer keeps its own copy of the field state, so the host and the field can no longer disagree.

### Breaking changes

- The `grid`, `filter` and `selected` slots no longer have shadow DOM fallback content. The
  default grid, filter and selected content are now generated into the light DOM when nothing
  is slotted.
- `el.$.lookupFieldFilter` is gone. Use `el._filter` for the default filter, or `el.field` for
  the field.
- `invalid` on the host is now derived from the field. Setting it on the host still reaches the
  field, but the field is the source of truth.
- Multi-select: when a `vaadin-multi-select-combo-box` is slotted, `value` is `undefined`
  because that field has no `value`. Use `selectedItems` instead.

### New API

- `value`, `selectedItem` and `selectedItems` read and write straight through to the slotted
  field. Values set before a field is attached are applied to it once it is.
- `field` returns the field in the `field` slot, generated or slotted. Use it to reach the
  parts of the field API that the lookup field does not mirror.
- `validate()` and `checkValidity()` delegate to the field.
- `gridRenderer` and `filterRenderer` build the grid and the filter of the dialog in place of
  the defaults. See [Customising the dialog content](#customising-the-dialog-content).
- `manualValidation` is forwarded to the field. It has no default on purpose: Flow's
  `ComboBoxBase` turns manual validation on for every combo box it creates, and forwarding an
  explicit `false` would switch it back off.
- The host re-dispatches the field's `value-changed`, `selected-item-changed`,
  `selected-items-changed`, `invalid-changed` and `validated` events, so you can listen on
  `<vcf-lookup-field>` directly. The Vaadin fields fire these without bubbling, so they would
  not reach the host otherwise.

## Running demo

1. Fork the `vcf-lookup-field` repository and clone it locally.

2. Make sure you have [npm](https://www.npmjs.com/) installed.

3. When in the `vcf-lookup-field` directory, run `npm install` to install dependencies.

4. Run `npm run serve` to open the demo.

## Running tests

The test suite runs in a real Chromium browser via [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview).

1. Install dependencies with `npm install`.

2. Install the browser once with `npx playwright install chromium`.

3. Run the tests:

```sh
npm test              # single run
npm run test:watch    # re-run on change, with a browser you can debug in
npm run test:coverage # single run plus a coverage report
```

The specs live in `test/` and are grouped by concern: `structure`, `properties`, `filtering`,
`dialog`, `selection`, `slots`, `grid-pro` and `focus`. Shared fixtures and DOM helpers are in
`test/helpers.js`.

## Publishing

To publish a new version, updte the version then run: `npm publish` with a account on npm that can update this component.

## License

Apache License 2.0
