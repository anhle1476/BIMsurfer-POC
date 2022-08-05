import AbstractIssueService from "./abstractissueservice.js";
import Issue from "./issue.js";

const ISSUE_KEY = "BUILDING_ISSUES";

/**
 * In memory implementation of @see {AbstractIssueService} , persist by saving the issues in localStorage
 * ! For POC and testing only so it is fucking dirty
 * @inheritDoc
 */
export default class InMemoryIssueService extends AbstractIssueService {
	static nextIssueId = 1;

	/**
	 * store all the issues
	 * @type {Map<number, Issue>}
	 */
	_issues;

	constructor() {
		super();

		this._issues = this.restoreIssues();
	}

	getIssues(revisionId) {
    const issues = [...this._issues.values()];
		return issues.filter(
			(issue) => issue.revisionId == revisionId
		);
	}

	getIssueById(issueId) {
		return this._issues.get(issueId);
	}

	createOrUpdateIssue(issue) {
		this.validateIssue(issue);

		if (!issue.issueId) {
			issue.issueId = InMemoryIssueService.nextIssueId++;
		}

		this._issues.set(issue.issueId, issue);

		this.persistIssue();
		return issue;
	}

	deleteIssue(issueId) {
		const result = this._issues.delete(issueId);

		if (result) {
			this.persistIssue();
		}

		return result;
	}

	persistIssue() {
		const issuesStr = JSON.stringify([...this._issues.values()]);
		localStorage.setItem(ISSUE_KEY, issuesStr);
	}

	restoreIssues() {
		const issueMap = new Map();

		try {
			const issuesStr = localStorage.getItem(ISSUE_KEY);
			if (issuesStr) {
				const serializedObj = JSON.parse(issuesStr);

				serializedObj.forEach((val) => {
					const issue = new Issue(
						val.issueId,
						val.revisionId,
						val.elementIds,
						val.description
					);
					this.validateIssue(issue);

					issueMap.set(issue.issueId, issue);
				});
			}

			// populate the next issue id
			if (issueMap.size > 0) {
				InMemoryIssueService.nextIssueId = Math.max(...issueMap.keys()) + 1;
			}
		} catch (err) {
			console.warn("Restore issues failed", err);
		}

		return issueMap;
	}

	/**
	 * Validate issue, throw error if the issue is invalid
	 *
	 * @param {Issue} issue
	 */
	validateIssue(issue) {
		if (!issue || !issue.revisionId || !issue.elementIds?.length) {
			console.error("Invalid new issue", issue);
			throw Error("Invalid issue");
		}
	}
}
