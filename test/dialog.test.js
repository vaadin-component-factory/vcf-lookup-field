import { expect, fixture, html, nextFrame, oneEvent } from '@open-wc/testing';
import { dialogContent, flush, footerButtons, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';

describe('vcf-lookup-field: dialog', () => {
  let el;

  beforeEach(async () => {
    el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
    await flush();
  });

  describe('opening', () => {
    it('opens when the search button is clicked', async () => {
      expect(el._dialog.opened).to.be.not.ok;

      await openDialog(el);

      expect(el._dialog.opened).to.be.true;
    });

    it('moves the filter, grid and selected slot content into the dialog', async () => {
      await openDialog(el);
      const content = dialogContent(el);

      expect(content).to.exist;
      expect(content.contains(el._filter)).to.be.true;
      expect(content.contains(el._grod)).to.be.true;
      expect(content.contains(el._selected)).to.be.true;
    });

    it('renders the footer buttons with the i18n labels', async () => {
      await openDialog(el);
      const { create, cancel, select } = footerButtons(el);

      expect(create.textContent.trim()).to.equal('Create new');
      expect(cancel.textContent.trim()).to.equal('Cancel');
      expect(select.textContent.trim()).to.equal('Select');
    });

    it('hides the create button while createhidden is set', async () => {
      await openDialog(el);
      const { create } = footerButtons(el);
      expect(create.hasAttribute('hidden')).to.be.true;

      el.createhidden = false;
      await nextFrame();
      expect(create.hasAttribute('hidden')).to.be.false;
    });

    it('seeds the grid filter from the text typed into the field', async () => {
      el._field.inputElement.value = 'berry';

      await openDialog(el);

      expect(el._filterdata).to.equal('berry');
      expect(el._grod.items).to.deep.equal([OBJECT_ITEMS[3]]);
    });

    it('preselects the grid row matching the field selection', async () => {
      el._field.selectedItem = OBJECT_ITEMS[1];
      await nextFrame();

      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[1]]);
      expect(el._grodSelectedItem).to.deep.equal(OBJECT_ITEMS[1]);
      expect(el.programselectdisabled).to.be.false;
      expect(el.selectdisabled).to.be.false;
    });

    it('leaves the grid unselected and Select disabled when the field is empty', async () => {
      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([]);
      expect(el.programselectdisabled).to.be.true;
      expect(el.selectdisabled).to.be.true;
    });

    it('does not touch the grid selection in multi-select mode', async () => {
      el.multiSelect = true;
      el._field.selectedItem = OBJECT_ITEMS[1];
      el._grod.selectedItems = [OBJECT_ITEMS[0], OBJECT_ITEMS[2]];
      await nextFrame();

      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[0], OBJECT_ITEMS[2]]);
    });

    it('asks the server connector to seed the dialog when one is present', async () => {
      const calls = [];
      el._filterdata = 'pre-set';
      el.$server = {
        copyFieldValueToGrid: () => calls.push('copyFieldValueToGrid'),
        filterGrid: value => calls.push(`filterGrid:${value}`)
      };

      await openDialog(el);

      expect(calls).to.deep.equal(['copyFieldValueToGrid', 'filterGrid:pre-set']);
    });

    it('does not open when the field was created disabled', async () => {
      const disabledField = await fixture(html`<vcf-lookup-field disabled></vcf-lookup-field>`);
      await flush();

      disabledField._searchButton.click();
      await flush();

      expect(disabledField._dialog.opened).to.be.not.ok;
    });

    it('does not open when the field was created readonly', async () => {
      const readonlyField = await fixture(html`<vcf-lookup-field readonly></vcf-lookup-field>`);
      await flush();

      readonlyField._searchButton.click();
      await flush();

      expect(readonlyField._dialog.opened).to.be.not.ok;
    });
  });

  describe('closing', () => {
    it('closes when Cancel is clicked', async () => {
      await openDialog(el);

      footerButtons(el).cancel.click();
      await flush();

      expect(el._dialog.opened).to.be.false;
    });

    it('keeps the field selection untouched when cancelled', async () => {
      el._field.selectedItem = OBJECT_ITEMS[0];
      await openDialog(el);
      el.__onSelectItem({ detail: { value: OBJECT_ITEMS[2] } });

      footerButtons(el).cancel.click();
      await flush();

      expect(el._field.selectedItem).to.deep.equal(OBJECT_ITEMS[0]);
    });
  });

  describe('selecting', () => {
    it('is disabled until a row is selected', async () => {
      await openDialog(el);
      const { select } = footerButtons(el);
      expect(select.disabled).to.be.true;

      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[1]] } });
      await nextFrame();

      expect(select.disabled).to.be.false;
    });

    it('copies the grid selection into the field and closes the dialog', async () => {
      await openDialog(el);
      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[2]] } });
      await nextFrame();

      footerButtons(el).select.click();
      await flush();

      expect(el._field.selectedItem).to.deep.equal(OBJECT_ITEMS[2]);
      expect(el._dialog.opened).to.be.false;
    });

    it('takes the first row when several are selected', async () => {
      await openDialog(el);
      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[1], OBJECT_ITEMS[3]] } });
      await nextFrame();

      el.__select();
      await flush();

      expect(el._field.selectedItem).to.deep.equal(OBJECT_ITEMS[1]);
    });

    it('notifies instead of closing when nothing is selected', async () => {
      await openDialog(el);

      el.__select();
      await flush();

      expect(el.$.notification.opened).to.be.true;
      expect(el._dialog.opened).to.be.true;
      el.$.notification.opened = false;
    });

    it('shows the i18n empty-selection message in the notification', async () => {
      const i18n = { emptyselection: 'Nothing picked!' };
      const custom = await fixture(html`<vcf-lookup-field .i18n="${i18n}"></vcf-lookup-field>`);
      await flush();

      custom.__select();
      await flush();

      const card = document.querySelector('vaadin-notification-card');
      expect(card.textContent).to.contain('Nothing picked!');
      custom.$.notification.opened = false;
    });

    it('delegates to the server connector when one is present', async () => {
      let called = 0;
      el.$server = {
        copyFieldValueToGrid: () => {},
        filterGrid: () => {},
        copyFieldValueFromGrid: () => (called += 1)
      };
      await openDialog(el);

      el.__select();

      expect(called).to.equal(1);
      expect(el._dialog.opened).to.be.true;
    });
  });

  describe('creating', () => {
    it('fires vcf-lookup-field-create-item-event when Create is clicked', async () => {
      el.createhidden = false;
      await openDialog(el);

      setTimeout(() => footerButtons(el).create.click());
      const event = await oneEvent(el, 'vcf-lookup-field-create-item-event');

      expect(event).to.exist;
    });

    it('leaves the dialog open after creating', async () => {
      el.createhidden = false;
      await openDialog(el);

      footerButtons(el).create.click();
      await flush();

      expect(el._dialog.opened).to.be.true;
    });
  });
});
