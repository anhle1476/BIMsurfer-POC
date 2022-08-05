/**
 * Model of the issue. An issue is belonged to one or multiple elements 
 * of a specific revision in a project
 */
export default class Issue {

  /**
   * TODO: add more stuff rather than just issue description (Ex: created date, user, comments,...etc...)
   * ctor
   * @param {number} issueId            unique ID of the issue
   * @param {number} revisionId         revision ID
   * @param {Array<number>} elementIds  unique ID of the related elements
   * @param {string} description        issue descriptions
   */
  constructor(issueId, revisionId, elementIds = [], description) {
    this.issueId = issueId;
    this.revisionId = revisionId,
    this.elementIds = elementIds;
    this.description = description
  }
}