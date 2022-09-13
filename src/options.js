(function() {
  let rules = new DDSOS.Rules();

  function displayRules(container) {
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }

    DDSOS.storage.get({ rules: [] }, ({ rules: values }) => {
      rules = DDSOS.Rules.deserialize(values);
      rules.forEach((rule) => new DDSOS.RuleView(rule, rules).render(container));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const form = document.querySelector('.form');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      //console.log('options.js: submit: DDSOS.storage.set - serialize');
      DDSOS.storage.set({ rules: rules.serialize() });
    });

    document.querySelector('.add').addEventListener('click', () => {
      const rule = new DDSOS.Rule();
      rules.add(rule);
      new DDSOS.RuleView(rule, rules).render(container);
    });

    DDSOS.browser.storage.onChanged.addListener(() => {
      displayRules(container);
    });

    displayRules(container);
  });
})();
