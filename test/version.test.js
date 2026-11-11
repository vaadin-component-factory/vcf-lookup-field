import { expect } from '@open-wc/testing';
import { LookupField } from '../src/vcf-lookup-field.js';

describe('vcf-lookup-field: version', () => {
  it('registers the version in package.json', async () => {
    const { version } = await (await fetch('/package.json')).json();
    expect(LookupField.version).to.equal(version);
    expect(customElements.get('vcf-lookup-field').version).to.equal(version);
  });
});
