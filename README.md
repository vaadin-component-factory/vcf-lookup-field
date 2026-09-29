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

## Usage

Once installed, import it in your application:

```js
import '@vaadin-component-factory/vcf-lookup-field';
```

Add `<vcf-lookup-field>` element to the page.

```html
<vcf-lookup-field></vcf-lookup-field>
```

## Customising the dialog content

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
