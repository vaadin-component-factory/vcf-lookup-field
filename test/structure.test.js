import { expect, fixture, html } from '@open-wc/testing';
import { flush, lookupFixture, OBJECT_ITEMS } from './helpers.js';
import { LookupField } from '../src/vcf-lookup-field.js';

describe('vcf-lookup-field: structure', () => {
  it('is registered under its own tag name', async () => {
    const el = await lookupFixture();
    expect(el).to.be.an.instanceOf(LookupField);
    expect(customElements.get('vcf-lookup-field')).to.equal(LookupField);
  });

  it('exposes the same version as package.json', async () => {
    const pkg = await fetch(new URL('../package.json', import.meta.url)).then(r => r.json());
    expect(LookupField.version).to.equal(pkg.version);
  });

  it('registers itself on the Vaadin namespace', () => {
    expect(window.Vaadin.VcfLookupField).to.equal(LookupField);
  });

  it('creates a combo box in the field slot when none is slotted', async () => {
    const el = await lookupFixture();
    const comboBox = el.querySelector('vaadin-combo-box');

    expect(comboBox).to.exist;
    expect(el._field).to.equal(comboBox);
    expect(comboBox.getAttribute('slot')).to.equal('field');
    expect(comboBox.hasAttribute('allow-custom-value')).to.be.true;
    expect(comboBox.hasAttribute('clear-button-visible')).to.be.true;
  });

  it('creates a search button in the search button slot', async () => {
    const el = await lookupFixture();
    const button = el.querySelector('vaadin-button.search-button');

    expect(button).to.exist;
    expect(el._searchButton).to.equal(button);
    expect(button.getAttribute('slot')).to.equal('search-button-slot');
    expect(button.getAttribute('aria-label')).to.equal(el.i18n.searcharialabel);
    expect(button.querySelector('vaadin-icon').getAttribute('icon')).to.equal('vaadin:search');
  });

  it('creates a closed, non-light-dismissable dialog', async () => {
    const el = await lookupFixture();
    const dialog = el.querySelector('vaadin-dialog');

    expect(dialog).to.exist;
    expect(el._dialog).to.equal(dialog);
    expect(dialog.opened).to.be.not.ok;
    expect(dialog.hasAttribute('no-close-on-outside-click')).to.be.true;
  });

  it('falls back to the default grid, filter and selected elements', async () => {
    const el = await lookupFixture();

    expect(el._grod.localName).to.equal('vaadin-grid');
    expect(el._filter.localName).to.equal('vaadin-text-field');
    expect(el._selected.localName).to.equal('div');
  });

  it('forwards field-related properties to the generated combo box', async () => {
    const el = await fixture(html`
      <vcf-lookup-field
        label="Fruit"
        item-label-path="label"
        item-value-path="value"
        required
        .items="${OBJECT_ITEMS}"
      ></vcf-lookup-field>
    `);
    await flush();

    expect(el._field.label).to.equal('Fruit');
    expect(el._field.itemLabelPath).to.equal('label');
    expect(el._field.itemValuePath).to.equal('value');
    expect(el._field.required).to.be.true;
    expect(el._field.items).to.deep.equal(OBJECT_ITEMS);
  });

  it('builds the dialog header title from the i18n prefix, header and postfix', async () => {
    const i18n = { headerprefix: 'Lookup:', headerpostfix: '(required)' };
    const el = await fixture(html`<vcf-lookup-field header="Pick a fruit" .i18n="${i18n}"></vcf-lookup-field>`);
    await flush();

    expect(el._dialog.headerTitle).to.equal('Lookup: Pick a fruit (required)');
  });

  it('omits the prefix and postfix from the header title by default', async () => {
    const el = await fixture(html`<vcf-lookup-field header="Pick a fruit"></vcf-lookup-field>`);
    await flush();

    expect(el._dialog.headerTitle.trim()).to.equal('Pick a fruit');
  });

  it('forwards dialog behaviour flags to the dialog', async () => {
    const el = await fixture(html`<vcf-lookup-field modeless draggable resizable></vcf-lookup-field>`);
    await flush();

    expect(el._dialog.modeless).to.be.true;
    expect(el._dialog.draggable).to.be.true;
    expect(el._dialog.resizable).to.be.true;
  });
});
