import EventEmitter from 'events';
import { w3cwebsocket as WebSocketClient } from 'websocket';
import { extendClientSideSocket } from '../socket-extensions';
import { handleMessage } from '../utils';

/**
 * WebSocket client with extensions.
 * @class Client
 */
export default class Client extends EventEmitter {
  /**
   * Connection event, fired when the client has connected successfully.
   * @event connect
   * @memberof Client
   */

  /**
   * Disconnection event, fired when the client disconnects.
   * @event disconnect
   * @memberof Client
   * @param {number} code Close status code sent by the server.
   * @param {string} reason Reason why the server closed the connection.
   * @param {boolean} wasClean Indicates whether or not the connection was
   * cleanly closed.
   */

  /**
   * Generic message event, fired when any message is received.
   * @event message
   * @memberof Client
   * @param {*} data Full message data.
   */

  /**
   * Typeful message event, fired when a typeful message is received.
   * @event message:[type]
   * @memberof Client
   * @param {*} payload Payload of the message.
   */

  /**
   * Error event, fired when an unexpected error occurs.
   * @event error
   * @memberof Client
   */

  /**
   * Direct reference to the underlying extended WebSocket instance.
   * @type {websocket.w3cwebsocket}
   * @private
   */
  base;

  /**
   * @param {string} url URL of the WebSocket server to which to connect.
   * @param {Object} [options] Options to construct the client with.
   * @param {string[]} [options.protocols] Protocols to be used if possible.
   * @param {Function[]} [options.plugins] Plugins to be used, each defined
   * as a function taking the constructed client instance as a parameter.
   */
  constructor(url, options = {}) {
    super();
    this.base = extendClientSideSocket(
      new WebSocketClient(url, options.protocols)
    );

    this.base.onopen = () => this.emit('connect');
    this.base.onclose = ({ code, reason, wasClean }) =>
      this.emit('disconnect', code, reason, wasClean);

    this.base.onmessage = ({ data }) => handleMessage(this, data);
    this.base.onerror = () => this.emit('error');

    // Parse custom options
    const { plugins = [] } = options;

    // Initialize plugins
    for (const plugin of plugins) {
      plugin(this);
    }
  }

  /**
   * Transmits data to the server.
   * @param {...*} [params] Data to be sent.
   */
  send(...params) {
    this.base.send(...params);
  }

  /**
   * Closes the connection or connection attempt, if any.
   * @param {number} [code] Status code explaining why the connection is being
   * closed.
   * @param {string} [reason] A human-readable string explaining why the
   * connection is closing. This string must be no longer than 123 bytes of
   * UTF-8 text (not characters).
   */
  disconnect(code, reason) {
    this.base.close(code, reason);
  }
}
