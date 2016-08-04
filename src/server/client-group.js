/**
 * Represents a group of clients.
 * @class ClientGroup
 */
export default class ClientGroup extends Set {
  /**
   * Parent of the group.
   * @type {Server}
   * @private
   */
  parent;

  /**
   * @param {Server} [parent] Parent of the group.
   * @private
   */
  constructor(parent) {
    super();

    this.parent = parent;
  }

  /**
   * Removes all clients from the group.
   */
  clear() {
    super.clear();

    // Delete the group from its parent if necessary
    if (this.parent) {
      for (const [key, value] of Object.entries(this.parent.clientGroups)) {
        if (value === this) {
          delete this.parent.clientGroups[key];
          return;
        }
      }
    }
  }

  /**
   * Removes the specified client from the group.
   * @param {ServerSideSocket} client Socket of the client to be removed.
   * @returns {boolean} `true` if the client has been removed successfully;
   * otherwise `false`.
   */
  delete(client) {
    const result = super.delete(client);
    if (result && this.size === 0) {
      this.clear();
    }
    return result;
  }

  /**
   * Transmits a message to every client in the group.
   * @param {string} type Type of the message.
   * @param {*} [payload] Payload of the message.
   */
  send(type, payload) {
    for (const client of this) {
      client.send(type, payload);
    }
  }
}
