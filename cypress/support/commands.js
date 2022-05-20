// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('seed', (tabs) => {
  let i = 0;
  tabs.forEach(tab => {
    const json = JSON.stringify(tab);
    window.localStorage.setItem(`clipboard_data_${i++}`, json);
  });
})
