export default function () {
  return [{
    title: 'Dashboard',
    to: { name: 'Dashboard' },
    htmlBefore: '<i class="material-icons">dashboard</i>',
    htmlAfter: '',
  }, {
    title: 'Forms',
    htmlBefore: '<i class="material-icons">filter_none</i>',
    to: { name: 'Forms' },
  }, {
    title: 'Settings',
    htmlBefore: '<i class="material-icons">note_add</i>',
    to: {
      name: 'Settings',
    },
  }];
}
