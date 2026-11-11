// Configuration for `npm run analyze`, which writes custom-elements.json.

const dashCase = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * The analyzer names attributes as plain Lit does, after the property as it is.
 * PolylitMixin maps a property to its dash-case attribute instead
 * (`itemLabelPath` to `item-label-path`), so rename them to match.
 */
const polylitAttributes = () => ({
  name: 'polylit-attributes',
  moduleLinkPhase({ moduleDoc }) {
    (moduleDoc.declarations || []).forEach(declaration => {
      (declaration.attributes || []).forEach(attribute => {
        attribute.name = dashCase(attribute.name);
      });
      (declaration.members || []).forEach(member => {
        if (member.attribute) {
          member.attribute = dashCase(member.attribute);
        }
      });
      // The events forwarded from the slotted field are dispatched with a
      // variable name; they are documented with @fires instead.
      declaration.events = (declaration.events || []).filter(event => event.name !== 'type');
    });
  }
});

export default {
  globs: ['src/vcf-lookup-field.js'],
  litelement: true,
  plugins: [polylitAttributes()]
};
