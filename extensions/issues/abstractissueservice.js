import Issue from "./issue.js";

export default class AbstractIssueService {
	constructor() {}

	/**
	 * Get issue by the issue Id
	 *
	 * @param {number} issueId 		issue unique Id
	 *
	 * @return {Issue}
	 */
	getIssueById(issueId) {
		throw Error("Not implemented");
	}

	/**
	 * Load issues of a project's revision
	 * @param {number} revisionId 
	 *
	 * @return {Array<Issue>}
	 */
	getIssues(revisionId) {
		throw Error("Not implemented");
	}

	/**
	 * Create or update issue
	 *
	 * @param {Issue} issue
	 *
	 * @return {Issue}
	 */
	createOrUpdateIssue(issue) {
		throw Error("Not implemented");
	}

	/**
	 * Delete issue
	 *
	 * @param {number} issueId
   * 
   * @return {boolean} is delete success or not
	 */
	deleteIssue(issueId) {
		throw Error("Not implemented");
	}
}
