import { expect } from '@open-wc/testing';
import { LitElement } from 'lit';
import { LookupField } from '../src/vcf-lookup-field.js';

// No lookup field is created in this file: each test file runs in its own page,
// so these checks see the class exactly as `customElements.define()` left it.
describe('vcf-lookup-field: property accessors', () => {
  it('is a Lit element', () => {
    expect(LookupField.prototype).to.be.an.instanceOf(LitElement);
  });

  it('has the accessors of its properties before any instance exists', () => {
    // Framework wrappers such as @lit/react decide between setting a property
    // and an attribute with an `in` check on the prototype, before rendering.
    const proto = customElements.get('vcf-lookup-field').prototype;
    [
      'items',
      'label',
      'itemLabelPath',
      'itemValuePath',
      'theme',
      'i18n',
      'invalid',
      'errorMessage',
      'gridRenderer',
      'filterRenderer',
      'multiSelect',
      'value',
      'selectedItem',
      'selectedItems'
    ].forEach(prop => expect(prop in proto, prop).to.be.true);
  });
});
