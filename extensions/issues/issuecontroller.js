import AbstractIssueService from "./abstractissueservice.js";
import { App } from "../../apps/app.js";
import IssueViewer from "./issueviewer.js";
import Issue from "./issue.js";
import ExtensionUtils from "../utils/extensionutils.js";

/**
 * Handle the issue feature on the viewer
 */
export default class IssueController {
  
  /**
   * ctor
   * 
   * @constructor
   * @param {App} app 
   * @param {AbstractIssueService} issueService
   * @param {IssueViewer} issueViewer
   */
  constructor(app, issueService, issueViewer) {
    this.setApp(app);
    this.setIssueService(issueService);
    this.setIssueViewer(issueViewer);

    this.handleCreateIssue = this.handleCreateIssue.bind(this);
    this.handleHighlightIssue = this.handleHighlightIssue.bind(this);
    this.handleHighlightIssueById = this.handleHighlightIssueById.bind(this);
  }

  /**
   * @param {App} app
   */
  setApp(app) {
    this.app = app;
  }

  /**
   * @param {AbstractIssueService} issueService
   */
  setIssueService(issueService) {
    this.issueService = issueService;
  }

  /**
   * @param {IssueViewer} issueViewer
   */
  setIssueViewer(issueViewer) {
    this.issueViewer = issueViewer;
  }

  /**
   * Initialize the issue management feature with a root element for the viewer
   * 
   * @param {HTMLDivElement} displayElement
   */
  init(displayElement, revisionId) {
    this.issueViewer.init(displayElement);

    if (!revisionId) {
      revisionId = this.getCurrentRevisionId();
    }

    const issues = this.issueService.getIssues(revisionId);

    console.log('reload revision id', revisionId);
    console.log('reload', issues);

    this.issueViewer.reloadIssues(issues);
  }

  /**
   * Return the current revision ID loaded in the viewer.
   * ! Only work well when the model is loaded
   * 
   * @returns {number} revision Id
   */
  getCurrentRevisionId() {
    return this.app.getBimViewer()?.revisionId;
  }

  /**
   * 
   * @param {Issue} issue 
   */
  handleCreateIssue(issue) {
    issue.revisionId = this.getCurrentRevisionId();
    issue.elementIds = this.getSelectedElements().map(e => e.uniqueId);

    const newIssue = this.issueService.createOrUpdateIssue(issue);

    this.issueViewer.addIssue(newIssue);
  }

  /**
   * Get information of the currently selected elements of the model
   */
  getSelectedElements() {
    const bimViewer = this.app.getBimViewer();
    
    if (bimViewer) {
      return [...bimViewer.viewer.getSelected()]
    }
  }

  async handleHighlightIssueById(issueId) {
    const issue = this.issueService.getIssueById(issueId);

    return this.handleHighlightIssue(issue);
  }

  async handleHighlightIssue(issue) {
    const highlightElements = issue.elementIds;
    if (!highlightElements?.length) {
      console.error('Highlight invalid issue with no elements', issue);
      return;
    }
    
    const modelViewer = this.app.getViewer();
    const highlightColor = ExtensionUtils.getRandomColor();

    await modelViewer.resetColors();
    return modelViewer.setColor(new Set(highlightElements), highlightColor);
  }

  handleDeleteIssue(issueId) {
    return this.issueService.deleteIssue(issueId);
  }
}