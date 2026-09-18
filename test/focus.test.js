import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';

const afterTimeout = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('vcf-lookup-field: focus', () => {
  it('focuses and selects the field text when focus() is called', async () => {
    const el = await lookupFixture();
    el._field.value = 'Apple';

    el.focus();
    await afterTimeout(150);

    expect(el._field.hasAttribute('focused')).to.be.true;
  });

  it('focuses the dialog search filter when the dialog opens', async () => {
    const el = await lookupFixture();

    await openDialog(el);
    await afterTimeout(50);

    expect(el._filter.hasAttribute('focus-ring')).to.be.true;
    expect(el._filter.hasAttribute('focused')).to.be.true;
  });

  it('returns focus to the field when the dialog closes', async () => {
    const el = await lookupFixture();
    await openDialog(el);

    el.__close();
    await flush();
    await afterTimeout(50);

    expect(el._field.hasAttribute('focus-ring')).to.be.true;
  });

  it('returns focus to the field after picking an item', async () => {
    const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
    await flush();
    await openDialog(el);
    el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[0]] } });
    await nextFrame();

    el.__select();
    await flush();
    await afterTimeout(50);

    expect(el._field.hasAttribute('focus-ring')).to.be.true;
  });
});

describe('vcf-lookup-field: accessibility', () => {
  it('labels the search button for screen readers', async () => {
    const el = await lookupFixture();

    expect(el._searchButton.getAttribute('aria-label')).to.equal('Click to open the search dialog');
  });

  it('uses a custom i18n aria label for the search button', async () => {
    const i18n = { searcharialabel: 'Rechercher' };
    const el = await fixture(html`<vcf-lookup-field .i18n="${i18n}"></vcf-lookup-field>`);
    await flush();

    expect(el._searchButton.getAttribute('aria-label')).to.equal('Rechercher');
  });

  it('labels the dialog from its header title', async () => {
    const el = await fixture(html`<vcf-lookup-field header="Pick a fruit"></vcf-lookup-field>`);
    await flush();

    // `vaadin-dialog` reflects `headerTitle` onto aria-label, overwriting the
    // "lookup-grid" fallback that `_createDialog` sets.
    expect(el._dialog.getAttribute('aria-label').trim()).to.equal('Pick a fruit');
  });

  it('marks the Select button aria-disabled while nothing is selected', async () => {
    const el = await lookupFixture();
    await openDialog(el);
    const select = el._dialog.querySelector('#selectbtn');

    expect(select.getAttribute('aria-disabled')).to.equal('true');

    el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[0]] } });
    await nextFrame();

    expect(select.hasAttribute('aria-disabled')).to.be.false;
  });

  it('labels the dialog search filter from i18n', async () => {
    const i18n = { search: 'Chercher' };
    const el = await fixture(html`<vcf-lookup-field .i18n="${i18n}"></vcf-lookup-field>`);
    await flush();

    expect(el._filter.label).to.equal('Chercher');
  });
});

describe('vcf-lookup-field: keyboard in the dialog', () => {
  it('confirms the selection on Enter', async () => {
    const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
    await flush();
    await openDialog(el);
    el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[1]] } });
    await nextFrame();

    el._grod.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));
    await flush();

    expect(el._field.selectedItem).to.deep.equal(OBJECT_ITEMS[1]);
    expect(el._dialog.opened).to.be.false;
  });

  it('ignores Enter while the Select button is disabled', async () => {
    const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
    await flush();
    await openDialog(el);

    el._grod.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));
    await flush();

    expect(el._dialog.opened).to.be.true;
    expect(el.$.notification.opened).to.be.not.ok;
  });
});
