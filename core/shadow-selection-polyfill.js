// see https://github.com/GoogleChromeLabs/shadow-selection-polyfill/issues/11
const SUPPORTS_SHADOW_SELECTION = typeof window.ShadowRoot.prototype.getSelection === 'function';
const SUPPORTS_BEFORE_INPUT = typeof window.InputEvent.prototype.getTargetRanges === 'function';
const IS_FIREFOX = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
const IS_MSIE = !!(window.navigator.userAgent.match(/Trident/) && !window.navigator.userAgent.match(/MSIE/));
const IS_EDGE = window.navigator.userAgent.match(/Edge/);

let processing = false;
export class ShadowSelection {
  constructor() {
    this._ranges = [];
  }

  get rangeCount() {
    return this._ranges.length;
  }

  getRangeAt(index) {
    return this._ranges[index];
  }

  addRange(range) {
    this._ranges.push(range);
    if (!processing) {
      let windowSel = window.getSelection();
      windowSel.removeAllRanges();
      windowSel.addRange(range);
    }
  }

  removeAllRanges() {
    this._ranges = [];
  }

  // todo: implement remaining `Selection` methods and properties.
}

function getActiveElement() {
  let active = document.activeElement;

  /* eslint-disable no-constant-condition */
  while (true) {
    if (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    } else {
      break;
    }
  }

  return active;
}

if ((IS_FIREFOX || IS_MSIE || IS_EDGE) && !SUPPORTS_SHADOW_SELECTION) {
  window.ShadowRoot.prototype.getSelection = function() {
    return document.getSelection();
  }
}

if (!IS_FIREFOX && !SUPPORTS_SHADOW_SELECTION && SUPPORTS_BEFORE_INPUT) {
  let selection = new ShadowSelection();

  window.ShadowRoot.prototype.getSelection = function() {
    return selection;
  }

  window.addEventListener('selectionchange', () => {
    if (!processing) {
      processing = true;

      const active = getActiveElement();

      if (active && (active.getAttribute('contenteditable') === 'true')) {
        document.execCommand('indent');
      } else {
        selection.removeAllRanges();
      }

      processing = false;
    }
  }, true);

  window.addEventListener('beforeinput', (event) => {
    if (processing) {
      const ranges = event.getTargetRanges();
      const range = ranges[0];

      const newRange = new Range();

      newRange.setStart(range.startContainer, range.startOffset);
      newRange.setEnd(range.endContainer, range.endOffset);

      selection.removeAllRanges();
      selection.addRange(newRange);

      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('selectstart', () => {
    selection.removeAllRanges();
  }, true);
}
