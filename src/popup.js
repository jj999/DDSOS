(function() {
  //try {
  //String(window);
  
  document.addEventListener('DOMContentLoaded', () => {
    const add = document.querySelector('.add');
    const cancel = document.querySelector('.cancel');
    const container = document.querySelector('.container');
    const form = document.querySelector('.form');
    const options = document.querySelector('.options');
    let rules = new DDSOS.Rules();

    form.addEventListener('submit', event => {
      event.preventDefault();
      //console.log('popup.js: submit: DDSOS.storage.set - serialize');
      DDSOS.storage.set({ rules: rules.serialize() });
      window.close();
    });

    cancel.addEventListener('click', event => {
      window.close();
    });

    options.addEventListener('click', event => {
      DDSOS.browser.runtime.openOptionsPage();
    });

    DDSOS.storage.get({ rules: [] }, ({ rules: values }) => {
      rules = DDSOS.Rules.deserialize(values);

      DDSOS.browser.tabs.query({active: true, windowId: DDSOS.browser.windows.WINDOW_ID_CURRENT}, ([tab]) => {
        const addHandler = () => {
          const rule = new DDSOS.Rule(new URL(tab.url).origin.replace(/\./g, '\\.'));
          rules.add(rule);
          new DDSOS.RuleView(rule, rules).render(container, '#new');
        };

        add.addEventListener('click', addHandler);

        const matching = rules.filter(rule => rule.test(tab.url));
        matching.forEach(rule => new DDSOS.RuleView(rule, rules).render(container, '#existing'));

        if (!matching.length) {
          addHandler();
        }

        const remove = document.querySelector('.delete');
        if (remove) {
            remove.addEventListener('click', event => {
            //console.log('popup.js: remove: DDSOS.storage.set - serialize');
            DDSOS.storage.set({ rules: rules.serialize() });
            window.close();
          });
        }
      });
    });

  });

/*
  }
  catch (e) {
    console.log("popup.js: window is likely dead");
  }
*/

})();
