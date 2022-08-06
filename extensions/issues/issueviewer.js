import IssueController from "./issuecontroller.js";
import Issue from "./issue.js";

const ISSUE_VIEWER_CLASS = {
  ROOT: 'issue-viewer',
  ISSUE_ITEM: 'issue-item',
  REMOVE: 'issue-remove',
  HIGHLIGHT: 'issue-highlight'
}

/**
 * For render the issue viewer
 */
export default class IssueViewer {

  /**
   * ctor
   * 
   * @constructor
   * @param {IssueController} controller 
   */
  constructor(controller) {
    this.setController(controller);

    this.handleDeleteIssue = this.handleDeleteIssue.bind(this);
    this.handleHighlightIssue = this.handleHighlightIssue.bind(this);
  }

  /**
   * @param {IssueController} controller
   */
  setController(controller) {
    this.controller = controller;
  }

  init(root) {
    this.root = root;
    this.root.classList.add(ISSUE_VIEWER_CLASS.ROOT);

    this.clear();
    this.bindEventHandler();
  }

  clear() {
    this.root.innerHTML = '';
  }

  /**
   * Add a single issue to the viewer
   * 
   * @param {Issue} issue 
   */
  addIssue(issue) {
    const issueDiv = document.createElement('div');
    issueDiv.className = ISSUE_VIEWER_CLASS.ISSUE_ITEM;
    issueDiv.dataset.issueId = issue.issueId;

    issueDiv.innerHTML = 
    `<button class=${ISSUE_VIEWER_CLASS.REMOVE}>X</button>
    <div>Elements: ${issue.elementIds.join(', ')}</div>
    <div>${issue.description}</div>
    <button class=${ISSUE_VIEWER_CLASS.HIGHLIGHT}>Highlight issue</button>`

    this.root.appendChild(issueDiv);
  }

  /**
   * Clear and re-render all provided issues
   * 
   * @param {Array<Issue>} issues 
   */
  reloadIssues(issues) {
    this.clear()

    issues.forEach(issue => this.addIssue(issue));
  }

  bindEventHandler() {
    this.root.addEventListener('click', this.handleDeleteIssue);
    this.root.addEventListener('click', this.handleHighlightIssue);
  }

  unbindEventHandler() {
    this.root.removeEventListener('click', this.handleDeleteIssue);
    this.root.removeEventListener('click', this.handleHighlightIssue);
  }

  handleDeleteIssue(e) {
    if (!e.target.classList.contains(ISSUE_VIEWER_CLASS.REMOVE)) return;

    const issueItem = e.target.parentElement;
    const issueId = Number(issueItem.dataset.issueId);
    console.log('close issue', issueId)

    const isSuccess = this.controller.handleDeleteIssue(issueId);
    if (isSuccess) {
      issueItem.parentElement.removeChild(issueItem);
    } else {
      console.error(`Remove issue ID=${issueId} failed`)
    }
  }

  handleHighlightIssue(e) {
    if (!e.target.classList.contains(ISSUE_VIEWER_CLASS.HIGHLIGHT)) return;
    
    const issueId = Number(e.target.parentElement.dataset.issueId);
    console.log('highlight issue', issueId);

    console.log(this);

    this.controller.handleHighlightIssueById(issueId);
  }
}