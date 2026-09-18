import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, OBJECT_ITEMS } from './helpers.js';

/**
 * Regression tests for https://github.com/vaadin-component-factory/vcf-lookup-field/issues/26
 *
 * The lookup field must render the invalid state and the error message the same
 * way every other Vaadin field does. The host only reflects `[invalid]` for the
 * search button styling, so the state has to reach the inner combo box too, and
 * it has to keep reaching it when validation flips after the element is ready.
 */
describe('vcf-lookup-field: validation state', () => {
  /**
   * The text the field actually renders. Vaadin's `ErrorController` puts the
   * message in a light DOM `<div slot="error-message">` and hides it unless the
   * field is both invalid and has a message, so an empty string here means the
   * user sees nothing.
   */
  function renderedErrorMessage(field) {
    const node = field.querySelector('[slot="error-message"]');
    return node && !node.hidden ? node.textContent.trim() : '';
  }

  describe('initial state', () => {
    it('forwards invalid set as an attribute to the field', async () => {
      const el = await fixture(
        html`
          <vcf-lookup-field invalid></vcf-lookup-field>
        `
      );
      await flush();

      expect(el._field.invalid).to.be.true;
      expect(el._field.hasAttribute('invalid')).to.be.true;
    });

    it('forwards error-message set as an attribute to the field', async () => {
      const el = await fixture(
        html`
          <vcf-lookup-field invalid error-message="Please pick a value"></vcf-lookup-field>
        `
      );
      await flush();

      expect(el.errorMessage).to.equal('Please pick a value');
      expect(el._field.errorMessage).to.equal('Please pick a value');
    });

    it('renders the error message in the field when invalid', async () => {
      const el = await fixture(
        html`
          <vcf-lookup-field invalid error-message="Please pick a value"></vcf-lookup-field>
        `
      );
      await flush();

      expect(renderedErrorMessage(el._field)).to.equal('Please pick a value');
    });
  });

  describe('reactive updates', () => {
    it('forwards invalid changed after initialization', async () => {
      const el = await lookupFixture();
      expect(el._field.invalid).to.not.be.true;

      el.invalid = true;
      await nextFrame();
      expect(el._field.invalid).to.be.true;

      el.invalid = false;
      await nextFrame();
      expect(el._field.invalid).to.be.false;
    });

    it('forwards errorMessage changed after initialization', async () => {
      const el = await lookupFixture();

      el.invalid = true;
      el.errorMessage = 'Bitte einen Halter wählen';
      await nextFrame();

      expect(el._field.errorMessage).to.equal('Bitte einen Halter wählen');
      expect(renderedErrorMessage(el._field)).to.equal('Bitte einen Halter wählen');
    });

    it('forwards required, readonly and disabled changed after initialization', async () => {
      const el = await lookupFixture();

      el.required = true;
      el.readonly = true;
      el.disabled = true;
      await nextFrame();

      expect(el._field.required).to.be.true;
      expect(el._field.readonly).to.be.true;
      expect(el._field.disabled).to.be.true;
    });

    it('forwards label changed after initialization', async () => {
      const el = await lookupFixture();

      el.label = 'Halter';
      await nextFrame();

      expect(el._field.label).to.equal('Halter');
    });
  });

  describe('slotted custom field', () => {
    it('forwards the validation state to a slotted field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field invalid error-message="Slotted is invalid too">
          <vaadin-combo-box slot="field"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._field.invalid).to.be.true;
      expect(el._field.errorMessage).to.equal('Slotted is invalid too');
    });

    it('keeps forwarding to a slotted field after initialization', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      el.invalid = true;
      el.errorMessage = 'Now invalid';
      await nextFrame();

      expect(el._field.invalid).to.be.true;
      expect(el._field.errorMessage).to.equal('Now invalid');
    });
  });

  describe('layout', () => {
    it('keeps the search button aligned with the input when an error message shows', async () => {
      const el = await fixture(html`
        <vcf-lookup-field invalid error-message="A rather long validation message"></vcf-lookup-field>
      `);
      await flush();

      const input = el._field.shadowRoot.querySelector('[part="input-field"]');
      const inputRect = input.getBoundingClientRect();
      const buttonRect = el._searchButton.getBoundingClientRect();

      // Both boxes should sit on the same row: their vertical centers must line
      // up within a pixel, which fails when the button drops to the bottom of a
      // combo box grown by the error message.
      const inputCenter = inputRect.top + inputRect.height / 2;
      const buttonCenter = buttonRect.top + buttonRect.height / 2;
      expect(Math.abs(inputCenter - buttonCenter)).to.be.below(1);
    });
  });
  describe('who owns the invalid state', () => {
    it('reflects an invalid state the field set on itself', async () => {
      const el = await lookupFixture();

      el.field.invalid = true;
      await flush();

      expect(el.invalid).to.be.true;
      expect(el.hasAttribute('invalid')).to.be.true;
    });

    it('clears the host invalid state with the field', async () => {
      const el = await lookupFixture();
      el.field.invalid = true;
      await flush();

      el.field.invalid = false;
      await flush();

      expect(el.invalid).to.be.false;
      expect(el.hasAttribute('invalid')).to.be.false;
    });

    /**
     * A field with no active constraint keeps whatever `invalid` it was given:
     * `InputConstraintsMixin.checkValidity()` returns `!this.invalid` in that
     * case, so validating is a no-op. The state set from outside is only at risk
     * once the field has a constraint of its own that it finds satisfied.
     */
    it('keeps an externally set invalid state while the field has no constraint', async () => {
      const el = await lookupFixture();
      el.invalid = true;
      el.errorMessage = 'Pick a value';
      await flush();

      el.field._requestValidation();
      await flush();

      expect(el.field.invalid).to.be.true;
      expect(renderedErrorMessage(el.field)).to.equal('Pick a value');
    });

    it('loses an externally set invalid state when the field validates a satisfied constraint', async () => {
      const el = await fixture(html`<vcf-lookup-field required .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
      el.value = 'apple';
      await flush();

      // The field's own `required` constraint is satisfied, but something
      // outside it knows the value is not acceptable.
      el.invalid = true;
      el.errorMessage = 'Pick another value';
      await flush();
      expect(renderedErrorMessage(el.field)).to.equal('Pick another value');

      // What a blur or a keystroke ends up calling.
      el.field._requestValidation();
      await flush();

      expect(el.field.invalid).to.be.false;
      expect(el.invalid).to.be.false;
      expect(renderedErrorMessage(el.field)).to.equal('');
    });

    it('keeps an externally set invalid state under manual validation', async () => {
      const el = await fixture(
        html`<vcf-lookup-field required manual-validation .items="${OBJECT_ITEMS}"></vcf-lookup-field>`
      );
      await flush();
      el.value = 'apple';
      el.invalid = true;
      el.errorMessage = 'Pick another value';
      await flush();

      el.field._requestValidation();
      await flush();

      expect(el.field.invalid).to.be.true;
      expect(el.invalid).to.be.true;
      expect(renderedErrorMessage(el.field)).to.equal('Pick another value');
    });

    it('forwards manualValidation to the generated field', async () => {
      const el = await lookupFixture();
      expect(el.field.manualValidation).to.be.false;

      el.manualValidation = true;
      await nextFrame();

      expect(el.field.manualValidation).to.be.true;
    });

    it('leaves the manual validation mode of a slotted field alone', async () => {
      // Flow turns manual validation on for every combo box it creates, so an
      // unset host property must never switch it back off.
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field" manual-validation></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el.manualValidation).to.be.undefined;
      expect(el.field.manualValidation).to.be.true;
    });
  });

  describe('validate and checkValidity', () => {
    it('reports a required field with no value as invalid', async () => {
      const el = await fixture(html`<vcf-lookup-field required></vcf-lookup-field>`);
      await flush();

      expect(el.checkValidity()).to.be.false;
      expect(el.validate()).to.be.false;
      await flush();

      expect(el.invalid).to.be.true;
    });

    it('reports a required field with a value as valid', async () => {
      const el = await fixture(html`<vcf-lookup-field required .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
      el.value = 'apple';
      await flush();

      expect(el.validate()).to.be.true;
      await flush();

      expect(el.hasAttribute('invalid')).to.be.false;
    });

    it('does not throw when the slotted field is not a Vaadin field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <input slot="field" />
        </vcf-lookup-field>
      `);
      await flush();

      expect(el.validate()).to.be.true;
      expect(el.checkValidity()).to.be.true;
    });
  });
});
