/**
 * Contract every email provider must implement. Nothing outside this
 * directory should ever import a provider SDK directly.
 * @typedef {Object} NotificationProvider
 * @property {(params: { to: string, subject: string, html: string }) => Promise<void>} send
 */

module.exports = {};
