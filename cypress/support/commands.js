// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('seed', (data) => {
  if (Array.isArray(data)) {
    let i = 0;
    data.forEach(tab => {
      const json = JSON.stringify(tab);
      window.localStorage.setItem(`clipboard_data_${i++}`, json);
    });
  } else {
    const json = JSON.stringify(data);
    window.localStorage.setItem(`clipboard_data_0`, json);
  }
})

// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('dataCy', (dataCy) => {
  return cy.get(`[data-cy=${dataCy}]`);
})

// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('lang', (lang) => {
  if (lang === 'en') return;
  window.localStorage.setItem('language', lang);
})