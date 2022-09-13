"use strict";

  DDSOS.browser.runtime.onMessage.addListener(({ active }) => {
    let debugF=false;
    let copyVisibilityF=true;

    const selectIDprefix='DDSOS_select_ID_';
    const inputElCustAttrName="data-ddsos-selectid";
    const inputIDPostfix="_DDSOS_INPUT_ID";
    const datalistIDPostfix="_DDSOS_DATALIST_ID";
    const defaultInputWidth=15;

    let log;

    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    function isElemHidden(el){
        // (el.offsetParent === null) //hidden
        // (window.getComputedStyle(el).display === 'none') //hidden
        return (el.offsetParent === null);
    }

    function showHideEl(el, actionF=true){
        el.style.display=(actionF) ? 'inline-block' : 'none';
    }

    function copyValSelectToInput(selectEl, inputEl){
        if (selectEl.selectedIndex !== -1) {
            inputEl.value=selectEl.options[selectEl.selectedIndex].text;
            //inputEl.title=selectEl.options[selectEl.selectedIndex].value;   //tooltip contains value
        } else {
            //inputEl.value='';
        }
    }

    function selectChangeHandler(event, selectEl){
        log('event', event, this, selectEl);
        //let selectEl=selectEl;
        let inputEl=document.getElementById(selectEl.id+inputIDPostfix);
        copyValSelectToInput(selectEl, inputEl);
        setStyleInputEl(inputEl, selectEl, 1);    //green
    }

    function keypressHandler(event){
        //let inputEl=this;
        if (event.keyCode === 13) {
            document.activeElement.blur();
        }
        //log('Key', event);
    }

    function onchangeHandler(){
        log('Change');
    }

    function oninputHandler(event, el){
        log('Input', event.data, el.value, event, el);
        let inputEl=el;
        let selectEl=document.getElementById(inputEl.getAttribute(inputElCustAttrName));

        let retO=matchSelectElByText(selectEl, el.value);
        if (retO.count===1) {
            setStyleInputEl(inputEl, selectEl, 1);     //green
        } else {
            setStyleInputEl(inputEl, selectEl);   //black
        }

        //event.preventDefault();
    }

    function onfocusHandler(){
        let inputEl=this;
        //setStyleInputEl(inputEl);   //black
        let selectID=inputEl.getAttribute(inputElCustAttrName);
        //let selectID=123;
        log('selectID', selectID);
        //inputEl.list='cars';
        //inputEl.setAttribute('list', 'cars');

        let datalistID=selectID + datalistIDPostfix;
        removeElIfExists(datalistID);     //Remove pre-existing element if it exists
        insertAfter(getDatalistEl(datalistID, selectID), document.getElementById(selectID));
        inputEl.setAttribute('list', datalistID);
        inputEl.size=getMaxWidth(selectID, defaultInputWidth) + 2;
    }

    function dispatchEvent(el, eventName){
        const event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
        event.eventName=eventName;
        el.dispatchEvent(event);
    }

    function matchSelectElByText(selectEl, inputVal){
        inputVal=inputVal.toLowerCase().trim();
        let arrA=Array.from(selectEl.options);
        let selectedIndex=-1;
        let filteredA=arrA.filter((obj, f) => {
            let retF=obj.text.toLowerCase().trim() === inputVal;
            if (retF && selectedIndex === -1) {
                selectedIndex=f;
            }
            return retF;
        });

        return {
                selectedIndex: selectedIndex,
                count: filteredA.length,
                filteredA: filteredA    //not needed but just in case
                };
    }

    function setStyleInputEl(inputEl, selectEl, count){
        let color='black';
        let toolTipValue='';   //black or red - no tooltip

        if(typeof count === 'number') {
            if (count===0) {
                color='red';
            } else if (count===1) {
                color='green';
                toolTipValue=selectEl.options[selectEl.selectedIndex].value;   //tooltip contains value
            } else {
                color='blue';
                toolTipValue=selectEl.options[selectEl.selectedIndex].value;   //tooltip contains value
            }   
        }

        inputEl.style.color=color;
        inputEl.style.borderColor=color;
        inputEl.title=toolTipValue;
    }

    //function onchangeHandler(){
    function onblurHandler(){
        let inputEl=this;
        //alert('change for: '+this['size']);
        //alert('change for: '+this.getAttribute(inputElCustAttrName));
        let inputVal=inputEl.value;
        let selectEl=document.getElementById(inputEl.getAttribute(inputElCustAttrName));

        let retO=matchSelectElByText(selectEl, inputVal);

        selectEl.selectedIndex=retO.selectedIndex;
        dispatchEvent(selectEl, 'change');

        log(inputEl, selectEl, inputEl.value, retO);

        setStyleInputEl(inputEl, selectEl, retO.count);
    }

    function getDatalistEl(datalistID, selectID){
        let datalistEl = document.createElement("datalist");
        //inputEl.id = selectID + inputIDPostfix;
        datalistEl.id = datalistID;

        let selectEl=document.getElementById(selectID);
        let arrA=Array.from(selectEl.options);

        arrA.forEach(obj => {
            let optEl = document.createElement("option");
            optEl.textContent = obj.text;
            datalistEl.appendChild(optEl);
        });

        return datalistEl;
    }

    function getMaxWidth(selectID, startWidth){
        let selectEl=document.getElementById(selectID);
        let arrA=Array.from(selectEl.options);
        let maxSize=startWidth;

        arrA.forEach(obj => {
            if (obj.text.length > maxSize) {
                maxSize=obj.text.length;
            }
        });

        return maxSize;
    }

    function removeElIfExists(elID){
        let el=document.getElementById(elID);
        if (el) {
            el.remove();
        }
    }

    function getInputEl(inputID, selectID){
        let inputEl = document.createElement("input");
        //inputEl.id = selectID + inputIDPostfix;
        inputEl.id = inputID;
        inputEl.type = "text";
        inputEl.size = defaultInputWidth;
        //inputEl[inputElCustAttrName]=selectID;  //does not work for custom attr - it is ignored
        inputEl.setAttribute(inputElCustAttrName, selectID);    //custom attr

        //inputEl.onchange=onchangeHandler;
        //inputEl.onselect=onselectHandler;
        inputEl.onblur=onblurHandler;
        //inputEl.oninput=oninputHandler;
        inputEl.addEventListener("input", (event) => oninputHandler(event, inputEl));

        inputEl.onfocus=onfocusHandler;
        //inputEl.style.border='1px solid';
        inputEl.style.borderWidth='1px';
        inputEl.style.borderRadius='3px';
        inputEl.style.outlineWidth='1px';
        inputEl.style.margin='1px';
        inputEl.style.outlineColor='cyan';
        //inputEl.onkeypress=keypressHandler;   //did not work
        //inputEl.setAttribute('onkeypress', keypressHandler);      //did not work
        inputEl.addEventListener("keypress", (event) => keypressHandler(event));

        //log('inputEl', inputEl);
        return inputEl;
    }

    function start(){
        if (DDSOS._activatedF) {
          return;
        }

        DDSOS._activatedF=true;
        if (debugF) {
          document.body.style.border = "5px solid red";
        }

        let elIDcounter=0;

        //document.querySelectorAll('select[type="select-one"]')
        document.querySelectorAll('select')
            .forEach(selectEl => {

                log(selectEl.type);
                if (selectEl.type!=='select-one') {
                    return;
                }

                //let prop = el.getAttribute("data-i18n");
                if (!selectEl.id) {
                    //selectEl.id='InputSelectHelper_select_ID_'+elIDcounter++;
                    selectEl.setAttribute('id', selectIDprefix+elIDcounter++);
                }
                log(selectEl);

                let inputID=selectEl.id + inputIDPostfix;
                removeElIfExists(inputID);      //Remove pre-existing element - if plugin disabled/enabled:

                insertAfter(getInputEl(inputID, selectEl.id), selectEl);
                //insertAfter(document.createTextNode('\u00A0\u00A0'), selectEl);    //&nbsp x2
                insertAfter(document.createTextNode('\u00A0'), selectEl);    //&nbsp - TODO: put into span with original ID

                let inputEl=document.getElementById(inputID);
                copyValSelectToInput(selectEl, inputEl);
                setStyleInputEl(inputEl, selectEl, 1);    //green
                
                if (copyVisibilityF) {
                    if (isElemHidden(selectEl)) {
                        showHideEl(inputEl, false); //hide input if select is hidden
                    }

                    let observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutationRecord) {
                            log('style changed!', mutationRecord);
                            //log('test2', mutationRecord.target.id);
                            //log('test3', document.getElementById(mutationRecord.target.id));
                            let selectEl=document.getElementById(mutationRecord.target.id);
                            //log('LINE1:', selectEl);
                            let inputEl=document.getElementById(selectEl.id+inputIDPostfix);
                            //log('LINE2:', selectEl, inputEl);
                            showHideEl(inputEl, !isElemHidden(selectEl));
                        });    
                    });
                    
                    observer.observe(selectEl, { attributes : true, attributeFilter : ['style'] });
                    DDSOS._copyVisibilityObserver=observer;
                }

                selectEl.addEventListener("change", (event) => selectChangeHandler(event, selectEl));
            });
    }

    function stop(){
      if (!DDSOS._activatedF) {
        return;
      }

      DDSOS._activatedF=false;
      if (debugF) {
        document.body.style.border = "0px";
      }

      if (copyVisibilityF && DDSOS._copyVisibilityObserver) {
        DDSOS._copyVisibilityObserver.disconnect();
      }

      document.querySelectorAll('select')
      .forEach(selectEl => {

          //log('Deactivate:', selectEl.type);
          if (selectEl.type!=='select-one') {
              return;
          }

          log('Deactivate:', selectEl);

          selectEl.removeEventListener("change", (event) => selectChangeHandler(event, selectEl));

          let inputID=selectEl.id + inputIDPostfix;
          removeElIfExists(inputID);      //Remove pre-existing element - if plugin disabled/enabled:

          let datalistID=selectEl.id + datalistIDPostfix;
          removeElIfExists(datalistID);  

      });
    }

    if (debugF) {
      log=console.log;
    } else {
        log=function(){};
    }
    
    if (active) {
      //alert('on');
      //document.addEventListener('copy', forceBrowserDefault, true);
      //document.body.style.border = "5px solid red";    
      start();

    } else {
      if (DDSOS._activatedF) {
        //alert('deactivate ' + DDSOS._activatedF);
        //deactivate:
        stop();
      } //else {
        //alert('already off');
      //}
      //document.body.style.border = "0px";
    }

  });
  
  DDSOS.browser.runtime.sendMessage({ didLoad: true });

