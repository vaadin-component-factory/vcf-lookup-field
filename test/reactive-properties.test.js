import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture } from './helpers.js';
import '@vaadin/combo-box';

/**
 * Regression tests for https://github.com/vaadin-component-factory/vcf-lookup-field/issues/28
 *
 * The combo box, search button and dialog are created imperatively, so the host
 * has to keep pushing its own state onto them. Before the fix that copy ran once
 * in a `requestAnimationFrame`, which meant every property set after the element
 * was ready was silently ignored: the field stayed interactive while the host
 * said `disabled`, and the dialog never picked up a later `header` or flag.
 */
describe('vcf-lookup-field: properties set after initialization', () => {
  it('applies the host state to the children without waiting for a frame', async () => {
    const el = await fixture(html`
      <vcf-lookup-field disabled header="Pick a fruit" item-label-path="name"></vcf-lookup-field>
    `);

    expect(el._field.disabled).to.be.true;
    expect(el._field.itemLabelPath).to.equal('name');
    expect(el._searchButton.disabled).to.be.true;
    expect(el._dialog.headerTitle).to.equal('Pick a fruit');
  });

  describe('search button', () => {
    it('disables the search button when the host becomes disabled', async () => {
      const el = await lookupFixture();
      expect(el._searchButton.disabled).to.be.not.ok;

      el.disabled = true;
      await nextFrame();

      expect(el.buttondisabled).to.be.true;
      expect(el._searchButton.disabled).to.be.true;
    });

    it('disables the search button when the host becomes readonly', async () => {
      const el = await lookupFixture();

      el.readonly = true;
      await nextFrame();

      expect(el._searchButton.disabled).to.be.true;
    });

    it('re-enables the search button when the host is enabled again', async () => {
      const el = await fixture(html`<vcf-lookup-field disabled></vcf-lookup-field>`);
      await flush();
      expect(el._searchButton.disabled).to.be.true;

      el.disabled = false;
      await nextFrame();

      expect(el._searchButton.disabled).to.be.false;
    });

    it('keeps the dialog shut while the host is disabled', async () => {
      const el = await lookupFixture();

      el.disabled = true;
      await nextFrame();
      el._searchButton.click();
      await flush();

      expect(el._dialog.opened).to.be.not.ok;
    });

    it('relabels the search button when i18n changes', async () => {
      const el = await lookupFixture();

      el.i18n = { ...el.i18n, searcharialabel: 'Rechercher' };
      await nextFrame();

      expect(el._searchButton.getAttribute('aria-label')).to.equal('Rechercher');
    });
  });

  describe('field', () => {
    it('forwards item paths changed after initialization', async () => {
      const el = await lookupFixture();

      el.itemLabelPath = 'name';
      el.itemValuePath = 'id';
      await nextFrame();

      expect(el._field.itemLabelPath).to.equal('name');
      expect(el._field.itemValuePath).to.equal('id');
    });

    it('forwards the theme changed after initialization', async () => {
      const el = await lookupFixture();

      el.theme = 'small';
      await nextFrame();

      expect(el._field.getAttribute('theme')).to.equal('small');
    });

    it('leaves the item paths of a slotted field alone', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field" item-label-path="name" item-value-path="id"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._field.itemLabelPath).to.equal('name');
      expect(el._field.itemValuePath).to.equal('id');
    });
  });

  describe('dialog', () => {
    it('updates the header title when the header changes', async () => {
      const el = await lookupFixture();

      el.header = 'Later header';
      await nextFrame();

      expect(el._dialog.headerTitle).to.equal('Later header');
    });

    it('rebuilds the header title when i18n changes', async () => {
      const el = await fixture(html`<vcf-lookup-field header="Pick a fruit"></vcf-lookup-field>`);
      await flush();

      el.i18n = { ...el.i18n, headerprefix: 'Lookup:', headerpostfix: '(required)' };
      await nextFrame();

      expect(el._dialog.headerTitle).to.equal('Lookup: Pick a fruit (required)');
    });

    it('forwards the behaviour flags changed after initialization', async () => {
      const el = await lookupFixture();

      el.modeless = true;
      el.draggable = true;
      el.resizable = true;
      await nextFrame();

      expect(el._dialog.modeless).to.be.true;
      expect(el._dialog.draggable).to.be.true;
      expect(el._dialog.resizable).to.be.true;

      el.modeless = false;
      el.resizable = false;
      await nextFrame();

      expect(el._dialog.modeless).to.be.false;
      expect(el._dialog.resizable).to.be.false;
    });

    it('forwards the theme changed after initialization', async () => {
      const el = await lookupFixture();

      el.theme = 'small';
      await nextFrame();

      expect(el._dialog.getAttribute('theme')).to.equal('small');
    });

    it('keeps a slotted dialog header in charge of the title', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <h2 slot="dialog-header">My header</h2>
        </vcf-lookup-field>
      `);
      await flush();

      el.header = 'Later header';
      await nextFrame();

      expect(el._dialog.headerTitle).to.be.not.ok;
    });
  });

  describe('dialog accessible name', () => {
    it('keeps the lookup-grid label when no header is set', async () => {
      const el = await lookupFixture();

      expect(el._dialog.headerTitle).to.be.not.ok;
      expect(el._dialog.getAttribute('aria-label')).to.equal('lookup-grid');
    });

    it('falls back to the lookup-grid label when the header is cleared', async () => {
      const el = await fixture(html`<vcf-lookup-field header="Pick a fruit"></vcf-lookup-field>`);
      await flush();
      expect(el._dialog.getAttribute('aria-label').trim()).to.equal('Pick a fruit');

      el.header = '';
      await flush();

      expect(el._dialog.headerTitle).to.be.not.ok;
      expect(el._dialog.getAttribute('aria-label')).to.equal('lookup-grid');
    });
  });
});
