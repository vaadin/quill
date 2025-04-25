import { EventEmitter } from 'eventemitter3';
import logger from './logger.js';

const debug = logger('quill:events');
const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];
const EMITTERS: Emitter[] = [];

EVENTS.forEach((eventName) => {
  document.addEventListener(eventName, (...args) => {
    EMITTERS.forEach((em) => {
      em.handleDOM(...args);
    });
  });
});

class Emitter extends EventEmitter<string> {
  static events = {
    EDITOR_CHANGE: 'editor-change',
    SCROLL_BEFORE_UPDATE: 'scroll-before-update',
    SCROLL_BLOT_MOUNT: 'scroll-blot-mount',
    SCROLL_BLOT_UNMOUNT: 'scroll-blot-unmount',
    SCROLL_OPTIMIZE: 'scroll-optimize',
    SCROLL_UPDATE: 'scroll-update',
    SCROLL_EMBED_UPDATE: 'scroll-embed-update',
    SELECTION_CHANGE: 'selection-change',
    TEXT_CHANGE: 'text-change',
    COMPOSITION_BEFORE_START: 'composition-before-start',
    COMPOSITION_START: 'composition-start',
    COMPOSITION_BEFORE_END: 'composition-before-end',
    COMPOSITION_END: 'composition-end',
  } as const;

  static sources = {
    API: 'api',
    SILENT: 'silent',
    USER: 'user',
  } as const;

  protected domListeners: Record<string, { node: Node; handler: Function }[]>;

  constructor() {
    super();
    this.domListeners = {};
    this.on('error', debug.error);
  }

  connect() {
    EMITTERS.push(this);
  }

  disconnect() {
    EMITTERS.splice(EMITTERS.indexOf(this), 1);
  }

  emit(...args: unknown[]): boolean {
    debug.log.call(debug, ...args);
    // @ts-expect-error
    return super.emit(...args);
  }

  handleDOM(event: Event, ...args: unknown[]) {
    const target = event.composedPath()[0];
    const containsNode = (node: Node, target: Node) => {
      if (target.getRootNode() === document) {
        return node.contains(target);
      }

      while (!node.contains(target)) {
        const root = target.getRootNode();
        if (!root) {
          return false;
        }
        const host = (root as ShadowRoot).host;
        if (!host) {
          return false;
        }
        target = host;
      }

      return true;
    };

    (this.domListeners[event.type] || []).forEach(({ node, handler }) => {
      if (target === node || containsNode(node, target as Node)) {
        handler(event, ...args);
      }
    });
  }

  listenDOM(eventName: string, node: Node, handler: EventListener) {
    if (!this.domListeners[eventName]) {
      this.domListeners[eventName] = [];
    }
    this.domListeners[eventName].push({ node, handler });
  }
}

export type EmitterSource =
  (typeof Emitter.sources)[keyof typeof Emitter.sources];

export default Emitter;
