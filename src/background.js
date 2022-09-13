(function() {
  const browser = DDSOS.browser;
  let rules = new DDSOS.Rules();

  const checkIfActive = (tabId) => {
    //fetchRules();
    browser.tabs.get(tabId, tab => {
      const match = rules.some((r) => r.test(tab.url));

      //console.log('tabId', tabId, 'rules', rules, 'match', match);

      if (match) {
        browser.browserAction.setIcon({ path: 'icons/ddsos-32-active.png' });
        browser.browserAction.setTitle({ title: "DDSOS (active)" });
        browser.tabs.sendMessage(tab.id, { active: true });
      } else {
        browser.browserAction.setIcon({ path: 'icons/ddsos-32-inactive.png' });
        browser.browserAction.setTitle({ title: "DDSOS (inactive)" });
        //alert(tab.id);
        browser.tabs.query({active: true}, tabA => {  //id: tab.id
          tabA.forEach(tabFiltered => {
            if (tab && tab.id && tab.id === tabFiltered.id) {
              //alert('Sending active: false');
              //console.log('Sending active: false');
              browser.tabs.sendMessage(tab.id, { active: false });
            }
          });
        });
        //Below created unresolved promise error: Error: Could not establish connection. Receiving end does not exist
        //browser.tabs.sendMessage(tab.id, { active: false });
        //It seems it is sending message also to tabs which do not have event listener activated - this should be fixed
      }
    });
  };

  const fetchRules = (cb) => {
    DDSOS.storage.get({ rules: [] }, ({ rules: values }) => {
      rules = DDSOS.Rules.deserialize(values);
      if (cb) { cb(); }
    });
  };

  /*
  browser.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
    if (reason === 'update' && previousVersion == '1.1') {
      DDSOS.storage.get({ include: '' }, ({ include }) => {
        fetchRules(() => {
          include.split('\n').forEach(value => {
            if (value !== '.*') {
              const rule = new DDSOS.Rule(value);
              rules.add(rule);
            }
          });
          DDSOS.storage.set({ rules: rules.serialize() });
        });
      });
    }
  });
  */

  browser.runtime.onMessage.addListener(({ didLoad }) => {
    if (didLoad) {
      //console.log('DidLoad');
      fetchRules();
      browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}, ([tab]) => {
        checkIfActive(tab.id);
      });
    }
  });

  browser.storage.onChanged.addListener(() => {
    //console.log('onChanged storage');
    fetchRules();
    browser.tabs.query({active: true}, tabs => {
      tabs.forEach(tab => {
        checkIfActive(tab.id);
      });
    });  

    /*
    fetchRules(() => {
      browser.tabs.query({active: true}, tabs => {
        tabs.forEach(tab => {
          checkIfActive(tab.id);
        });
      });
    })
    */
  });

  fetchRules();
  browser.tabs.onActivated.addListener(({ tabId }) => {
    //console.log('onActivated');
    //fetchRules();
    checkIfActive(tabId);
  });

/*
}
catch (e) {
  console.log("background.js: window is likely dead");
}
*/

})();
